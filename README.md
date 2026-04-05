# Visual Analysis of X-Ray Scattering Images (Updated version)

An interactive browser-based visualization platform for exploring how a ResNet-50 model processes X-ray scattering images (and CIFAR-10). The system projects high-dimensional layer activations into 2-D scatter plots, lets you select subsets of data points, and investigates attribute co-occurrence and clustering quality through several linked views.

---

## Requirements & Setup

```bash
pip install -r requirements.txt
python main.py          # starts Flask on http://127.0.0.1:8085
```

A running PostgreSQL instance is required. Connection parameters are in `config.json` (default: port 5434, database `xraydb`). The database must contain tables with the schema produced by the ResNet-50 feature-extraction pipeline (T-SNE embeddings, intermediate activations, prediction probabilities, true labels).

---

## Interface Overview

The UI is a single HTML page divided into four main regions:

```
┌──────────────────────────────────────────────────────────────┐
│  Navbar                                                      │
├────────────────┬─────────────────────────┬───────────────────┤
│  Scatterplot   │  Visualization Panels   │  Filter / Attrs   │
│  (top-left)    │  (top-center)           │  (top-right)      │
├────────────────┴─────────────────────────┴───────────────────┤
│  Detailed Images (bottom)                                    │
└──────────────────────────────────────────────────────────────┘
```

An optional **Attribute Study** overlay slides in from the right edge when opened.

---

## Scatterplot Panel (top-left)

The main interactive canvas. Every data point is one circle.

### Dot Appearance

- **Fill color** encodes the attribute group (true label class).
- **Opacity** encodes the distance-of-error: a dot with low reconstruction error is opaque; high error is transparent.
- **Selected dots** receive a colored overlay circle and a numeric ID label.

### Display Mode Buttons

| Button | Effect |
|---|---|
| **Default** | Colors dots by true label. |
| **Prediction** | Colors dots by predicted label probability. |
| **FlowerPlot** | Renders multi-petal glyphs representing per-attribute prediction probabilities. |
| **Background** slider | Continuously adjusts the opacity of all unselected (background) dots from fully visible (1) to fully hidden (0). |

### Plot Type Dropdown

Switches the 2-D projection source used for dot positions:

| Option | Projection source |
|---|---|
| Actual Label (ACT) | T-SNE of true-label embedding |
| Layer s1 | T-SNE of ResNet ReLU block 1 activations |
| Layer s3 | T-SNE of ResNet ReLU block 3 activations |
| Layer s5 | T-SNE of ResNet ReLU block 5 activations |
| Feature-2048 (FEA) | T-SNE of the 2048-d feature vector |
| Prediction Prob (PRD) | T-SNE of softmax prediction probabilities |

### Selection Interactions

**Single selection:** Click any dot to add it to the current selection. A red animated pulse ring expands and contracts to confirm the selection across all visible panels simultaneously. The dot receives a colored ring and a numeric text label; overlapping labels are automatically pushed apart (collision-detection repositioning with up to 20 passes).

**Lasso selection:** Click the **Multiple** button, then drag a rectangle on the plot to select all enclosed dots at once.

**Drag to panel:** Drag any selection token from the Selections list (right sidebar) onto either visualization panel to analyze that group.

### Layer Compare Mode

The **Layer Compare** button opens a small menu:

| Option | Result |
|---|---|
| 1 Layer | Single-plot mode (uses the Plot Type dropdown). |
| 3 Layers | Splits the scatterplot panel into ACT / FEA / PRD side-by-side. |
| 6 Layers | Splits into ACT / s1 / s3 / s5 / FEA / PRD — six plots side-by-side showing how the embedding evolves through each ResNet stage. |

When any compare mode is active, hovering or clicking a dot highlights the **same data point simultaneously** in all six panels with an animated ring.

---

## Visualization Panels (top-center)

Two stacked panels (**Selection 1** top, **Selection 2** bottom). Each panel has three tabs:

### Gallery Tab

Displays thumbnail images for every data point in the selection, arranged in a scrollable grid. Hovering a thumbnail highlights the corresponding dot in the scatterplot. Clicking an image adds it to the Detailed Images strip at the bottom.

### Statistics Tab

Shows bar charts or distribution plots of attribute values across the selected subset.

### Clustering Tab

Run unsupervised clustering on the selection and visualize the results.

**Algorithm options:**

| Algorithm | Tunable Parameters |
|---|---|
| **K-Means** | Number of clusters k (1 – 5) |
| **DBSCAN** | EPS (0.00 – 1.00 in 0.05 steps), MinPts (3 – 10) |

**Projection source for clustering display:** ACT t-SNE, FEA t-SNE, or PRD t-SNE.

**Quality scores returned (K-Means):** Davies–Bouldin index and Silhouette score.

The cluster result is shown as a bubble chart where each bubble represents one cluster; a force-directed layout separates the bubbles by cluster membership. DBSCAN marks noise points as a separate outlier group.

---

## Filter / Attribute Panel (top-right)

### Attributes

A scrollable list of all attribute labels (from the selected feature file). Click an attribute button to toggle it as a filter — only data points that have that attribute active are shown in the scatterplot and panels.

**Attributes Selection** toggle button: shows/hides the attribute filter panel.

**Group Selection** toggle button: shows/hides the visualization panels, effectively giving the scatterplot more horizontal space.

### Drag/Drop Selections

Stores named selections created by lasso or single-click operations. Each selection token shows its count. Tokens can be:
- Dragged onto Panel 1 or Panel 2 to load that group for analysis.
- Deleted with the **✕ (clear all)** button at the top-right of the section title.

---

## Detailed Images Strip (bottom)

A horizontal scrollable strip of large-format images for data points that were clicked directly in the scatterplot or gallery.

- **✕ (clear all)** button removes all images and resets the inner-circle highlights in the scatterplot.
- Each image shows the filename / ID.
- The corresponding dot in every scatterplot panel gets a filled inner highlight circle; clicking a highlighted dot elsewhere in the UI clears the highlight for that dot.

### LRP Heatmap Overlay

Clicking any **PRD** (Prediction Probability) attribute box on an image card triggers an LRP (Layer-wise Relevance Propagation) heatmap for that image and attribute.

- The heatmap is computed by a Python 2.7 + TensorFlow 1.4 Docker sidecar (`lrp-service`) using Gradient×Input as the relevance method.
- The result is overlaid directly on the raw image using a jet colormap (warm = high relevance pixels).
- An **opacity slider** below each image controls heatmap transparency.
- Heatmaps persist across new image additions — adding a new image does not clear existing overlays.
- A label below each image shows which attribute was analyzed and the predicted probability.

> **Note:** LRP is only available for Synthetic X-ray data (17 attributes). CIFAR-10 and Experimental X-ray are not currently supported.

---

## Attribute Study Overlay

Opened via the **Open Attribute Study** navbar button. Slides in as a panel from the right, covering the filter column and part of the visualization panels.

### Pairwise Attributes Information (upper section)

A heatmap showing a statistical relationship between every pair of attributes. The **metric dropdown** selects what is shown:

| Option | Metric |
|---|---|
| **Mutual Info** | Mutual information between attribute i and attribute j |
| **Correlation** | Pearson correlation between attribute i and attribute j |
| **Cond. Entropy Truelabel** | Conditional entropy H(attr\_j \| attr\_i) based on true labels |
| **Cond. Entropy Prediction** | Conditional entropy H(attr\_j \| attr\_i) based on predictions |

The matrix is **composite**: the upper triangle shows green cells (true-label statistics) and the lower triangle shows blue cells (prediction statistics), with diagonal cells neutral.

**Cluster button:** Performs hierarchical agglomerative clustering (average linkage, distance = 1 − |value|) on the attribute similarity matrix and reorders both rows and columns so that attributes with similar patterns are placed adjacent to each other. The green/blue triangle assignment is preserved after reordering. Click again to restore the original attribute order.

### Coexisting Attributes Statistics (lower section)

A count-based chart showing how frequently attribute combinations co-occur in the dataset. The **number dropdown** (1 – 5) controls the co-occurrence order (single attributes, pairs, triples, …).

---

## Datasets

| Dataset | Feature file | Images |
|---|---|---|
| X-ray scattering (17 classes) | `resources/data/17tags_meta.txt` | `static/images/vis_filtered_thumbnails/*.jpg` |
| CIFAR-10 (10 classes) | `resources/data/cifar10.txt` | `static/images/cifar10_images/*.png` |

Switching datasets via the Feature Names dropdown or Data types dropdown automatically reloads all data and switches the image directory.

---

## AI Assistant

An **AI Assistant** button in the navbar opens a floating chat panel. Users can ask questions about how to use any feature of the tool — scatter plot navigation, LRP heatmaps, clustering, attribute study, etc.

- Powered by Claude (claude-haiku-4-5) via the Anthropic API.
- Conversation history is maintained within the session.
- Requires `ANTHROPIC_API_KEY` set as an environment variable (see deployment notes).

> **Currently available:** Synthetic X-ray data + T-SNE embedding only. CIFAR-10, Experimental X-ray, and PCA are not available.

---

## Navbar Controls

| Control | Description |
|---|---|
| **Feature Names** dropdown | Selects the attribute label file. `cifar10.txt` is disabled (not available). |
| **Data types** dropdown | `Synthetic` only. `Experimental` and `Cifar10` are disabled (not available). |
| **Error methods** dropdown | Distance metric for dot opacity: `Cosine`, `Euclidean`, or `Manhattan`. |
| **Embedding methods** dropdown | `T-SNE` only. `PCA` is disabled (not available). |
| **Open Attribute Study** | Opens the pairwise attribute information panel. |
| **Model Architecture** | Shows the ResNet-50 architecture diagram. |
| **AI Assistant** | Opens the Claude-powered chat assistant. |

---

## Backend API Endpoints

All endpoints accept POST with a JSON body.

| Endpoint | Purpose |
|---|---|
| `POST /QueryAll` | Fetches embedding coordinates, labels, and error distances for up to 300 records. |
| `POST /GetCluster` | Runs K-Means on the server and returns cluster assignments + quality scores. |
| `POST /GetClusterDBSCAN` | Runs DBSCAN and returns cluster assignments. |
| `POST /GetMutualInfo` | Computes pairwise mutual information, correlation, and conditional entropy matrices. |
| `POST /GetCountInfo` | Computes attribute co-occurrence frequency tables. |
| `POST /GetTsne` | Returns t-SNE coordinates for a requested layer/projection. |

---

## Project Structure

```
xscatter10/
├── main.py                  # Flask app, endpoint routing
├── query.py                 # DB queries, K-Means, DBSCAN, t-SNE, MI
├── info.py                  # Pure information-theory functions
├── utils.py                 # Distance utilities
├── modules.py               # Centralized imports
├── config.json              # PostgreSQL credentials
├── templates/index.html     # Single-page UI
├── static/
│   ├── css/                 # Per-component stylesheets
│   ├── js/
│   │   ├── index.js         # Global state, init, main.visualize()
│   │   ├── dom/             # DOM refs, event wiring
│   │   ├── query/           # AJAX wrappers
│   │   ├── vis/             # D3 visualization components
│   │   └── utils/           # Shared JS utilities
│   └── images/              # Thumbnail images
└── resources/data/          # Attribute label files (.txt)
```


## Contributors

Origional publication: https://ieeexplore.ieee.org/document/9240062

Origional code Contributors Xinyi Huang, Suphanut Jamonnak  (ResNet-50 Model trained by Boyu Wang)

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

XScatter is a Flask-based web visualization platform for analyzing X-ray scattering images and CIFAR-10 datasets. It evaluates ResNet-50 model training quality through interactive scatter plots, clustering analysis, information-theoretic metrics, and attribute co-occurrence statistics. The UI is a single-page D3.js application.

## Running the Application

```bash
# Install dependencies
pip install -r requirements.txt

# Start Flask server (runs on http://127.0.0.1:8085)
python main.py
```

**Prerequisites**: A PostgreSQL instance at the host/port/dbname specified in `config.json`. The database must contain tables with 42 columns (T-SNE embeddings, predictions, true labels, intermediate activations). The default config expects port 5434, database `xraydb`.

## Running Standalone Computations

```bash
# Test information-theoretic functions (entropy, MI, conditional entropy)
python info.py
```

There is no test suite; `info.py` has inline `__main__` tests at the bottom.

## Architecture

### Backend (Python/Flask)

- **`main.py`** — Flask entry point. Loads `config.json`, opens a single psycopg2 connection, and defines 7 POST endpoints that delegate to `query.py`.
- **`query.py`** — Core data and ML logic. All database queries and scikit-learn computations (K-Means, DBSCAN, t-SNE, silhouette/Davies-Bouldin scoring, mutual information) live here. The `dataSize` variable (default 500) controls how many records are fetched.
- **`info.py`** — Pure information theory: entropy, joint probability, mutual information, conditional entropy on binary attribute vectors.
- **`utils.py`** — Distance computations (cosine, Manhattan, Euclidean) between true label vectors and predicted probability vectors.
- **`modules.py`** — Centralized imports with friendly error messages for missing libraries.

### Frontend (D3.js SPA)

- **`templates/index.html`** — Single HTML page. All UI panels are defined here.
- **`static/js/index.js`** — Global state and initialization.
- **`static/js/query/query.js`** — AJAX wrappers for the 7 Flask endpoints.
- **`static/js/dom/`** — DOM manipulation, event handlers (`dom-events.js` is the primary event wiring file).
- **`static/js/vis/`** — D3 visualization components: `scatterplot.js`, `clustering.js`, `matrix.js` (heatmap), `parallel.js`, `tsne.js`, `gallery.js`, `count.js`.

### Data Flow

1. Page load triggers `POST /QueryAll` → fetches 300 records with embeddings and labels.
2. User interactions (clustering, mutual info, t-SNE) trigger additional POST endpoints.
3. All responses are JSON; D3 components consume them directly.

### Datasets

- **X-ray (17 classes)**: attribute names in `resources/data/17tags_meta.txt`
- **CIFAR-10 (10 classes)**: class names in `resources/data/cifar10.txt`, sample images in `static/images/cifar10_images/`
- X-ray thumbnails in `static/images/vis_filtered_thumbnails/`

### Key Configuration

`config.json` holds PostgreSQL credentials. Table names are hardcoded in `query.py` (e.g., `vis_TSNE_500`, `cifar10_TSNE_1000`). Switch datasets by changing the table reference and `dataSize` in `query.py`.

// Dom options
dom.options = {
    featureFile: $('#feature-file-select'),
    dataType: $('#data-type-option'),
    errorMethod: $('#error-method-option'), 
    embeddingMethod: $('#embedding-method-option'),
    matrix: $('#attribute-matrix-option'),
    count: $('#attribute-matrix2-option'),
    scatterplot: $('#plot-options'),
}

// Dom buttons
dom.buttons = {
    selectToggle: $('#selection-toggle-btn'),
    compareToggle: $('#compare-toggle-btn'),
    singleSelect: $('#single-select-btn'),
    multipleSelect: $('#multiple-select-btn'),

    // Dot color style buttons
    dotColors: $('.dot-color-btn'),
    defaultDot: $('#default-dot-btn'),
    predProbDot: $('#prediction-dot-btn'),
    flowerDot: $('#flower-dot-btn'),

    // Locker
    lock1: $('#lock-1-btn'),
    lock2: $('#lock-2-btn'),

    // attribute study
    attrStudy: $('#attribute-study-btn'),
    hideBackground: $('#navbar-hide-background'),

    imageContainer: $('#imagecontainer-toggle-btn'),
    groupSelectToggle: $('#group-selection-toggle-btn')
}

// Dom containers
dom.containers = {
    filter: $('#filter-container'),
    vis: $('#vis-container'),
    scatterplot: $('#scatterplot-container'),
    actplot: $('#act-container'),
    feaplot: $('#fea-container'),
    prdplot: $('#prd-container'),
    scatterPlotImage: $('#scatterplot-image'),
    scatterPlotImageId: $('#scatterplot-imageid'),
    attrViz: $('#attribute-vis-container'),

    top: $('#top-container'),
    bottom: $('#bottom-container')
}

// Dom contents
dom.contents = {
    selection: $('#selection-content'),
    attribute: $('#attribute-content'),
    actPlot: $('#act-content'),
    feaPlot: $('#fea-content'),
    prdPlot: $('#prd-content'),

    vis1: $('#vis1-content'),
    vis2: $('#vis2-content'),

    images: $('#image-content'),
    attrViz: $('#attribute-vis-content'),
    attrMatrix: $('#attribute-matrix-content'),
    attrCount: $('#attribute-matrix2-content')
}

// Tab elements
dom.tabs = {
    // First panel
    overview1: $('#tab-overview-1'),
    statistic1: $('#tab-statistic-1'),
    clustering1: $('#tab-clustering-1'),
    // Second panel
    overview2: $('#tab-overview-2'),
    statistic2: $('#tab-statistic-2'),
    clustering2: $('#tab-clustering-2'),

    vis1Title: $('#tab-title-1'),
    vis2Title: $('#tab-title-2')
}

// Get error method option
dom.getErrorMethod = function () {
    return dom.options.errorMethod.val().toLowerCase();
}

// Get embedding method option
dom.getEmbeddingMethod = function () {
    return dom.options.embeddingMethod.val().toLowerCase().replace(/[^\w\s]/gi, '');
}

// Get data type option
dom.getDataType = function () {
    return dom.options.dataType.val().toLowerCase();
}
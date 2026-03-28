var main = main || {};
// Embedding image path
main.imagePath = 'vis_filtered_thumbnails/';
main.imageFileType = '.jpg';
main.selectImageIds = [];
main.matrix = undefined;
main.count = undefined;

// Embedding data
main.embedding = {
    options: {
        'Data type': dom.getDataType(),
        'Vector of feature': 'feature2048',
        'Distance of error': dom.getErrorMethod(),
        'Embedding method': dom.getEmbeddingMethod(),
        'matrix method': 'correlation'
    },
    data: undefined,
    filterData: undefined,
    labels: [],
    filterLabels: [],
    labelColors: undefined,
    filterColors: [],
    selection: []
}

main.matrix = undefined;

// Initialize system
main.init = function () {
    dom.initDataOptions(main.embedding);
    dom.initFileInput(main.embedding);
    dom.initSelectToggleButton();
    dom.initCompareButton();
    dom.initTransitionEvents();
    // Scatterplot dot buttons
    dom.initScatterPlotButtons();
    // Initialize tab button events
    dom.initVisTabEvents();
    // dom.initLockEvents();
    // Attribute visualization
    dom.initAttributeVizButton();
    // Hide scatterplot background
    dom.initHideBackgroundButton();
    // Initialize matrix options
    dom.initMatrixOptions();
    // Initialize count options
    dom.initCountOptions();
    // Initialize scatter plot options
    dom.initPlotOptions();
    // Drag drop events
    dom.initDropContent();

    dom.initImageContainer();
    return;
}

// Start system
main.start = function () {

    query.getAll(main.embedding).then(function (result) {

        // Use to show loading animation

        // Set default result for both data and filter data
        main.embedding.data = utils.cloneObject(result);
        main.embedding.filterData = utils.cloneObject(result);
        // Assign color base on number of attributes
        main.embedding.labelColors = utils.getAttributeColors(main.embedding.labels.length);
        // List attributes and initiate all filter events
        dom.listAttributes(dom.contents.attribute, main.embedding);
        //main.visualize();

        query.getMutualInfo().then(function (matrix) {

            main.matrix = matrix;

            query.getCountInfo().then(function (count) {

                main.count = count;
                console.log(count)
                requestAnimationFrame(function () {
                    main.visualize();
                });
            });
        });
    });
    
    return;
}

// Visualize
main.visualize = function () {
    // Filter data by selected attributes
    utils.filterDataByAttributes(main.embedding);
    vis.initRelations(dom.contents.attrViz, main.embedding);
    //vis.initMatrix(dom.options.matrix.val()); //?

    let scatterplotData = utils.prepareScatterplot(main.embedding);

    // is Comparison opened
    if (dom.buttons.compareToggle.hasClass('open')) {
        dom.options.scatterplot.hide();

        vis.scatterplot(dom.contents.actPlot, type = 'act', scatterplotData);
        vis.scatterplot(dom.contents.feaPlot, type = 'fea', scatterplotData);
        vis.scatterplot(dom.contents.prdPlot, type = 'prd', scatterplotData);

        // Need to set title back to act
        $('#act-container .container-title').html('Actual Label (ACT)');
    } else {
        dom.options.scatterplot.show();
        let plotType = 'act';

        switch (dom.options.scatterplot.val()) {
            case 'act':
                plotType = 'act';
                $('#act-container .container-title').html('Actual Label (ACT)');
                break;
            case 'fea':
                plotType = 'fea';
                $('#act-container .container-title').html('Feature-2048 (FEA)');
                break;
            case 'prd':
                plotType = 'prd';
                $('#act-container .container-title').html('Prediction Prob (PRD)');
                break;
            default: break;
        }

        vis.scatterplot(dom.contents.actPlot, type = plotType, scatterplotData);
    }

    // List all selections
    dom.listSelections(dom.contents.selection);
    // Display visualization panels
    vis.displayPanel1();
    vis.displayPanel2();
    // Show interaction
    vis.showSelectedImages(main.selectImageIds);
    vis.selectInteraction(main.selectImageIds);
    return;
}

// Entry point
window.onload = function () {
    main.init();
    dom.options.featureFile.val('17tags_meta.txt');
    dom.loadFeatureFile(main.embedding, '17tags_meta.txt');
    return;
}
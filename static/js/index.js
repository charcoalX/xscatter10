var main = main || {};
// Embedding image path
main.imagePath = 'vis_filtered_thumbnails/';
main.imageFileType = '.jpg';
main.selectImageIds = [];
main.matrix = undefined;
main.count = undefined;
main.compareMode = 'none'; // 'none' | '3layers' | '6layers'

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
    dom.initGroupSelectToggleButton();
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

        if (main.compareMode === '6layers') {
            vis.scatterplot(dom.contents.actPlot, 'act', scatterplotData);
            vis.scatterplot(dom.contents.layer2Plot, 'layer1', scatterplotData);
            vis.scatterplot(dom.contents.layer3Plot, 'layer3', scatterplotData);
            vis.scatterplot(dom.contents.layer4Plot, 'layer5', scatterplotData);
            vis.scatterplot(dom.contents.feaPlot, 'fea', scatterplotData);
            vis.scatterplot(dom.contents.prdPlot, 'prd', scatterplotData);
            $('#act-container .container-title').html('Actual Label (ACT)');
            $('#layer2-container .container-title').html('s1');
            $('#layer3-container .container-title').html('s3');
            $('#layer4-container .container-title').html('s5');

            console.group('=== 6 Layers Mode: Data Structure ===');
            console.log('Total points:', scatterplotData.length);
            console.log('Sample dot (all fields):', scatterplotData[0]);
            console.log('ACT coords (xTrueLabel, yTrueLabel):', { x: scatterplotData[0].xTrueLabel, y: scatterplotData[0].yTrueLabel });
            console.log('FEA coords (xFeature, yFeature):', { x: scatterplotData[0].xFeature, y: scatterplotData[0].yFeature });
            console.log('PRD coords (xPredict, yPredict):', { x: scatterplotData[0].xPredict, y: scatterplotData[0].yPredict });
            console.log('Layer s1-s5 coords:', {
                s1: { x: scatterplotData[0].xLayer1, y: scatterplotData[0].yLayer1 },
                s2: { x: scatterplotData[0].xLayer2, y: scatterplotData[0].yLayer2 },
                s3: { x: scatterplotData[0].xLayer3, y: scatterplotData[0].yLayer3 },
                s4: { x: scatterplotData[0].xLayer4, y: scatterplotData[0].yLayer4 },
                s5: { x: scatterplotData[0].xLayer5, y: scatterplotData[0].yLayer5 }
            });
            console.log('Raw embedding sample:', main.embedding.filterData[0]);
            console.groupEnd();

        } else { // '3layers'
            vis.scatterplot(dom.contents.actPlot, 'act', scatterplotData);
            vis.scatterplot(dom.contents.feaPlot, 'fea', scatterplotData);
            vis.scatterplot(dom.contents.prdPlot, 'prd', scatterplotData);
            $('#act-container .container-title').html('Actual Label (ACT)');
        }
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
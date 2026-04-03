// Initialize data option events
dom.initDataOptions = function (embedding) {

    dom.options.errorMethod.on('change', function () {
        embedding.options['Distance of error'] = dom.getErrorMethod();
        main.start();
    });

    dom.options.embeddingMethod.on('change', function () {
        embedding.options['Embedding method'] = dom.getEmbeddingMethod();
        main.start();
    });

    dom.options.dataType.on('change', function () {
        embedding.options['Data type'] = dom.getDataType();
        if (dom.getDataType() === 'cifar10') {
            main.imagePath = 'cifar10_images/';
            main.imageFileType = '.png';
        } else {
            main.imagePath = 'vis_filtered_thumbnails/';
            main.imageFileType = '.jpg';
        }
        main.start();
    });

    return;
}

// Load a feature file by name and trigger data reload
dom.loadFeatureFile = function (embedding, filename) {
    let content = featureFiles[filename];
    if (!content) return;

    let attributes = content.split('\n').filter(function (s) {
        return s.trim() !== '';
    });
    embedding.labels = attributes;

    if (filename === 'cifar10.txt') {
        embedding.options['Data type'] = 'cifar10';
        main.imagePath = 'cifar10_images/';
        main.imageFileType = '.png';
        dom.options.dataType.val('Cifar10');
    } else {
        embedding.options['Data type'] = 'synthetic';
        main.imagePath = 'vis_filtered_thumbnails/';
        main.imageFileType = '.jpg';
        dom.options.dataType.val('Synthetic');
    }

    main.start();
}

// Initialize file select: populate options and bind change event
dom.initFileInput = function (embedding) {
    Object.keys(featureFiles).forEach(function (filename) {
        var isCifar = filename === 'cifar10.txt';
        dom.options.featureFile.append(
            $('<option/>', {
                value: filename,
                text: filename,
                disabled: isCifar || undefined,
                title: isCifar ? 'Not available' : undefined
            })
        );
    });

    dom.options.featureFile.on('change', function () {
        let filename = $(this).val();
        if (filename) {
            dom.loadFeatureFile(embedding, filename);
        }
    });
}



// Initialize selector toggle button
dom.initSelectToggleButton = function () {

    dom.buttons.selectToggle.on('click', function () {
        dom.buttons.selectToggle.toggleClass('open');
        var visOpen = dom.buttons.groupSelectToggle.hasClass('open');
        var compareOpen = dom.buttons.compareToggle.hasClass('open');

        if (dom.buttons.selectToggle.hasClass('open')) {
            dom.containers.filter.width('15%');
            $('#clear-selections-btn').show();
            if (!visOpen) {
                dom.containers.scatterplot.width('85%');
            } else if (compareOpen) {
                dom.containers.scatterplot.width('45%');
                dom.containers.vis.width('40%');
            } else {
                dom.containers.scatterplot.width('35%');
                dom.containers.vis.width('50%');
            }
        } else {
            dom.containers.filter.width('0%');
            $('#clear-selections-btn').hide();
            if (!visOpen) {
                dom.containers.scatterplot.width('100%');
            } else if (compareOpen) {
                dom.containers.scatterplot.width('60%');
                dom.containers.vis.width('40%');
            } else {
                dom.containers.scatterplot.width('40%');
                dom.containers.vis.width('60%');
            }
            dom.containers.attrViz.width('0%');
            dom.buttons.attrStudy.removeClass('active');
        }
    });
}

// Initialize group selection toggle button
dom.initGroupSelectToggleButton = function () {

    dom.buttons.groupSelectToggle.on('click', function () {
        dom.buttons.groupSelectToggle.toggleClass('open');
        var filterOpen = dom.buttons.selectToggle.hasClass('open');
        var compareOpen = dom.buttons.compareToggle.hasClass('open');
        var filterWidth = filterOpen ? 15 : 0;

        if (dom.buttons.groupSelectToggle.hasClass('open')) {
            var visWidth = compareOpen ? 40 : 50;
            dom.containers.vis.width(visWidth + '%');
            dom.containers.scatterplot.width((100 - visWidth - filterWidth) + '%');
        } else {
            dom.containers.vis.width('0%');
            dom.containers.scatterplot.width((100 - filterWidth) + '%');
        }
    });
}

// Show fea prd comparison events
dom.initCompareButton = function () {

    dom.buttons.compareToggle.on('click', function (e) {
        e.stopPropagation();
        $('#compare-menu').toggle();
    });

    $('#compare-option-1layer').on('click', function () {
        $('#compare-menu').hide();
        dom.closeCompare();
    });

    $('#compare-option-3layers').on('click', function () {
        $('#compare-menu').hide();
        dom.openCompare('3layers');
    });

    $('#compare-option-6layers').on('click', function () {
        $('#compare-menu').hide();
        dom.openCompare('6layers');
    });

    $(document).on('click', function () {
        $('#compare-menu').hide();
    });
    $('#compare-menu').on('click', function (e) {
        e.stopPropagation();
    });
}

dom.openCompare = function (mode) {
    main.compareMode = mode;
    dom.buttons.compareToggle.addClass('open');

    if (mode === '3layers') {
        dom.containers.actplot.width('33.2%');
        dom.containers.layer2plot.width('0%');
        dom.containers.layer3plot.width('0%');
        dom.containers.layer4plot.width('0%');
        dom.containers.feaplot.width('33.2%');
        dom.containers.prdplot.width('33.2%');
    } else {
        dom.containers.actplot.width('16.6%');
        dom.containers.layer2plot.width('16.6%');
        dom.containers.layer3plot.width('16.6%');
        dom.containers.layer4plot.width('16.6%');
        dom.containers.feaplot.width('16.6%');
        dom.containers.prdplot.width('16.6%');
    }

    if (dom.buttons.attrStudy.hasClass('active')) {
        dom.containers.attrViz.width('40%');
        vis.initRelations(dom.contents.attrViz, main.embedding);
        vis.initMatrix(dom.options.matrix.val());
        vis.initCount(dom.options.count.val());
    }
    requestAnimationFrame(function () { main.visualize(); });
}

dom.closeCompare = function () {
    main.compareMode = 'none';
    dom.buttons.compareToggle.removeClass('open');

    dom.containers.actplot.width('100%');
    dom.containers.layer2plot.width('0%');
    dom.containers.layer3plot.width('0%');
    dom.containers.layer4plot.width('0%');
    dom.containers.feaplot.width('0%');
    dom.containers.prdplot.width('0%');

    if (dom.buttons.attrStudy.hasClass('active')) {
        dom.containers.attrViz.width('40%');
        vis.initRelations(dom.contents.attrViz, main.embedding);
        vis.initMatrix(dom.options.matrix.val());
        vis.initCount(dom.options.count.val());
    }
    requestAnimationFrame(function () { main.visualize(); });
}

// Refresh visualization on transition has ended
dom.initTransitionEvents = function () {
    dom.containers.scatterplot.on('transitionEnd webkitTransitionEnd', function () {
        // Refresh visualization
        main.visualize();
    });
}

// Update dot color based on different modes
dom.initScatterPlotButtons = function () {
    dom.buttons.defaultDot.on('click', function () {
        dom.buttons.dotColors.removeClass('selected');
        dom.buttons.defaultDot.addClass('selected');
        main.visualize();
    });

    dom.buttons.predProbDot.on('click', function () {
        dom.buttons.dotColors.removeClass('selected');
        dom.buttons.predProbDot.addClass('selected');
        main.visualize();
    });

    dom.buttons.flowerDot.on('click', function () {
        dom.buttons.dotColors.removeClass('selected');
        dom.buttons.flowerDot.addClass('selected');
        main.visualize();
    });

    return;
}

// Initialize vis tab events
dom.initVisTabEvents = function () {
    dom.tabs.overview1.on('click', function () {
        enableView('overview', vis.panels.first.views);
        vis.displayPanel1();
    });

    dom.tabs.overview2.on('click', function () {
        enableView('overview', vis.panels.second.views);
        vis.displayPanel2();
    });

    dom.tabs.statistic1.on('click', function () {
        enableView('statistic', vis.panels.first.views);
        vis.displayPanel1();
    });

    dom.tabs.statistic2.on('click', function () {
        enableView('statistic', vis.panels.second.views);
        vis.displayPanel2();
    });

    dom.tabs.clustering1.on('click', function () {
        enableView('clustering', vis.panels.first.views);
        vis.displayPanel1();
    });

    dom.tabs.clustering2.on('click', function () {
        enableView('clustering', vis.panels.second.views);
        vis.displayPanel2();
    });

    // Enable view in panel1
    function enableView (view, panelViews) {
        Object.keys(panelViews).forEach(function (item) {
            if (item === view) {
                panelViews[item] = true;
            } else {
                panelViews[item] = false;
            }
        });
        return;
    }

    return;
}

// Initialize panel locker events
/*
dom.initLockEvents = function () {
    dom.buttons.lock1.on('click', function (e) {
        e.stopPropagation();
        if (vis.panels.first.selection !== undefined) {
            dom.buttons.lock1.toggleClass('active');
            if (dom.buttons.lock1.hasClass('active')) {
                dom.buttons.lock1.html('<i class="fas fa-lock"></i>');
                vis.panels.first.locked = true;

                // Unlock second one
                dom.buttons.lock2.removeClass('active');
                dom.buttons.lock2.html('<i class="fas fa-lock-open"></i>');
                vis.panels.second.locked = false;
            } else {
                dom.buttons.lock1.html('<i class="fas fa-lock-open"></i>');
                vis.panels.first.locked = false;
            }
        }
    });

    dom.buttons.lock2.on('click', function (e) {
        e.stopPropagation();
        if (vis.panels.second.selection !== undefined) {
            dom.buttons.lock2.toggleClass('active');
            if (dom.buttons.lock2.hasClass('active')) {
                dom.buttons.lock2.html('<i class="fas fa-lock"></i>');
                vis.panels.second.locked = true;

                // Unlock first one
                dom.buttons.lock1.removeClass('active');
                dom.buttons.lock1.html('<i class="fas fa-lock-open"></i>');
                vis.panels.first.locked = false;
            } else {
                dom.buttons.lock2.html('<i class="fas fa-lock-open"></i>');
                vis.panels.second.locked = false;
            }
        }
    });

    return;
}*/

dom.initAttributeVizButton = function () {
    dom.buttons.attrStudy.on('click', function () {
        dom.buttons.attrStudy.toggleClass('active');
        if (dom.buttons.attrStudy.hasClass('active')) {
            dom.buttons.attrStudy.html('Close Attribute Study');
            if (dom.buttons.compareToggle.hasClass('open')) {
                dom.containers.attrViz.width('40%');
            } else {
                dom.containers.attrViz.width('40%');
            }
            
        } else {
            dom.buttons.attrStudy.html('Open Attribute Study');
            dom.containers.attrViz.width('0px');
        }
      
    });

    dom.containers.attrViz.on('transitionEnd webkitTransitionEnd', function () {
        if (dom.buttons.attrStudy.hasClass('active')) {
            vis.initRelations(dom.contents.attrViz, main.embedding);
            vis.initMatrix(dom.options.matrix.val());
            vis.initCount(dom.options.count.val());
        }
    });

    return;
}

dom.initModelArchButton = function () {
    var panel = $('#model-arch-panel');

    dom.buttons.modelArch.on('click', function () {
        panel.toggleClass('open');
        var isOpen = panel.hasClass('open');
        dom.buttons.modelArch.html(isOpen ? 'Close Architecture' : 'Model Architecture');
    });

    $('#model-arch-close-btn').on('click', function () {
        panel.removeClass('open');
        dom.buttons.modelArch.html('Model Architecture');
    });
}

// Background opacity slider
dom.initBackgroundOpacitySlider = function () {
    dom.buttons.backgroundSlider.on('input', function () {
        var opacity = parseFloat($(this).val());
        vis.setBackgroundOpacity(opacity);
    });
}

dom.initMatrixOptions = function () {
    dom.options.matrix.on('change', function () {
        vis.initMatrix(dom.options.matrix.val());
    });

    $('#matrix-cluster-btn').on('click', function () {
        vis.matrixClustered = !vis.matrixClustered;
        $(this).toggleClass('selected');
        vis.initMatrix(dom.options.matrix.val());
    });

    return;
}

dom.initCountOptions = function () {
    dom.options.count.on('change', function () {
        vis.initCount(dom.options.count.val());
    });

    return;
}

// Scatterplot drawing options
dom.initPlotOptions = function () {
    dom.options.scatterplot.on('change', function () {
        main.visualize();
    });
}

dom.initDropContent = function () {
    dom.contents.vis1.on('dragover', function (event) {
        event.preventDefault();
        dom.contents.vis1.css({'background': '#d9d9d9'});
    });

    dom.contents.vis1.on('dragleave', function () {
        dom.contents.vis1.css({'background': '#f0f0f0'});
    });

    dom.contents.vis2.on('dragover', function (event) {
        event.preventDefault();
        dom.contents.vis2.css({'background': '#d9d9d9'});
    });

    dom.contents.vis2.on('dragleave', function () {
        dom.contents.vis2.css({'background': '#f0f0f0'});
    });

    dom.contents.vis1.on('drop', function (event) {
        event.preventDefault();
        dom.contents.vis1.css({'background': '#f0f0f0'});
        vis.addSelectionToPanel(dom.draggedSelection, 'vis1');
    });

    dom.contents.vis2.on('drop', function (event) {
        event.preventDefault();
        dom.contents.vis2.css({'background': '#f0f0f0'});
        vis.addSelectionToPanel(dom.draggedSelection, 'vis2');
    });

    return;
}

dom.initImageContainer = function() {
    dom.buttons.imageContainer.on('click', function() {
        dom.buttons.imageContainer.toggleClass('hide');
        if (dom.buttons.imageContainer.hasClass('hide')) {
            dom.containers.top.height('100%');
            dom.containers.bottom.height('0%');
            dom.containers.attrViz.height('100%');
            main.visualize();
        } else {
            dom.containers.top.height('70%');
            dom.containers.bottom.height('30%');
            dom.containers.attrViz.height('70%');
            main.visualize();
        }
    });

    $('#clear-selections-btn').on('click', function() {
        vis.selectedDots = [];
        vis.selectionCount = 0;
        d3.selectAll('.scatterdot-selected').remove();
        dom.contents.selection.empty();
        main.visualize();
    });

    $('#clear-images-btn').on('click', function() {
        main.selectImageIds.forEach(function(id) {
            d3.selectAll('.inner-circle-' + id).attr('fill', '#fff');
            d3.selectAll('.inner-text-' + id).style('fill', '#000');
        });
        main.selectImageIds = [];
        d3.selectAll('.scatterdot-selected').remove();
        d3.selectAll('.scatterdot-hover').remove();
        dom.contents.images.empty();
    });
}


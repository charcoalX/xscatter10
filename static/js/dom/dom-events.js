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

// // Initialize file input events
// dom.initFileInput = function (embedding) {
    
//     dom.buttons.file.on('click', function () {
//         dom.inputs.file.click();
//     });

//     dom.inputs.file.on('change', function () {
//         if (this.files && this.files[0]) {
//             let file = this.files[0];
//             let fileReader = new FileReader();

//             fileReader.addEventListener('load', function (e) {
//                 let content = e.target.result;
//                 let attributes = content.split('\n');

//                 embedding.labels = attributes;
//                 main.start();
//             });

//             fileReader.readAsBinaryString(file);
//         }
//     });
// }

// Initialize file input events
dom.initFileInput = function (embedding) {  
    dom.buttons.file.on('click', function () {                    
        embedding.labels = ["BCC",
            "Beam Off Image",
            "Circular Beamstop",
            "Diffuse high-q",
            "Diffuse low-q",
            "FCC",
            "Halo",
            "High background",
            "Higher orders",
            "Linear beamstop",
            "Many rings",
            "Polycrystalline",
            "Ring",
            "Strong scattering",
            "Structure factor",
            "Weak scattering",
            "Wedge beamstop"]; 
        console.log("clicked and labels:",embedding.labels)      
        main.start();               
    });
}



// Initialize selector toggle button
dom.initSelectToggleButton = function () {

    dom.buttons.selectToggle.on('click', function () {
        dom.buttons.selectToggle.toggleClass('open');
        // Open and close selection sidebar
        if (dom.buttons.selectToggle.hasClass('open')) {
            dom.containers.filter.width('15%');
            if (dom.buttons.compareToggle.hasClass('open')) {
                dom.containers.scatterplot.width('45%');
                dom.containers.vis.width('40%');
            } else {
                dom.containers.scatterplot.width('35%');
                dom.containers.vis.width('50%');
            }
        } else {
            dom.containers.filter.width('0%');

            if (dom.buttons.compareToggle.hasClass('open')) {
                dom.containers.scatterplot.width('60%');
                dom.containers.vis.width('40%');
            } else {
                dom.containers.scatterplot.width('40%');
                dom.containers.vis.width('60%');
            }

            // Hide attribute container
            // And   active class from attribute study button
            dom.containers.attrViz.width('0%');
            dom.buttons.attrStudy.removeClass('active');
        }

    });
}

// Show fea prd comparison events
dom.initCompareButton = function () {
    
    dom.buttons.compareToggle.on('click', function () {
        dom.buttons.compareToggle.toggleClass('open');
        // Open comparison
        if (dom.buttons.compareToggle.hasClass('open')) {

            // Resize scatterplot and vis depending on filter container
            if (dom.buttons.selectToggle.hasClass('open')) {
                dom.containers.scatterplot.width('45%');
                dom.containers.vis.width('40%');
            } else {
                dom.containers.scatterplot.width('60%');
                dom.containers.vis.width('40%');
            }

            dom.containers.actplot.width('33.2%');
            dom.containers.feaplot.width('33.2%');
            dom.containers.prdplot.width('33.2%');

            // Check attribute viz if opened
            if (dom.buttons.attrStudy.hasClass('active')) {
                dom.containers.attrViz.width('40%')
                vis.initRelations(dom.contents.attrViz, main.embedding);
                vis.initMatrix(dom.options.matrix.val());
                vis.initCount(dom.options.count.val());
            }

        } else {

            if (dom.buttons.selectToggle.hasClass('open')) {
                dom.containers.scatterplot.width('35%');
                dom.containers.vis.width('50%');
            } else {
                dom.containers.scatterplot.width('40%');
                dom.containers.vis.width('60%');
            }

            dom.containers.actplot.width('100%');
            dom.containers.feaplot.width('0%');
            dom.containers.prdplot.width('0%');

            // Check attribute viz if opened
            if (dom.buttons.attrStudy.hasClass('active')) {
                dom.containers.attrViz.width('40%')
                vis.initRelations(dom.contents.attrViz, main.embedding);
                vis.initMatrix(dom.options.matrix.val());
                vis.initCount(dom.options.count.val());
            }
        }

    });

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

// Hide and show background button
dom.initHideBackgroundButton = function () {
    dom.buttons.hideBackground.on('click', function () {
        dom.buttons.hideBackground.toggleClass('active');
        if (dom.buttons.hideBackground.hasClass('active')) {
            vis.hideScatterplotBackground();
            dom.buttons.hideBackground.html('Show Background');
        } else {
            main.visualize();
            dom.buttons.hideBackground.html('Hide Background');
        }
    });
}

dom.initMatrixOptions = function () {
    dom.options.matrix.on('change', function () {
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
}
vis.selectionCount = 0;
vis.selectedDots = [];
vis.distanceOfErrors = [];
vis.backgroundOpacity = 1.0;

// Visualize scatterplot
vis.scatterplot = function (container, type, dots) {

    // console.log(dots);

    // Clear scatterplot container and reset distance of errors
    container.empty();

    let width = container.width(),
        height = container.height();

    let circleWidth = 40;

    let x, y, group;
    let linearScale = d3.scaleLinear()
                        .domain([d3.min(vis.distanceOfErrors), d3.max(vis.distanceOfErrors)])
                        .range([0.3, 1]);

    let svg = d3.select('#' + container.attr('id')).append('svg')
                .attr('id', 'scatterplot-' + type)
                .attr('width', width)
                .attr('height', height);

    for (let i = 0, len = dots.length; i < len; ++i) {
        
        let dot = dots[i];
        
        if (vis.getTsneCoords(dot,type).x !== undefined) {

            // Create zoom coordinates
            x = vis.getTsneCoords(dot, type).x * (width - circleWidth * 2) + circleWidth;
            y = vis.getTsneCoords(dot, type).y * (height - 20 - circleWidth * 2) +  circleWidth;

            let dotColor = vis.getDotColor(dot.id);

            zCoords = d3.range(1).map(function () { return [x, y] });

            // Create each dot as one group
            group =  svg.append('g')
                        .attr('id', 'scatterdot-' + type + '-' + dot.id)
                        .attr('class', 'scatterdot-' + type)
                        .attr('data', dot)
                        .attr('transform', 'translate(' + x + ',' + y + ')');

            // Add circle if selected

            group.data(zCoords)
                .enter()
                .attr('transform', vis.zoomTransform(d3.zoomIdentity));

            group.append('circle')
                .attr('id', 'scattercircle-' + type + '-' + dot.id)
                .attr('class', 'scattercircle-' + type)
                .attr('cx', circleWidth / 2)
                .attr('cy', circleWidth / 2 )
                .attr("transform", "translate(-" + (circleWidth / 2) + ",-" + (circleWidth / 2) + ")")
                .attr('r', 5)
                .attr('fill', vis.getDotColor(dot.id))
                .attr('fill-opacity', (d,i) => (linearScale(vis.distanceOfErrors[dot.id])))
                .attr('opacity', vis.backgroundOpacity);

            if (vis.isSelectedDots(dot.id)) {
                group.append('circle')
                    .attr('id', 'scatterselectedcircle-' + type + '-' + dot.id)
                    .attr('class', 'scatterselectedcircle-' + type)
                    .attr('cx', circleWidth / 2)
                    .attr('cy', circleWidth / 2 )
                    .attr("transform", "translate(-" + (circleWidth / 2) + ",-" + (circleWidth / 2) + ")")
                    .attr('r', 5)
                    .attr('fill', vis.getSelectedColor(dot.id))
                    //.attr('stroke', '#252525')
                    //.attr('stroke-width', '1px')
                    .attr('fill-opacity', (d,i) => (linearScale(vis.distanceOfErrors[dot.id])));
                    
                // 2020july
                group.append('text')
                    .attr('id', 'scatterselectedtext-' + type + '-' + dot.id)
                    .attr('class', 'scatterselectedtext-' + type)
                    .attr('dx', '1em')
                    .attr('dy', '-0.7em')
                    .style("text-anchor", "middle")
                    .style('fill', '#000')
                    .style('font-size', '12px')
                    .text(dot.id);
            }

            // Draw flowers
            if (dom.buttons.flowerDot.hasClass('selected')) {

                let radius = Math.min(circleWidth, circleWidth) / 2;
                let innerRadius = 0.3 * radius;

                let predprobs = [];
                let trueValue = [];
                Object.keys(dot.predProb).forEach(function (item) {
                    predprobs.push(dot.predProb[item]);
                });
                Object.keys(dot.trueLabel).forEach(function (item) {
                    trueValue.push(dot.trueLabel[item]);
                });
               
                
                
                let pie = d3.pie()
                            .sort(null)
                            .value((d) => 1);

                let arc = d3.arc()
                            .innerRadius(innerRadius)
                            .outerRadius(function (d) {
                                return (radius - innerRadius) * (parseFloat(d.data) / 1.0) + innerRadius;
                            });
                let outlineArc = d3.arc()
                            .innerRadius(innerRadius)
                            .outerRadius(radius)

                // Modify colors
                group.selectAll('.solidArc')
                    .data(pie(predprobs))
                    .enter()
                    .append('path')
                    .attr('fill', (d, i) => {
                        if (main.embedding.filterLabels.length === 0) {
                            return main.embedding.labelColors[i]
                        }
                        if (main.embedding.filterLabels.indexOf(i) !== -1) {
                            return main.embedding.labelColors[i]
                        } else {
                            return 'none';
                        }
                    })
                    .attr('fill-opacity', '0.5')
                    .attr('class', 'solidArc')
                    .attr('d', arc)
                    .attr('stroke', (d, i) => {
                        
                        // TODO: need to fix this confusing here;
                        if (main.embedding.filterLabels.length === 0) {
                            if (dot.trueLabel[i] === 1) {
                                return main.embedding.labelColors[i];
                            } else {
                                if (d.data >0.5){ return '#000';  }
                                else {return 'none';}                                 
                            }
                        } else {
                            if (main.embedding.filterLabels.indexOf(i) !== -1) {
                                if (dot.trueLabel[i] === 1) {
                                    return main.embedding.labelColors[i];
                                } else {
                                    if (d.data >0.5){ return '#000';}
                                    else {return 'none';}     
                                }
                            } else {
                                return 'none';
                            }
                        }
                        
                    })
                    .attr('stroke-width', '1px');

                // // outlineArc
                group.selectAll('.outlineArc')
                    .data(pie(trueValue))
                    .enter()
                    .append("path")
                    .attr('fill','none')
                    .attr('stroke', function(d, i){
                        
                        if (main.embedding.filterLabels.length === 0) {
                            if(d.data === 1){
                                return main.embedding.labelColors[i];
                            } else{
                                return 'none';
                            }
                        }
                        else{
                            if (main.embedding.filterLabels.indexOf(i) !== -1) {
                                if (dot.trueLabel[i] === 1) {
                                    return main.embedding.labelColors[i];
                                } else {
                                    return 'none';
                                }
                            } else {
                                return 'none';
                            }
                        }
                        
                    })
                    .attr('class','outlineArc')
                    .attr('d',outlineArc);



            }
        }
    }

    // Set selection events
    dom.buttons.singleSelect.on('click', function () {
        dom.buttons.singleSelect.css({ background: '#525252', color: '#ffffff' });
        dom.buttons.multipleSelect.css({ background: '#ffffff', color: '#000000' });
        vis.addDotZoom(svg, '.' + 'scatterdot-' + type, container);
    });

    dom.buttons.multipleSelect.on('click', function () {
        dom.buttons.singleSelect.css({ background: '#ffffff', color: '#000000' });
        dom.buttons.multipleSelect.css({ background: '#525252', color: '#ffffff' });
        vis.addDotLasso(svg, '.' + 'scatterdot-' + type, container);
    });

    // Reset selection button and add zoom by default
    dom.buttons.singleSelect.css({ background: '#525252', color: '#ffffff' });
    dom.buttons.multipleSelect.css({ background: '#ffffff', color: '#000000' });
    vis.addDotZoom(svg, '.' + 'scatterdot-' + type, container);

    return;
}

// Get x y coordinate of tsne based on type
vis.getTsneCoords = function (dot, type) {
    switch (type) {
        case 'act': return {
            x: dot.xTrueLabel,
            y: dot.yTrueLabel
        }
        case 'fea': return {
            x: dot.xFeature,
            y: dot.yFeature
        }
        case 'prd': return {
            x: dot.xPredict,
            y: dot.yPredict
        }
        case 'layer1': return {
            x: dot.xLayer1,
            y: dot.yLayer1
        }
        case 'layer3': return {
            x: dot.xLayer3,
            y: dot.yLayer3
        }
        case 'layer5': return {
            x: dot.xLayer5,
            y: dot.yLayer5
        }
        default:  return undefined;
    }
}

// Increase selected radius by 9 and default by 5
vis.getSelectedRadius = function (id) {
    for (let i = 0; i < vis.selectedDots.length; ++i) {
        var select = vis.selectedDots[i];
        var ids = select.ids;

        if (ids.indexOf(id) !== -1) {
            return 9;
        }
    }
    return 5;
}

// Coloring selected dots
vis.getSelectedColor = function (id) {

    var highlightColor = '#252525'
    for (let i = 0; i < vis.selectedDots.length; ++i) {
        var select = vis.selectedDots[i];
        var color = select.color;
        var ids = select.ids;
        if (ids.indexOf(id) !== -1) {
            highlightColor = color;
        }
    }

    return highlightColor;
}

// Add zoom bounding box 
vis.zoomTransform = function (t) {

    return function (d, i) {
        return 'translate(' + t.apply(d) + ')';
    }

}

// Add zoom interaction
vis.addDotZoom = function (svg, className, container) {
    
    var width = container.width(),
        height = container.height();

    // Create bounding box rectangle
    svg.append('rect')
        .attr('class', 'zoom-rect')
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .attr('width', width)
        .attr('height', height)
        .attr('z-index', -10)
        .call(
            d3.zoom().scaleExtent([1, 20])
                .on('zoom', function () {
                    d3.selectAll(className)
                        .transition()
                        .duration(0)
                        .attr('transform', vis.zoomTransform(d3.event.transform));
                 })
        );

    // Add event to all dots
    d3.selectAll(className)
        .attr('cursor', 'pointer')
        .on('mouseenter', vis.dotOnMouseOver)
        .on('mouseleave', vis.dotOnMouseOut)
        .on('click', vis.dotOnClick)
        .moveToFront();

    return;
}

// Dot click and select single dot
vis.dotOnClick = function () {

    var imageID = d3.select(this).attr('id').split('-')[2];

    // Check if selected image alreay exist
    if (main.selectImageIds.indexOf(imageID) === -1) {
        main.selectImageIds.push(imageID);
    }

    //image_ids.push(imageID);
    vis.showSelectedImages(main.selectImageIds);
    vis.selectInteraction([imageID]);

    return;
}

// dot mouse over event
vis.dotOnMouseOver = function () {

    dom.containers.scatterPlotImage.empty();
    dom.containers.scatterPlotImageId.empty();

    var id = d3.select(this).attr('id').split('-')[2];

    vis.hoverInteraction(id);

    var image = $('<img/>', {
        src: '/static/images/' + main.imagePath + id + main.imageFileType,
        alt: ''
    }).css({ width: '100%', height: '100%' });

    dom.containers.scatterPlotImage.append(image);
    dom.containers.scatterPlotImage.css({ 'opacity': 1 });
    dom.containers.scatterPlotImageId.append('Image ID: ' + id);
    dom.containers.scatterPlotImageId.css({ 'opacity': 1 });

    return;
}

// dot mouse out event
vis.dotOnMouseOut = function () {
    var id = d3.select(this).attr('id').split('-')[2];
    dom.containers.scatterPlotImage.empty();
    dom.containers.scatterPlotImageId.empty();
    dom.containers.scatterPlotImage.css({ 'opacity': 0 });
    dom.containers.scatterPlotImageId.css({ 'opacity': 0 });

    vis.hoverOutInteraction(id);

    return;
}

// Utility for move shape to front
d3.selection.prototype.moveToFront = function() {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};

// Check if dot id is selected
vis.isSelectedDots = function (id) {
    for (let i = 0; i < vis.selectedDots.length; ++i) {
        var ids = vis.selectedDots[i].ids;
        if (ids.indexOf(id) !== -1) {
            return true;
        }
    }

    return false;
}

// Generate dots color
vis.getDotColor = function (id) {

    let color = '#252525';

    if (dom.buttons.defaultDot.hasClass('selected') || dom.buttons.flowerDot.hasClass('selected')) return color;

    Object.keys(main.embedding.filterData).forEach(function (item) {
        if (id == item) {
            
            // Detect dot color mode by buttons
            let label = main.embedding.filterData[item].predProb;

            let index = Object.keys(label).reduce(function(a, b){ return label[a] > label[b] ? a : b });

            color = main.embedding.labelColors[index];
            return color;
        }
    })

    return color;
}

// Add lasso selection
vis.addDotLasso = function (svg, className) {
    
    d3.selectAll('.zoom-rect').remove();
    
    let dots = d3.selectAll(className);

    let lasso = d3.lasso()
                .closePathSelect(true)
                .closePathDistance(100)
                .items(dots)
                .targetArea(svg)
                .on('end', function () {
                    // Get all dots id
                    let dotIds = [];
                    lasso.selectedItems().each(function (d, i) {
                        // Add id of selected item
                        let group = d3.select(this);
                        let id = parseInt(group.attr('id').split('-')[2])
                        dotIds.push(id);
                    });

                    // Create selected dots and generate selection id
                    let select = {
                        selectId: vis.selectionCount + 1,
                        color: utils.getRandomColors(),
                        ids: dotIds,
                        lock: false
                    }

                    // Add to selected dots and increment count
                    vis.selectedDots.push(select);
                    vis.selectionCount += 1;
                    
                    main.visualize();
                });

    // Add lasso to svg
    svg.call(lasso);

    (function (t) { setTimeout(function () { vis.repositionLabels(t); }, 0); })(type);

    return;
}

// Update circle color of selection values
vis.updateColor = function (id, color) {
    d3.select('#scatterselectedcircle-act-' + id).attr('fill', color);
    d3.select('#scatterselectedcircle-fea-' + id).attr('fill', color);
    d3.select('#scatterselectedcircle-prd-' + id).attr('fill', color);
    d3.select('#scatterselectedcircle-layer1-' + id).attr('fill', color);
    d3.select('#scatterselectedcircle-layer3-' + id).attr('fill', color);
    d3.select('#scatterselectedcircle-layer5-' + id).attr('fill', color);
    return;
}

vis.setBackgroundOpacity = function (opacity) {
    vis.backgroundOpacity = opacity;
    d3.selectAll('.scattercircle-act').attr('opacity', opacity);
    d3.selectAll('.scattercircle-fea').attr('opacity', opacity);
    d3.selectAll('.scattercircle-prd').attr('opacity', opacity);
    d3.selectAll('.scattercircle-layer1').attr('opacity', opacity);
    d3.selectAll('.scattercircle-layer3').attr('opacity', opacity);
    d3.selectAll('.scattercircle-layer5').attr('opacity', opacity);
}

vis.repositionLabels = function (type) {
    // Reset any previous repositioning so getBBox reflects natural position
    d3.selectAll('.scatterselectedtext-' + type).attr('transform', null);

    var simNodes = [];

    d3.selectAll('.scatterselectedtext-' + type).each(function () {
        var t = d3.select(this.parentNode).attr('transform');
        var m = t.match(/translate\(([^,]+),\s*([^)]+)\)/);
        if (!m) return;
        var ax = +m[1], ay = +m[2];
        var bbox = this.getBBox();

        // Label centre in root SVG coordinate space
        var cx = ax + bbox.x + bbox.width  / 2;
        var cy = ay + bbox.y + bbox.height / 2;

        simNodes.push({
            el:      this,
            ax:      ax,         // parent group origin x
            ay:      ay,         // parent group origin y
            bboxX:   bbox.x,     // natural top-left x in group coords
            bboxY:   bbox.y,     // natural top-left y in group coords
            w:       bbox.width,
            h:       bbox.height,
            x:       cx,         // force sim position (centre, SVG space)
            y:       cy,
            anchorX: cx,         // pull-back anchor
            anchorY: cy,
            r: Math.sqrt(bbox.width * bbox.width + bbox.height * bbox.height) / 2 + 3
        });
    });

    if (simNodes.length < 2) return;

    var simulation = d3.forceSimulation(simNodes)
        .alphaDecay(0)          // constant force — no cooling
        .force('collide', d3.forceCollide(function (d) { return d.r; }).strength(1).iterations(8))
        .force('x', d3.forceX(function (d) { return d.anchorX; }).strength(0.03))
        .force('y', d3.forceY(function (d) { return d.anchorY; }).strength(0.03))
        .stop();

    for (var i = 0; i < 200; i++) simulation.tick();

    simNodes.forEach(function (d) {
        // New top-left in group coords = (sim_centre - SVG_origin) - natural_bbox_offset
        var tx = (d.x - d.w / 2 - d.ax) - d.bboxX;
        var ty = (d.y - d.h / 2 - d.ay) - d.bboxY;
        d3.select(d.el).attr('transform', 'translate(' + tx + ',' + ty + ')');
    });
};
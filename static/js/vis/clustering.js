vis.clustering = function (container, selection, index) {
    // Clear current container
    container.empty();
    // Initialize cluster controls
    vis.initClusterControls(container, selection, index);
    vis.preprocessCluster(container, selection, index);
    return;
}

vis.initClusterControls = function (container, selection, index) {

    // Create controls container
    let controls = dom.createDiv('', 'cluster-controls', 'Cluster By: ', {});

    // Create select options
    let optionNames = ['ACT tSNE', 'FEA tSNE', 'PRD tSNE'];//, 'Feature-2048', 'PredProb17', 'TrueLabel17'];
    let optionValues = ['act', 'fea', 'prd']; // 'feature2048', 'predProb17', 'trueLabel17'];
    let selectOptions = dom.createSelectOptions('clusterby-' + index, 'clusterby-selection', optionNames, optionValues);
    controls.append(selectOptions);

    // Create cluster number input
    let label = $('<label/>').html('3');
    let input = dom.createRangeInput(3, [1, 5], 'cluster-slider', 'clusternum-' + index);
    controls.append('<br/><br/>Clusters: ').append(input).append(label);

    // Add everything to main container
    container.append(controls);

    input.on('input', function () {
        label.html(input.val());
        vis.preprocessCluster(container, selection, index);
    });

    selectOptions.on('change', function () {
        vis.preprocessCluster(container, selection, index);
    });

    return;
}

vis.preprocessCluster = function (container, selection, index) {

    var images = vis.getSelectImages(selection);
    var vectors = vis.getClusterVectors(images, index);
    var clusterNum = $('#clusternum-' + index).val();

    // Do clustering
    query.getCluster(vectors, parseInt(clusterNum)).then(function (result) {
        vis.displayCluster(container, images, main.embedding, result.cluster, clusterNum, index);
        vis.selectInteraction(main.selectImageIds);
        return;
    });
}

vis.getSelectImages = function (selection) {

    var images = [];
    
    for (let i = 0; i < selection.ids.length; ++i) {

        let id = selection.ids[i];

        // TODO: Can be detect by filter
        Object.keys(main.embedding.data).forEach(function (item) {
            if (item == id) {
                main.embedding.data[item]['image_id'] = item;
                images.push(main.embedding.data[item]);
            }
        });

    }

    return images;
}

vis.getClusterVectors = function (data, index) {
    let vectors = [];
    let clusterOptions = $('#clusterby-' + index).val();
    var x, y;
    for (let i = 0; i < data.length; ++i) {
        switch (clusterOptions) {
            case 'act':
                x = data[i]['truelabel17-x'];
                y = data[i]['truelabel17-y'];
                vectors.push([x, y]);
                break;
            case 'fea':
                x = data[i]['feature2048-x'];
                y = data[i]['feature2048-y'];
                vectors.push([x, y]);
                break;
            case 'prd':
                x = data[i]['prediction17-x'];
                y = data[i]['prediction17-y'];
                vectors.push([x, y]);
                break;
            case 'feature2048':
                let feature2048 = [];
                Object.keys(data[i]['feature_vector']).forEach(function (item) {
                    feature2048.push(data[i]['feature_vector'][item]);
                });
                vectors.push(feature2048);
                break;
            case 'predProb17':
                let predProb17 = [];
                Object.keys(data[i]['predProb']).forEach(function (item) {
                    predProb17.push(data[i]['predProb'][item]);
                });
                vectors.push(predProb17);
                break;
            case 'trueLabel17':
                let trueLabel17 = [];
                Object.keys(data[i]['trueLabel']).forEach(function (item) {
                    trueLabel17.push(data[i]['trueLabel'][item]);
                });
                vectors.push(trueLabel17);
                break;
        }
    }

    return vectors;
}

vis.displayCluster = function (mainContainer, images, embedding, clusterResult, clusterNum, index) {


    $('#viscluster-' + index).remove();
    let clusterColors = d3.schemeCategory10;
    // Update cluster legend
    vis.showClusterLegends(mainContainer, clusterNum, clusterColors, index);

    var clusterContainer = $('<div/>', {
        id: 'viscluster-' + index
    }).css({ width: '100%', height: '100%' });

    mainContainer.append(clusterContainer);

    // Create cluster row by cluster number
    for (let i = 0, len = clusterNum; i < len; ++i ) {

        let rowContainer = $('<div/>').css({
            width: 'calc(100% - 210px)',
            'margin-left': '200px',
            'height': 'auto',
            'margin-top': '5px',
            'border': '2px solid ' + clusterColors[i],
            'overflow-y': 'auto',
            'overflow-x': 'hidden'
        });

        for (let j = 0; j < images.length; ++j) {
            if (clusterResult[j] === i) {
                let flowerContainer = $('<div/>', {
                    id: 'clusterflower-' + index + '-' + j
                }).css({
                    width: '50px',
                    height: '50px',
                    'margin-right': '2px',
                    'float': 'left'
                });

                let svg = $('<svg/>').css({
                    'height': '50px',
                    'width': '50px'
                });
    
                rowContainer.append(flowerContainer);
            }
        }

        // Add each row to cluster container
        clusterContainer.append(rowContainer);
    }

    for (let k = 0, len = images.length; k < len; ++k) {
        let svg = d3.select('#clusterflower-' + index + '-' + k)
                            .append('svg')
                            .attr('height', '50px')
                            .attr('width', '50px');

        let group = svg.append('g')
            .attr('imageID', images[k].image_id)
            .style('cursor', 'pointer')
            .attr('transform', 'translate(' + 50 / 2 + ',' + 50 / 2 + ')')
            .on('click', bubbleClick)
            .on('mouseover', bubbleMouseOver)
            .on('mouseout', bubbleMouseOut);
                        
        let pieRadius = Math.min(50, 50) / 2;
        var innerRadius = (0.3 * pieRadius);

        let pie = d3.pie()
                .sort(null)
                .value((d) => 1);

        let arc = d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(function(d) {
                    return (pieRadius - innerRadius) * (parseFloat(d.data) / 1.0) + innerRadius;
                });

        let outlineArc = d3.arc()
                            .innerRadius(innerRadius)
                            .outerRadius(pieRadius);
        
        // Add predprobs and truelabels
        let predprobs = [];
        let trueValue = [];
        Object.keys(images[k].predProb).forEach(function (item) {
            predprobs.push(images[k].predProb[item]);
        });
        Object.keys(images[k].trueLabel).forEach(function (item) {
            trueValue.push(images[k].trueLabel[item]);
        });
        
        // Draw preprob
        group.selectAll('.solidArc')
            .data(pie(predprobs))
            .enter()
            .append('path')
            .attr('fill', (d, i) => {
                if (main.embedding.filterLabels.length === 0) {
                    return main.embedding.labelColors[i];
                }

                if (main.embedding.filterLabels.indexOf(i) !== -1) {
                    return main.embedding.labelColors[i]
                } else {
                    return 'none';
                }
            })
            .attr('fill-opacity', 0.5)
            .attr('class', 'solidArc')
            .attr('d', arc)
            .attr('stroke', (d, i) => {
                if (main.embedding.filterLabels.length === 0) {
                    if (trueValue[i] === 1) {
                        return main.embedding.labelColors[i];
                    } else {
                        if (d.data > 0.5){ return '#000';  }
                        else {return 'none';}                                 
                    }
                } else {
                    if (main.embedding.filterLabels.indexOf(i) !== -1) {
                        if (trueValue[i] === 1) {
                            return main.embedding.labelColors[i];
                        } else {
                            if (d.data > 0.5){ return '#000';}
                            else {return 'none';}     
                        }
                    } else {
                        return 'none';
                    }
                }
            })
            .attr('stroke-width', '2px');

        // Draw truelabel
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
                        if (trueValue[i] === 1) {
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

        group.append('circle')
            .attr('class', 'inner-circle2-' + images[k].image_id)
            .attr('r', 11)
            .attr('fill', '#000')
            .attr('fill-opacity', 1);

        // Add label and text
        group.append('circle')
            .attr('class', 'inner-circle-' + images[k].image_id)
            .attr('r', 10)
            .attr('fill', '#fff')
            .attr('fill-opacity', 1);

        group.append('text')
            .attr('class', 'inner-text-' + images[k].image_id)
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .style('fill', '#000')
            .style('font-size', '12px')
            .text(images[k].image_id);

    }

    function bubbleClick () {
        var imageID = d3.select(this).attr('imageID');

        // Check if selected image alreay exist
        if (main.selectImageIds.indexOf(imageID) === -1) {
            main.selectImageIds.push(imageID);
        }
        //image_ids.push(imageID);
        vis.showSelectedImages(main.selectImageIds);
        vis.selectInteraction(main.selectImageIds);
    }

    function bubbleMouseOver () {
        var imageID = d3.select(this).attr('imageID');
        vis.hoverInteraction(imageID);
        return;
    }

    function bubbleMouseOut () {
        var imageID = d3.select(this).attr('imageID');
        vis.hoverOutInteraction(imageID);
        return;
    }

    return;

    /*
    let svg = d3.select('#' + clusterContainer.attr('id'))
                .append('svg')
                .attr('height', height)
                .attr('width', width)
                .style('margin-left', '200px');
    */
                /*
                .append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');*/

    /*
    var width = clusterContainer.width(),
        height = clusterContainer.height(),
        padding = 5, // separation between same-color circles
        clusterPadding = 10, // separation between different-color circles
        maxRadius = 15;
    
    var n = images.length, // total number of nodes
        m = parseInt(clusterNum), // number of distinct clusters
        z = d3.scaleOrdinal().range(clusterColors);

    var clusters = new Array(m);

    var svg = d3.select('#' + clusterContainer.attr('id'))
            .append('svg')
            .attr('height', height)
            .attr('width', width)
            .append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    for (var i = 0; i < images.length; ++i) {
        
        let predProbs = [];
        images[i].normPredProb = [];
        images[i].arrPredProbs = [];
        images[i].arrTrueLabels = [];

        Object.keys(images[i].predProb).forEach(function (item) {
            predProbs.push(images[i].predProb[item]);
        });

        let min = d3.min(predProbs);
        let max = d3.max(predProbs);
        
        Object.keys(images[i].predProb).forEach(function (item) {
            images[i].normPredProb.push(utils.normalize(images[i].predProb[item], [0, 1], [0, 100]));
            images[i].arrPredProbs.push(images[i].predProb[item]);
            images[i].arrTrueLabels.push(images[i].trueLabel[item]);
        });
    }

    var nodeIndex = 0;
    var nodes = d3.range(n).map(() => {
        let i = clusterResult[nodeIndex],
            radius = 25,
            d = {
                    imageId: images[nodeIndex]['image_id'],
                    cluster: i, 
                    r: radius,
                    predProb: images[nodeIndex].arrPredProbs,
                    trueLabel: images[nodeIndex].arrTrueLabels,
                    clusterData: clusterResult[index],
                    error: vis.distanceOfErrors[images[nodeIndex]['image_id']]
            }
        if (!clusters[i] || (radius > clusters[i].r)) clusters[i] = d;
        nodeIndex++;
        return d;
    });

    var group = svg.append('g')
                    .datum(nodes)
                    .selectAll('.image-bubble-' + index)
                    .data(d => d)
                    .enter().append('g')
                    .attr('id', (d, i) => 'image-bubble-' + d.imageId)
                    .attr('imageID', (d, i) => d.imageId)
                    .attr('class', 'image-bubble-' + index)
                    .style('cursor', 'pointer')
                    .on('click', bubbleClick)
                    .on('mouseover', bubbleMouseOver)
                    .on('mouseout', bubbleMouseOut);

    // TODO: We might do some ratio for dynamic size of bubble 
    // Based on selected number of images
    var pieRadius = Math.min(50, 50) / 2;
    var innerRadius = (0.3 * pieRadius);

    let pie = d3.pie()
            .sort(null)
            .value((d) => 1);

    let arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(function(d) {
                return (pieRadius - innerRadius) * (parseFloat(d.data) / 1.0) + innerRadius;
            });

    let outlineArc = d3.arc()
                        .innerRadius(innerRadius)
                        .outerRadius(pieRadius);

    
    var linearScale = d3.scaleLinear()
                        .domain([d3.min(vis.distanceOfErrors), d3.max(vis.distanceOfErrors)])
                        .range([0.1, 0.9]);
    // Add circle
    
    group.append('circle')
    .attr('r', 12)
    .attr('fill', (d, i) => z(clusterResult[i]))
    .attr('fill-opacity', 0.5);
    
    /*
    group.selectAll('.bubble-arc')
        .data(function (d) {  return pie(d.predProb); })
        .enter().append('path')
        .attr("d", arc)
        .attr('class', 'bubble-arc')
        .style("fill", function(d, i) { return embedding.filterColors[i]; });
        //.attr('stroke', '#000')
        //.attr('stroke-width', '1px');*/

    /*
    group.selectAll('.solidArc')
            .data(function(d) { return pie(d.predProb); })
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
            .attr('fill-opacity', 0.5)
            .attr('class', 'solidArc')
            .attr('d', arc)
            .attr('stroke', (d, i) => {
                return 'none';
                /*
                if (main.embedding.filterLabels.length === 0) {
                    if (dot.trueLabel[i] === 1) {
                        return main.embedding.labelColors[i];
                    } else {
                        if (d.data > 0.5){ return '#000';  }
                        else {return 'none';}                                 
                    }
                } else {
                    if (main.embedding.filterLabels.indexOf(i) !== -1) {
                        if (dot.trueLabel[i] === 1) {
                            return main.embedding.labelColors[i];
                        } else {
                            if (d.data > 0.5){ return '#000';}
                            else {return 'none';}     
                        }
                    } else {
                        return 'none';
                    }
                }
            })
            .attr('stroke-width', '2px');

    group.selectAll('.outlineArc')
            .data(function(d) { console.log(d); return pie(d.trueLabel); })
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


    group.append('circle')
        .attr('class', (d, i) => 'inner-circle-' + d.imageId)
        .attr('r', 10)
        .attr('fill', '#fff')//(d, i) => z(clusterResult[i]))
        .attr('fill-opacity', 1);
        //.attr('stroke', '#fff')
        //.attr('stroke-width', '1px');

    group.append('text')
        .attr('class', (d, i) => 'inner-text-' + d.imageId)
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .style('fill', '#000')
        .style('font-size', '10px')
        .text( (d, i) => { return d.imageId});

    let simulation = d3.forceSimulation(nodes)
        .velocityDecay(0.2)
        .force("x", d3.forceX().strength(.00005))
        .force("y", d3.forceY().strength(.00005))
        .force("collide", collide)
        .force("cluster", clustering)
        .on("tick", ticked);

    function ticked() {
        group.attr('transform', function (d) {
            return 'translate(' + d.x + ',' + d.y + ')'
        });
    }   

    // These are implementations of the custom forces.
    function clustering(alpha) {
        nodes.forEach(function(d) {
        var cluster = clusters[d.cluster];
        if (cluster === d) return;
        var x = d.x - cluster.x,
            y = d.y - cluster.y,
            l = Math.sqrt(x * x + y * y),
            r = d.r + cluster.r;
        if (l !== r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            cluster.x += x;
            cluster.y += y;
        }  
        });
    }

    function collide(alpha) {
        var quadtree = d3.quadtree()
            .x((d) => d.x)
            .y((d) => d.y)
            .addAll(nodes);

        nodes.forEach(function(d) {
            var r = d.r + maxRadius + Math.max(padding, clusterPadding),
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function(quad, x1, y1, x2, y2) {

            if (quad.data && (quad.data !== d)) {
                var x = d.x - quad.data.x,
                    y = d.y - quad.data.y,
                    l = Math.sqrt(x * x + y * y),
                    r = d.r + quad.data.r + (d.cluster === quad.data.cluster ? padding : clusterPadding);
                if (l < r) {
                l = (l - r) / l * alpha;
                d.x -= x *= l;
                d.y -= y *= l;
                quad.data.x += x;
                quad.data.y += y;
                }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        });
    }

    function bubbleClick () {
        var imageID = d3.select(this).attr('imageID');

        // Check if selected image alreay exist
        if (main.selectImageIds.indexOf(imageID) === -1) {
            main.selectImageIds.push(imageID);
        }
        //image_ids.push(imageID);
        vis.showSelectedImages(main.selectImageIds);
        vis.selectInteraction(main.selectImageIds);
    }

    function bubbleMouseOver () {
        var imageID = d3.select(this).attr('imageID');
        vis.hoverInteraction(imageID);
        return;
    }

    function bubbleMouseOut () {
        var imageID = d3.select(this).attr('imageID');
        vis.hoverOutInteraction(imageID);
        return;
    }

    return;*/
}

// Create cluster legends
vis.showClusterLegends = function (container, clusterNum, colors, index) {

    // Remove current cluster legends
    $('#cluster-legends-' + index).remove();

    let legends = dom.createDiv('cluster-legends-' + index, 'cluster-legends', '', {});
    let button, icon;

    for (let i = 0; i < clusterNum; ++i) {
        
        button = dom.createDiv('', 'cluster-legends-btn', '', {});
        icon = dom.createFontAwesomeIcon('fas fa-square-full', {
            color: colors[i],
            opacity: 0.5
        });

        button.append(icon).append(' Cluster ' + (i + 1));
        legends.append(button);
    }
    container.append(legends);
    return;
}
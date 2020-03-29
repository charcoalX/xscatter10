vis.tsne = function(container, selection, index) {

    // Clear current container 
    container.empty();

    // Initialize tsne controls
    vis.initializeTsneControls(container, selection ,index);
    vis.preprocessTsne(container, selection, index);

    return;
}

vis.initializeTsneControls = function(container, selection, index) {

    // Create select options
    let optionNames = ['Prediction', 'TrueLabel', 'Features'];
    let optionValues = ['predProb17', 'trueLabel17', 'feature2048'];

    // Create options and controls container
    let controls = dom.createDiv('', 'tsne-controls', 'Compute Tsne By: ', {});
    let selectOptions = dom.createSelectOptions('tsneby-' + index, 'tsneby-selection', optionNames, optionValues);
    controls.append(selectOptions);

    // Create perplexity range
    let perplexityLabel = $('<label/>').html('15');
    let perplexityInput = dom.createRangeInput(15, [5, 50], 'tsne-slider', 'perplexity-slider-' + index);
    controls.append('<br/><br/>Perplexity: ').append(perplexityInput).append(perplexityLabel);

    // Create learning rate range
    let learningRateLabel = $('<label/>').html('200');
    let learningRateInput = dom.createRangeInput(200, [10, 1000], 'tsne-slider', 'learningrate-slider-' + index);
    controls.append('<br/><br/>Learning Rate: ').append(learningRateInput).append(learningRateLabel);

    // Create early exaggeration: space between cluster
    let earlyExaggerationLabel = $('<label/>').html('12');
    let earlyExaggerationInput = dom.createRangeInput(12, [1, 20], 'tsne-slider', 'earlyExaggeration-slider-' + index);
    controls.append('<br/><br/>Early Exaggeration: ').append(earlyExaggerationInput).append(earlyExaggerationLabel);

    // Create number of interation range
    let nIterLabel = $('<label/>').html('1000');
    let nIterInput = dom.createRangeInput(1000, [250, 1000], 'tsne-slider', 'nIter-slider-' + index);
    controls.append('<br/><br/>Number Iterations: ').append(nIterInput).append(nIterLabel);

    // Create selection metric
    let metricOptions = dom.createSelectOptions('tsnemetric-' + index, 'tsneby-selection', ['Cosine', 'Euclidean'], ['cosine', 'euclidean']);
    controls.append('<br/><br/>Metric: ').append(metricOptions);

    container.append(controls)
    
    let controlButton = $('<button/>', {
        class: 'tsne-button'
    }).html('Tsne Controller');
    container.append(controlButton);
    controlButton.on('click', function () {

        controls.toggleClass('show');
        if (controls.hasClass('show')) {
            controls.show();
        } else {
            controls.hide();
        }
    });
    
    // Set all events
    vis.tsneOptionEvents(selectOptions, container, selection, index);
    vis.tsneOptionEvents(metricOptions, container, selection, index);
    vis.tsneRangeEvents(perplexityInput, perplexityLabel, container, selection, index);
    vis.tsneRangeEvents(learningRateInput, learningRateLabel, container, selection, index);
    vis.tsneRangeEvents(earlyExaggerationInput, earlyExaggerationLabel, container, selection, index);
    vis.tsneRangeEvents(nIterInput, nIterLabel, container, selection, index);

    // Hide control from the start
    controls.hide();
    return;
}

vis.preprocessTsne = function(container, selection, index) {

    // Get all input vectors and data
    var images = vis.getSelectImages(selection);
    var inputData = vis.getTsneVectors(images, index);

    // Set tsne parameters
    let tsneParameters = {
        n_components: 2,
        perplexity: parseInt($('#perplexity-slider-' + index).val()),
        early_exaggeration: parseInt($('#earlyExaggeration-slider-' + index).val()),
        learning_rate: parseInt($('#learningrate-slider-' + index).val()),
        n_iter: parseInt($('#nIter-slider-' + index).val()),
        metric: $('#tsnemetric-' + index).val()
    }



    query.getTsne(inputData, tsneParameters).then(function(result) {

        let xArray = [], yArray = [];

        for (let i = 0; i < images.length; ++i) {
            let x = result[i][0];
            let y = result[i][1];
            //images
            images[i]['tsne-x'] = x;
            images[i]['tsne-y'] = y;

            // Add x and y coordinates to find min and max
            xArray.push(x); yArray.push(y);
        }

        let xMinmax = [d3.min(xArray), d3.max(xArray)];
        let yMinmax = [d3.min(yArray), d3.max(yArray)];

        vis.displayTsne(container, images, index, xMinmax, yMinmax);
        vis.selectInteraction(main.selectImageIds);
    });

    return;
}

vis.getTsneVectors = function(data, index) {
    let vectors = [];
    let tsneOptions = $('#tsneby-' + index).val();
    var x, y;
    for (let i = 0; i < data.length; ++i) {
        switch (tsneOptions) {
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

vis.getSelectImages = function (selection) {

    var images = [];
    
    for (let i = 0; i < selection.ids.length; ++i) {

        let id = selection.ids[i];

        // TODO: Can be detect by filter
        Object.keys(main.embedding.filterData).forEach(function (item) {
            if (item == id) {
                main.embedding.filterData[item]['image_id'] = item;
                images.push(main.embedding.filterData[item]);
            }
        });

    }

    return images;
}

vis.tsneOptionEvents = function(options, container, selection, index) {
    options.on('change', function() {
        vis.preprocessTsne(container, selection, index);
    });
    return;
}

vis.tsneRangeEvents = function (range, label, container, selection, index) {

    range.on('input', function () {
        label.html(range.val());
    });

    range.on('change', function () {
        vis.preprocessTsne(container, selection, index);
    });
    return;
}

// D3 function to draw tsne
vis.displayTsne = function(container, data, index, xMinmax, yMinmax) {
   
    // Start normalize values

    for (let i = 0; i < data.length; ++i) {
        let x = data[i]['tsne-x'], y = data[i]['tsne-y'];
        data[i]['tsne-x'] = utils.normalize(x, [xMinmax[0], xMinmax[1]], [0, 1]);
        data[i]['tsne-y'] = utils.normalize(y, [yMinmax[0], yMinmax[1]], [0, 1])

        // Normalize predprob for pie chart
        data[i].normPredProb = [];
        Object.keys(data[i]['predProb']).forEach(function(item) {
            data[i].normPredProb.push(utils.normalize(data[i]['predProb'][item], [0, 1], [0, 100]));
        });
    }

    console.log(data);

    // Start drawing
    $('#visTsne-' + index).empty();
    var tsneContainer = $('<div/>', {
        id: 'visTsne-' + index
    }).css({ width: '100%', height: '100%' });
    container.append(tsneContainer);

    let width = container.width(),
        height = container.height();

    let circleWidth = 40;

    // Add svg container
    let svg = d3.select('#' + tsneContainer.attr('id'))
                .append('svg')
                .attr('height', height)
                .attr('width', width);

    let x, y, group;
    for (let i = 0; i < data.length; ++i) {
        x = data[i]['tsne-x'] * (width - circleWidth * 2) + circleWidth;
        y = data[i]['tsne-y'] * (height - 20 - circleWidth * 2) + circleWidth;

        group = svg.append('g')
                    .attr('id', 'tsneDot-' + data[i]['image_id'])
                    .attr('imageID', data[i]['image_id'])
                    .attr('class', 'tsneDot')
                    .attr('data', data[i])
                    .attr('transform', 'translate(' + x + ',' + y + ')')
                    .style('cursor', 'pointer')
                    .on('click', bubbleClick)
                    .on('mouseover', bubbleMouseOver)
                    .on('mouseout', bubbleMouseOut);

        // Start adding pie chart
        let pieRadius = Math.min(circleWidth, circleWidth) / 2;
        let arc = d3.arc()
                .outerRadius(pieRadius)
                .innerRadius(0);
    
        let pie = d3.pie()
                .sort(null)
                .value(function(d, i) { return d; });

        group.selectAll('.bubble-arc')
            .data(pie(data[i]['normPredProb']))
            .enter().append('path')
            .attr("d", arc)
            .attr('class', 'bubble-arc')
            .style("fill", function(d, i) { return main.embedding.filterColors[i]; });

        group.append('circle')
            .attr('class', 'inner-circle-' + data[i]['image_id'])
            .attr('r', 10)
            .attr('fill', '#fff')
            .attr('fill-opacity', 1);

        group.append('text')
            .attr('class', 'inner-text-' + data[i]['image_id'])
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .style('fill', '#000')
            .style('font-size', '12px')
            .text(data[i]['image_id']);

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
    }
}
vis.selectInteraction = function (imageIds) {
    

    for (let i = 0; i < imageIds.length; ++i) {
        let imageID = imageIds[i];

        let scatterplotTypes = ['act', 'layer1', 'layer3', 'layer5', 'fea', 'prd'];

        // Cluster interaction
        d3.selectAll('.inner-circle-' + imageID)
                .attr('fill', '#000');
        d3.selectAll('.inner-text-' + imageID)
                .style('fill', '#fff');

        d3.selectAll('#image-bubble-' + imageID).moveToFront();

        // Scatter plot interaction — all panels animate simultaneously
        for (let j = 0; j < scatterplotTypes.length; ++j) {
            let type = scatterplotTypes[j];

            d3.select('#scatterdot-' + type + '-' + imageID)
                .append('circle')
                .attr('class', 'scatterdot-selected')
                .attr('r', 0)
                .attr('fill', 'red')
                .attr('fill-opacity', 0)
                .attr('stroke', 'red')
                .attr('stroke-opacity', 0)
                .attr('stroke-width', '2px')
                .moveToFront()
                .transition()
                .duration(200)
                .attr('r', 9)
                .attr('stroke-opacity', 1)
                .transition()
                .duration(150)
                .attr('r', 5);
        }
    }

    d3.selectAll('.scatterdot-selected').moveToFront();

    return;
}

// single id
vis.hoverInteraction = function (imageID) {

    let scatterplotTypes = ['act', 'layer1', 'layer3', 'layer5', 'fea', 'prd'];

    // Cluster interaction
    d3.selectAll('.inner-circle-' + imageID)
            .attr('fill', '#000');
    d3.selectAll('.inner-text-' + imageID)
            .style('fill', '#fff');

    // Scatter plot interaction — animated, all panels simultaneously
    for (let i = 0; i < scatterplotTypes.length; ++i) {
        let type = scatterplotTypes[i];
        d3.select('#scatterdot-' + type + '-' + imageID)
            .append('circle')
            .attr('class', 'scatterdot-hover')
            .attr('r', 0)
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-opacity', 0)
            .attr('stroke-width', '2px')
            .moveToFront()
            .transition()
            .duration(200)
            .attr('r', 11)
            .attr('stroke-opacity', 1)
            .transition()
            .duration(150)
            .attr('r', 7)
            .attr('stroke-opacity', 0.8);
    }

    return;
}

vis.hoverOutInteraction = function (imageID) {
    // If already selected
    if (main.selectImageIds.indexOf(imageID) !== -1) {
        // Remove scatterplot interaction
        d3.selectAll('.scatterdot-hover').remove();
        // Cluster interaction
        d3.selectAll('.inner-circle-' + imageID)
                .attr('fill', '#000');
        d3.selectAll('.inner-text-' + imageID)
                .style('fill', '#fff');
    } else {
        // Remove scatterplot interaction
        d3.selectAll('.scatterdot-hover').remove();

        // Set back Cluster interaction
        d3.selectAll('.inner-circle-' + imageID)
            .attr('fill', '#fff');

        d3.selectAll('.inner-text-' + imageID)
            .style('fill', '#000');
    }

    return;
}
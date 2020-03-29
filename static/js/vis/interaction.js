vis.selectInteraction = function (imageIds) {
    

    for (let i = 0; i < imageIds.length; ++i) {
        let imageID = imageIds[i];

        let scatterplotTypes = ['act', 'fea', 'prd'];

        // Cluster interaction
        d3.selectAll('.inner-circle-' + imageID)
                .attr('fill', '#000');
        d3.selectAll('.inner-text-' + imageID)
                .style('fill', '#fff');

        d3.selectAll('#image-bubble-' + imageID).moveToFront();

        // Scatter plot interaction
        for (let j = 0; j < scatterplotTypes.length; ++j) {
            let type = scatterplotTypes[j];
            // Scatterplot interaction
            d3.select('#scatterdot-' + type + '-' + imageID)
                .append('circle')
                .attr('class', 'scatterdot-selected')
                .attr('r', 5)
                .attr('fill', 'red')
                .attr('fill-opacity', 0)
                .attr('stroke', 'red')
                .attr('stroke-opacity', 1)
                .attr('stroke-width', '1px').moveToFront();

            /*
            d3.select('#scatterdot-' + type + '-' + imageID)
                .append('text')
                .attr('class', 'scatterdot-selected')
                .attr("dy", "-1.5em")
                .style("text-anchor", "middle")
                .style('fill', 'rgb(43, 20, 217)')
                .style('font-size', '10px')
                .text(imageID).moveToFront();*/
        }
    }

    d3.selectAll('.scatterdot-selected').moveToFront();

    return;
}

// single id
vis.hoverInteraction = function (imageID) {

    let scatterplotTypes = ['act', 'fea', 'prd'];

    // Cluster interaction
    d3.selectAll('.inner-circle-' + imageID)
            .attr('fill', '#000');
    d3.selectAll('.inner-text-' + imageID)
            .style('fill', '#fff');

    // Scatter plot interaction
    for (let i = 0; i < scatterplotTypes.length; ++i) {
        let type = scatterplotTypes[i];
        // Scatterplot interaction
        d3.select('#scatterdot-' + type + '-' + imageID)
            .append('circle')
            .attr('class', 'scatterdot-hover')
            .attr('r', 5)
            .attr('fill', 'red')
            .attr('fill-opacity', 0)
            .attr('stroke', 'red')
            .attr('stroke-opacity', 1)
            .attr('stroke-width', '3px');
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
vis.showSelectedImages = function (image_ids) {

    dom.contents.images.empty();

    var tooltip = d3.select('body')
                    .append("div")
                    .attr("class", "heatmap-tooltip")
                    .style("opacity", 0);

    for (let i = 0; i < image_ids.length; ++i) {
        if(main.embedding.options['Data type'] == 'synthetic'){
            var source = '/static/images/vis_filtered_thumbnails/' + image_ids[i] + '.jpg';
        }else if (main.embedding.options['Data type'] == 'experimental'){
		    var source = '/static/images/exp_filtered_thumbnails/' + image_ids[i] + '.png';

        }else if (main.embedding.options['Data type']  == 'cifar10'){
            var source = '/static/images/cifar10_images/' + image_ids[i] + '.png';
        }
        
        let image_container = $('<div/>', {
            id: 'image-container-' + image_ids[i]
        }).css({
            'width': '9%',
            'height': '88.5%',
            'background': '#ffffff',
            'margin-right' : '10px',
            'font-size': '12px',
            'display': 'inline-block',
            'position': 'relative',
            'padding': '10px'
        }).html('Image ID: ' + image_ids[i] + ' <br/>');

        let closeButton = $('<button/>').css({
            position: 'absolute',
            top: '2px',
            right: '2px',
            'z-index': '1000',
            'outline': 'none',
            'border': 'none',
            'background': 'transparent',
            'cursor': 'pointer'
        }).html('<i class="fas fa-times"></i>');
        image_container.append(closeButton);

        let img_div = $('<div/>').css({
            width: '100%',
            height: '50%',
            float:'left',
            position:'relative'
        });

        let image = $('<img/>', {
            src: source,
            title: 'image-' + image_ids[i],
            class: 'xray_image',
            width: '100%',
            height: '100%'
        });

        img_div.append(image);

        let heatmap_div = $('<div/>', { 
            id: 'heatmap-' + image_ids[i]
        }).css({
            width: '100%',
            height: '50%',
            color: '#fff',
            'padding': '5px',
            'text-align': 'center',
            float:'left',
            position:'relative'
        });

        image_container.append(img_div);
        image_container.append(heatmap_div);
        dom.contents.images.prepend(image_container);

        image_container.on('mouseover', () => {
            vis.hoverInteraction(image_ids[i]);
        });

        image_container.on('mouseout', () => {
            vis.hoverOutInteraction(image_ids[i]);
        });

        closeButton.on('click', function () {
            if (main.selectImageIds.indexOf(image_ids[i]) !== -1) {

                // Reset back cluster (try not to reset drawing cluster)
                d3.selectAll('.inner-circle-' + image_ids[i]).attr('fill', '#fff');
                d3.selectAll('.inner-text-' + image_ids[i]).style('fill', '#000');

                // Remove select image from array
                main.selectImageIds.splice(i, 1);
                // Try not to redraw this
                // Remove selected from scatterplot and remove container
                d3.selectAll('.scatterdot-selected').remove();
                vis.selectInteraction(main.selectImageIds);
                vis.showSelectedImages(main.selectImageIds);
                d3.selectAll('.scatterdot-hover').remove();
            }
        });

        let predProbObj = main.embedding.data[image_ids[i]].predProb;
        let trueLabelObj = main.embedding.data[image_ids[i]].trueLabel;

        // Create array of predProb and truelabel
        let pred_prob = [], true_label = [];
        Object.keys(predProbObj).forEach(function (item) {
            pred_prob.push(predProbObj[item]);
        });
        Object.keys(trueLabelObj).forEach(function (item) {
            true_label.push(trueLabelObj[item]);
        });

        var labels = main.embedding.labels;
        var colors = main.embedding.labelColors;

        let width = heatmap_div.width();
        let height = heatmap_div.height();

        let svg = d3.select('#heatmap-' + image_ids[i])
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height);
        
        // 3 rows for each group
        let rect_height = ((height / 2) / 3) - 10;
        let rect_width = (width / 6) - 3;
        let distance = 3;

        // divide into 2 groups
        let predict_groupBackground = svg.append('g')
            .selectAll('rect')
            .data(pred_prob)
            .enter()
        .append('rect')
            .attr('class','heatmap-rect') //xy
            .attr('id',(d,i) => { return image_ids[i] +'_pred_'+ i.toString() })
            .attr('height', (d,i) =>{
                return rect_height;
            })
            .attr('width', rect_width)
            .attr('fill', (d, i) => {
                return '#f0f0f0';
            })
            .attr('stroke', '#fff')
            .attr('stroke-width', '0px')
            .attr('transform', (d, i) => {
                let x = (rect_width + distance)* (i % 6);
                let y = (rect_height + distance) * Math.floor(i / 6)+ 15;
                return 'translate(' + x + ',' + y + ')';
            });

            let predict_groupFill = svg.append('g')
                .selectAll('rect')
                .data(pred_prob)
                .enter()
            .append('rect')
                .attr('class','heatmap-rect')
                .attr('id',(d,i) => { return image_ids[i] +'_pred_'+i.toString() })
                .attr('height', (d,i) =>{
                    // return rect_height * d;
                    return rect_height * 1;
                })
                .attr('width', rect_width)
                .attr('fill', (d, i) => {
                    if (d > 0.5){
                        return colors[i];
                    }
                    else {
                        return '#f0f0f0';
                    }
                })
                .attr('stroke', '#fff')
                .attr('stroke-width', '0px')
                .style('cursor', 'pointer')
            //.transition()
                //.duration(500)
                .attr('transform', (d, i) => {
                    let x = (rect_width +distance) * (i % 6);
                    // let y = (rect_height +distance)* Math.floor(i / 6)+ 15 + (1-d) * rect_height;
                    let y = (rect_height + distance) * Math.floor(i / 6)+ 15;
                    return 'translate(' + x + ',' + y + ')';
                })
                .on('mouseover', function (d, i) {
                    d3.event.stopPropagation();
                    tooltip.transition()
                        .duration(200)
                        .style('opacity', .9);
                    tooltip.html('<strong>' + labels[i] + '</strong><br/>' + d)
                        .style('left', (d3.event.pageX) + 15 + 'px')
                        .style('top', (d3.event.pageY) - 15 + 'px');
                })
                .on('mouseout', function (d) {
                    d3.event.stopPropagation();
                    tooltip.transition()
                        .duration(500)
                        .style('opacity', 0);
                });

        let truelabel_group = svg.append('g')
            .selectAll('rect')
            .data(true_label)
            .enter()
        .append('rect')
            .attr('class','heatmap-rect')//xy
            .attr('height', rect_height)
            .attr('width', rect_width)
            .attr('fill', (d, i) => {
                if (d > 0.5) { return colors[i] }
                return '#f0f0f0';
            })
            //.transition()
            //.duration(500)
            .attr('transform', (d, i) => {
                let x = (rect_width +distance)* (i % 6);
                let y = (rect_height +distance) * Math.floor(i / 6) + (height / 2) + 10;
                return 'translate(' + x + ',' + y + ')';
            })
            .style('cursor', 'pointer')
            .on('mouseover', function (d, i) {
                d3.event.stopPropagation();
                tooltip.transition()
                    .duration(200)
                    .style('opacity', .9);
                tooltip.html('<strong>' + labels[i] + '</strong><br/>' + d)
                    .style('left', (d3.event.pageX) + 15 + 'px')
                    .style('top', (d3.event.pageY) - 15 + 'px');
            })
            .on('mouseout', function (d) {
                d3.event.stopPropagation();
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });

        //xy add titile for PRD and ACT
        svg.append('text')
            .attr('class', 'image_Vector_title')
            .attr("x", 0)
            .attr("y", 0)
            .attr('dy', '1em')
            .attr('fill', 'black')
            .attr('text-anchor', 'right')
            .style("font-size", "12px")
            .text('PRD');

        svg.append('text')
            .attr('class', 'image_Vector_title')
            .attr("x", 0)
            .attr("y", 25 + rect_height *3 )
            .attr('dy', '1em')
            .attr('fill', 'black')
            .attr('text-anchor', 'right')
            .style("font-size", "12px")
            .text('ACT');
    }

    return;
}
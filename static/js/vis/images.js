// Persistent store: keyed by imageId, value = { src, label, opacity }
vis.lrpOverlays = vis.lrpOverlays || {};

vis.showSelectedImages = function (image_ids) {

    // Remove store entries for images no longer in selection
    Object.keys(vis.lrpOverlays).forEach(function(id) {
        if (image_ids.indexOf(id) === -1 && image_ids.indexOf(Number(id)) === -1) {
            delete vis.lrpOverlays[id];
        }
    });

    dom.contents.images.empty();

    var tooltip = d3.select('body')
                    .append("div")
                    .attr("class", "heatmap-tooltip")
                    .style("opacity", 0);

    // Helper: render PRD + ACT SVG into heatmapDiv at a given pixel height
    function renderHeatmap(heatmapDiv, heatmapH, pred_prob, true_label, labels, colors, img_id) {
        heatmapDiv.empty();
        let width  = heatmapDiv.width();
        let height = heatmapH;

        let svg = d3.select('#heatmap-' + img_id)
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height);

        // 3 rows for each group
        let rect_height = ((height / 2) / 3) - 10;
        let rect_width  = (width / 6) - 3;
        let distance    = 3;

        // PRD background rects
        svg.append('g')
            .selectAll('rect')
            .data(pred_prob)
            .enter()
            .append('rect')
                .attr('class', 'heatmap-rect')
                .attr('id', (d, i) => img_id + '_pred_' + i)
                .attr('height', rect_height)
                .attr('width', rect_width)
                .attr('fill', '#f0f0f0')
                .attr('stroke', '#fff')
                .attr('stroke-width', '0px')
                .attr('transform', (d, i) => {
                    let x = (rect_width + distance) * (i % 6);
                    let y = (rect_height + distance) * Math.floor(i / 6) + 15;
                    return 'translate(' + x + ',' + y + ')';
                });

        // PRD filled rects
        svg.append('g')
            .selectAll('rect')
            .data(pred_prob)
            .enter()
            .append('rect')
                .attr('class', 'heatmap-rect')
                .attr('id', (d, i) => img_id + '_pred_' + i)
                .attr('height', rect_height)
                .attr('width', rect_width)
                .attr('fill', (d, i) => {
                    if (main.embedding.options['Data type'] === 'synthetic') {
                        return d > 0.5 ? colors[i] : '#f0f0f0';
                    }
                    return colors[i];
                })
                .attr('opacity', (d) => {
                    return main.embedding.options['Data type'] === 'synthetic' ? 1 : d;
                })
                .attr('stroke', '#fff')
                .attr('stroke-width', '0px')
                .style('cursor', 'pointer')
                .attr('transform', (d, i) => {
                    let x = (rect_width + distance) * (i % 6);
                    let y = (rect_height + distance) * Math.floor(i / 6) + 15;
                    return 'translate(' + x + ',' + y + ')';
                })
                .on('mouseover', function(d, i) {
                    d3.event.stopPropagation();
                    tooltip.transition().duration(200).style('opacity', .9);
                    tooltip.html('<strong>' + labels[i] + '</strong><br/>' + d)
                        .style('left', (d3.event.pageX + 15) + 'px')
                        .style('top',  (d3.event.pageY - 15) + 'px');
                })
                .on('mouseout', function() {
                    d3.event.stopPropagation();
                    tooltip.transition().duration(500).style('opacity', 0);
                })
                .on('click', function(d, attrIdx) {
                    d3.event.stopPropagation();
                    vis.requestLRPHeatmap(img_id, attrIdx);
                });

        // ACT (true label) rects
        svg.append('g')
            .selectAll('rect')
            .data(true_label)
            .enter()
            .append('rect')
                .attr('class', 'heatmap-rect')
                .attr('height', rect_height)
                .attr('width', rect_width)
                .attr('fill', (d, i) => d > 0.5 ? colors[i] : '#f0f0f0')
                .attr('transform', (d, i) => {
                    let x = (rect_width + distance) * (i % 6);
                    let y = (rect_height + distance) * Math.floor(i / 6) + (height / 2) + 10;
                    return 'translate(' + x + ',' + y + ')';
                })
                .style('cursor', 'pointer')
                .on('mouseover', function(d, i) {
                    d3.event.stopPropagation();
                    tooltip.transition().duration(200).style('opacity', .9);
                    tooltip.html('<strong>' + labels[i] + '</strong><br/>' + d)
                        .style('left', (d3.event.pageX + 15) + 'px')
                        .style('top',  (d3.event.pageY - 15) + 'px');
                })
                .on('mouseout', function() {
                    d3.event.stopPropagation();
                    tooltip.transition().duration(500).style('opacity', 0);
                });

        // Titles
        svg.append('text')
            .attr('class', 'image_Vector_title')
            .attr('x', 0).attr('y', 0).attr('dy', '1em')
            .attr('fill', 'black').attr('text-anchor', 'right')
            .style('font-size', '12px')
            .text('PRD');

        svg.append('text')
            .attr('class', 'image_Vector_title')
            .attr('x', 0)
            .attr('y', 25 + rect_height * 3)
            .attr('dy', '1em')
            .attr('fill', 'black').attr('text-anchor', 'right')
            .style('font-size', '12px')
            .text('ACT');
    }

    var imgMaxH = Math.floor($('#image-container').height() * 0.5);

    for (let i = 0; i < image_ids.length; ++i) {
        let img_id = image_ids[i];

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
            'width': 'auto',
            'height': 'auto',
            'background': '#ffffff',
            'margin-right' : '10px',
            'font-size': '12px',
            'display': 'inline-block',
            'position': 'relative',
            'padding': '10px',
            'vertical-align': 'top'
        }).html('Image ID: ' + image_ids[i] + ' <br/>');

        // Pre-allocated label row — filled when LRP is computed, keeps height stable
        let lrpLabel = $('<div/>', { class: 'lrp-label', id: 'lrp-label-' + image_ids[i] })
            .css({ 'font-size': '9px', color: '#444', height: '14px', overflow: 'hidden',
                   'text-overflow': 'ellipsis', 'white-space': 'nowrap', 'line-height': '14px' })
            .text('');
        image_container.append(lrpLabel);

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

        // Opacity slider for LRP overlay — hidden until heatmap is loaded
        let opacitySlider = $('<input/>', {
            type: 'range',
            min: 0,
            max: 1,
            step: 0.05,
            value: 0.7,
            class: 'lrp-opacity-slider',
            id: 'lrp-slider-' + image_ids[i]
        }).css({
            position: 'absolute',
            top: '2px',
            right: '18px',
            width: '50px',
            height: '12px',
            'z-index': '1000',
            display: 'none'
        });
        image_container.append(opacitySlider);

        opacitySlider.on('input', function() {
            var op = $(this).val();
            $('#lrp-overlay-' + img_id).css('opacity', op);
            if (vis.lrpOverlays[img_id]) { vis.lrpOverlays[img_id].opacity = parseFloat(op); }
        });

        let img_div = $('<div/>').css({
            width: '100%',
            'max-height': imgMaxH + 'px',
            height: 'auto',
            overflow: 'hidden',
            float:'left',
            position:'relative'
        });

        let image = $('<img/>', {
            src: source,
            title: 'image-' + image_ids[i],
            class: 'xray_image',
            width: '100%'
        }).css({ display: 'block', height: 'auto', 'max-height': 'inherit', 'object-fit': 'contain' });

        // LRP heatmap overlay — hidden until computed
        let lrpOverlay = $('<img/>', {
            id: 'lrp-overlay-' + image_ids[i],
            class: 'lrp-overlay'
        }).css({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            'max-height': imgMaxH + 'px',
            'object-fit': 'contain',
            opacity: 0.7,
            display: 'none',
            'pointer-events': 'none'
        });

        img_div.append(image);
        img_div.append(lrpOverlay);

        // Restore previously computed LRP overlay if it exists
        var stored = vis.lrpOverlays[img_id] || vis.lrpOverlays[String(img_id)];
        if (stored) {
            lrpOverlay.attr('src', stored.src).css({ opacity: stored.opacity, display: 'block' });
            opacitySlider.val(stored.opacity).show();
            lrpLabel.text(stored.label);
        }

        let heatmap_div = $('<div/>', {
            id: 'heatmap-' + image_ids[i]
        }).css({
            width: '100%',
            color: '#fff',
            'padding': '5px',
            'text-align': 'center',
            float:'left',
            position:'relative'
        });

        // Extract per-image data for use in the load callback
        let predProbObj  = main.embedding.data[image_ids[i]].predProb;
        let trueLabelObj = main.embedding.data[image_ids[i]].trueLabel;
        let pred_prob = [], true_label = [];
        Object.keys(predProbObj).forEach(function(item)  { pred_prob.push(predProbObj[item]); });
        Object.keys(trueLabelObj).forEach(function(item) { true_label.push(trueLabelObj[item]); });

        let labels = main.embedding.labels;
        let colors = main.embedding.labelColors;

        // On image load: size container to image aspect ratio, then render heatmap in remaining space
        image.on('load', function() {
            var imgH       = $(this).height();
            var ratio      = this.naturalWidth / this.naturalHeight;
            var imgW       = Math.round(imgH * ratio);
            image_container.css('width', (imgW + 4) + 'px');

            var containerH = $('#image-container').height();
            // overhead: Image ID line (~16px) + lrpLabel (14px) + container padding (20px top+bottom)
            var overhead   = 50;
            var heatmapH   = Math.max(containerH - imgH - overhead, 50);
            heatmap_div.css('height', heatmapH + 'px');
            renderHeatmap(heatmap_div, heatmapH, pred_prob, true_label, labels, colors, img_id);
        });

        image_container.append(img_div);
        image_container.append(heatmap_div);
        dom.contents.images.append(image_container);

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
    }

    return;
}

vis.requestLRPHeatmap = function(imageId, classIdx) {
    var labels    = main.embedding.labels || [];
    var labelName = labels[classIdx] ? labels[classIdx] : ('class ' + classIdx);
    var overlay   = $('#lrp-overlay-' + imageId);
    if (!overlay.length) return;

    var container = $('#image-container-' + imageId);
    var labelEl   = $('#lrp-label-' + imageId);
    labelEl.css('color', '#888').text('computing...');

    // Get p-value from database predProb
    var predProbObj = main.embedding.data[imageId] && main.embedding.data[imageId].predProb;
    var predProbArr = [];
    if (predProbObj) {
        Object.keys(predProbObj).forEach(function(k) { predProbArr.push(predProbObj[k]); });
    }
    var dbPredProb = predProbArr.length > classIdx ? predProbArr[classIdx] : null;

    query.getLRPHeatmap(imageId, classIdx, main.embedding.options['Data type'])
        .then(function(result) {
            if (result.status === 'ok') {
                var pVal  = dbPredProb !== null ? dbPredProb.toFixed(2) : result.pred_prob.toFixed(2);
                var label = 'LRP: ' + labelName + ' (p=' + pVal + ')';
                labelEl.css('color', '#444').text(label);
                var sliderVal = parseFloat($('#lrp-slider-' + imageId).val()) || 0.7;
                var src = 'data:image/png;base64,' + result.heatmap_b64;
                overlay.attr('src', src).css({ opacity: sliderVal, display: 'block' });
                $('#lrp-slider-' + imageId).show();
                vis.lrpOverlays[imageId] = { src: src, label: label, opacity: sliderVal };
            } else {
                labelEl.css('color', '#c00').text('error: ' + result.message);
            }
        })
        .catch(function() {
            labelEl.css('color', '#c00').text('LRP unavailable');
        });
};

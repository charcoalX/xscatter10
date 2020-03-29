vis.initRelations = function (container, embedding) {

    let trueLabeledData = vis.filterTruelabel(embedding);
    
    if (trueLabeledData.length > 0) {

        let xorGates = {};

        for (let i = 0; i < trueLabeledData.length; ++i) {
            vis.computeXORGate(xorGates, trueLabeledData[i]);
        }

        // Draw relationships
        vis.drawRelationships(container, xorGates);

    } else {
        // No relation found
        //console.log('no relationships found');
        container.empty();
        container.append('<center><label style="margin-top: 50%; display:inline-block;">No relationships between selected attributes</label></center>')
    }

    return;
}

vis.computeXORGate = function (gates, trueLabels) {

    let gate = '';
    let imageId = trueLabels['imageId'];
    Object.keys(trueLabels.predProb).forEach(function (item) {
        if (trueLabels.predProb[item] > 0.5) {
            gate += '1';
        } else {
            gate += '0';
        }
    });

    if (!(gate in gates)) {
        gates[gate] = {
            count: 0,
            imageIds: []
        }
    }

    gates[gate].count += 1;
    gates[gate].imageIds.push(parseInt(imageId));

    return;
}

vis.isAllTrueLabel =function (trueLabels) {

    for (let i = 0; i < trueLabels.length; ++i) {
        if (trueLabels[i] === 0) {
            return false;
        }
    }
    
    return true;
}

// Filter true label equal to one
vis.filterTruelabel = function (embedding) {

    let data = [];

    Object.keys(embedding.filterData).forEach(function (item) {

        
        let trueLabels = [];
        Object.keys(embedding.filterData[item].trueLabel).forEach(function (trueLabel) {
            trueLabels.push(embedding.filterData[item].trueLabel[trueLabel]);
        });

        if (vis.isAllTrueLabel(trueLabels)) {
            embedding.filterData[item]['imageId'] = item;
            data.push(embedding.filterData[item]);
        }
    });

    return data;
}

vis.drawRelationships = function (container, tableDict) {

    container.empty();

    let tableKeys = Object.keys(tableDict).sort();

    let tableValues = [];
    Object.keys(tableDict).forEach(function (item) {
        tableValues.push(tableDict[item].count);
    });

    let tableRows_len = tableKeys.length;
    let tableCols_len = tableKeys[0].length;
    let numOfCircle = tableRows_len * tableCols_len;
    let flatten_items = [];

    let labelList = main.embedding.filterLabels;
    
    for (let i = 0 ;i < tableRows_len; ++i){
        for (let j = 0 ;j <tableCols_len  ; ++j){
            flatten_items.push(tableKeys[i][j])
        }
    }

    var linearScale = d3.scaleLinear()
        .domain([0, d3.max(tableValues)])
        .range([0, 1]);
    
    let margin = {left: 10, top: 0, right: 20, bottom:0}
    let width = container.width() - margin.left - margin.right ;
    let height = container.height() - margin.top - margin.bottom;
    let height_text = 70;
    let distance = 3;
    let x_translation_of_right_most_circle = 0;
    let radius = d3.min([6, (width / tableCols_len / 2 )]);

    svg = d3.select('#' + container.attr('id')).append("svg")
            .attr('width',width)
            .attr('height',height)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    let tableCircleGroup =svg.append('g')
                        .selectAll('table_circle')        
                        .data(flatten_items)
                        .enter()
                        .append('circle')
                        .attr('r',radius)
                        .attr('fill', function(d,i){
                            if (d == '0'){
                                return '#ffffff';
                            } else{
                                return '#4d4d4d';
                            }
                        })
                        .attr('stroke', '#000')
                        .attr('stroke-width', '1px')
                        .attr('transform', function(d,k){
                            let x = (k % tableCols_len) * (radius + distance)* 2 + radius + margin.left;
                            let y = parseInt(k / tableCols_len) * (radius +distance)* 2 + radius + height_text + distance;

                            if (k == flatten_items.length-1) {x_translation_of_right_most_circle = x + radius + distance*4;}
                            return "translate( " + x +"," + y + ")";
                        });
                
    
    let tableLabelText = svg.selectAll('table_label_name-text')
                        .attr('class','table_label')
                        .data(labelList.sort(function(a,b){return a-b;}))
                        .enter()
                        .append('text')
                        .attr('dy','.3em')
                        .attr('text-anchor', 'right')
                        .style("font-size", "12px")
                        .attr('transform',function(d,i){
                            let x = i * (radius + distance)* 2 + margin.left ;
                            let y = height_text - distance;
                            return "translate( " + x +"," + y + ") rotate(-45)";
                        })
                        .text(function(d){
                            return main.embedding.labels[d];
                        });


    let x_fullWidth = width - x_translation_of_right_most_circle - radius -30;
    //console.log("x_translation_of_right_most_circle", x_translation_of_right_most_circle, x_fullWidth)
    let text_further_translate_x = [];
    
    let tableValueRect = svg.append('g')
            .selectAll('rect')        
            .data(tableValues)
            .enter()        
        .append('rect')
            .attr('class','table-rect') 
            .attr('width', function(d,i){
                // since the order may changed, still ckeck from tableDict
                let tableK = tableKeys[i];
                let res = linearScale(tableDict[tableK].count) * x_fullWidth;
                text_further_translate_x.push(res);
                return res;                
            })        
            .attr('height',radius *2)
            .attr('fill','#b2182b')
            .attr('transform', function(d,i){
                let x = x_translation_of_right_most_circle;
                let y = parseInt(i) * (radius+distance)* 2 + height_text + distance; 
                return "translate( " + x +"," + y + ")";
            })
            .style('cursor', 'pointer')
            .on('mouseover', mouseOver)
            .on('mouseout', mouseOut)
            .on('click', onClick);

    let tableValueTitile = svg.append('text')
                .attr('dy','.3em')
                .attr('text-anchor', 'right')
                .style("font-size", "12px")
                .attr('transform',function(){
                    let x = x_translation_of_right_most_circle + distance;//tableCols_len * (radius + 5)* 2 ;
                    let y = height_text - distance;
                    return "translate( " + x +"," + y + ") rotate(-45)";
                })
                .text('percentage');

    let tableValueText = svg.append('g')
                    .selectAll('rect')        
                    .data(tableValues)
                    .enter()        
                .append('text')
                    .attr('dy','.3em')
                    .attr('text-anchor', 'right')
                    .style("font-size", "12px")
                    .attr('fill', 'black')
                    .attr('transform', function(d,i){
                        let x = x_translation_of_right_most_circle + text_further_translate_x[i] +distance;
                        let y = parseInt(i) * (radius+distance)* 2 + height_text + radius +distance; 
                        return "translate( " + x +"," + y + ")";
                    })
                    .text(function(d,i){   
                        let tableK = tableKeys[i];                        
                        let textValue = tableDict[tableK].count;                        
                        return textValue;
                    });


    function mouseOver (d, i) {
        d3.select(this).attr('fill', '#f4a582');
        let tableK = tableKeys[i];      
        let imageIds = tableDict[tableK].imageIds;
        
        for (let j = 0; j < imageIds.length; ++j) {
            vis.hoverInteraction(imageIds[j]);
        }
    }

    function mouseOut (d, i) {
        d3.select(this).attr('fill', '#b2182b');
        let tableK = tableKeys[i];                        
        let imageIds = tableDict[tableK].imageIds;

        for (let j = 0; j < imageIds.length; ++j) {
            vis.hoverOutInteraction(imageIds[j]);
        }
    }

    function onClick (d, i) {

        let tableK = tableKeys[i];                        
        let imageIds = tableDict[tableK].imageIds;

        let select = {
            selectId: vis.selectionCount + 1,
            color: utils.getRandomColors(),
            ids: imageIds,
            lock: false
        }

        // Add to selected dots and increment count
        vis.selectedDots.push(select);
        vis.selectionCount += 1;
        
        main.visualize();
        return;
    }
}
vis.initParallel = function (mainContainer, selection, index) {

    mainContainer.empty();

    // Split in top and bottom container
    // Create tptnfpfn container
    let topContainer = $('<div/>', {
        id: 'paralleltop-' + index
    }).css({ width: '100%', height: '50%', 'float': 'left'});

    // Create acc container
    let bottomContainer = $('<div/>', {
        id: 'parallelbottom-' + index
    }).css({ width: '100%', height: '50%', 'float': 'left'});

    mainContainer.append(topContainer);
    mainContainer.append(bottomContainer);

    var topDims = ['Label', 'TP', 'TN', 'FP', 'FN'];
    var bottomDims = ['Label', 'Accuracy', 'F1', 'Precision', 'Recall'];
    var topData = vis.parallelProcessTop(selection);
    var bottomData = vis.parallelProcessBottom(topData); 
    console.log("bottomData",bottomData)

    vis.parallel(topContainer, topData, topDims, selection);
    vis.parallel(bottomContainer, bottomData, bottomDims, selection);

    return;
}

vis.parallel = function (container, data, dimensions, selection) {

    var margin = {top: 20, right: 10, bottom: 20, left: 10},
        width = container.width() - margin.left - margin.right,
        height = container.height() - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width]).padding(1),
        y = {},
        dragging = {};

    let line = d3.line();

    var svg = d3.select('#' + container.attr('id')).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(dimensions);

    var quant_p = function(v){return (parseFloat(v) == v) || (v == "")}; 
    dimensions.forEach(function(d) {

        var vals = data.map(function(p) {
            console.log("p",p,"d",d,"p[d]",p[d])
            return p[d];});
        //

        if (vals.every(quant_p)){
            y[d] = d3.scaleLinear()
                    .domain(d3.extent(data, function(p) {
                        return +parseFloat(p[d]); }))
                    .range([height, 0]);
        }
        else{           
            y[d] = d3.scalePoint()
                    .domain(vals.filter(function(v, i) { return vals.indexOf(v) == i;}))
                    .range([0, height],1);}
    });

    var extents = dimensions.map(function(p) { return [0,0]; });
    var background = svg.append("g")
                    .attr("class", "background")
                    .selectAll("path")
                    .data(data)
                    .enter().append("path")
                    .attr("d", path)
                    .attr('fill', 'none')
                    .attr('stroke', '#ddd')
                    .attr('stroke-opacity', .4)
                    .attr('shape-rendering', 'crispEdges');

    // Add blue foreground lines for focus.
    var foreground = svg.append("g")
                    .attr("class", "foreground")
                    .selectAll("path")
                    .data(data)
                    .enter().append("path")
                    .attr("d", path)
                    .attr('fill', 'none')
                    .attr('id', function(d, i) { return 'foreground-' + d.Label.replace(/\s/g,'')})
                    .attr('stroke', function (d, i) {
                        
                        let pos = main.embedding.labels.indexOf(d.Label);
                        
                        if (main.embedding.filterLabels.length === 0) {
                            return main.embedding.labelColors[parseInt(pos)];  
                        }
                        let p = main.embedding.filterLabels.indexOf(pos);
                        if (p !== -1) {
                            return main.embedding.labelColors[(main.embedding.filterLabels[p])];
                        } else {
                            return;
                        }
                    })
                    .attr('stroke-opacity', .7)
                    .attr('stroke-width', '1px')
                    .style('cursor', 'pointer')
                    .on('mouseover', function(d, i) {
                        d3.select(this).attr('stroke-width', '4px');
                        let pos = main.embedding.labels.indexOf(d.Label);
                        for (let j = 0; j < selection.ids.length; ++j) {
                            let trueLabel = (main.embedding.data[selection.ids[j]]['trueLabel']);
                            if (trueLabel[pos] === 1) {
                                vis.hoverInteraction(selection.ids[j]);
                            }
                        }
                    })
                    .on('mouseout', function(d, i) {
                        d3.select(this).attr('stroke-width', '1px');
                        for (let j = 0; j < selection.ids.length; ++j) {
                            vis.hoverOutInteraction(selection.ids[j]);
                        }
                    });

    var g = svg.selectAll(".dimension")
                .data(dimensions)
                .enter().append("g")
                .attr("class", "dimension")
                .attr("transform", function(d) {  return "translate(" + x(d) + ")"; })
                .call(d3.drag()
                    .subject(function(d) { return {x: x(d)}; })
                    .on("start", function(d) {
                        dragging[d] = x(d);
                        background.attr("visibility", "hidden");
                    })
                    .on("drag", function(d) {
                        dragging[d] = Math.min(width, Math.max(0, d3.event.x));
                        foreground.attr("d", path);
                        dimensions.sort(function(a, b) { 
                            return position(a) - position(b); 
                        });
                        x.domain(dimensions);
                        g.attr("transform", function(d) { 
                            return "translate(" + position(d) + ")"; 
                        })
                    })
                    .on("end", function(d) {
                        delete dragging[d];
                        transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                        transition(foreground).attr("d", path);
                        background.attr("d", path)
                            .transition()
                            .delay(500)
                            .duration(0)
                            .attr("visibility", null);
                }));

    g.append("g")
        .attr("class", "axis")
        .each(function (d, i) {
            // Modify tick format
            if (d !== 'Label' ) {
                (dimensions.indexOf('TP') !== -1) ? d3.select(this).call(d3.axisLeft(y[d]).tickFormat(d3.format("d"))) : 
                d3.select(this).call(d3.axisLeft(y[d]));
            } else {
                d3.select(this)
                    .call(d3.axisLeft(y[d]))
                    .style('font-size', '12px');
            }
        })
        //text does not show up because previous line breaks somehow
        .append("text")
            .attr("fill", '#000')
            .style("text-anchor", "middle")
            .attr("y", -9) 
            .text(function(d) { return d; });

    // Add and store a brush for each axis.
    g.append("g")
        .attr("class", "brush")
        .each(function(d) {
            d3.select(this).call(y[d].brush = d3.brushY().extent([[-8, 0], [8,height]]).on("brush start", brushstart).on("brush", brush_parallel_chart));
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);
    
    d3.selectAll('.tick').style('cursor', 'pointer').on('mouseover', function(d, i) {
        d3.select(this).style('font-size', '14px');
        let pos = main.embedding.labels.indexOf(d);
        if (pos !== -1) {
            d3.selectAll('#foreground-' + d.replace(/\s/g,'')).attr('stroke-width', '4px');
            for (let j = 0; j < selection.ids.length; ++j) {
                let trueLabel = (main.embedding.data[selection.ids[j]]['trueLabel']);
                if (trueLabel[pos] === 1) {
                    vis.hoverInteraction(selection.ids[j]);
                }
            }
        }
    });

    d3.selectAll('.tick').on('mouseout', function(d, i) {

        d3.selectAll('#foreground-' + d.replace(/\s/g,'')).attr('stroke-width', '1px');
        d3.select(this).style('font-size', '12px');

        for (let j = 0; j < selection.ids.length; ++j) {
            vis.hoverOutInteraction(selection.ids[j]);
        }
    });
    
    // Returns the path for a given data point.
    function path(d) {
        return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
    }

    function position(d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
    }

    function transition(g) {
        return g.transition().duration(500);
    }
    
    function brushstart() {
        d3.event.sourceEvent.stopPropagation();
    }
      
       
    // Handles a brush event, toggling the display of foreground lines.
    function brush_parallel_chart() {    
        for(var i=0;i<dimensions.length;++i){
            if(d3.event.target==y[dimensions[i]].brush) {
                extents[i]=d3.event.selection.map(y[dimensions[i]].invert,y[dimensions[i]]);
    
            }
        }
    
        foreground.style("display", function(d) {
            return dimensions.every(function(p, i) {
                if(extents[i][0]==0 && extents[i][0]==0) {
                    return true;
                }
            return extents[i][1] <= d[p] && d[p] <= extents[i][0];
            }) ? null : "none";
        });
    }
}

vis.parallelProcessTop = function (selection) {

    let data = [];

    // Pregenerate data
    for (let i = 0; i < main.embedding.labels.length; ++i) {
        let attribute = {
            Label: main.embedding.labels[i],
            TP: 0,
            TN: 0,
            FP: 0,
            FN: 0
        }
        data.push(attribute);
    }

    Object.keys(main.embedding.data).forEach(function (item) {
        if (selection.ids.indexOf(parseInt(item)) !== -1) {
            Object.keys(main.embedding.data[item].predProb).forEach(function (prob) {

                let predProb = main.embedding.data[item].predProb[prob];
                let trueLabel = main.embedding.data[item].trueLabel[prob];

                predProb = (predProb > 0.5) ? 1 : 0;

                if (trueLabel == 1 && predProb == 1) {
                    data[parseInt(prob)]['TP'] += 1;
                } else if (trueLabel == 0 && predProb == 1) {
                    data[parseInt(prob)]['FP'] += 1;
                } else if (trueLabel == 1 && predProb == 0) {
                    data[parseInt(prob)]['FN'] += 1;
                } else if (trueLabel == 0 && predProb == 0) {
                    data[parseInt(prob)]['TN'] += 1;
                }
            });
        }
    });

    data = data.sort(function(a, b) {
        return (b.TP + b.FP + b.FN) - (a.TP + a.FP + a.FN);
    });

    // Create new array insteads
    let preprocessData = [];
    for (let i = 0; i < data.length; ++i) {
        let sum = parseInt(data[i].TP + data[i].FP + data[i].FN);
        if (sum > 0) {
            preprocessData.push(data[i]);
        }
    }

    return preprocessData;
}

vis.parallelProcessBottom = function (counterData) {
    
    let data = [];

    // Pregenerate data
    for (let i = 0; i < main.embedding.labels.length; ++i) {
        let attribute = {
            Label: main.embedding.labels[i],
            Accuracy: 0,
            F1: 0,
            Precision: 0,
            Recall: 0
        }
        data.push(attribute);
    }

    // Calculate acc f1 precision recall
    for (let i = 0; i < counterData.length; ++i) {
        
        let p = counterData[i]['TP'] + counterData[i]['FN'];
        let n = counterData[i]['FP'] + counterData[i]['TN'];

        let accuracy = (counterData[i]['TP'] + counterData[i]['TN']) / (p + n);
       
        // let f1 = 2 * counterData[i]['TP'] / (2 * counterData[i]['TP'] + counterData[i]['FP'] + counterData[i]['FN']);
        let precision = counterData[i]['TP'] / (counterData[i]['TP'] + counterData[i]['FP']);
        let recall = counterData[i]['TP'] / (counterData[i]['TP'] + counterData[i]['FN']);

        
        accuracy = Math.round(accuracy * 100) / 100;    
        precision = Math.round(precision * 100) / 100;
        recall = Math.round(recall * 100) / 100;

        f1 = 2* (precision * recall) /( precision + recall)
        f1 = Math.round(f1 * 100) / 100;
    
        if (isNaN(accuracy)) { accuracy = 0; }        
        if (counterData[i]['TP'] + counterData[i]['FP'] == 0 ) { precision = 0; }
        if (counterData[i]['TP'] + counterData[i]['FN'] == 0 ) { recall = 0; }
        if (precision == 0 && recall ==0) { f1 = 0; }

        console.log("accuracy + ' ' + f1 + ' ' + precision + ' ' + recall");
        console.log(accuracy + ' ' + f1 + ' ' + precision + ' ' + recall);
        console.log('----------')

        counterData[i]['Accuracy'] = accuracy;
        counterData[i]['F1'] = f1;
        counterData[i]['Precision'] = precision;
        counterData[i]['Recall'] = recall;
        console.log(counterData)

        // data[i]['Accuracy'] = accuracy;
        // data[i]['F1'] = f1;
        // data[i]['Precision'] = precision;
        // data[i]['Recall'] = recall;
        // console.log(data[i])
    }
    
    // let preprocessData = [];
    // console.log("counterData,",counterData)
    // console.log("data,",data)
    // for (let i = 0; i < counterData.length; ++i) {
    //     console.log("counterData[i]['Label']:",counterData[i]['Label'])
    //     for (let j = 0; j < data.length; ++j) {
    //         console.log("data[j]['Label'] :",data[j]['Label'] )
    //         if (data[j]['Label'] === counterData[i]['Label']) {
    //             preprocessData.push(data[j]);
    //         }
    //     }
    // }
    // console.log("counterData:",counterData)
    // console.log("preprocessData:",preprocessData)

    //return preprocessData;
    return counterData;
}
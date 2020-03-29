vis.initMatrix = function (label) {
    let data = vis.processMutualInfo('correlation');  //fix the label first
    // console.log("initMatrx:",label)

    if (dom.buttons.attrStudy.hasClass('active')) {
        //console.log("dom.buttons.attrStudy.hasClass('active')")
        // vis.drawMatrix(data, label, dom.contents.attrMatrix);
        if (label == 'conditional_entropy_truelabel' || label == 'conditional_entropy_prediction'){
            let newlabel = label.split('_')[0] +'_' + label.split('_')[1]
            // console.log("newlabel:",newlabel)
            data = vis.processMutualInfo(newlabel);
            vis.drawMatrix(data, label, dom.contents.attrMatrix);
        } else{
            data = vis.processMutualInfo(label);
            vis.drawMatrixMerged(data, label, dom.contents.attrMatrix);
        }
    }
    return;
}

vis.processMutualInfo = function (labels) {

    let data = {};

    data.mutualInfo = main.matrix[labels];
    data.current_method = labels;
    data.rowCol = Object.keys(data.mutualInfo.predProb);

    let range_pred = Object.values(data.mutualInfo.predProb).sort()
    let range_true = Object.values(data.mutualInfo.trueLabel).sort()
    let range_between = Object.values(data.mutualInfo.between).sort()

    //get real range since there is the no data case and 1000000 is filled
    data.max_range_prediction = range_pred.filter(num =>num <1000000)
    data.max_range_truelabel = range_true.filter(num =>num <1000000)
    data.max_range_between= range_between.filter(num =>num <1000000)


    let rowRange = [];
    let colRange = [];

    for (let i = 0; i < data.rowCol.length; i++) {
        let item = data.rowCol[i];
        let rowId = parseInt(item.split('-')[0]);
        let colId = parseInt(item.split('-')[0]);
        rowRange.push(rowId);
        colRange.push(colId);
    }

    // Minimum rows and columns
    data.minRow = d3.min(rowRange);
    data.maxRow = d3.max(rowRange);

    data.minCol = d3.min(colRange);
    data.maxCol = d3.max(colRange);

    // console.log("data",data)
    return data;
}

///////// conditional_entropy //////////

vis.drawMatrix = function (data, labelType, container){
    container.empty();

    let labeltype = labelType.split('_')[2]  // truelabel or prediciton

    let mutualKeyValues_pred = data.mutualInfo.predProb ;
    let mutualKeyValues_true = data.mutualInfo.trueLabel;
    let mutualKeyValues_between = data.mutualInfo.between;


    var linearScale_pred = d3.scaleLinear()
        //.domain([0, d3.max(Object.values(mutualKeyValues_pred))])
        .domain([d3.min(data.max_range_prediction), d3.max(data.max_range_prediction)])
        .range([0, 1]);
    var linearScale_true = d3.scaleLinear()
        // .domain([0, d3.max(Object.values(mutualKeyValues_true))])
        .domain([d3.min(data.max_range_truelabel), d3.max(data.max_range_truelabel)])
        .range([0, 1]);

    // var linearScale_pred = d3.scaleLinear()
    //     //.domain([0, d3.max(Object.values(mutualKeyValues_pred))])
    //     .domain([d3.min(data.max_range_prediction), d3.max(data.max_range_prediction)])
    //     .range([d3.min(data.max_range_prediction), d3.max(data.max_range_prediction)]);
    //     // .range([0, 1]);
    // var linearScale_true = d3.scaleLinear()
    //     // .domain([0, d3.max(Object.values(mutualKeyValues_true))])
    //     .domain([d3.min(data.max_range_truelabel), d3.max(data.max_range_truelabel)])
    //     .range([d3.min(data.max_range_truelabel), d3.max(data.max_range_truelabel)]);
    //     // .range([0, 1]);
    // var linearScale_between = d3.scaleLinear()
    //     // .domain([0, d3.max(Object.values(mutualKeyValues_true))])
    //     .domain([d3.min(data.max_range_between), d3.max(data.max_range_between)])
    //     .range([d3.min(data.max_range_between), d3.max(data.max_range_between)]);
    //     // .range([0, 1]);

    // let margin = {left: 300, top:110, right:50, bottom:30}
    let margin = {left: 240, top:110, right:50, bottom:30}
    let width = container.width() ;
    let height = container.height() ;
    let distance = 0;

    let matrixRows_len = data.maxCol+1;
    let matrixCols_len = matrixRows_len;
    // let rect_width = d3.min([17, ((width - margin.left - margin.right) / matrixRows_len ), ((height - margin.top - margin.bottom ) / matrixRows_len)]);
    let rect_width = d3.min([17, ((width - margin.left - margin.right) / matrixRows_len ), ((height - margin.top - margin.bottom ) / matrixRows_len)]) + 6;
    let rect_height = d3.min([17, ((width - margin.left - margin.right) / matrixRows_len ), ((height - margin.top - margin.bottom ) / matrixRows_len)]);

    svg = d3.select('#' + container.attr('id')).append("svg")
            .attr('width',width)
            .attr('height',height);

    // draw upright corner of matrix for trueLabel data

    let transformXY = [];
    let transformData = [];
    let transformIJ = [];

    let markerColor1 =''
    let markerColor2 = ''
    let markerText1 = ''
    let markerText2 = ''
    if (labeltype == 'truelabel'){
        var mutualKeyValuesArray = Object.entries(mutualKeyValues_true);
        markerColor1 = '#a6d96a'
        markerColor2 = '#a6d96a'
        markerText1 = 'true-label'
        markerText2 = 'true-label'
    }
    else {
        var mutualKeyValuesArray = Object.entries(mutualKeyValues_pred);
        markerColor1 = '#92c5de'
        markerColor2 = '#92c5de'
        markerText1 = 'prediction'
        markerText2 = 'prediction'
    }




    let mutual_matrixRect_true = svg.append('g')
            .selectAll('mutual-rect-'+labeltype)
            .data(mutualKeyValuesArray)
            .enter()
        .append('rect')
            .attr('class','mutual_rect')
            .attr('id', function(d,i){
                let rect_pos_value = mutualKeyValuesArray[i];
                let pos_i = rect_pos_value[0].split('-')[0];
                let pos_j = rect_pos_value[0].split('-')[1];
                return 'trueRect_'+pos_i + '_' + pos_j;
            })
            .attr('width', rect_width)
            .attr('height',rect_height)
            .attr('fill',markerColor1)
            .attr('opacity',function(d,i){
                let rect_pos_value = mutualKeyValuesArray[i];
                let pos_i = rect_pos_value[0].split('-')[0];
                let pos_j = rect_pos_value[0].split('-')[1];
                let value = rect_pos_value[1];
                if (labelType == 'prediciton'){
                    var res = linearScale_pred(value);
                } else {
                    var res = linearScale_true(value);
                }
                if (res > 10000000) {
                    transformData.push(res);
                    return 0;
                }
                transformData.push(res);
                
                return res;
            })
            .attr('stroke','black')
            .attr('stroke-width','1px')
            .attr('transform', function(d,i){
                let rect_pos_value = mutualKeyValuesArray[i];
                let pos_i = rect_pos_value[0].split('-')[0];
                let pos_j = rect_pos_value[0].split('-')[1];

                // if (parseInt(pos_i) > parseInt(pos_j) ){
                    let x = parseInt(pos_i) * ( rect_width  +distance) + margin.left;
                    let y = parseInt(pos_j) * (rect_height +distance) + margin.top;
                    transformXY.push(x.toString() + ',' + y.toString());
                    transformIJ.push(pos_i.toString()+'_'+pos_j.toString())
                    return "translate( " + x +"," + y + ")";
                // }
                // return;
            })
            .style('cursor', 'pointer')
            .on('click', function(d) {
                main.embedding.filterLabels = [];
                let col_j = this.id.split('_')[1];
                let row_i = this.id.split('_')[2];
                $('#attribute-btn-' + row_i).click();
                $('#attribute-btn-' + col_j).click();
            })
            .on("mouseover",mouseover)
            .on("mouseout",mouseout);

    //up right number text
    let mutual_matrixRect_true_text = svg.append('g')
                .selectAll('mutual-rect-text'+labeltype)
                .data(transformData)
                .enter()
            .append('text')
                .attr('id', function(d,i){
                    return 'Text_'+transformIJ[i];
                })
                .attr('class','number_text')
                .attr('dy','1.3em')
                .attr('dx','0.5em')
                .attr('text-anchor', 'start')
                .style("font-size", "9px")
                .style('cursor', 'pointer')
                .attr('transform',function(d,i){
                    return "translate( " + transformXY[i]+ ")";
                })
                .text(function(d){
                    if (d> 100000){return;}
                    return setNum(d);
                })
                .on("mouseover",mouseoverText)
                .on("mouseout",mouseoutText)
                .on('click', function(d) {
                    main.embedding.filterLabels = [];
                    let col_j = this.id.split('_')[1];
                    let row_i = this.id.split('_')[2];
                    $('#attribute-btn-' + row_i).click();
                    $('#attribute-btn-' + col_j).click();
                });





    // set the text of matrix label
    let mutual_matrixText_top = svg.selectAll('mutual_label_name-text')
            .attr('class','mutual_label')
            .data(main.embedding.labels.sort())
            .enter()
        .append('text')
            .attr('id',function(d,i){
                return 'col_' + i;
            })
            .attr('dy','0.5em')
            .attr('dx','1em')
            .attr('text-anchor', 'right')
            .style("font-size", "12px")
            .attr('transform',function(d,i){
                let x = margin.left + i * (rect_width +distance);
                let y = margin.top - 10;
                return "translate( " + x +"," + y + ") rotate(-45)";
            })
            .text(function(d){
                return d;
            });

    let mutual_matrixText_left = svg.selectAll('mutual_label_name-text')
            .attr('class','mutual_label')
            .data(main.embedding.labels.sort())
            .enter()
        .append('text')
            .attr('id',function(d,i){
                return 'row_' + i;
            })
            .attr('dy','1em')
            .attr('text-anchor', 'end')
            .style("font-size", "12px")
            .attr('transform',function(d,i){
                let x = margin.left -10;
                let y = margin.top + i * (rect_height +distance);
                return "translate( " + x +"," + y + ") rotate(0)";
            })
            .text(function(d){
                return d;
            });

    //markers text

    let marker_between1 = svg.append('text')
            .attr('class', 'mutual_marker')
            .attr('text-anchor','end')
            .style("font-size", "12px")
            .style("font-weight","bold")
            .attr('fill','#f4a582')
            .attr('transform',function(d,i){
                let x = margin.left -22;
                let y = margin.top - 10;
                return "translate( " + x +"," + y + ") rotate(0)";
            })
            .text('uncertain attribute');

    let marker_between2 = svg.append('text')
            .attr('class', 'mutual_marker')
            .attr('text-anchor','start')
            .style("font-size", "12px")
            .style("font-weight","bold")
            .attr('fill','#f4a582')
            .attr('transform',function(d,i){
                let x = margin.left - 10;
                let y = margin.top - 24;
                return "translate( " + x +"," + y + ") rotate(-90)";
            })
            .text('condition');      

    let lineBetween1 = svg.append('line')
        .attr("x1", margin.left - 130)
        .attr("y1", margin.top - 9)
        .attr("x2", margin.left - 9)
        .attr("y2", margin.top  - 9)
        .attr("stroke", "#f4a582")
        .attr("stroke-width", 1);
      

    let lineBetween2 = svg.append('line')
            .attr("x1", margin.left - 9)
            .attr("y1", margin.top - 84)
            .attr("x2", margin.left - 9)
            .attr("y2", margin.top  - 9)
            .attr("stroke", "#f4a582")
            .attr("stroke-width", 1);


    let marker_pred2 = svg.append('text')
            .attr('class', 'mutual_marker')
            .attr('text-anchor','start')
            .style("font-size", "12px")
            .style("font-weight","bold")
            .attr('fill',markerColor1)
            .attr('transform',function(d,i){
                let x = margin.left / 2 + 125;// 85;
                let y = margin.top  +  matrixRows_len * rect_height + 15;
                return "translate( " + x +"," + y + ") rotate(0)";
            })
            .text(markerText1);

    let marker_true2 = svg.append('text')
            .attr('class', 'mutual_marker')
            .attr('text-anchor','end')
            .style("font-size", "12px")
            .style("font-weight","bold")
            .attr('fill', markerColor2)
            .attr('transform',function(d,i){
                let x = margin.left  + matrixRows_len * rect_width + 14;
                let y = 110;
                return "translate( " + x +"," + y + ") rotate(270)";
            })
            .text(markerText2);

    let line_marker_pred2 = svg.append('line')
            .attr("x1", margin.left / 2 + 125)
            .attr("y1", margin.top  +  matrixRows_len * rect_height +6)
            .attr("x2", margin.left / 2 + 245)
            .attr("y2", margin.top  +  matrixRows_len * rect_height +6)
            .attr("stroke", markerColor1)
            .attr("stroke-width", 1);
          
    
    let line_marker_true2 = svg.append('line')
            .attr("x1", margin.left  + matrixRows_len * rect_width + 6)
            .attr("y1", 110)
            .attr("x2", margin.left  + matrixRows_len * rect_width + 6)
            .attr("y2", 230)
            .attr("stroke", markerColor1)
            .attr("stroke-width", 1);

}



////////// MI_correlation //////////
vis.drawMatrixMerged = function (data, labelType, container){
    container.empty();
    let mutualKeyValues_pred = data.mutualInfo.predProb ;
    let mutualKeyValues_true = data.mutualInfo.trueLabel;
    let mutualKeyValues_between = data.mutualInfo.between;




    var linearScale_pred = d3.scaleLinear()
        //.domain([0, d3.max(Object.values(mutualKeyValues_pred))])
        .domain([d3.min(data.max_range_prediction), d3.max(data.max_range_prediction)])
        .range([d3.min(data.max_range_prediction), d3.max(data.max_range_prediction)]);
        // .range([0, 1]);
    var linearScale_true = d3.scaleLinear()
        // .domain([0, d3.max(Object.values(mutualKeyValues_true))])
        .domain([d3.min(data.max_range_truelabel), d3.max(data.max_range_truelabel)])
        .range([d3.min(data.max_range_truelabel), d3.max(data.max_range_truelabel)]);
        // .range([0, 1]);
    var linearScale_between = d3.scaleLinear()
        // .domain([0, d3.max(Object.values(mutualKeyValues_true))])
        .domain([d3.min(data.max_range_between), d3.max(data.max_range_between)])
        .range([d3.min(data.max_range_between), d3.max(data.max_range_between)]);
        // .range([0, 1]);


    let margin = {left: 240, top:110, right:50, bottom:30}
    let width = container.width() ;
    let height = container.height() ;
    let distance = 0;

    let matrixRows_len = data.maxCol+1;
    let matrixCols_len = matrixRows_len;
    let rect_width = d3.min([17, ((width - margin.left - margin.right) / matrixRows_len ), ((height - margin.top - margin.bottom ) / matrixRows_len)]) + 6;
    let rect_height = d3.min([17, ((width - margin.left - margin.right) / matrixRows_len ), ((height - margin.top - margin.bottom ) / matrixRows_len)]);

    svg = d3.select('#' + container.attr('id')).append("svg")
            .attr('width',width)
            .attr('height',height);

    // draw upright corner of matrix for trueLabel data
    let mutualKeyValuesArray = Object.entries(mutualKeyValues_true);
    let transformXY = [];
    let transformData = [];
    let transformIJ = [];
    let mutual_matrixRect_true = svg.append('g')
            .selectAll('mutual-rect')
            .data(mutualKeyValuesArray)
            .enter()
        .append('rect')
            .attr('class','mutual_rect_true')
            .attr('id', function(d,i){
                let rect_pos_value = mutualKeyValuesArray[i];
                let pos_i = rect_pos_value[0].split('-')[0];
                let pos_j = rect_pos_value[0].split('-')[1];
                return 'trueRect_'+pos_i + '_' + pos_j;
            })
            .attr('width', rect_width)
            .attr('height',rect_height)
            .attr('fill','#a6d96a')
            .attr('opacity',function(d,i){
                let rect_pos_value = mutualKeyValuesArray[i];
                let pos_i = rect_pos_value[0].split('-')[0];
                let pos_j = rect_pos_value[0].split('-')[1];
                if (parseInt(pos_i) > parseInt(pos_j)) {
                    let value = rect_pos_value[1];
                    let res = linearScale_true(value);
                    if (res > 10000) {
                        transformData.push(res);
                        return 0;
                    }
                    transformData.push(res);

                    // judge positve or negativd 
                    if(res < 0 ){
                        return Math.abs(res)
                    }
                    return res;
                }
                return 0;

            })
            .attr('stroke','black')
            .attr('stroke-width','1px')
            .attr('transform', function(d,i){
                let rect_pos_value = mutualKeyValuesArray[i];
                let pos_i = rect_pos_value[0].split('-')[0];
                let pos_j = rect_pos_value[0].split('-')[1];

                if (parseInt(pos_i) > parseInt(pos_j) ){
                    let x = parseInt(pos_i) * ( rect_width+distance) + margin.left;
                    let y = parseInt(pos_j) * ( rect_height  +distance) + margin.top;
                    transformXY.push(x.toString() + ',' + y.toString());
                    transformIJ.push(pos_i.toString()+'_'+pos_j.toString())
                    return "translate( " + x +"," + y + ")";
                }
                return;
            })
            .on('click', function(d) {
                main.embedding.filterLabels = [];
                let col_j = this.id.split('_')[1];
                let row_i = this.id.split('_')[2];
                $('#attribute-btn-' + row_i).click();
                $('#attribute-btn-' + col_j).click();
            })
            .style('cursor', 'pointer')
            .on("mouseover",mouseover)
            .on("mouseout",mouseout);

    //up right number text
    let mutual_matrixRect_true_text = svg.append('g')
                .selectAll('mutual-rect-text')
                .data(transformData)
                .enter()
            .append('text')
                .attr('id', function(d,i){
                    return 'trueText_'+transformIJ[i];
                })
                .attr('class','number_text')
                .attr('dy','1.3em')
                .attr('dx','0.5em')
                .attr('text-anchor', 'start')
                .style("font-size", "9px")
                .attr('transform',function(d,i){
                    return "translate( " + transformXY[i]+ ")";
                })
                .text(function(d){
                    if (d >10000) {return;}
                    return setNum(d);
                })
                .style('cursor', 'pointer')
                .on("mouseover",mouseoverText)
                .on("mouseout",mouseoutText)
                .on('click', function(d) {

                    main.embedding.filterLabels = [];
                    let col_j = this.id.split('_')[1];
                    let row_i = this.id.split('_')[2];
                    $('#attribute-btn-' + row_i).click();
                    $('#attribute-btn-' + col_j).click();

                });

    // draw bottom left corner for the predProb
    mutualKeyValuesArray = Object.entries(mutualKeyValues_pred);
    transformXY = [];
    transformData = [];
    transformIJ = [];
    let mutual_matrixRect_pred = svg.append('g')
            .selectAll('mutual-rect')
            .data(mutualKeyValuesArray)
            .enter()
        .append('rect')
            .attr('class','mutual_rect_pred')
            .attr('id', function(d,i){
                let rect_pos_value = mutualKeyValuesArray[i];
                let pos_i = rect_pos_value[0].split('-')[0];
                let pos_j = rect_pos_value[0].split('-')[1];
                return 'predRect_'+pos_i + '_' + pos_j;
            })
            .attr('width', rect_width)
            .attr('height',rect_height)
            .attr('fill','#92c5de')
            .attr('stroke','black')
            .attr('stroke-width','1px')
            .attr('opacity',function(d,i){
                let rect_pos_value = mutualKeyValuesArray[i];
                let pos_i = rect_pos_value[0].split('-')[0];
                let pos_j = rect_pos_value[0].split('-')[1];
                if (parseInt(pos_i) < parseInt(pos_j)) {
                    let value = rect_pos_value[1];
                    let res = linearScale_pred(value);
                    if (res > 10000) {
                        transformData.push(res);
                        return 0;
                    }
                    transformData.push(res);
                    // judge positve or negativd 
                    if(res < 0 ){
                        return Math.abs(res)
                    }
                    return res;
                }
                return 0;

            })
            .attr('transform', function(d,i){
                let rect_pos_value = mutualKeyValuesArray[i];
                let pos_i = rect_pos_value[0].split('-')[0];
                let pos_j = rect_pos_value[0].split('-')[1];

                if (parseInt(pos_i) < parseInt(pos_j) ){
                    let x = parseInt(pos_i) * ( rect_width+distance) + margin.left;
                    let y = parseInt(pos_j) * ( rect_height  +distance) + margin.top;
                    transformXY.push(x.toString() + ',' + y.toString());
                    transformIJ.push(pos_i.toString() + '_' + pos_j.toString());
                    return "translate( " + x +"," + y + ")";
                }
                return;
            })
            .on('click', function(d) {
                main.embedding.filterLabels = [];
                let col_j = this.id.split('_')[1];
                let row_i = this.id.split('_')[2];
                $('#attribute-btn-' + row_i).click();
                $('#attribute-btn-' + col_j).click();
            })
            .style('cursor', 'pointer')
            .on("mouseover",mouseover)
            .on("mouseout",mouseout);

     //botton left number text
     let mutual_matrixRect_pred_text = svg.append('g')
                    .selectAll('mutual-rect-text')
                    .data(transformData)
                    .enter()
                .append('text')
                    .attr('id', function(d,i){
                        return 'trueText_'+transformIJ[i];
                    })
                    .attr('class','number_text')
                    .attr('dy','1.3em')
                    .attr('dx','0.5em')
                    .attr('text-anchor', 'start')
                    .style("font-size", "9px")
                    .attr('transform',function(d,i){
                        return "translate( " + transformXY[i]+ ")";
                    })
                    .text(function(d){
                        if (d >10000) {return;}
                        return setNum(d);
                    })
                    .style('cursor', 'pointer')
                    .on("mouseover",mouseoverText)
                    .on("mouseout",mouseoutText)
                    .on('click', function(d) {
                        main.embedding.filterLabels = [];
                        let col_j = this.id.split('_')[1];
                        let row_i = this.id.split('_')[2];
                        $('#attribute-btn-' + row_i).click();
                        $('#attribute-btn-' + col_j).click();
                    });


     // draw diagnoal of matrix
     mutualKeyValuesArray = Object.entries(mutualKeyValues_between);
     transformXY = [];
     transformData = [];
     transformIJ = [];
     let mutual_matrixRect_diag = svg.append('g')
             .selectAll('mutual-rect')
             .data(mutualKeyValuesArray)
             .enter()
         .append('rect')
             .attr('class','mutual_rect_diag')
             .attr('id', function(d,i){
                let rect_pos_value = mutualKeyValuesArray[i];
                let pos_i = rect_pos_value[0].split('-')[0];
                let pos_j = rect_pos_value[0].split('-')[1];
                return 'diagRect_'+pos_i + '_' + pos_j;
            })
             .attr('width', rect_width)
             .attr('height',rect_height)
             .attr('stroke','black')
             .attr('stroke-width','1px')
             .attr('fill','#f4a582')
             .attr('opacity',function(d,i){
                 let rect_pos_value = mutualKeyValuesArray[i];
                 let pos_i = rect_pos_value[0].split('-')[0];
                 let pos_j = rect_pos_value[0].split('-')[1];
                 if (parseInt(pos_i) == parseInt(pos_j)) {
                    let value = rect_pos_value[1];
                    let res = linearScale_between(value);

                    if (res > 10000) {
                       transformData.push(res);
                       return 0;
                   }

                    transformData.push(res);
                    console.log('res',res)
                    // judge positve or negativd 
                    if(res < 0 ){
                        return Math.abs(res)
                    }
                    return res;
                 }
                 return 0;

             })

             .attr('transform', function(d,i){
                 let rect_pos_value = mutualKeyValuesArray[i];
                 let pos_i = rect_pos_value[0].split('-')[0];
                 let pos_j = rect_pos_value[0].split('-')[1];

                 if (parseInt(pos_i) == parseInt(pos_j) ){
                     let x = parseInt(pos_i) * ( rect_width+distance) + margin.left;
                     let y = parseInt(pos_j) * (rect_height  +distance) + margin.top;
                     transformXY.push(x.toString() + ',' + y.toString());
                     transformIJ.push(pos_i.toString() + '_' + pos_j.toString());
                     return "translate( " + x +"," + y + ")";
                 }
                 return;
             })

            .on('click', function(d) {
                main.embedding.filterLabels = [];
                let col_j = this.id.split('_')[1];
                let row_i = this.id.split('_')[2];
                $('#attribute-btn-' + row_i).click();
            })
            .style('cursor', 'pointer')
            .on("mouseover",mouseover)
            .on("mouseout",mouseout);

        //diagonal number text
        let mutual_matrixRect_diag_text = svg.append('g')
            .selectAll('mutual-rect-text')
            .data(transformData)
            .enter()
        .append('text')
            .attr('id', function(d,i){
                return 'trueText_'+transformIJ[i];
            })
            .attr('class','number_text')
            .attr('dy','1.3em')
            .attr('dx','0.5em')
            .attr('text-anchor', 'start')
            .style("font-size", "9px")
            .attr('transform',function(d,i){
                return "translate( " + transformXY[i]+ ")";
            })
            .text(function(d){
                if (d >10000){return;}
                return setNum(d);
            })
            .on('click', function(d) {
                main.embedding.filterLabels = [];
                let col_j = this.id.split('_')[1];
                let row_i = this.id.split('_')[2];
                $('#attribute-btn-' + row_i).click();
            })
            .style('cursor', 'pointer')
            .on("mouseover",mouseoverText)
            .on("mouseout",mouseoutText);




    // set the text of matrix label
    let mutual_matrixText_top = svg.selectAll('mutual_label_name-text')
            .attr('class','mutual_label')
            .data(main.embedding.labels.sort())
            .enter()
        .append('text')
            .attr('id',function(d,i){
                return 'col_' + i;
            })
            .attr('dy','0.5em')
            .attr('dx','0.5em')
            .attr('text-anchor', 'right')
            .style("font-size", "12px")
            .attr('transform',function(d,i){
                let x = margin.left + i * (rect_width +distance);
                let y = margin.top - 10;
                return "translate( " + x +"," + y + ") rotate(-45)";
            })
            .text(function(d){
                return d;
            });

    let mutual_matrixText_left = svg.selectAll('mutual_label_name-text')
            .attr('class','mutual_label')
            .data(main.embedding.labels.sort())
            .enter()
        .append('text')
            .attr('id',function(d,i){
                return 'row_' + i;
            })
            .attr('dy','1em')
            .attr('text-anchor', 'end')
            .style("font-size", "12px")
            .attr('transform',function(d,i){
                let x = margin.left -10;
                let y = margin.top + i * (rect_height +distance);
                return "translate( " + x +"," + y + ") rotate(0)";
            })
            .text(function(d){
                return d;
            });

    // markers text
    let marker_between1 = svg.append('text')
            .attr('class', 'mutual_marker')
            .attr('text-anchor','end')
            .style("font-size", "12px")
            .style("font-weight","bold")
            .attr('fill','#f4a582')
            .attr('transform',function(d,i){
                let x = margin.left -24;
                let y = margin.top - 10;
                return "translate( " + x +"," + y + ") rotate(0)";
            })
            .text('prediction');

    let marker_between2 = svg.append('text')
            .attr('class', 'mutual_marker')
            .attr('text-anchor','start')
            .style("font-size", "12px")
            .style("font-weight","bold")
            .attr('fill','#f4a582')
            .attr('transform',function(d,i){
                let x = margin.left - 10;
                let y = margin.top - 24;
                return "translate( " + x +"," + y + ") rotate(-90)";
            })
            .text('true-label');

    let lineBetween1 = svg.append('line')
            .attr("x1", margin.left - 100)
            .attr("y1", margin.top - 9)
            .attr("x2", margin.left - 9)
            .attr("y2", margin.top  - 9)
            .attr("stroke", "#f4a582")
            .attr("stroke-width", 1);
          
    
    let lineBetween2 = svg.append('line')
                .attr("x1", margin.left - 9)
                .attr("y1", margin.top - 84)
                .attr("x2", margin.left - 9)
                .attr("y2", margin.top  - 9)
                .attr("stroke", "#f4a582")
                .attr("stroke-width", 1);
    
    

    let marker_pred2 = svg.append('text')
            .attr('class', 'mutual_marker')
            .attr('text-anchor','start')
            .style("font-size", "12px")
            .style("font-weight","bold")
            .attr('fill','#92c5de')
            .attr('transform',function(d,i){
                let x = margin.left / 2 + 125;
                let y = margin.top  +  matrixRows_len * rect_height + 15;
                return "translate( " + x +"," + y + ") rotate(0)";
            })
            .text('prediction');

    let marker_true2 = svg.append('text')
            .attr('class', 'mutual_marker')
            .attr('text-anchor','end')
            .style("font-size", "12px")
            .style("font-weight","bold")
            .attr('fill','#a6d96a')
            .attr('transform',function(d,i){
                let x = margin.left  + matrixRows_len * rect_width + 14;
                let y = 110;
                return "translate( " + x +"," + y + ") rotate(-90)";
            })
            .text('true-label ');

    let line_marker_pred2 = svg.append('line')
            .attr("x1", margin.left / 2 + 125)
            .attr("y1", margin.top  +  matrixRows_len * rect_height +6)
            .attr("x2", margin.left / 2 + 245)
            .attr("y2", margin.top  +  matrixRows_len * rect_height +6)
            .attr("stroke", '#92c5de')
            .attr("stroke-width", 1);
          
    
    let line_marker_true2 = svg.append('line')
            .attr("x1", margin.left  + matrixRows_len * rect_width + 6)
            .attr("y1", 110)
            .attr("x2", margin.left  + matrixRows_len * rect_width + 6)
            .attr("y2", 230)
            .attr("stroke", '#a6d96a')
            .attr("stroke-width", 1);


}

function mouseover(){
    // get position of mouseover
    let col_j = this.id.split('_')[1];
    let row_i = this.id.split('_')[2];
    let header = this.id.split('_')[0];


    d3.select('#trueText' + '_' + row_i + '_' + col_j)
        .style('stroke','blue')
        .style('font-size', '10px')
        .style('stroke-width','0.8px');

    d3.select('#trueText' + '_' + col_j + '_' + row_i)
        .style('stroke','red')
        .style('font-size', '10px')
        .style('stroke-width','0.8px');

    // find the label text
    d3.select('#col_' + col_j)
        .attr('fill', 'red')
        .style('font-weight','bold')
        .style('font-size', '14px');
    d3.select('#row_' + row_i)
        .attr('fill', 'red')
        .style('font-weight','bold')
        .style('font-size', '14px');

    // find the label text
    d3.select('#col_' + row_i)
        .attr('fill', 'blue')
        .style('font-weight','bold')
        .style('font-size', '14px');
    d3.select('#row_' + col_j)
        .attr('fill', 'blue')
        .style('font-weight','bold')
        .style('font-size', '14px');

    //d3.selectAll('.number_text').style('font-size', '8px').
}

function mouseout(){
    // get position of mouseover
    let col_j = this.id.split('_')[1];
    let row_i = this.id.split('_')[2];
    let header = this.id.split('_')[0];

    d3.select('#trueText' + '_' + row_i + '_' + col_j)
        .style('stroke','#000')
        .style('font-size', '9px')
        .style('stroke-width','0.1px');

    d3.select('#trueText' + '_' + col_j + '_' + row_i)
        .style('stroke','#000')
        .style('font-size', '9px')
        .style('stroke-width','0.1px');

    // find the label text
    d3.select('#col_' + col_j)
        .attr('fill', '#000')
        .style('font-weight','normal')
        .style('font-size', '12px');
    d3.select('#row_' + row_i)
        .attr('fill', '#000')
        .style('font-weight','normal')
        .style('font-size', '12px');

    // find the label text
    d3.select('#col_' + row_i)
        .attr('fill', '#000')
        .style('font-weight','normal')
        .style('font-size', '12px');
    d3.select('#row_' + col_j)
        .attr('fill', '#000')
        .style('font-weight','normal')
        .style('font-size', '12px');

}

function mouseoverText(){
    // get position of mouseover
    let col_j = this.id.split('_')[1];
    let row_i = this.id.split('_')[2];
    let header = this.id.split('_')[0];

    // find the label text
    d3.select('#col_' + col_j)
        .attr('fill', 'red')
        .style('font-weight','bold')
        .style('font-size', '14px');
    d3.select('#row_' + row_i)
        .attr('fill', 'red')
        .style('font-weight','bold')
        .style('font-size', '14px');
    // find the label text
    d3.select('#col_' + row_i)
        .attr('fill', 'blue')
        .style('font-weight','bold')
        .style('font-size', '14px');
    d3.select('#row_' + col_j)
        .attr('fill', 'blue')
        .style('font-weight','bold')
        .style('font-size', '14px');


    d3.select('#'+this.id)
        .style('stroke','red')
        .style('font-size', '10px')
        .style('stroke-width','0.8px');

    d3.select('#' + header + '_' + row_i + '_' + col_j)
        .style('stroke','blue')
        .style('font-size', '10px')
        .style('stroke-width','0.8px');
}

function mouseoutText(){
    // get position of mouseover
    let col_j = this.id.split('_')[1];
    let row_i = this.id.split('_')[2];
    let header = this.id.split('_')[0];

    // find the label text
    d3.select('#col_' + col_j)
        .attr('fill', '#000')
        .style('font-weight','normal')
        .style('font-size', '12px');
    d3.select('#row_' + row_i)
        .attr('fill', '#000')
        .style('font-weight','normal')
        .style('font-size', '12px');

    // find the label text
    d3.select('#col_' + row_i)
        .attr('fill', '#000')
        .style('font-weight','normal')
        .style('font-size', '12px');
    d3.select('#row_' + col_j)
        .attr('fill', '#000')
        .style('font-weight','normal')
        .style('font-size', '12px');

    d3.select('#'+this.id)
        .style('stroke','black')
        .style('font-size', '9px')
        .style('stroke-width','0.1px');
        

    d3.select('#' + header + '_'+ row_i + '_' + col_j)
        .style('stroke','black')
        .style('font-size', '9px')
        .style('stroke-width','0.1px');
}

function setNum(num){
    let res = num.toFixed(2).toString()
    //console.log("res:",res)
    // if (res[0]=='1'){
    //     return '1.0';
    // }
    // else if (res == '-0.00'){
    //     return '.00';
    // }
    
    // else{
    //     return res.substr(1,(res.length-1));
    // }


    if (res[0] == '-' && res[1] == '0'){
        return res.replace('-0','-');
    }
    else if (res[0] == '0' && res[1] == '.'){
        return res.replace('0.','.')
    }
    return res
}


// function setOpacity(num){
//     let res = num.toFixed(2).toString()
//     if (res[0] == '-' && res[1] == '0'){


// }
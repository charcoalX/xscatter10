vis.initCount = function (num) {        
    let data = vis.processCountInfo(num);   

    if (dom.buttons.attrStudy.hasClass('active')) {
       
        vis.drawCountTable(data, num, dom.contents.attrCount);
    }
    return;    
}


vis.processCountInfo = function (num) {

    let data = {};
    data.countInfo = main.count[num];
    data.current_num = num;
    data.rowLen = Object.keys(data.countInfo).length;
    let keys = Object.keys(data.countInfo)
    
    let rowInfoAll = []
    for (let i = 0; i< data.rowLen; i++){
        let key = keys[i];
        let ids = key.split('_');           
        ids.shift(); // remove 'attr' 
        let rowInfo ={}
        if (ids.length ==1){          
            rowInfo.Number = data.countInfo[key].imageIDs[0].length,
            rowInfo.imageIDs= data.countInfo[key].imageIDs,
            rowInfo.Attributes = ids,
            rowInfo.CorNum = data.countInfo[key].imageIDs_correctPred.length
        } else {
          rowInfo.Number = data.countInfo[key].imageIDs.length,
          rowInfo.imageIDs= data.countInfo[key].imageIDs,
          rowInfo.Attributes = ids,
          rowInfo.CorNum = data.countInfo[key].imageIDs_correctPred.length
        }       
        rowInfoAll.push(rowInfo)
    }
    data.rowInfo = rowInfoAll;
    return data;
}




vis.drawCountTable = function (data, colNum, container){
    container.empty();

    ////////
    let sortAscending = true;
    let table = d3.select('#attribute-matrix2-content').append('table').attr('class', 'scroll');

    var titles = d3.keys(data.rowInfo[0]);
    var titles = ["Attributes","Number","CorNum"]; // "imageIDs",
    var headers = table.append('thead').append('tr')
        .selectAll('th')
        .data(titles).enter()
        .append('th')
        .text(function(d) {
            return d
        })
        .on('click', function(d) {
            headers.attr('class', 'header');
            if (sortAscending) {
                //all other keys sort numerically including time
                rows.sort(function(a, b) {
                  return b[d] - a[d];
                });
                sortAscending = false;
                this.className = 'aes';
              } else {
                rows.sort(function(a, b) {
                  return a[d] - b[d];
                });
                sortAscending = true;
                this.className = 'des';
              }
        });



    var rows = table.append('tbody').selectAll('tr')
      .data(data.rowInfo).enter()
      .append('tr');
    rows.selectAll('td')
      .data(function(d) {
        return titles.map(function(key, i) {
          return {
            'value': d[key],
            'name': d
          };
        });
      }).enter()
      .append('td')
      .attr('class',function(d){
        let attrIDs = d.name.Attributes;
        let classAttrName = 'class-'
        for (let i = 0;i< attrIDs.length;i++){
            classAttrName += attrIDs[i] + '-';
        }
        return classAttrName.substr(0,classAttrName.length-1)

      })
      .attr('id',function(d,c){
        
          if (typeof(d.value) == "object") {
            let attrIDs = d.name.Attributes;
            classAttrName = 'col1-'
            for (let i = 0;i< attrIDs.length;i++){
                classAttrName += attrIDs[i] + '-'
            }
            return classAttrName.substr(0,classAttrName.length-1)
          } else {
            let attrIDs = d.name.Attributes;
            classAttrName = 'col2-'
            for (let i = 0;i< attrIDs.length;i++){
                classAttrName += attrIDs[i] + '-'
            }
            return classAttrName.substr(0,classAttrName.length-1)
          }
      })
      .html(function (d) {
            if (typeof(d.value) == "object") { 
                let htmlStr = "";
                for (let i = 0 ; i <d.value.length; i++){
                    let key = d.value[i];
                    htmlStr += '<i class="fas fa-square-full" style="color: ' + main.embedding.labelColors[key] + '"></i> ' + main.embedding.labels[key] + " ";
                }
                return htmlStr;
            } else {
                return d.value;
            }
      })
      .on("mouseover",mouseoverC)
      .on("mouseout",mouseoutC)
      .on('click', function(d) {
          main.embedding.filterLabels = [];      
          for (let i = 0; i< d.value.length ; i++){
            $('#attribute-btn-' + d.value[i]).click();
          }                
      });
    return;
}



function mouseoverC(){
    // console.log('mouseover',this.id)
    // get position of mouseover
    let attr_ids= this.id.split('-');
    // // find the label text
    // svg.select('#col_' + col_j)
    //     .attr('fill','red')
    // svg.select('#row_' + row_i)
    //     .attr('fill','red')
    // svg.select('#'+this.id).attr('fill','red')
}

function mouseoutC(){
    // get position of mouseover
    // let col_j = this.id.split('_')[1];
    // let row_i = this.id.split('_')[2];
   
    // // find the label text
    // svg.select('#col_' + col_j)
    //     .attr('fill','black')
    // svg.select('#row_' + row_i)
    //     .attr('fill','black')
    // svg.select('#'+this.id).attr('fill','black')
}


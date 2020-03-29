vis.gallery = function (mainContainer, selection, index) {

    mainContainer.empty();
    var data = vis.getGalleryData(selection);
    //console.log(data);

    Object.keys(data).forEach(function (item) {
        
        let labelContainer = $('<div/>', {
            class: 'gallery-label-container'
        });

        let labelHeader = $('<div/>').css({ width: '100px', height: '60px', border: '2px solid #d9d9d9', 'margin': '2px', float: 'left', 'line-height': '60px', 'text-align': 'center', 'cursor': 'pointer' }).append('#Attributes: ' + item);

        labelContainer.append(labelHeader);

        labelHeader.on('click', function () {

            let select = {
                selectId: vis.selectionCount + 1,
                color: utils.getRandomColors(),
                // Need to convert id to integers
                ids: data[item].map(function (x) { 
                    return parseInt(x, 10); 
                }),
                lock: false
            }

            // Add to selected dots and increment count
            vis.selectedDots.push(select);
            vis.selectionCount += 1;
            
            main.visualize();
        });

        for (let i = 0; i < data[item].length; ++i) {


            let trueImage = $('<img/>', {
                src: '/static/images/' + main.imagePath + data[item][i] + main.imageFileType,
                alt: ''
            }).css({ width: '60px', height: '60px', border: '2px solid #fff', 'margin': '2px', 'white-space': 'nowrap', 'cursor': 'pointer'});
            
            labelContainer.append(trueImage).append(data[item][i]);

            trueImage.on('click', function () {
                // Check if selected image alreay exist
                if (main.selectImageIds.indexOf(data[item][i]) === -1) {
                    main.selectImageIds.push(data[item][i]);
                }
                //image_ids.push(imageID);
                vis.showSelectedImages(main.selectImageIds);
                vis.selectInteraction(main.selectImageIds);
            });

            trueImage.on('mouseover', function () {
                trueImage.css({ border: '2px solid rgb(43, 20, 217)'});
                vis.hoverInteraction(data[item][i]);
            });

            trueImage.on('mouseout', function () {
                trueImage.css({ border: '2px solid #fff'});
                vis.hoverOutInteraction(data[item][i]);
            });
        }

        mainContainer.append(labelContainer);
    });
}

vis.getGalleryData = function (selection) {

    let data = {};
    console.log(selection);

    Object.keys(main.embedding.data).forEach(function (item) {
        if (selection.ids.indexOf(parseInt(item)) !== -1) {
            let count = 0;
            Object.keys(main.embedding.data[item].predProb).forEach(function (prob) {

                let predProb = main.embedding.data[item].predProb[prob];
                let trueLabel = main.embedding.data[item].trueLabel[prob];

                if (trueLabel === 1) {
                    count += 1;
                }

            });

            if (count in data) {
                data[count].push(item);
            } else {
                data[count] = [];
                data[count].push(item);
            }
        }
    });

    return data;
}
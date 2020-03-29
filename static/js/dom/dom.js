var dom = dom || {};
dom.draggedSelection = undefined;
// List all attributes with selection
dom.listAttributes = function (container, embedding) {

    // Clear container and reset filter labels
    container.empty();
    embedding.filterLabels = [];

    // Return if no labels shown
    if (embedding.labels <= 0) return;

    let button, icon;
    button = dom.createDiv('attribute-selectall-btn', 'attribute-btn selected', '', {});
    icon = dom.createFontAwesomeIcon('fas fa-square-full', {
        color: '#000'
    });

    // Add select all button to container
    button.append(icon).append(' ' + 'Select All');
    container.append(button);

    button.on('click', function () {
        $('.attribute-btn').addClass('selected');
        embedding.filterLabels = [];
        // visualize
        main.visualize();
    });

    for (let i = 0; i < embedding.labels.length; ++i) {

        icon = dom.createFontAwesomeIcon('fas fa-square-full', {
            color: embedding.labelColors[i]
        });

        button = dom.createDiv('attribute-btn-' + i, 'attribute-btn selected', '', {});
        button.append(icon).append(' ' + embedding.labels[i]);
        container.append(button);

        // Add selection events
        button.on('click', function () {
            $('.attribute-btn').removeClass('selected');

            // Pre-select all attributes
            for (let j = 0; j < embedding.filterLabels.length; ++j) {
                $('#attribute-btn-' + embedding.filterLabels[j]).addClass('selected');
            }

            // Get selected position
            let pos = embedding.filterLabels.indexOf(i);

            if (pos !== -1) {
                embedding.filterLabels.splice(pos, 1);
                $(this).removeClass('selected');
            } else {
                embedding.filterLabels.push(i);
                // need to sort here
                embedding.filterLabels.sort();
                $(this).addClass('selected');
            }

            // visualize
            main.visualize();
        });
    }

    return;
}

// List all selections
dom.listSelections = function (container) {
    
    // Refresh selection list
    container.empty();

    for (let i = 0; i < vis.selectedDots.length; ++i) {

        let selection = vis.selectedDots[i];

        // Create selection header
        let header = dom.createDiv('', 'selection-header', '', {});
        header.attr('draggable', true);

        // Add color picker if not cloned
        if (selection.selectId.toString().indexOf(' (clone)') == -1) {
            let colorPickerBtn = dom.createColorPickerButton(selection);
            header.append(colorPickerBtn);
        }

        header.append('&nbsp;<label>Selection ' + selection.selectId + ' (' + selection.ids.length + ')</label>');

        // Create clone button if it not cloned
        /*
        if (selection.selectId.toString().indexOf(' (clone)') == -1) {
            let cloneButton = dom.createCloneButton(i);
            header.append(cloneButton);
        }*/

        let removeButton = dom.createRemoveButton(i);
        header.append(removeButton);

        let showNumberBtn = $('<button/>', {
            class: 'selection-remove-button'
        });
    
        let numberIcon = dom.createFontAwesomeIcon('fas fa-exclamation', {});
        showNumberBtn.append(numberIcon);
    
        // Remove selection by selection index
        showNumberBtn.on('click', function (event) {
            event.stopPropagation();
            showNumberBtn.toggleClass('hide');
            if (showNumberBtn.hasClass('hide')) {
                d3.selectAll('.scatterselectedtext-act').attr('opacity', 0);
                d3.selectAll('.scatterselectedtext-fea').attr('opacity', 0);
                d3.selectAll('.scatterselectedtext-prd').attr('opacity', 0);
            } else {
                d3.selectAll('.scatterselectedtext-act').attr('opacity', 1);
                d3.selectAll('.scatterselectedtext-fea').attr('opacity', 1);
                d3.selectAll('.scatterselectedtext-prd').attr('opacity', 1);
            }
        });
        header.append(showNumberBtn);


        container.append(header);

         

        // Add header event
        /*
        header.on('click', function (event) {
            // Find unlock one
            event.stopPropagation();
            console.log(selection);
            vis.addSelectionToPanel(selection);
        });*/

        // Set data transfer
        header.on('dragstart', function (event) {
            dom.draggedSelection = selection;
        });
    }

    return;
}
// Create div elements
dom.createDiv = function (id, className, contents, css) {
    let div = $('<div/>', {
        id: id,
        class: className
    })
    .html(contents)
    .css(css);

    return div;
}

// Create fontawesome icon elements
dom.createFontAwesomeIcon = function (className, css) {
    let i = $('<i/>', {
        class: className
    })
    .css(css);

    return i;
}

// Add color picker for each selection
dom.createColorPickerButton = function (selection) {
    
    var colorPickerBtn = document.createElement('button');
    colorPickerBtn.className = 'colorpicker-button';

    // Create js color picker
    var picker = new jscolor(colorPickerBtn);
    picker.padding = 0;
    picker.width = 100;
    picker.shadow = false;
    picker.borderWidth = 0;
    picker.backgroundColor = "transparent";
    picker.fromString(selection.color);
    picker.valueElement.innerHTML = "";

    colorPickerBtn.addEventListener('click', function (e) {
        e.stopPropagation();
    });
    // Add color changing events
    picker.onFineChange = function () {

        // Get color values
        let newColor = '#' + colorPickerBtn.innerHTML;
        selection.color = newColor;

        for (let j = 0; j < selection.ids.length; ++j) {
            vis.updateColor(selection.ids[j], newColor);
        }
        // Empty value of color picker
        picker.valueElement.innerHTML = "";
    }

    return colorPickerBtn;
}

// Create selection remove button
dom.createRemoveButton = function (selectionIndex) {

    let removeBtn = $('<button/>', {
        class: 'selection-remove-button'
    });

    let trashIcon = dom.createFontAwesomeIcon('fas fa-trash', {});
    removeBtn.append(trashIcon);

    // Remove selection by selection index
    removeBtn.on('click', function (event) {
        event.stopPropagation();
        vis.removeSelectionFromPanels(vis.selectedDots[selectionIndex].selectId);
        vis.selectedDots.splice(selectionIndex, 1);
        main.visualize();
    });

    return removeBtn;
}

// Create clone selection button
/*
dom.createCloneButton = function (selectionIndex) {
    
    let cloneBtn = $('<button/>', {
        class: 'selection-clone-button'
    });

    let cloneIcon = dom.createFontAwesomeIcon('fas fa-clone', {});
    cloneBtn.append(cloneIcon);

    // Clone current selection by selection index
    cloneBtn.on('click', function (event) {
        event.stopPropagation();
        // Copy selection object
        var clone = $.extend(true, {}, vis.selectedDots[selectionIndex]);
        clone.selectId = clone.selectId + ' (clone)';
        // Add cloned selection at the back of current selection
        vis.selectedDots.splice(selectionIndex + 1, 0, clone);
        vis.selectedDots.join();

        main.visualize();
    });

    return cloneBtn;
}*/

// Create select option elements
dom.createSelectOptions = function (id, className, optionNames, optionValues) {

    let select = $('<select/>', {
        id: id,
        class: className
    });

    for (let i = 0; i < optionNames.length; ++i) {
        
        let option = $('<option/>', {
            value: optionValues[i]
        }).html(optionNames[i]);

        select.append(option);
    }

    return select;
}

dom.createRangeInput = function (value, minmax, className, id) {

    let rangeInput = $('<input/>', {
        id: id,
        class: className,
        value: value,
        min: minmax[0],
        max: minmax[1],
        type: 'range'
    });

    return rangeInput;
}
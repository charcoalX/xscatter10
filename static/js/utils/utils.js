// Utils namespace
var utils = utils || {};

// Get attribute colors in array
utils.getAttributeColors = function (attributeLength) {

    let scale = [];
    
    
    for (let i = 0; i < attributeLength; ++i) {
        let value = utils.normalize(i, [0, attributeLength - 1], [0, 1]);
        scale.push(d3.interpolatePlasma(value));
    }

    /*
    scale = [
    'rgb(200,128,178)',
    'rgb(198,145,187)',
    'rgb(219,151,188)',
    'rgb(160,149,183)',
    'rgb(161,161,197)',
    'rgb(162,177,200)',
    'rgb(157,184,141)',
    'rgb(187,211,149)',
    'rgb(185,218,163)',
    'rgb(234,234,172)',
    'rgb(246,240,142)',
    'rgb(246,217,141)',
    'rgb(233,207,172)',
    'rgb(246,199,143)',
    'rgb(246,183,140)',
    'rgb(247,145,143)',
    'rgb(202,108,108)'];*/

    return scale;
}

// Filter data by attributes
utils.filterDataByAttributes = function (embedding) {

    let filter = embedding.filterLabels;

    if (embedding.filterData === undefined) return;
    
    let colors = [];
    Object.keys(embedding.filterData).forEach(function (item) {

        // Select all - clone all embedding data to filtered one
        if (filter.length === 0) {

            embedding.filterData[item].predProb = utils.cloneObject(embedding.data[item].predProb);

            embedding.filterData[item].trueLabel = utils.cloneObject(embedding.data[item].trueLabel);

        } else {

            embedding.filterData[item].predProb = {};
            embedding.filterData[item].trueLabel = {};
            
            Object.keys(embedding.data[item].predProb).forEach(function (attribute) {

                let pos = filter.indexOf(parseInt(attribute));
                if (pos !== -1) {
                    embedding.filterData[item].predProb[attribute] = embedding.data[item].predProb[attribute]
                    embedding.filterData[item].trueLabel[attribute] = embedding.data[item].trueLabel[attribute]

                    let color = embedding.labelColors[parseInt(attribute)];
                    if (colors.indexOf(color) === -1) {
                        colors.push(color);
                    }
                }
            });
        }
    });

    if (filter.length === 0) {
        embedding.filterColors = embedding.labelColors;
    }  else {
        embedding.filterColors = colors;
    }
    
    return;
}

// Clone similar object
utils.cloneObject = function (source) {

    let target = {};

    for (let property in source) {
        if (source.hasOwnProperty(property)) {
            if (isObject(source[property])) {
                target[property] = utils.cloneObject(source[property]);
            } else {
                target[property] = source[property];
            }
        }
    }

    function isObject (obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    }

    return target;
}

// Get random HSL colors
utils.getRandomColors1 = function () {
    var color = utils.HSLToHex(360 * Math.random(), (20 + 70 * Math.random()), (70 + 10 * Math.random()))
    // Convert hsl to hex
    return color;
}

// Get random colors
utils.getRandomColors = function () {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Convert HSL to Hex color
utils.HSLToHex = function (h,s,l) {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0,
        g = 0,
        b = 0;
  
    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }
    // Having obtained RGB, convert channels to hex
    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);
  
    // Prepend 0s, if necessary
    if (r.length == 1)
        r = "0" + r;
    if (g.length == 1)
        g = "0" + g;
    if (b.length == 1)
        b = "0" + b;
  
    return "#" + r + g + b;
}

// Normalize values
utils.normalize = function (value, r1, r2) {

    let rr = (r1[1] - r1[0]);

    if (rr === 0) {
        rr = 0.0001;
    } 

    return (value - r1[0] ) * (r2[1] - r2[0]) / rr + r2[0];
}

// Prepare scatterplot data
utils.prepareScatterplot = function (embedding) {

    let dots = [];

    if (embedding.data !== undefined) {
        let index = 0;

        Object.keys(embedding.data).forEach(function (item) {
            let image = embedding.data[item];
            let dot = {
                id: index,
                error: image['Distance of error'],
                xTrueLabel: image['truelabel17-x'],
                yTrueLabel: image['truelabel17-y'],
                xFeature: image['feature2048-x'],
                yFeature: image['feature2048-y'],
                xPredict: image['prediction17-x'],
                yPredict: image['prediction17-y'],
                // Tsne layer by layer
                xLayer1: image['s1-x'],
                yLayer1: image['s1-y'],
                xLayer2: image['s2-x'],
                yLayer2: image['s2-y'],
                xLayer3: image['s3-x'],
                yLayer3: image['s3-y'],
                xLayer4: image['s4-x'],
                yLayer4: image['s4-y'],
                xLayer5: image['s5-x'],
                yLayer5: image['s5-y'],
                // Actual Predprob and true label
                predProb: image['predProb'],
                trueLabel: image['trueLabel']
            }

            dots.push(dot);
            vis.distanceOfErrors.push(dot.error);
            index += 1;
        });

    }

    return dots;
}
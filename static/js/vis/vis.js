// Create vis namespace
var vis = vis || {};

// 2 panel selections

vis.panels = {
    first: {
        locked: false,
        views: {
            overview: true,
            statistic: false,
            clustering: false
        },
        selection: undefined
    },
    second: {
        locked: false,
        views: {
            overview: true,
            statistic: false,
            clustering: false
        },
        selection: undefined
    }
}


vis.addSelectionToPanel = function (selection, container) {

    if (container === "vis1") {
        vis.panels.first.selection = selection;
        vis.displayPanel1();
    } else {
        vis.panels.second.selection = selection;
        vis.displayPanel2();
    }
    
    /*
    if (!vis.panels.first.locked) {
        vis.panels.first.selection = selection;
    } else {
        vis.panels.second.selection = selection;
    }*/
    return;
}

vis.removeSelectionFromPanels = function (selectId) {

    if (vis.panels.first.selection !== undefined && vis.panels.first.selection.selectId === selectId) {
        // Unlock selection and clear panels
        vis.panels.first.locked = false;
        vis.panels.first.views.overview = true;
        vis.panels.first.views.statistic = false;
        vis.panels.first.views.clustering = false;
        vis.panels.first.selection = undefined;
        dom.contents.vis1.empty();
        dom.tabs.vis1Title.html('Selection: 0');
        // Unlock first one
        dom.buttons.lock1.removeClass('active');
        dom.buttons.lock1.html('<i class="fas fa-lock-open"></i>');
        vis.displayPanel1();
    }

    if (vis.panels.second.selection !== undefined && vis.panels.second.selection.selectId === selectId) {
        // Unlock selection and clear panels
        vis.panels.second.locked = false;
        vis.panels.second.views.overview = true;
        vis.panels.second.views.statistic = false;
        vis.panels.second.views.clustering = false;
        vis.panels.second.selection = undefined;
        dom.contents.vis2.empty();
        dom.tabs.vis2Title.html('Selection: 0');
        // Unlock second one
        dom.buttons.lock2.removeClass('active');
        dom.buttons.lock2.html('<i class="fas fa-lock-open"></i>');
        vis.displayPanel2();
    }
    return;
}

vis.displayPanel1 = function () {
    
    vis.displayTab();

    // Display first panel
    if (vis.panels.first.selection !== undefined) {

        let select1 = vis.panels.first.selection;
        vis.setPanelTitle(dom.tabs.vis1Title, select1);

        if (vis.panels.first.views.overview) {
            dom.contents.vis1.empty();
            vis.gallery(dom.contents.vis1, select1, 1);
        }

        if (vis.panels.first.views.statistic) {
            dom.contents.vis1.empty();
            vis.initParallel(dom.contents.vis1, select1, 1);
        }

        if (vis.panels.first.views.clustering) {
            vis.clustering(dom.contents.vis1, select1, 1);
        }
    }
}

vis.displayPanel2 = function() {

    vis.displayTab();
    // Display second panel
    if (vis.panels.second.selection !== undefined) {

        let select2 = vis.panels.second.selection;
        vis.setPanelTitle(dom.tabs.vis2Title, select2);

        if (vis.panels.second.views.overview) {
            dom.contents.vis2.empty();
            vis.gallery(dom.contents.vis2, select2, 2);
        }

        if (vis.panels.second.views.statistic) {
            dom.contents.vis2.empty();
            vis.initParallel(dom.contents.vis2, select2, 2);
        }

        if (vis.panels.second.views.clustering) {
            dom.contents.vis2.empty();
            vis.clustering(dom.contents.vis2, select2, 2);
        }
    }
}

// Highlight selected tab
vis.displayTab = function () {

    // Clear all active tabs
    $('.tab-buttons').removeClass('active');

    if (vis.panels.first.selection !== undefined) {

        Object.keys(vis.panels.first.views).forEach(function (item) {
            if (vis.panels.first.views[item]) {
                if (item === 'overview') {
                    dom.tabs.overview1.addClass('active');
                } else if (item === 'statistic') {
                    dom.tabs.statistic1.addClass('active');
                } else if (item === 'clustering') {
                    dom.tabs.clustering1.addClass('active');
                }
            }
        });
    }

    if (vis.panels.second.selection !== undefined) {

        Object.keys(vis.panels.second.views).forEach(function (item) {
            if (vis.panels.second.views[item]) {
                if (item === 'overview') {
                    dom.tabs.overview2.addClass('active');
                } else if (item === 'statistic') {
                    dom.tabs.statistic2.addClass('active');
                } else if (item === 'clustering') {
                    dom.tabs.clustering2.addClass('active');
                }
            }
        });
    }
}

vis.setPanelTitle = function (container, selection) {
    container.empty();
    let icon = dom.createFontAwesomeIcon('fas fa-square-full', {
        color: selection.color
    });
    container.append(icon);
    container.append('&nbsp;&nbsp;<strong>Selection:</strong> ' + selection.selectId + ' <strong>Total:</strong> ' + selection.ids.length + ' images');
    return;
}
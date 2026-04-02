// Query namespace
var query = query || {};

// Query all matrix data
query.getAll = function (embedding) {

    console.log(embedding);

    return new Promise(function (resolve, reject) {
        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            async: true,
            data: JSON.stringify(embedding.options),
            dataType: 'json',
            url: '/QueryAll',
            success: function (result) {
                resolve(result); 
            },
            error: function (error) {
                reject(error);
            }
        });
    });
}



// Query clustering data (k-mean)
query.getCluster = function (vectors, clusterNum) {
    
    return new Promise (function (resolve, reject) {
        var obj = {
            vectors: vectors,
            clusterNum: clusterNum
        };
        console.log("obj clustering vector:", obj)

        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            async: true,
            data: JSON.stringify(obj),
            dataType: 'json',
            url: '/GetCluster',
            success: function(data) {
                resolve(data);
            },
            error: function(error) {
                reject(error);
            }
        });
    });
}

query.getClusterDBSCAN = function (vectors, eps, min_sample) {

    return new Promise(function(resolve, reject) {
        var obj = {
            vectors: vectors,
            eps: eps,
            min_samples: min_sample
        };
        console.log('obj dbscan vector: ', obj);

        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            async: true,
            data: JSON.stringify(obj),
            dataType: 'json',
            url: '/GetClusterDBSCAN',
            success: function(data) {               
                resolve(data);
            },
            error: function(error) {
                reject(error);
            }
        });
    });
}

query.getMutualInfo = function () {

    return new Promise (function (resolve, reject) {
        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            async: true,
            data: JSON.stringify(main.embedding.options),
            dataType: 'json',
            url: '/GetMutualInfo',
            success: function (result) {
                resolve(result);
            },
            error: function (error) {
                reject(error);
            }
        });
    });
}
query.getCountInfo = function () {

    return new Promise (function (resolve, reject) {
        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            async: true,
            data: JSON.stringify(main.embedding.options),
            dataType: 'json',
            url: '/GetCountInfo',
            success: function (result) {
                resolve(result);
            },
            error: function (error) {
                reject(error);
            }
        });
    });
}

// Get tsne result with vectors and default parameters
query.getTsne = function(inputs, parameters) {

    return new Promise(function(resolve, reject) {

        let obj = {
            inputData: inputs,
            parameters: parameters
        };

        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            async: true,
            data: JSON.stringify(obj),
            dataType: 'json',
            url: '/GetTsne',
            success: function(data) {
                resolve(data);
            },
            error: function(error) {
                reject(error);
            }
        });

    });

}

// // Query all recommandation  count data
// query.getAll_count = function (embedding) {

//     return new Promise(function (resolve, reject) {
//         $.ajax({
//             type: 'POST',
//             contentType: 'application/json',
//             async: true,
//             data: JSON.stringify(embedding.options),
//             dataType: 'json',
//             url: '/QueryAll',
//             success: function (result) {
//                 // Query count information
//                 query.getCountInfo().then(function (count) {
//                     main.count = count;
//                     console.log("main for Count",main)
//                     resolve(result);
//                 });
//             },
//             error: function (error) {
//                 reject(error);
//             }
//         });
//     });

query.getLRPHeatmap = function(imageId, classIdx, dataType) {
    return new Promise(function(resolve, reject) {
        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            async: true,
            data: JSON.stringify({ image_id: imageId, class_idx: classIdx, data_type: dataType }),
            dataType: 'json',
            url: '/GetLRPHeatmap',
            timeout: 90000,
            success: resolve,
            error: reject
        });
    });
};
// }
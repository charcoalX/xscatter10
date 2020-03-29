// Query namespace
var query = query || {};

// Query all matrix data
query.getAll = function (embedding) {

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



// Query clustering data
query.getCluster = function (vectors, clusterNum) {
    
    return new Promise (function (resolve, reject) {
        var obj = {
            vectors: vectors,
            clusterNum: clusterNum
        };

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
// }
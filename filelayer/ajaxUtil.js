/*
  Very simple javascript for invoke a very basic ajax call
 */
var ajax = {};
ajax.result = {response: {}, isCorrect: false};

ajax.x = function() {
    if (typeof XMLHttpRequest !== 'undefined') {
        return new XMLHttpRequest();
    }
    var versions = [
        "MSXML2.XmlHttp.6.0",
        "MSXML2.XmlHttp.5.0",
        "MSXML2.XmlHttp.4.0",
        "MSXML2.XmlHttp.3.0",
        "MSXML2.XmlHttp.2.0",
        "Microsoft.XmlHttp"
    ];

    var xhr;
    for(var i = 0; i < versions.length; i++) {
        try {
            xhr = new ActiveXObject(versions[i]);
            return xhr;
        } catch (e) {}
    }
    if(window.XMLHttpRequest) return new XMLHttpRequest(); // if Mozilla, Safari etc
    else return false;

};

ajax.send = function(url, callback, method, data, sync,dataType) {
    return new Promise(function(resolve, reject) {
        var x = ajax.x();
        //If you directly use a XMLHTTPRequest object, pass false as third argument to .open.
        x.open(method, url, sync);
        if (method == 'POST') {
            if (dataType.toLowerCase() == 'json'){
                x.setRequestHeader('Content-type', 'application/json; charset=utf-8;');
            }
        }
        x.onreadystatechange = function () {
            if (x.readyState == XMLHttpRequest.DONE) {
                if (x.status == 200 || window.location.href.indexOf("http") == -1) {
                    // Success!
                    //ajax.result = JSON.parse(this.responseText);

                    //x.onload = function () {
                        /*if (typeof x.responseText != 'undefined') {
                            console.info("info:" + JSON.stringify(x.responseText, undefined, 2));
                        } else {
                            console.error("Error on the content of the json response of the server");
                            callback(false);
                        }   */
                        // when the request is loaded
                        callback(JSON.parse(this.responseText));
                        //callback(x.responseText);
                    //};
                    //var jsondata = eval(x.responseText); //retrieve result as an JavaScript object
                    //alert("info:" + JSON.stringify(jsondata, undefined, 2));

                    //ajax.result = x.responseText;
                    //document.getElementById("myDiv").innerHTML = x.responseText;
                }
                else if (x.status == 400){
                    console.error('There was an error 400');
                    callback(false);
                }
                else{
                    console.error('something else other than 200 was returned');
                    callback(false);
                }
            }
        };
        //x.send(data) ??
        x.send();
    });
};

ajax.get = function(url, data, callback, sync) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, sync)
};

ajax.post = function(url, data, callback, sync,dataType) {
    if (ajax.checkJQuery) {
        $.ajax({
            url: url,
            type: 'POST',
            data: data,
            dataType: dataType.toLowerCase(),
            success: ajax.processSuccess,
            error: ajax.processError
        });
    }else {
        var query = [];
        for (var key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        ajax.send(url, function(result){
            console.info("Response send:"+result.toString());
            callback(result);
        }, 'POST', query.join('&'), sync, dataType)
        .then(function(result) {
            console.info("Response send:"+result.toString());
            // Code depending on result
           callback(result);
        }).catch(function() {
            // An error occurred
        });
    }
};

ajax.processSuccess = function(data) {
    ajax.result.response = data;
    if (data.status === 'ok') {
        console.info('You just posted some valid GeoJSON!');
        ajax.result.isCorrect = true;
    } else if (data.status === 'error') {
        if (data.message == 'Data was not JSON serializeable.') {
            //ignore this error
            ajax.result.isCorrect = true;
        } else {
            console.info('There was a problem with your GeoJSON: ' + data.message);
            ajax.result.isCorrect = false;
        }
    }
};

ajax.processError = function(){
    console.info('There was a problem with your ajax.');
    ajax.result.isCorrect = false;
};

ajax.checkJQuery = window.jQuery || typeof jQuery != 'undefined';

ajax.wait = function(result){
    if(result === 'undefined') {
        window.setTimeout(ajax.wait, 500); //check every 0.5 sec if the callback has done
    }else{
        return result;
    }
};

ajax._validateGeoJson = function(json,callback){
    try {
        if (typeof json == 'string') {
            json = JSON.stringify(json, undefined, 2);
            json = JSON.parse(json);
        }
        ajax.post('http://geojsonlint.com/validate', json, function (data) {
                callback(data);
            }, false, // `false` makes the request synchronous
            'json');
    }catch(e){
        console.error(e.message);
    }
};

function delay(ms){ // takes amount of milliseconds returns a new promise
    return new Promise(function(resolve, reject){
        // Only `delay` is able to resolve or reject the promise
        setTimeout(function(){ // when the time is up
            resolve(); // change the promise to the fulfilled state
        }, ms);
    });
}

function getFive(){
    // we're RETURNING the promise, remember, a promise is a wrapper over our value
    return delay(100).then(function(){ // when the promise is ready
        return 5; // return the value 5, promises are all about return values
    })
}

/**..if you use jquery*/
function GETWithJQuery(URL){
    var javaMarker;
    if(arrayMarkerVar.length >0 ) {
        //alert("exists a marker on the array!!")
        removeClusterMarker();
    }
    $.getJSON(URL, function(jsonData) {
        //alert( "Data Loaded from url:"+ URL + " = "+ data );
        alert( "Data Loaded 2: " + jsonData);
        /*
         var sayingsList = [];
         $.each(data, function(key, val) {
         sayingsList.push('<li>' + val + '</li>');
         });
         $('<ul/>', {
         html: sayingsList.join('')
         }).appendTo('#div4');*/
    }).done(function(data) {
        //$('#div4').append('getJSON request succeeded! </li>');
        try {
            //...test with response from google api
            var jsonString = JSON.stringify(data);
            alert( "JSON STRING: " + jsonString );
            if ($.isEmptyObject(data.results))
            {
                alert("Json array is empty: " + data.results[0]);
            }
            //http://stackoverflow.com/questions/13382364/jquery-and-json-array-how-to-check-if-array-is-empty-or-undefined
            else if (data.results == undefined || data.results == null || data.results.length == 0
                || (data.results.length == 1 && data.results[0] == "")){
                alert("Json array is empty 2: " + data.results[0]);
            }
            else {
                //alert("Data Loaded: " + data.results[0]);
            }
            var name = data.results[0].address_components[0].long_name;
            var lat = data.results[0].geometry.location.lat;
            var lng = data.results[0].geometry.location.lng;
            //alert("NAME:"+ name +",COORDINATES:["+ lat +","+ lng +"]");
            javaMarker = addSingleMarker(name,URL,lat,lng);
            alert("getJSON request succeeded!");
            return javaMarker;
        }catch(e){
            alert(e.message );
            alert( "getJSON request failed!");
            //jsonData = $.parseJSON(data);
        }
        return javaMarker = {name:null, url:null, latitudine:null,longitudine:null};
    })
        .fail(function() {
            //$('#div4').append('getJSON request failed! </li>');
            alert( "getJSON request failed!");
            return javaMarker = {name:null, url:null, latitudine:null,longitudine:null};
        })
        .always(function() {
            //$('#div4').append('getJSON request ended! </li></li>');
            alert( "getJSON request ended!" );
        });

}

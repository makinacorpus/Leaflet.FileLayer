/*
 * Load files *locally* (GeoJSON, KML, GPX) into the map
 * using the HTML5 File API.
 *
 * Requires Pavel Shramov's GPX.js
 * https://github.com/shramov/leaflet-plugins/blob/d74d67/layer/vector/GPX.js
 *
 * Requires Pavel mholt papaparse.js
 * https://github.com/mholt/PapaParse/blob/master/papaparse.js
 *
 * Requires gildas-lormeau zip.js and mbostock d3.js only if you want to try to load zip archive of GTFS .
 * https://gildas-lormeau.github.io/zip.js/ , https://github.com/mbostock/d3
 *
 *
 * //TODO try to avoid the use of papaparse in favor of d3
 * //TODO upgrade the gtfs zip draw on the map work oly if the 'shapes' file is present
 */

var FileLoader = L.Class.extend({
    includes: L.Mixin.Events,
    options: {
        layerOptions: {},
        fileSizeLimit: 1024,
        headers: true,             //if the first line of a csv file has headers (if false launch exception)
		latitudeColumn: 'lat',     //the default field name for the latitude coordinates...
		longitudeColumn: 'lng',    //the default field name for the longitude coordinates...
        titleForSearch: 'title',   //for future integration with other functions...
        titlesToInspect: [],       //if you want get only some specific field from csv files...
                                   //TODO implement for XML files....
        rootTag: {root: "Root", subRoot:"Row"},  //set the Json path to the collection of json object to inspect...
                                                 //you can many subRoot e.g. '...,subRoot2:xxx,subRoot3:yyy'
                                                 //or if you prefer set a Array e.g. ["Root","Row"]

        rdfLink: [],               //if you want merge the json object created from a rdf file you can specify the property of a link...
        rdfAbout: 'rdf:about',     //the value for the property rdf:about of a rdf file...
        rdfAboutLink: 'rdf:about', //the value for the property rdf:about for linking different classes of triple...

        layer: new L.geoJson(),    //make the variable of the layer reachable from external function,
                                   // can be a L.layerGroup or a L.Feautregroup or another L.GeoJson....
        popupTable:false,          //if true all the information of the popup are pushed on a html table for a better view.
                                   //if false is saved on a json object.
        validateGeoJson: false     //if you want to validate the geojson with a ajax call...
    },

    initialize: function (map, options) {
        this._map = map;
        L.Util.setOptions(this, options);

        this._parsers = {
            'json': this._loadGeoJSON,
            'geojson': this._loadGeoJSON,
            'gpx': this._convertToGeoJSON,
            'kml': this._convertToGeoJSON,
            'csv': this._csvToGeoJSON,
            'xml': this._XMLToGeoJSON,
            'rdf': this._RDFToGeoJSON,
            'input': this._gtfsToGeoJSON //TODO to upgrade
        };
    },

    load: function (file /* File */) {

        // Check file size
        var fileSize;
        if(typeof file == 'undefined') fileSize = 1024; //avoid a console error
        else fileSize = (file.size / 1024).toFixed(4);

        if (fileSize > this.options.fileSizeLimit) {
            this.fire('data:error', {
                error: new Error('File size exceeds limit (' + fileSize + ' > ' + this.options.fileSizeLimit + 'kb)')
            });
            return;
        }

        // Check file extension
        if(typeof file === 'undefined'){ /*do nothing avoid console error*/}
        else{
            var ext = file.name.split('.').pop();
            //Check if file is a document or a archive
            if (ext == "zip") {  //if is a archive
                try {
                    this.fire('data:loading', {filename: file.name, format: ext});
                    this.fire('data:loaded', {filename: file.name, format: ext});
                }
                catch (err) {
                    this.fire('data:error', {error: err});
                }
                return this._gtfsZipToGEOJSON(file);
            } else {
                var parser = this._parsers[ext];
                if (!parser) {  //if is a document
                    this.fire('data:error', {
                        error: new Error('Unsupported file type ' + file.type + '(' + ext + ')')
                    });
                    return;
                }
                // Read selected file using HTML5 File API
                var reader = new FileReader();
                reader.onload = L.Util.bind(function (e) {
                    try {
                        this.fire('data:loading', {filename: file.name, format: ext});
                        var layer = parser.call(this, e.target.result, ext);
                        this.fire('data:loaded', {layer: layer, filename: file.name, format: ext});
                    }
                    catch (err) {
                        this.fire('data:error', {error: err});
                    }
                }, this);
                reader.readAsText(file);
                return reader; //return the document
            }
        }
    },

    _loadGeoJSON: function (content) {
        if (typeof content == 'string') {
            content = JSON.parse(content);
        }

        var layer = this.options.layer;
        if (layer.getLayers().length > 0) {
            //there are other information to merge to the result....
            layer.addLayer(new L.geoJson(content, this.options.layerOptions));

        } else {
            //console.error("load json:"+JSON.stringify(content,undefined,2));
            try {
                layer = L.geoJson(content, this.options.layerOptions);
            }catch(e){ console.error(e.message);}
        }
        if (layer.getLayers().length === 0) {
            this.fire('data:error', {
                error: new Error('GeoJSON has no valid layers.\n' +
                    'if you try to load a CSV/RDF/XML file make sure to have setted the corrected name of the columns')
            });
        }
        if (this.options.addToMap) {
            layer.addTo(this._map);
            //map.addLayer(layer);
        }
        return  layer;
    },

    _convertToGeoJSON: function (content, format) {
        // Format is either 'gpx' or 'kml'
        if (typeof content == 'string') {
            content = ( new window.DOMParser() ).parseFromString(content, "text/xml");
        }
        var geojson = toGeoJSON[format](content);
        return this._loadGeoJSON(geojson);
    },

    _csvToGeoJSON: function(content){
        try {
            if (!this.options.headers) {
                this.fire('data:error', {error: new Error('The file CSV must have the Headers')});
            }
            var json;
            //Work with Papaparse.js
            json = Papa.parse(content, {header: this.options.headers});
            this._depth = json.data.length - 1;
            if (this.options.titlesToInspect.length == 0)this._titles = json.meta.fields;
            else this._titles = this.options.titlesToInspect;
            delete json.errors;
            delete json.meta;

            json = this._addFeatureToJson(json.data);
            return this._loadGeoJSON(json);
        }catch(e){
            console.error(e.message);
            this.fire('data:error', {error: e});
        }
    },

    _addFeatureToJson: function(json){
        //be sure we have a json array of object of objects
        if(json === null || typeof json === 'undefined' || Object.keys(json).length==0){
            console.error("Be sure to add the feature geojson to a Array or a Object of objects.");
            return;
        }
        var titles = this._titles;
        var columnLat =this.options.latitudeColumn;
        var columnLng = this.options.longitudeColumn;
        var popupTable = this.options.popupTable;
        var arrayLatLng = [];
        json = {
            type: "FeatureCollection",
            features: Object.keys(json).map(function (id) {
                //id 0,1,2,3,4,5,.....
                var obj = json[id];
                if (obj === null || typeof obj === 'undefined' || id >= Object.keys(json).length - 1) {
                    console.warn("Ignore line ", id, " invalid data");
                    return;
                } else {
                    //if you not have setted a specific set of columns just get everything
                    if (!titles.length > 0)titles = Object.keys(obj);

                    return {
                        type: 'Feature',
                        properties: {
                            id: id,
                            //integration for search
                            title: (function () {
                                for (var search, i = 0; search = titles[i++];) {
                                    if (titles[i] == search)  return obj[search];
                                }
                                return id;
                            })(),
                            popupContent: (function () {
                                var content = '';
                                if (popupTable) {
                                    content = '<div class="popup-content">' +
                                        '<table class="table table-striped table-bordered table-condensed">';
                                }
                                for (var title, i = 0; title = titles[i++];) {
                                    try {
                                        if(obj.hasOwnProperty(title)) {
                                            if (popupTable) {
                                                var href = '';
                                                if (obj[title].indexOf('http') === 0) {
                                                    href = '<a target="_blank" href="' + obj[title] + '">' + obj[title] + '</a>';
                                                }
                                                if (href.length > 0)content += '<tr><th>' + title + '</th><td>' + href + '</td></tr>';
                                                else content += '<tr><th>' + title + '</th><td>' + obj[title] + '</td></tr>';
                                            } else {
                                                content[title] = obj[title];
                                            }
                                        }
                                    } catch (e) {
                                        console.warn(
                                            "Undefined field for the json:"
                                            +JSON.stringify(obj)+",Title:"+title+"->"+e.message);
                                    }
                                }//for
                                if (popupTable)content += "</table></div>";
                                return content;
                            })()
                        },
                        geometry: {
                            type: "Point",
                            coordinates: (function () {
                                //check now only the feature with correct coordinate
                                var lng = obj[columnLng].toString();
                                var lat = obj[columnLat].toString();
                                try {
                                    if (/[a-z]/.test(lng.toLowerCase()) || /[a-z]/.test(lat.toLowerCase()) ||
                                        isNaN(lng) || isNaN(lat) || !isFinite(lng) || !isFinite(lat)) {
                                        console.warn("Coords lnglat:[" + lng + "," + lat + "] ,id:" + id);
                                        return;
                                    }else{
                                        lng = parseFloat(obj[columnLng]);
                                        lat = parseFloat(obj[columnLat]);
                                        if (!(lng < 180 && lng > -180 && lat < 90 && lat > -90)) {
                                            console.warn("Something wrong with the coordinates, ignore line", id, " invalid data");
                                            return;
                                        }
                                    }
                                } catch (e) {
                                    //try with the string
                                    console.warn("Not valid coordinates avoid this line ->" + "Coords:" + lng + "," + lat + ",id:" + id);
                                    return;
                                }
                                arrayLatLng.push(new L.LatLng(lat,lng));
                                return [lng, lat];
                            })()
                        }
                    };
                }//if obj is not null
            })
        };
        this._cleanJson(json);
        this._bounds(arrayLatLng);
        if(this.options.validateGeoJson) {
            ajax._validateGeoJson(json, function (message) {
                ajax.processSuccess(message);
            });
            if (ajax.result.isCorrect)return json;
            else console.error("The geo json generated is wrong:" + JSON.stringify(ajax.result.response, undefined, 2));
        }else return json;
    },

    _RDFToGeoJSON: function(content) {
        try {
            var xml = this._toXML(content);
            var json = this._XMLToJSON(xml);

            for (var i = 0; i < Object.keys(this.options.rootTag).length; i++) {
                json = json[this.options.rootTag[Object.keys(this.options.rootTag)[i]]];
            }

            this._simplifyJson(json);
            this._mergeRdfJson(this._root.data);
            //Filter result, get all object with at least coordinates...
            for (i = 0; i < this._root.data.length; i++) {
                if (!(this._root.data[i].hasOwnProperty(this.options.latitudeColumn) &&
                    this._root.data[i].hasOwnProperty(this.options.longitudeColumn))
                ) {
                    delete this._root.data[i];
                }
            }
            this._depth = this._root.data.length;
            json = this._addFeatureToJson(this._root.data);

            return this._loadGeoJSON(json);
        }catch(e){console.error(e.message);}
    },

    _toXML:function(content){
        var xml;
        try {
            if(window.DOMParser){
                xml = new DOMParser().parseFromString(content,"text/xml");
            }
            else{
                try {
                    xml = new ActiveXObject("Microsoft.XMLDOM");
                    xml.async = false;
                    xml.validateOnParse = false;
                    xml.resolveExternals = false;
                    xml.loadXML(content);
                } catch (e) {
                    try {
                        Document.prototype.loadXML = function (s) {
                            var doc2 = (new DOMParser()).parseFromString(s, "text/xml");
                            while (this.hasChildNodes()) {
                                this.removeChild(this.lastChild);
                            }
                            for (var i = 0; i < doc2.childNodes.length; i++) {
                                this.appendChild(this.importNode(doc2.childNodes[i], true));
                            }
                        };
                        xml = document.implementation.createDocument('', '', null);
                        xml.loadXML(content);
                    } catch (e) {
                        this.fire('data:error', {error: new Error(e.message)});
                    }
                }
            }
        }catch(e) {
            throw new Error(e.message);
        }
        return xml;
    },

    _XMLToJSON:function (content) {
        var attr,
            child,
            attrs = content.attributes,
            children = content.childNodes,
            key = content.nodeType,
            json = {},
            i = -1;
        if (key == 1 && attrs.length) {
            json[key = '@attributes'] = {};
            while (attr = attrs.item(++i)) {
                json[key][attr.nodeName] = attr.nodeValue;
            }
            i = -1;
        } else if (key == 3) {
            json = content.nodeValue;
        }
        while (child = children.item(++i)) {
            key = child.nodeName;
            if (json.hasOwnProperty(key)) {
                if (json.toString.call(json[key]) != '[object Array]') {
                    json[key] = [json[key]];
                }
                json[key].push(this._XMLToJSON(child));
            }
            else {
                json[key] = this._XMLToJSON(child);
            }
        }
        return json;
    },

    _XMLToGeoJSON: function(content){
        var xml = this._toXML(content);
        var json = this._XMLToJSON(xml);

        for(var i = 0; i < Object.keys(this.options.rootTag).length; i++){
            json = json[this.options.rootTag[Object.keys(this.options.rootTag)[i]]];
        }

        this._simplifyJson(json);

        //Filter result, get all object with at least coordinates...
        for(i = 0; i < this._root.data.length; i++){
            if(!(this._root.data[i].hasOwnProperty(this.options.latitudeColumn) &&
                this._root.data[i].hasOwnProperty(this.options.longitudeColumn))
            ){
                delete this._root.data[i];
            }
        }

        this._depth = this._root.data.length;

        json = this._addFeatureToJson(this._root.data);
        return this._loadGeoJSON(json);
    },

    _simplifyJson: function(json){
        if(!(Object.prototype.toString.call(json) === '[object Array]')){
            this.fire('data:error', {
                error: new Error('Try to simplify a not json array, please re-set your root tag path, ' +
                    'e.g. xmlRootTag:["some","pathTo","Array"], we need a json array')
            });
            return;
        }
        var root = {data: []};
        for (var i = 0; i < Object.keys(json).length; i++) {  //406 object
            var obj;
            if (typeof  json[i] === 'undefined')break; //read all
            else  obj = json[i];
            var info = {};
            try {
                var elements;
                if(Object.keys(obj).length > 1) elements = Object.keys(obj).toString().split(",");
                else elements = Object.keys(obj).toString();
                for(var element, k=0; element = elements[k++];){
                //for (var ele in elements) {
                    //var element = elements[ele]; //@attributes
                    var key, value;
                    if (element.toString() == "#text") {
                        if (Object.prototype.toString.call(obj[element]) === '[object Array]') {
                            //key = element;
                            //value = obj[element]["#text"];
                            continue;
                        }else {
                            key = element;
                            value = obj[element]["#text"];
                        }
                    }
                    else if (element.toString() == "@attributes") {
                        key = Object.keys(obj[element]);//rdf:
                        value = obj[element][key].toString();
                    }else{
                        key = element;
                        value = Object.keys(obj[element]).toString();
                        if (value == "@attributes") {
                            value = obj[element]["@attributes"][Object.keys(obj[element]["@attributes"])];
                        } else if (value == "#text") {
                            value = obj[element]["#text"];
                        } else if (value == "@attributes,#text") {
                            value = obj[element]["#text"];
                            info[key] = value;
                            key = Object.keys(obj[element]["@attributes"]);
                            value = obj[element]["@attributes"][Object.keys(obj[element]["@attributes"])];
                            //info[key] = value;
                        }
                        else {
                            //never run here.....
                            this.fire('data:error', {
                                error: new Error('this stage can\'t be reach from the simplification of the json \n' +
                                    'maybe the function need a update')
                            });
                            return;
                        }
                    }
                    info[key] = value;
                }
                root.data.push(info);
            }catch(e){
                console.error(e.message);
                this.fire('data:error', {
                    error: new Error('Some error occurred during the simplification of the Json:'+ e.message+'1\n')
                });
                return;
            }
           this._root = root;
        }//for every object on rdf description
    },

    _mergeRdfJson: function(json){
        try {
            var link = '';
            var mJson = [];
            var xJson;

            for (var i = 0; i < Object.keys(json).length; i++) {
                for (var k = 0; k < Object.keys(this.options.rdfLink).length; k++) {
                    if (json[i].hasOwnProperty(this.options.rdfLink[Object.keys(this.options.rdfLink)[k]])) {
                        link = json[i][this.options.rdfLink[k]];
                        mJson.push(this._searchJsonByKeyAndValue(json, this.options.rdfAboutLink, link));
                    }
                }
            }
            //clean and merge json object with link relations....
            for (i = 0; i < Object.keys(json).length; i++) {
                if (mJson[i] != null && json[i]!=null) {
                     xJson = this._mergeJson(json[i], mJson[i]);
                     json.push(xJson);
                    delete json[json[i]];
                    delete json[mJson[i]];
                }
            }
        }catch(e){
            this.fire('data:error', {
                error: new Error('Some error occurred during the simplification of the Json:'+ e.message)
            });
        }
        this._root.data = json;
    },

    _searchJsonByKeyAndValue: function(json,key,value){
        for (var i = 0; i < json.length; i++) {
            try {
                if (json[i].hasOwnProperty(key)) {
                    if (json[i][key] == value) {
                        return json[i];
                    }
                }
            }catch(e){
                console.warn(e.message);
            }
        }
    },

    _mergeJson: function(json1,json2){
        for(var key in json2)
            if(json2.hasOwnProperty(key))
                json1[key] = json2[key];
        return json1;
    },

    _removeNullJson: function(json){
        // Compact arrays with null entries; delete keys from objects with null value
        var isArray = json instanceof Array;
        for (var k in json){ //type,properties,..,title,popupContent,features,..
            if (json[k]==null || typeof json[k] === 'undefined') isArray ? json.splice(k,1) : delete json[k];
            else if (typeof json[k]=="object") this._removeNullJson(json[k]);
        }
    },

    _cleanJson: function(json){
        this._removeNullJson(json);
        var i = json.features.length;
        while(i--){
            if( typeof json.features[i] === 'undefined' || !json.features[i].geometry.hasOwnProperty("coordinates")){
                json.features.splice(i,1);
            }
        }
    },

    _gtfsToGeoJSON: function(content){
        var shapes = Papa.parse(content, {header: this.options.headers});
        shapes = shapes.data;
        var lookup = {};
        var dintintShape = [];
        for (var item, i = 0; item = shapes[i++];) {
            var name = item.shape_id;
            if (!(name in lookup)) {
                lookup[name] = 1;
                if(name.length >0)dintintShape.push(name);
            }
        }
        var json = {};
        for(item, i = 0; item = dintintShape[i++];){
            if(item.length >0 && item !='') { //avoid null object
                json[item] = [];
                for (var k = 0; k < Object.keys(shapes).length; k++) {
                    if(shapes[k].shape_id == item)json[item].push(shapes[k]);
                }
            }
        }
        json = {
            type: 'FeatureCollection',
            features: Object.keys(json).map(function (id) {
                return {
                    type: 'Feature',
                    id: id,
                    properties: {
                        shape_id: id
                    },
                    geometry: {
                        type: "GeometryCollection",
                        geometries: [
                            {
                                type: "MultiPoint",
                                coordinates: (function() {
                                    var coords =[];
                                    for(var s =0; s < Object.keys(json[id]).length; s++){
                                        coords.push([
                                            parseFloat(json[id][s].shape_pt_lon),
                                            parseFloat(json[id][s].shape_pt_lat)
                                        ]);
                                    }
                                    return coords;
                                })()
                            },
                            {
                                type: "LineString",
                                coordinates: json[id].sort(function (a, b) {
                                    return +a.shape_pt_sequence - b.shape_pt_sequence;
                                }).map(function (coord) {
                                    return [
                                        parseFloat(coord.shape_pt_lon),
                                        parseFloat(coord.shape_pt_lat)
                                    ];
                                })
                            }
                        ]
                    }
                };
            })
        };
        return this._loadGeoJSON(json);
    },

    /* ty to kaezarrex () for the code :)*/
    _gtfsZipToGEOJSON: function(file){
        parseGtfs(file, {
            'shapes.txt': load_shapes
            //'stops.txt': load_stops
        });
    },


    /*  future integration with ajax call */
    _depth: 0,
    _titles: [],
    _root:{},
    _bounds: function(arrayLatLng){
        newBounds = new L.LatLngBounds(arrayLatLng)
    }

    });

var newBounds = {};

L.Control.FileLayerLoad = L.Control.extend({
    statics: {
        TITLE: 'Load local file (GPX, KML, GeoJSON, CSV, RDF, XML)',
        LABEL: '&#8965;'
    },
    options: {
        position: 'topleft',
        fitBounds: true,
        layerOptions: {},
        addToMap: true,
        fileSizeLimit: 1024
    },

    initialize: function (options) {
        L.Util.setOptions(this, options);
        this.loader = null;
    },

    onAdd: function (map) {
        this.loader = new FileLoader(map, this.options);

        this.loader.on('data:loaded', function (e) {
            // Fit bounds after loading
            if (this.options.fitBounds) {
                window.setTimeout(function () {
                    try {
                        map.fitBounds(e.layer.getBounds());
                    }catch(e){
                        //TODO try to solve this issue on the last version of leaflet
                        map.fitBounds(newBounds);
                    }
                }, 500);
            }
        }, this);

        // Initialize Drag-and-drop
        this._initDragAndDrop(map);

        // Initialize map control
        return this._initContainer();
    },

    _initDragAndDrop: function (map) {
        var fileLoader = this.loader,
            dropbox = map._container;

        var callbacks = {
            dragenter: function () {
                map.scrollWheelZoom.disable();
            },
            dragleave: function () {
                map.scrollWheelZoom.enable();
            },
            dragover: function (e) {
                e.stopPropagation();
                e.preventDefault();
            },
            drop: function (e) {
                e.stopPropagation();
                e.preventDefault();

                var files = Array.prototype.slice.apply(e.dataTransfer.files),
                    i = files.length;
                setTimeout(function(){
                    fileLoader.load(files.shift());
                    if (files.length > 0) {
                        setTimeout(arguments.callee, 25);
                    }
                }, 25);
                map.scrollWheelZoom.enable();
            }
        };
        for (var name in callbacks)
            dropbox.addEventListener(name, callbacks[name], false);
    },

    _initContainer: function () {
        // Create a button, and bind click on hidden file input
        var zoomName = 'leaflet-control-filelayer leaflet-control-zoom',
            barName = 'leaflet-bar',
            partName = barName + '-part',
            container = L.DomUtil.create('div', zoomName + ' ' + barName);
        var link = L.DomUtil.create('a', zoomName + '-in ' + partName, container);
        link.innerHTML = L.Control.FileLayerLoad.LABEL;
        link.href = '#';
        link.title = L.Control.FileLayerLoad.TITLE;

        // Create an invisible file input
        var fileInput = L.DomUtil.create('input', 'hidden', container);
        fileInput.type = 'file';
        if (!this.options.formats) {
            fileInput.accept = '.gpx,.kml,.json,.geojson,.csv,.rdf,.xml,.input,.zip';
        } else {
            fileInput.accept = this.options.formats.join(',');
        }
        fileInput.style.display = 'none';
        // Load on file change
        var fileLoader = this.loader;
        fileInput.addEventListener("change", function (e) {
            fileLoader.load(this.files[0]);
            // reset so that the user can upload the same file again if they want to
            this.value = '';
        }, false);

        L.DomEvent.disableClickPropagation(link);
        L.DomEvent.on(link, 'click', function (e) {
            fileInput.click();
            e.preventDefault();
        });
        return container;
    }
});

L.Control.fileLayerLoad = function (options) {
    return new L.Control.FileLayerLoad(options);
};





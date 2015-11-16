/*
 * Load files *locally* (GeoJSON, KML, GPX) into the map
 * using the HTML5 File API.
 *
 * Requires Pavel Shramov's GPX.js
 * https://github.com/shramov/leaflet-plugins/blob/d74d67/layer/vector/GPX.js
 */
var FileLoader = L.Class.extend({
    includes: L.Mixin.Events,
    options: {
        layerOptions: {},
        fileSizeLimit: 1024,
        firstLineTitles: true,    //if the first line of a csv file has headers (if false launch exception)
		latitudeTitle: 'lat',     //the default field name for the latitude coordinates...
		longitudeTitle: 'lng',    //the default field name for the longitude coordinates...
        titleForSearch: 'title',  //for future integration with other functions...
        titlesToInspect: [],      //if you want get only some specific field from csv and rdf files.....
        rdfLink: [],              //if you want merge the json object created from a rdf file you can specify the property of a link...
        rdfAbout: 'rdf:about',    //the value for the property rdf:about of a rdf file...
        rdfAboutLink: 'rdf:about', //the value for the property rdf:about for linking different classes of triple...
    },

    initialize: function (map, options) {
        this._map = map;
        L.Util.setOptions(this, options);

        this._parsers = {
            'json': this._loadGeoJSON,
            'geojson': this._loadGeoJSON,
            'gpx': this._convertToGeoJSON,
            'kml': this._convertToGeoJSON,
            'csv': this._convertCsvToGeoJSON,
            'rdf': this._convertRDFToJson
        };
    },

    load: function (file /* File */) {
        // Check file size
        var fileSize = (file.size / 1024).toFixed(4);
        if (fileSize > this.options.fileSizeLimit) {
            this.fire('data:error', {
                error: new Error('File size exceeds limit (' + fileSize + ' > ' + this.options.fileSizeLimit + 'kb)')
            });
            return;
        }

        // Check file extension
        var ext = file.name.split('.').pop(),
            parser = this._parsers[ext];
        if (!parser) {
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
        return reader;
    },

    _loadGeoJSON: function (content) {
        if (typeof content == 'string') {
            content = JSON.parse(content);
        }
        var layer = L.geoJson(content, this.options.layerOptions);

        if (layer.getLayers().length === 0) {
            throw new Error('GeoJSON has no valid layers.');
        }

        if (this.options.addToMap) {
            layer.addTo(this._map);
        }
        return layer;
    },

    _convertToGeoJSON: function (content, format) {
        // Format is either 'gpx' or 'kml'
        if (typeof content == 'string') {
            content = ( new window.DOMParser() ).parseFromString(content, "text/xml");
        }
        var geojson = toGeoJSON[format](content);
        return this._loadGeoJSON(geojson);
    },

    _convertCsvToGeoJSON: function(content){
        try {
            if(!this.options.firstLineTitles){
                throw new Error('The file CSV must have the Headers');
            }
            //convert csv to json.
            /*for this function i used the Papa Parser of mholt (https://github.com/mholt/PapaParse)*/
            var geojson = Papa.parse(content,{header: this.options.firstLineTitles});
            this._depth = geojson.data.length - 1;
            if(this.options.titlesToInspect.length == 0)this._titles = geojson.meta.fields;
            else this._titles = this.options.titlesToInspect;

            geojson = this._addFeatureToJson(geojson);
            return this._loadGeoJSON(geojson);
        }catch(e){alert(e.message);}
    },

    _addFeatureToJson: function(json){
        var titles = [];
        json["type"]="FeatureCollection";
        json["features"]=[];
        try {
            for (var num_linea = 0; num_linea < +this._depth; num_linea++) { //  var depth = papaJson.data.length - 1;
                var obj = json.data[num_linea]; //single element of papa parse json object
                if(obj !=null) {
                    if (this._titles.length > 0)titles = this._titles;
                    else titles = Object.keys(obj);
                    var fields = titles.toString().trim().split(",");

                    var lng = parseFloat(obj[this.options.longitudeTitle]);
                    var lat = parseFloat(obj[this.options.latitudeTitle]);
                    if (fields.length + "==" + titles.length && lng < 180 && lng > -180 && lat < 90 && lat > -90) {
                        var feature = {};
                        feature["type"] = "Feature";
                        feature["geometry"] = {};
                        feature["properties"] = {};
                        feature["geometry"]["type"] = "Point";
                        feature["geometry"]["coordinates"] = [lng, lat];
                        var content = '<div class="popup-content"><table class="table table-striped table-bordered table-condensed">';
                        for (var i = 0; i < titles.length; i++) {
                            if (titles[i] != this.options.latitudeTitle && titles[i] != this.options.longitudeTitle) {
                                if (titles[i] == this.options.titleForSearch) {
                                    feature["properties"]["search"] = this._deleteDoubleQuotes(obj[titles[i]]);
                                    feature["properties"]["titles"] = this._deleteDoubleQuotes(obj[titles[i]]);
                                } else {
                                    feature["properties"][titles[i]] = this._deleteDoubleQuotes(obj[titles[i]]);
                                    var href = '';
                                    if (obj[titles[i]].indexOf('http') === 0) {
                                        href = '<a target="_blank" href="' + obj[titles[i]] + '">' + obj[titles[i]] + '</a>';
                                    }
                                    if (href.length > 0)content += '<tr><th>' + titles[i] + '</th><td>' + href + '</td></tr>';
                                    else content += '<tr><th>' + titles[i] + '</th><td>' + obj[titles[i]] + '</td></tr>';
                                }
                            }//end of if
                        }//end of for
                        content += "</table></div>";
                        feature["properties"]["popupContent"] = content;
                        json["features"].push(feature);
                    }
                }//if obj != null
            }
        }catch(e){
            alert(e.message);
        }
        delete json.data;
        return json;
    },

    _deleteDoubleQuotes: function (text) {
        text = text.trim().replace(/^"/,"").replace(/"$/,"");
        return text;
    },

    _convertRDFToJson: function(contentRdf) {
        try {
            var xml = this._convertRDFToXML(contentRdf);
            var json = this._convertXMLToJson(xml);
            this._simplifyJson(json["rdf:RDF"]["rdf:Description"],null);
            this._mergeRdfJson(this._root.data);
            //Filter result, get all object with coordinates...
            for(var i = 0; i < this._root.data.length; i++){
                if(!(this._root.data[i].hasOwnProperty(this.options.latitudeTitle) &&
                    this._root.data[i].hasOwnProperty(this.options.longitudeTitle))
                ){
                    delete this._root.data[i];
                }
            }
            this._depth = this._root.data.length;
            json = this._addFeatureToJson(this._root);
            return this._loadGeoJSON(json);
        }catch(e) {
            alert(e.message);
        }
    },

    _convertRDFToXML:function(contentRdf){
        var xml;
        try {
            if (typeof parseXML == 'undefined') {
                try {
                    xml = new ActiveXObject("Microsoft.XMLDOM");
                    xml.async = false;
                    xml.validateOnParse = false;
                    xml.resolveExternals = false;
                    xml.loadXML(contentRdf);
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
                        xml.loadXML(contentRdf);
                    } catch (e) {
                        throw new Error(e.message);
                    }
                }
            } else {
                xml = parseXML(contentRdf, null);
            }
        }catch(e) {
            throw new Error(e.message);
        }
        return xml;
    },

    _convertXMLToJson:function (contentXml) {
        var attr,
            child,
            attrs = contentXml.attributes,
            children = contentXml.childNodes,
            key = contentXml.nodeType,
            json = {},
            i = -1;
        if (key == 1 && attrs.length) {
            json[key = '@attributes'] = {};
            while (attr = attrs.item(++i)) {
                json[key][attr.nodeName] = attr.nodeValue;
            }
            i = -1;
        } else if (key == 3) {
            json = contentXml.nodeValue;
        }
        while (child = children.item(++i)) {
            key = child.nodeName;
            if (json.hasOwnProperty(key)) {
                if (json.toString.call(json[key]) != '[object Array]') {
                    json[key] = [json[key]];
                }
                json[key].push(this._convertXMLToJson(child));
            }
            else {
                json[key] = this._convertXMLToJson(child);
            }
        }
        return json;
    },

    _simplifyJson: function(json){
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

                for (var element in elements) { //
                    element = elements[element]; //@attributes
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
                    }else {
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
                            info[key] = value;
                        }
                        else {
                            //never run here.....
                            alert("ERROR:"+ JSON.stringify(obj[element], undefined, 2));
                        }
                    }
                    info[key] = value;
                }
                root.data.push(info);
            }catch(e){
                alert(e.message);
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
                for(var k in this.options.rdfLink) { //for each rdf link you setted
                    if (json[i].hasOwnProperty(this.options.rdfLink[k])) {
                        link = json[i][this.options.rdfLink[k]];
                        mJson.push(this._searchJsonByKeyAndValue(json, this.options.rdfAboutLink, link));
                    }
                }
            }

            for (i = 0; i < Object.keys(json).length; i++) {
                if (mJson[i] != null && json[i]!=null) {
                     xJson = this._mergeJson(json[i], mJson[i]);
                     //alert("111:\n"+JSON.stringify(xJson,undefined,2));
                     json.push(xJson);
                    delete json[json[i]];
                    delete json[mJson[i]];
                }
            }
        }catch(e){
            alert(e.message);
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
                alert(e.message);
            }
        }
        return null;
    },

    /*_convertCSVToRDF:function(contentcsv){
        var line;
        var lines = [];
        for(var i = 0; i < contentcsv.length; i++){
            line = "@prefix : <http://rdfdata.org/csv#> . :csvList :item" + contentcsv[i];
            lines.push(line);
        }
        return lines;
    }*/

    _cleanArray: function(array){
        var err = ["","\n","\n ","\"\n \"","\"\n\"","\"\""]
        for(var deleteValue in err) {
            for (var i = 0; i < array.length; i++) {
                if (array[i] === deleteValue) {
                    array.splice(i, 1);
                }
            }
        }
        return array;
    },

    _mergeJson: function(a,b){
        for(var key in b)
            if(b.hasOwnProperty(key))
                a[key] = b[key];
        return a;
    },

    _depth: 0,
    _titles: [],
    _root:{}

});


L.Control.FileLayerLoad = L.Control.extend({
    statics: {
        TITLE: 'Load local file (GPX, KML, GeoJSON, CSV, RDF)',
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
                    map.fitBounds(e.layer.getBounds());
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
            fileInput.accept = '.gpx,.kml,.json,,.geojson,.csv,.rdf';
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




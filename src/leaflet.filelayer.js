/*
 * Load files *locally* (GeoJSON, KML, GPX) into the map
 * using the HTML5 File API.
 *
 * Requires Mapbox's togeojson.js to be in global scope
 * https://github.com/mapbox/togeojson
 * 
 * Requires read-excel-file.js to be in global scope
 * https://gitlab.com/catamphetamine/read-excel-file#json
 */

 (function (factory, window) {
    // define an AMD module that relies on 'leaflet'
    if (typeof define === 'function' && define.amd && window.toGeoJSON && window.readXlsxFile) {
        define(['leaflet'], function (L) {

            factory(L, window.toGeoJSON, window.readXlsxFile);
        });
    } else if (typeof module === 'object' && module.exports) {
        // require('LIBRARY') returns a factory that requires window to
        // build a LIBRARY instance, we normalize how we use modules
        // that require this pattern but the window provided is a noop
        // if it's defined
        module.exports = function (root, L, toGeoJSON) {
            if (L === undefined) {
                if (typeof window !== 'undefined') {
                    L = require('leaflet');
                } else {
                    L = require('leaflet')(root);
                }
            }
            if (toGeoJSON === undefined) {
                if (typeof window !== 'undefined') {
                    toGeoJSON = require('togeojson');
                } else {
                    toGeoJSON = require('togeojson')(root);
                }
            }
            factory(L, toGeoJSON);
            return L;
        };
    } else if (typeof window !== 'undefined' && window.L && window.toGeoJSON && window.readXlsxFile) {
        factory(window.L, window.toGeoJSON, window.readXlsxFile);
    }
}(function fileLoaderFactory(L, toGeoJSON, readXlsxFile) {
    var FileLoader = L.Layer.extend({
        options: {
            layer: L.geoJson,
            MultiPoint: true,
            layerOptions: {},
            fileSizeLimit: 1024,
            GpsKmlGeojsonArr: [], //Add an array to hold the loaded data
            layerArr: [] //Store L.Geo JSON layer data
        },
        initialize: function (map, options) {
            this._map = map;
            L.Util.setOptions(this, options);
            this._parsers = {
                geojson: this._loadGeoJSON,
                json: this._loadGeoJSON,
                gpx: this._convertToGeoJSON,
                kml: this._convertToGeoJSON,
                xlsx: this._excelPointGeojson,//Add data in excel xlsx format
            };
        },
        load: function (file, ext) {
            var parser, reader;
            // Check file is defined
            if (this._isParameterMissing(file, 'file')) {
                return false;
            }

            // Check file size
            if (!this._isFileSizeOk(file.size)) {
                return false;
            }

            // Get parser for this data type
            parser = this._getParser(file.name, ext);
            if (!parser) {
                return false;
            }

            // Read selected file using HTML5 File API
            reader = new FileReader();
            reader.onload = L.Util.bind(function (e) {
                var layer;
                var that = this;
                var coordinates = [];
                try {
                    
                    //Add xlsx format judgment
                    if (parser.ext != 'xlsx') {
                        that.fire('data:loading', { filename: file.name, format: parser.ext });
                        layer = parser.processor.call(that, e.target.result, parser.ext);
                        that.fire('data:loaded', {
                            layer: layer,
                            filename: file.name,
                            format: parser.ext
                        });
                    } else {
                        that.fire('data:loading', { filename: file.name, format: parser.ext });
                        readXlsxFile(file).then(function (data) {
                            coordinates = getGpsPoint(data);
                            if (coordinates.length > 0) {
                                layer = parser.processor.call(that, coordinates);
                                that.fire('data:loaded', {
                                    layer: layer,
                                    filename: file.name,
                                    format: parser.ext
                                });
                            }
                        }), function (error) {
                            console.error(error)
                            // alert("Error while parsing Excel file. See console output for the error stack trace.")
                        };

                    }
                } catch (err) {
                    this.fire('data:error', { error: err });
                }
            }, this);

            // Testing trick: tests don't pass a real file,
            // but an object with file.testing set to true.
            // This object cannot be read by reader, just skip it.
            if (!file.testing) {
                reader.readAsText(file);
            }
            // We return this to ease testing
            return reader;
        },
        loadMultiple: function (files, ext) {
            var readers = [];
            if (files[0]) {
                files = Array.prototype.slice.apply(files);
                while (files.length > 0) {
                    readers.push(this.load(files.shift(), ext));
                }
            }
            // return first reader (or false if no file),
            // which is also used for subsequent loadings
            return readers;
        },
        loadData: function (data, name, ext) {
            var parser;
            var layer;

            // Check required parameters
            if ((this._isParameterMissing(data, 'data'))
              || (this._isParameterMissing(name, 'name'))) {
                return;
            }

            // Check file size
            if (!this._isFileSizeOk(data.length)) {
                return;
            }

            // Get parser for this data type
            parser = this._getParser(name, ext);
            if (!parser) {
                return;
            }

            // Process data
            try {
                this.fire('data:loading', { filename: name, format: parser.ext });
                layer = parser.processor.call(this, data, parser.ext);
                this.fire('data:loaded', {
                    layer: layer,
                    filename: name,
                    format: parser.ext
                });
            } catch (err) {
                this.fire('data:error', { error: err });
            }
        },
        
        _isParameterMissing: function (v, vname) {
            if (typeof v === 'undefined') {
                this.fire('data:error', {
                    error: new Error('Missing parameter: ' + vname)
                });
                return true;
            }
            return false;
        },
        
        _getParser: function (name, ext) {
            var parser;
            ext = ext || name.split('.').pop();
            parser = this._parsers[ext];
            if (!parser) {
                this.fire('data:error', {
                    error: new Error('Unsupported file type (' + ext + ')')
                });
                return undefined;
            }
            return {
                processor: parser,
                ext: ext
            };
        },
        _isFileSizeOk: function (size) {
            var fileSize = (size / 1024).toFixed(4);
            if (fileSize > this.options.fileSizeLimit) {
                this.fire('data:error', {
                    error: new Error(
                        'File size exceeds limit (' +
                        fileSize + ' > ' +
                        this.options.fileSizeLimit + 'kb)'
                    )
                });
                return false;
            }
            return true;
        },
        
        _loadGeoJSON: function _loadGeoJSON(content) {
            var layer;
            
            if (typeof content === 'string') {
                content = JSON.parse(content);
            }
            //Deposit will be converted geojson this. The options. GpsKmlGeojsonArr array
            this.options.GpsKmlGeojsonArr = [];
            this.options.GpsKmlGeojsonArr.push(content);
            layer = this.options.layer(content, this.options.layerOptions);
            this.options.layerArr.push(layer);
            
            if (layer.getLayers().length === 0) {
                throw new Error('GeoJSON has no valid layers.');
            }
            if (this.options.addToMap) {
                layer.addTo(this._map);
            }
            return layer;
        },
        
        _convertToGeoJSON: function _convertToGeoJSON(content, format) {
            var geojson;
            // Format is either 'gpx' or 'kml'      
            if (typeof content === 'string') {
                content = (new window.DOMParser()).parseFromString(content, 'text/xml');
            }
            geojson = toGeoJSON[format](content);

            return this._loadGeoJSON(geojson);
        },
        //New method
        _excelPointGeojson: function _excelPointGeojson(excelConvertArr) {
            //excle point coordinates will generate Geojson in two formats: Point format and multipoint format          
            if (this.options.MultiPoint) {
                if (excelConvertArr.length > 0) {
                    var lnglat = [];
                    for (let i = 0; i < excelConvertArr.length; i++) {
                        //excel file data format latitude in front and Geojson format longitude in front here for conversion
                        //The conversion coordinates are numeric
                        var x = excelConvertArr[i][0]*1;
                        var y = excelConvertArr[i][1]*1;
                        var coordinate = [y, x];
                        lnglat.push(coordinate);
                    }
                    if (this.options.addToMap) {
                        if (lnglat.length > 0) {
                            var geojsonArr = [];
                            var pointToFeature = this._MultiPointToFeature(lnglat)
                            geojsonArr.push(pointToFeature)
                            var geojsonPoint = this._featureCollection(geojsonArr);
                        }
                    }
                    return this._loadGeoJSON(geojsonPoint);
                }
            } else {
                if (excelConvertArr.length > 0) {
                    var lnglat = [];
                    for (let i = 0; i < excelConvertArr.length; i++) {
                        var x = excelConvertArr[i][0]*1;
                        var y = excelConvertArr[i][1]*1;
                        var coordinate = [y, x];
                        var properties = { name: `${i}` }
                        var pointToFeature = this._pointToFeature(coordinate, properties)
                        lnglat.push(pointToFeature);
                    }
                    if (this.options.addToMap) {
                        if (lnglat.length > 0) {
                            var geojsonPoint = this._featureCollection(lnglat);
                            return this._loadGeoJSON(geojsonPoint);
                        }
                    }

                }
            }
        },

        //New method
        // Add point coordinates to the element  
        _pointToFeature: function _pointToFeature(coordinates, properties, options) {
            return this._feature(
                {
                    type: "Point",
                    coordinates: coordinates
                },
                properties,
                options

            );
        },

        //New method
        _MultiPointToFeature: function _MultiPointToFeature(coordinates, properties, options) {
            return this._feature(
                {
                    type: "MultiPoint",
                    coordinates: coordinates
                },
                properties,
                options

            );
        },

        //New method
        _feature: function _feature(geometry, properties, options) {
            var feat = { type: "Feature" };
            feat.properties = properties || {};
            feat.geometry = geometry;
            return feat;
        },

        //New method
        _featureCollection: function _featureCollection(features) {
            var fc = { type: "FeatureCollection" };
            fc.features = features;
            return fc;
        }
    });

    //New method
    //Extract EXCEL file coordinates
    const getGpsPoint = function (data) {
        var newXYArr = [];
        for (var i = 0; i < data.length; i++) {
            var Arr = data[i]
            for (var j = 0; j < Arr.length; j++) {
                newXYArr[i] = Arr.filter((_, j) => {
                    return j !== 0;
                });

            }
        }
        return newXYArr;
    };
    var FileLayerLoad = L.Control.extend({
        statics: {
            TITLE: 'Load local file (GPX, KML, GeoJSON,XLSX)',
            LABEL: '&#8965;'
        },
        options: {
            position: 'topleft', //The open file icon is on the top left
            fitBounds: true,   //Display boundary
            flyTo: true,       //Flight mode
            addToMap: true, //Add to map switch on
            fileSizeLimit: 1024,
            //A point file generates a geojson method that generates a point if false and a point if TRUE generates a multipoint
            MultiPoint: false 
        },
        initialize: function (options) {
            L.Util.setOptions(this, options);
            this.loader = null;
        },
        onAdd: function (map) {
            this.loader = L.FileLayer.fileLoader(map, this.options);
            this.loader.on('data:loaded', function (e) {
                //Fit boundary after loading. There are two ways to enter the appropriate boundary Settings after loading the file
                //1.Go directly to this.options.flyTo=true
                //2、Fly-in method programs default to this.options.fitBounds=true      
                if (this.options.fitBounds) {
                    if (this.options.flyTo) {
                        window.setTimeout(function () {
                            if (e.layer) {
                                //Scale to size
                                var scale = map.getZoom();
                                if (scale > 18) {
                                    //If the zoom level is greater than 18, zoom down to 15 otherwise the highlighting will not work
                                    map.setZoom(15);
                                }
                                var bounds = e.layer.getBounds();
                                var zoom = map.getBoundsZoom(bounds);
                                var swPoint = map.project(bounds.getSouthWest(), zoom);
                                var nePoint = map.project(bounds.getNorthEast(), zoom);
                                var center = map.unproject(swPoint.add(nePoint).divideBy(2), zoom);
                                map.flyTo(center, zoom);
                            } else if (e.featureGroup) {
                                //Scale to size
                                var bounds = e.featureGroup.getBounds();
                                var zoom = map.getBoundsZoom(bounds);
                                var swPoint = map.project(bounds.getSouthWest(), zoom);
                                var nePoint = map.project(bounds.getNorthEast(), zoom);
                                var center = map.unproject(swPoint.add(nePoint).divideBy(2), zoom);
                                map.flyTo(center, zoom);
                            }
                        }, 500);
                    } else {
                        window.setTimeout(function () {
                            if (e.layer) {
                                //geojson enters the layer
                                map.fitBounds(e.layer.getBounds());
                                //map.flyToBounds(fitBounds(e.layer.getBounds()))
                            } else if (e.featureGroup) {
                                //The point coordinates enter the featureGroup layer
                                map.fitBounds(e.featureGroup.getBounds());
                            }

                        }, 500);
                    }
                }

            }, this);

            // Initialize Drag-and-drop
            this._initDragAndDrop(map);

            // Initialize map control
            return this._initContainer();
        },

        //File support
        _initDragAndDrop: function (map) {
            var callbackName;
            var thisLoader = this.loader;
            var dropbox = map._container;

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

                    thisLoader.loadMultiple(e.dataTransfer.files);
                    map.scrollWheelZoom.enable();
                }
            };
            for (callbackName in callbacks) {
                if (callbacks.hasOwnProperty(callbackName)) {
                    dropbox.addEventListener(callbackName, callbacks[callbackName], false);
                }
            }
        },
        
        _initContainer: function () {
            var thisLoader = this.loader;

            // Create a button, and bind click on hidden file input     
            var fileInput;
            var zoomName = 'leaflet-control-filelayer leaflet-control-zoom';
            var barName = 'leaflet-bar';
            var partName = barName + '-part';
            var container = L.DomUtil.create('div', zoomName + ' ' + barName);
            var link = L.DomUtil.create('a', zoomName + '-in ' + partName, container);
            link.innerHTML = L.Control.FileLayerLoad.LABEL;
            link.href = '#';
            link.title = L.Control.FileLayerLoad.TITLE;

            // Create an invisible file input
            fileInput = L.DomUtil.create('input', 'hidden', container);
            fileInput.type = 'file';
            fileInput.multiple = 'multiple';
            if (!this.options.formats) {
                //add .xlsx
                fileInput.accept = '.gpx,.kml,.json,.geojson,.xlsx';
            } else {
                fileInput.accept = this.options.formats.join(',');
            }
            fileInput.style.display = 'none';
            // Load on file change
            fileInput.addEventListener('change', function (e) {
                thisLoader.loadMultiple(this.files);
                // reset so that the user can upload the same file again if they want to
                this.value = '';
            }, false);

            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.on(link, 'click', function (e) {
                fileInput.click();
                e.preventDefault();
            });
            return container;
        }
    });
    L.FileLayer = {};
    L.FileLayer.FileLoader = FileLoader;
    L.FileLayer.fileLoader = function (map, options) {
        return new L.FileLayer.FileLoader(map, options);
    };
    L.Control.FileLayerLoad = FileLayerLoad;
    L.Control.fileLayerLoad = function (options) {
        return new L.Control.FileLayerLoad(options);
    };
}, window));


/*
 * Load files *locally* (GeoJSON, KML, GPX) into the map
 * using the HTML5 File API.
 *
 * Requires Pavel Shramov's GPX.js
 * https://github.com/shramov/leaflet-plugins/blob/d74d67/layer/vector/GPX.js
 */
L.Util.FileLoader = L.Class.extend({
    includes: L.Mixin.Events,
    options: {
        layer: L.geoJson,
        layerOptions: {},
        fileSizeLimit: 1024
    },

    initialize: function (map, options) {
        this._map = map;
        L.Util.setOptions(this, options);

        this._parsers = {
            'geojson': this._loadGeoJSON,
            'json': this._loadGeoJSON,
            'gpx': this._convertToGeoJSON,
            'kml': this._convertToGeoJSON
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
        var layer = this.options.layer(content, this.options.layerOptions);

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
    }
});

L.Util.fileLoader = function(map, options) {
  return new L.Util.FileLoader(map, options);  
};


L.Control.FileLayerLoad = L.Control.extend({
    statics: {
        TITLE: 'Load local file (GPX, KML, GeoJSON)',
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
        this.loader = L.Util.fileLoader(map, this.options);

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
        var thisFileLayerLoad = this,
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

                thisFileLayerLoad._loadFiles(e.dataTransfer.files);
                map.scrollWheelZoom.enable();
            }
        };
        for (var name in callbacks)
            dropbox.addEventListener(name, callbacks[name], false);
            
        // For maps which are not fullscreen this will prevent dragging and
        // dropping a file outside of map container from loading the file as a new webpage.
        L.DomEvent.on(L.DomUtil.get(window), "dragover drop", function(e) {
            L.DomEvent.preventDefault(e);
        });
    },

    _initContainer: function () {
        var thisFileLayerLoad = this;

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
        fileInput.multiple = 'multiple';
        if (!this.options.formats) {
            fileInput.accept = '.gpx,.kml,.geojson';
        } else {
            fileInput.accept = this.options.formats.join(',');
        }
        fileInput.style.display = 'none';
        // Load on file change
        fileInput.addEventListener("change", function (e) {
            thisFileLayerLoad._loadFiles(this.files);
            // reset so that the user can upload the same file again if they want to
            this.value = '';
        }, false);

        L.DomEvent.disableClickPropagation(link);
        L.DomEvent.on(link, 'click', function (e) {
            fileInput.click();
            e.preventDefault();
        });
        return container;
    },

    _loadFiles: function (files) {
        files = Array.prototype.slice.apply(files);

        var fileLoader = this.loader,
            i = files.length;
        setTimeout(function(){
            fileLoader.load(files.shift());
            if (files.length > 0) {
                setTimeout(arguments.callee, 25);
            }
        }, 25);
    }
});

L.Control.fileLayerLoad = function (options) {
    return new L.Control.FileLayerLoad(options);
};

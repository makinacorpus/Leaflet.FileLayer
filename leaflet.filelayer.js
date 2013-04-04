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
	},

	initialize: function (map, options) {
		this._map = map;
		L.Util.setOptions(this, options);
		
		this._parsers = {
			'geojson': this._loadGeoJSON,
			'gpx': this._convertToGeoJSON,
			'kml': this._convertToGeoJSON,
		};
	},
	
	load: function (file /* File */) {
		// Check file extension
		var ext = file.name.split('.').pop()
		  , parser = this._parsers[ext];
		if (!parser) {
			window.alert("Unsupported file type " + file.type + '(' + ext + ')');
			return;
		}
		// Read selected file using HTML5 File API
		var reader = new FileReader();
		reader.onload = L.Util.bind(function (e) {
			this.fire('data:loading');
			var layer = parser.call(this, e.target.result, ext);
			this.fire('data:loaded', {layer: layer});
		}, this);
		reader.readAsText(file);
	},

	_loadGeoJSON: function (content) {
		var content = typeof content == 'string' ? JSON.parse(content) : content,
		    layer = L.geoJson(content, this.options.layerOptions);
		return layer.addTo(this._map);
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


L.Control.FileLayerLoad = L.Control.extend({
	statics: {
		TITLE: 'Load local file (GPX, KML, GeoJSON)',
		LABEL: '&#8965;',
	},
	options: {
		position: 'topleft',
		fitBounds: true,
		layerOptions: {},
	},

	initialize: function (options) {
		L.Util.setOptions(this, options);
		this._fileLoader = null;
	},

	onAdd: function (map) {
		this._fileLoader = new FileLoader(map, {layerOptions: this.options.layerOptions});

		this._fileLoader.on('data:loaded', function (e) {
			// Fit bounds after loading
			if (this.options.fitBounds) {
				window.setTimeout(function () {
					map.fitBounds(e.layer.getBounds()).zoomOut();
				}, 500);
			}
		}, this);

		return this._initContainer();
	},

	_initContainer: function () {
		// Create an invisible file input 
		var fileInput = L.DomUtil.create('input', 'hidden', container);
		fileInput.type = 'file';
		fileInput.accept = '.gpx,.kml,.geojson';
		fileInput.style.display = 'none';
		// Load on file change
		var fileLoader = this._fileLoader;
		fileInput.addEventListener("change", function (e) {
			fileLoader.load(this.files[0]);
		}, false);

		// Create a button, and bind click on hidden file input
		var zoomName = 'leaflet-control-filelayer leaflet-control-zoom',
		    barName = 'leaflet-bar',
		    partName = barName + '-part',
		    container = L.DomUtil.create('div', zoomName + ' ' + barName);
		var link = L.DomUtil.create('a', zoomName + '-in ' + partName, container);
		link.innerHTML = L.Control.FileLayerLoad.LABEL;
		link.href = '#';
		link.title = L.Control.FileLayerLoad.TITLE;
		
		var stop = L.DomEvent.stopPropagation;
		L.DomEvent
		    .on(link, 'click', stop)
		    .on(link, 'mousedown', stop)
		    .on(link, 'dblclick', stop)
		    .on(link, 'click', L.DomEvent.preventDefault)
		    .on(link, 'click', function (e) {
				fileInput.click();
				e.preventDefault();
			});
		return container;
	},
});

L.Control.fileLayerLoad = function (options) {
	return new L.Control.FileLayerLoad(options)
};

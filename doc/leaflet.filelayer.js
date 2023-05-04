/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ (function(module) {

module.exports = L;

/***/ }),
/* 2 */
/***/ (function(module) {

module.exports = toGeoJSON;

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
!function() {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Control": function() { return /* binding */ Control; },
/* harmony export */   "FileLayer": function() { return /* binding */ FileLayer; },
/* harmony export */   "FileLayerLoad": function() { return /* binding */ FileLayerLoad; },
/* harmony export */   "FileLoader": function() { return /* binding */ FileLoader; }
/* harmony export */ });
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(leaflet__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var togeojson__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var togeojson__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(togeojson__WEBPACK_IMPORTED_MODULE_1__);
/*
 * Load files *locally* (GeoJSON, KML, GPX) into the map
 * using the HTML5 File API.
 *
 * Requires Mapbox's togeojson.js to be in global scope
 * https://github.com/mapbox/togeojson
 */


const FileLoader = leaflet__WEBPACK_IMPORTED_MODULE_0___default().Layer.extend({
  options: {
    layer: (leaflet__WEBPACK_IMPORTED_MODULE_0___default().geoJson),
    layerOptions: {},
    fileSizeLimit: 1024,
  },

  initialize: function initialize(map, options) {
    this._map = map;
    leaflet__WEBPACK_IMPORTED_MODULE_0___default().Util.setOptions(this, options);

    this._parsers = {
      geojson: this._loadGeoJSON,
      json: this._loadGeoJSON,
      gpx: this._convertToGeoJSON,
      kml: this._convertToGeoJSON,
    };
  },

  load: function load(file, ext) {
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
    reader.onload = leaflet__WEBPACK_IMPORTED_MODULE_0___default().Util.bind(function (e) {
      var layer;
      try {
        this.fire('data:loading', { filename: file.name, format: parser.ext });
        layer = parser.processor.call(this, e.target.result, parser.ext);
        this.fire('data:loaded', {
          layer: layer,
          filename: file.name,
          format: parser.ext,
        });
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

  loadMultiple: function loadMultiple(files, ext) {
    let readers = [];
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

  loadData: function loadData(data, name, ext) {
    var parser;
    var layer;
    // Check required parameters
    if (this._isParameterMissing(data, 'data') || this._isParameterMissing(name, 'name')) {
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
        format: parser.ext,
      });
    } catch (err) {
      this.fire('data:error', { error: err });
    }
  },

  _isParameterMissing: function _isParameterMissing(v, vname) {
    if (typeof v === 'undefined') {
      this.fire('data:error', {
        error: new Error(`Missing parameter:${vname}`),
      });
      return true;
    }
    return false;
  },

  _getParser: function _getParser(name, ext) {
    var parser;
    ext = ext || name.split('.').pop();
    parser = this._parsers[ext];
    if (!parser) {
      this.fire('data:error', {
        error: new Error(`Unsupported file type (${ext})`),
      });
      return undefined;
    }
    return {
      processor: parser,
      ext: ext,
    };
  },

  _isFileSizeOk: function _isFileSizeOk(size) {
    var fileSize = (size / 1024).toFixed(4);
    if (fileSize > this.options.fileSizeLimit) {
      this.fire('data:error', {
        error: new Error(`File size exceeds limit (${fileSize} > ${this.options.fileSizeLimit} 'kb)`),
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
    layer = this.options.layer(content, this.options.layerOptions);

    if (layer.getLayers().length === 0) {
      throw new Error('GeoJSON has no valid layers.');
    }

    if (this.options.addToMap) {
      layer.addTo(this._map);
    }
    return layer;
  },

  _convertToGeoJSON: function _convertToGeoJSON(content, format) {
    // Format is either 'gpx' or 'togeojson'
    if (typeof content === 'string') {
      content = new window.DOMParser().parseFromString(content, 'text/xml');
    }
    /*  let toGeoJSON;
    if (toGeoJSON === undefined) {
      if (typeof window !== 'undefined') {
        toGeoJSON = require('togeojson');
      } else {
        toGeoJSON = require('togeojson');
      }
    } */

    const geojson = (togeojson__WEBPACK_IMPORTED_MODULE_1___default())[format](content);
    return this._loadGeoJSON(geojson);
  },
});

const FileLayerLoad = leaflet__WEBPACK_IMPORTED_MODULE_0___default().Control.extend({
  options: {
    title: 'Load local file (GPX, KML, GeoJSON)',
    position: 'topleft',
    fitBounds: true,
    layerOptions: {},
    addToMap: true,
    fileSizeLimit: 1024,
  },
  initialize: function (options) {
    leaflet__WEBPACK_IMPORTED_MODULE_0___default().Util.setOptions(this, options);
    this.loader = null;
  },
  /* browserFileLoad: undefined,
  initialize: function initialize(options, browserFileLoad) {
    L.Util.setOptions(this, options);
    this.loader = null;
    if (browserFileLoad) {
      this.browserFileLoad = browserFileLoad;
      L.setOptions(this.browserFileLoad, options);
    }
  }, */

  onAdd: function onAdd(map) {
    this.loader = leaflet__WEBPACK_IMPORTED_MODULE_0___default().FileLayer.fileLoader(map, this.options);
    this.loader.on(
      'data:loaded',
      function (e) {
        // Fit bounds after loading
        if (this.options.fitBounds) {
          window.setTimeout(function () {
            map.fitBounds(e.layer.getBounds());
          }, 500);
        }
      },
      this
    );
    // Initialize Drag-and-drop
    this._initDragAndDrop(map);
    map.FileControl = this; // Make control available from the map object itself;
    // Initialize map control
    return this._createIcon();
  },
  //新增ICON
  _createIcon: function _createIcon() {
    const thisLoader = this.loader;
    // Create a button, and bind click on hidden file input
    let fileInput;
    const zoomName = 'leaflet-control-filelayer leaflet-control-zoom';
    const barName = 'leaflet-bar';
    const partName = `${barName}-part` + '';
    const container = leaflet__WEBPACK_IMPORTED_MODULE_0___default().DomUtil.create('div', `${zoomName}  ${barName}`);
    const link = leaflet__WEBPACK_IMPORTED_MODULE_0___default().DomUtil.create('a', `${zoomName} -in ${partName}`, container);
    if (this.options.title) {
      link.title = this.options.title;
    }

    if (!document.getElementById('browser-file-css')) {
      this._appendControlStyles(container);
    }
    link.href = '#';
    // Create an invisible file input
    fileInput = leaflet__WEBPACK_IMPORTED_MODULE_0___default().DomUtil.create('input', 'hidden', container);
    fileInput.type = 'file';
    fileInput.multiple = 'multiple';
    if (!this.options.formats) {
      fileInput.accept = '.gpx,.kml,.json,.geojson';
    } else {
      fileInput.accept = this.options.formats.join(',');
    }
    fileInput.style.display = 'none';
    // Load on file change
    fileInput.addEventListener(
      'change',
      function () {
        thisLoader.loadMultiple(this.files);
        // reset so that the user can upload the same file again if they want to
        this.value = '';
      },
      false
    );

    leaflet__WEBPACK_IMPORTED_MODULE_0___default().DomEvent.disableClickPropagation(container);
    leaflet__WEBPACK_IMPORTED_MODULE_0___default().DomEvent.on(link, 'click', function (e) {
      fileInput.click();
      e.preventDefault();
    });
    return container;
  },

  _initDragAndDrop: function _initDragAndDrop(map) {
    var callbackName;
    var thisLoader = this.loader;
    var dropbox = map._container;

    var callbacks = {
      dragenter: function dragenter() {
        map.scrollWheelZoom.disable();
      },
      dragleave: function dragleave() {
        map.scrollWheelZoom.enable();
      },
      dragover: function dragover(e) {
        e.stopPropagation();
        e.preventDefault();
      },
      drop: function drop(e) {
        e.stopPropagation();
        e.preventDefault();

        thisLoader.loadMultiple(e.dataTransfer.files);
        map.scrollWheelZoom.enable();
      },
    };
    for (callbackName in callbacks) {
      if (callbacks.hasOwnProperty(callbackName)) {
        dropbox.addEventListener(callbackName, callbacks[callbackName], false);
      }
    }
  },
  //更改原_initContainer
  _appendControlStyles: function _appendControlStyles(container) {
    var fileControlStyleSheet = document.createElement('style');
    fileControlStyleSheet.setAttribute('type', 'text/css');
    fileControlStyleSheet.id = 'browser-file-css';
    fileControlStyleSheet.innerHTML +=
      " .leaflet-control-filelayer { display: flex; } .leaflet-control-filelayer a { background: #fff url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAoklEQVQ4T2NkoBAwUqifAWyAhoq523/Gf5UohjEyvr5561QYIQvABqirmf38z/Df5tat06dhGtTVzUIZ/jOEEjIEYoCq6f6bt087otsGNWQVDlf8vnnrFBteA/A5X13N7P/NW6cYRw0YPGGgZvb7P8N/K+SERCgFqquZgdIBKzga1dTMAhj//89nYGR0IKQRJs/475/jjTtnDlAnMxFrKzZ1ALrzaRGE3tGmAAAAAElFTkSuQmCC') no-repeat 5px; background-size: 16px 16px; display: block; border-radius: 2px; }";
    fileControlStyleSheet.innerHTML += ' .leaflet-control-filelayer a.leaflet-control-filelayer { background-position: center; }';
    container.appendChild(fileControlStyleSheet);
  },
});

const FileLayer = {
  FileLoader: FileLoader,
  fileLoader: function (map, options) {
    return new FileLoader(map, options);
  }
};

const Control = {
  fileLayerLoad: function (options) {
    return new FileLayerLoad(options);
  }
};

// 给 L.FileLayer 对象添加属性
(leaflet__WEBPACK_IMPORTED_MODULE_0___default().FileLayer) = FileLayer;
(leaflet__WEBPACK_IMPORTED_MODULE_0___default().Control.FileLayerLoad) = FileLayerLoad;
(leaflet__WEBPACK_IMPORTED_MODULE_0___default().Control.fileLayerLoad) = Control.fileLayerLoad;

/* L.FileLayer = {};
L.FileLayer.FileLoader = FileLoader;
L.FileLayer.fileLoader = function (map, options) {
  return new L.FileLayer.FileLoader(map, options);
};

L.Control.FileLayerLoad = FileLayerLoad;
L.Control.fileLayerLoad = function (options) {
  return new L.Control.FileLayerLoad(options);
};
 */
}();
/******/ })()
;
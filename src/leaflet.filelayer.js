/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./ts/filelayerload.ts":
/*!*****************************!*\
  !*** ./ts/filelayerload.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Control": function() { return /* binding */ Control; },
/* harmony export */   "FileLayerLoad": function() { return /* binding */ FileLayerLoad; }
/* harmony export */ });
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! leaflet */ "leaflet");
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(leaflet__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _fileloader__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./fileloader */ "./ts/fileloader.ts");


class FileLayerLoad extends (leaflet__WEBPACK_IMPORTED_MODULE_0___default().Control) {
  constructor(options) {
    super(options);
    this.options = {
      title: 'Load local file (GPX, KML, GeoJSON)',
      position: 'topleft',
      fitBounds: true,
      layerOptions: {},
      addToMap: true,
      fileSizeLimit: 1024,
      formats: ['gpx', 'kml', 'json', 'geojson']
    };
    leaflet__WEBPACK_IMPORTED_MODULE_0___default().Util.setOptions(this, options);
    this.loader = null;
  }
  onAdd(map) {
    const control = this;
    this.loader = _fileloader__WEBPACK_IMPORTED_MODULE_1__.FileLayer.fileLoader(map, this.options);
    if (this.loader) {
      this.loader.on('data:loaded', function (e) {
        // Fit bounds after loading
        if (control.options.fitBounds) {
          window.setTimeout(function () {
            map.fitBounds(e.layer.getBounds());
          }, 500);
        }
      }, this);
    }
    // Initialize Drag-and-drop
    this._initDragAndDrop(map);
    // Create the control icon
    const controlIcon = this._createIcon();
    // Add control to the map container
    const container = map.getContainer();
    container.appendChild(controlIcon);
    // Return the control icon element
    return controlIcon;
  }
  //Add ICON
  _createIcon() {
    const thisLoader = this.loader;
    // Create a button, and bind click on hidden file input
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
    const fileInput = leaflet__WEBPACK_IMPORTED_MODULE_0___default().DomUtil.create('input', 'hidden', container);
    fileInput.type = 'file';
    fileInput.multiple = true;
    if (!this.options.formats) {
      fileInput.accept = '.gpx,.kml,.json,.geojson';
    } else {
      fileInput.accept = this.options.formats.join(',');
    }
    fileInput.style.display = 'none';
    // Load on file change
    if (fileInput) {
      fileInput.addEventListener('change', function () {
        if (thisLoader) {
          if (this.files) {
            thisLoader.loadMultiple(this.files);
          }
        }
        // reset so that the user can upload the same file again if they want to
        this.value = '';
      }, false);
    }
    leaflet__WEBPACK_IMPORTED_MODULE_0___default().DomEvent.disableClickPropagation(container);
    leaflet__WEBPACK_IMPORTED_MODULE_0___default().DomEvent.on(link, 'click', function (e) {
      fileInput.click();
      e.preventDefault();
    });
    return container;
  }
  _initDragAndDrop(map) {
    let callbackName;
    let thisLoader = this.loader;
    let ext = this.options.formats;
    //Use getContainer() instead of the old _container method
    let dropbox = map.getContainer();
    let callbacks = {
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
        if (thisLoader) {
          const files = e.dataTransfer.files;
          //Set the default ext value
          //const ext = '.gpx,.kml,.json,.geojson'; 
          //const ext = this.options.formats 
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = file.name;
            const fileNameParts = fileName.split('.');
            const fileExt = fileNameParts[fileNameParts.length - 1];
            // 检查文件扩展名是否符合要求
            if (ext.includes(fileExt.toLowerCase())) {
              thisLoader.loadMultiple(files);
            } else {
              throw new Error(`Unsupported file type (${ext})`);
            }
          }
          map.scrollWheelZoom.enable();
        }
        //thisLoader.loadMultiple(e.dataTransfer.files);
        map.scrollWheelZoom.enable();
      }
    };
    for (callbackName in callbacks) {
      if (callbacks.hasOwnProperty(callbackName)) {
        dropbox.addEventListener(callbackName, callbacks[callbackName], false);
      }
    }
  }
  //更改原_initContainer
  _appendControlStyles(container) {
    let fileControlStyleSheet = document.createElement('style');
    fileControlStyleSheet.setAttribute('type', 'text/css');
    fileControlStyleSheet.id = 'browser-file-css';
    fileControlStyleSheet.innerHTML += " .leaflet-control-filelayer { display: flex; } .leaflet-control-filelayer a { background: #fff url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAoklEQVQ4T2NkoBAwUqifAWyAhoq523/Gf5UohjEyvr5561QYIQvABqirmf38z/Df5tat06dhGtTVzUIZ/jOEEjIEYoCq6f6bt087otsGNWQVDlf8vnnrFBteA/A5X13N7P/NW6cYRw0YPGGgZvb7P8N/K+SERCgFqquZgdIBKzga1dTMAhj//89nYGR0IKQRJs/475/jjTtnDlAnMxFrKzZ1ALrzaRGE3tGmAAAAAElFTkSuQmCC') no-repeat 5px; background-size: 16px 16px; display: block; border-radius: 2px; }";
    fileControlStyleSheet.innerHTML += ' .leaflet-control-filelayer a.leaflet-control-filelayer { background-position: center; }';
    container.appendChild(fileControlStyleSheet);
  }
}
const Control = {
  //FileLayerLoad: FileLayerLoad,
  fileLayerLoad: function (options) {
    return new FileLayerLoad(options);
  }
};


/***/ }),

/***/ "./ts/fileloader.ts":
/*!**************************!*\
  !*** ./ts/fileloader.ts ***!
  \**************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FileLayer": function() { return /* binding */ FileLayer; },
/* harmony export */   "FileLoader": function() { return /* binding */ FileLoader; }
/* harmony export */ });
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! leaflet */ "leaflet");
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(leaflet__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var togeojson__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! togeojson */ "togeojson");
/* harmony import */ var togeojson__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(togeojson__WEBPACK_IMPORTED_MODULE_1__);


class FileLoader extends (leaflet__WEBPACK_IMPORTED_MODULE_0___default().Layer) {
  constructor(map, options) {
    super(options);
    this.options = {
      layer: (leaflet__WEBPACK_IMPORTED_MODULE_0___default().geoJSON),
      layerOptions: {},
      fileSizeLimit: 1024,
      addToMap: true
    };
    this._map = map;
    leaflet__WEBPACK_IMPORTED_MODULE_0___default().Util.setOptions(this, options);
    this._parsers = {
      geojson: this._loadGeoJSON.bind(this),
      json: this._loadGeoJSON.bind(this),
      gpx: (content, format) => this._convertToGeoJSON(content, format),
      kml: (content, format) => this._convertToGeoJSON(content, format)
    };
  }
  getFileExtension(file) {
    let fileName = '';
    if (typeof file === 'string') {
      fileName = file;
    } else {
      fileName = file.name;
    }
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex !== -1 && dotIndex < fileName.length - 1) {
      return fileName.substring(dotIndex + 1).toLowerCase();
    }
    return '';
  }
  load(file, ext) {
    // Check file is defined
    if (this._isParameterMissing(file, 'file')) {
      return false;
    }
    // Check file size
    if (!this._isFileSizeOk(file.size)) {
      return false;
    }
    // Get parser for this data type
    const parser = this._getParser(file.name, ext);
    if (!parser) {
      return false;
    }
    // Read selected file using HTML5 File API
    const reader = new FileReader();
    reader.onload = leaflet__WEBPACK_IMPORTED_MODULE_0___default().Util.bind(e => {
      try {
        this.fire('data:loading', {
          filename: file.name,
          format: parser.ext
        });
        const layer = parser.processor.call(this, e.target.result, parser.ext);
        this.fire('data:loaded', {
          layer: layer,
          filename: file.name,
          format: parser.ext
        });
      } catch (err) {
        this.fire('data:error', {
          error: err
        });
      }
    }, this);
    // Testing trick: tests don't pass a real file,
    // but an object with file.testing set to true.
    // This object cannot be read by reader, just skip it.
    if (typeof file === 'object' && file.testing) {
      return reader;
    } else {
      reader.readAsText(file);
    }
    // We return this to ease testing
    return reader;
  }
  loadMultiple(files, ext) {
    let readers = [];
    if (files[0]) {
      //Convert to a real array。
      files = Array.prototype.slice.apply(files);
      while (files.length > 0) {
        //Removes the first element of the array and returns its value
        const file = files.shift();
        if (file) {
          readers.push(this.load(file, ext));
        }
      }
    }
    // return first reader (or false if no file),
    // which is also used for subsequent loadings
    return readers;
  }
  loadData(data, name, ext) {
    // Check required parameters
    if (this._isParameterMissing(data, 'data') || this._isParameterMissing(name, 'name')) {
      return;
    }
    // Check file size
    if (!this._isFileSizeOk(data.length)) {
      return;
    }
    // Get parser for this data type
    const parser = this._getParser(name, ext);
    if (!parser) {
      return;
    }
    // Process data
    try {
      this.fire('data:loading', {
        filename: name,
        format: parser.ext
      });
      const layer = parser.processor.call(this, data, parser.ext);
      this.fire('data:loaded', {
        layer: layer,
        filename: name,
        format: parser.ext
      });
    } catch (err) {
      this.fire('data:error', {
        error: err
      });
    }
  }
  _isParameterMissing(v, vname) {
    if (typeof v === 'undefined') {
      this.fire('data:error', {
        error: new Error(`Missing parameter:${vname}`)
      });
      return true;
    }
    return false;
  }
  _getParser(name, ext) {
    ext = ext || name.split('.').pop();
    const parser = this._parsers[ext];
    if (!parser) {
      this.fire('data:error', {
        error: new Error(`Unsupported file type (${ext})`)
      });
      return undefined;
    }
    return {
      processor: parser,
      ext: ext
    };
  }
  _isFileSizeOk(size) {
    //Converts a string to a floating point number
    let fileSize = parseFloat((size / 1024).toFixed(4));
    if (fileSize > this.options.fileSizeLimit) {
      this.fire('data:error', {
        error: new Error(`File size exceeds limit (${fileSize} > ${this.options.fileSizeLimit} 'kb)`)
      });
      return false;
    }
    return true;
  }
  _loadGeoJSON(content) {
    if (typeof content === 'string') {
      content = JSON.parse(content);
    }
    const layer = this.options.layer(content, this.options.layerOptions);
    if (layer.getLayers().length === 0) {
      throw new Error('GeoJSON has no valid layers.');
    }
    if (this.options.addToMap) {
      layer.addTo(this._map);
    }
    return layer;
  }
  _convertToGeoJSON(content, format) {
    // Format is either 'gpx' or 'togeojson'
    if (typeof content === 'string') {
      content = new window.DOMParser().parseFromString(content, 'text/xml');
    }
    const geojson = togeojson__WEBPACK_IMPORTED_MODULE_1__[format](content);
    return this._loadGeoJSON(geojson);
  }
}
const FileLayer = {
  //FileLoader: FileLoader,
  fileLoader: function (map, options) {
    return new FileLoader(map, options);
  }
};


/***/ }),

/***/ "./ts/index.ts":
/*!*********************!*\
  !*** ./ts/index.ts ***!
  \*********************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Control": function() { return /* reexport safe */ _filelayerload__WEBPACK_IMPORTED_MODULE_0__.Control; },
/* harmony export */   "FileLayer": function() { return /* reexport safe */ _fileloader__WEBPACK_IMPORTED_MODULE_1__.FileLayer; },
/* harmony export */   "FileLayerLoad": function() { return /* reexport safe */ _filelayerload__WEBPACK_IMPORTED_MODULE_0__.FileLayerLoad; },
/* harmony export */   "FileLoader": function() { return /* reexport safe */ _fileloader__WEBPACK_IMPORTED_MODULE_1__.FileLoader; }
/* harmony export */ });
/* harmony import */ var _filelayerload__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./filelayerload */ "./ts/filelayerload.ts");
/* harmony import */ var _fileloader__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./fileloader */ "./ts/fileloader.ts");
/* module decorator */ module = __webpack_require__.hmd(module);


(function (factory, window) {
  // define an AMD module that relies on 'leaflet'
  if (typeof define === 'function' && __webpack_require__.amdO && window.toGeoJSON) {
    define(['leaflet'], function (L) {
      factory(L, window.toGeoJSON);
    });
  } else if ( true && module.exports) {
    // require('LIBRARY') returns a factory that requires window to
    // build a LIBRARY instance, we normalize how we use modules
    // that require this pattern but the window provided is a noop
    // if it's defined
    module.exports = function (root, L, toGeoJSON) {
      if (L === undefined) {
        if (typeof window !== 'undefined') {
          L = __webpack_require__(/*! leaflet */ "leaflet");
        } else {
          L = __webpack_require__(/*! leaflet */ "leaflet")(root);
        }
      }
      if (toGeoJSON === undefined) {
        if (typeof window !== 'undefined') {
          toGeoJSON = __webpack_require__(/*! togeojson */ "togeojson");
        } else {
          toGeoJSON = __webpack_require__(/*! togeojson */ "togeojson")(root);
        }
      }
      factory(L, toGeoJSON);
      return L;
    };
  } else if (typeof window !== 'undefined' && window.L && window.toGeoJSON) {
    factory(window.L, window.toGeoJSON);
  }
})(function fileLoaderFactory(L, toGeoJSON) {
  if (L && toGeoJSON) {
    // @ts-ignore
    L.FileLayer = {};
    // @ts-ignore
    L.FileLayer.FileLoader = _fileloader__WEBPACK_IMPORTED_MODULE_1__.FileLoader;
    // @ts-ignore
    L.FileLayer.fileLoader = _fileloader__WEBPACK_IMPORTED_MODULE_1__.FileLayer.fileLoader;
    // @ts-ignore
    L.Control.FileLayerLoad = _filelayerload__WEBPACK_IMPORTED_MODULE_0__.FileLayerLoad;
    // @ts-ignore
    L.Control.fileLayerLoad = _filelayerload__WEBPACK_IMPORTED_MODULE_0__.Control.fileLayerLoad;
  }
}, window);
/* // @ts-ignore
L.FileLayer = {};
// @ts-ignore
L.FileLayer.FileLoader = FileLoader;
// @ts-ignore
L.FileLayer.fileLoader = FileLayer.fileLoader;
// @ts-ignore
L.Control.FileLayerLoad = FileLayerLoad;
// @ts-ignore
L.Control.fileLayerLoad = Control.fileLayerLoad; */


/***/ }),

/***/ "leaflet":
/*!********************!*\
  !*** external "L" ***!
  \********************/
/***/ (function(module) {

module.exports = L;

/***/ }),

/***/ "togeojson":
/*!****************************!*\
  !*** external "toGeoJSON" ***!
  \****************************/
/***/ (function(module) {

module.exports = toGeoJSON;

/***/ })

/******/ 	});
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
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/amd options */
/******/ 	!function() {
/******/ 		__webpack_require__.amdO = {};
/******/ 	}();
/******/ 	
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
/******/ 	/* webpack/runtime/harmony module decorator */
/******/ 	!function() {
/******/ 		__webpack_require__.hmd = function(module) {
/******/ 			module = Object.create(module);
/******/ 			if (!module.children) module.children = [];
/******/ 			Object.defineProperty(module, 'exports', {
/******/ 				enumerable: true,
/******/ 				set: function() {
/******/ 					throw new Error('ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: ' + module.id);
/******/ 				}
/******/ 			});
/******/ 			return module;
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
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./ts/index.ts");
/******/ 	
/******/ })()
;
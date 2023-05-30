/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),
/* 2 */
/***/ (function() {

/******/(function () {
  // webpackBootstrap
  /******/
  "use strict";

  /******/
  var __webpack_modules__ = {
    /***/"./src-ts/filelayerload.ts":
    /*!*********************************!*\
      !*** ./src-ts/filelayerload.ts ***!
      \*********************************/
    /***/
    function (__unused_webpack_module, __webpack_exports__, __nested_webpack_require_350__) {
      __nested_webpack_require_350__.r(__webpack_exports__);
      /* harmony export */
      __nested_webpack_require_350__.d(__webpack_exports__, {
        /* harmony export */"Control": function () {
          return (/* binding */Control
          );
        },
        /* harmony export */"FileLayerLoad": function () {
          return (/* binding */FileLayerLoad
          );
        }
        /* harmony export */
      });
      /* harmony import */
      var leaflet__WEBPACK_IMPORTED_MODULE_0__ = __nested_webpack_require_350__( /*! leaflet */"leaflet");
      /* harmony import */
      var leaflet__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__nested_webpack_require_350__.n(leaflet__WEBPACK_IMPORTED_MODULE_0__);
      /* harmony import */
      var _fileloader__WEBPACK_IMPORTED_MODULE_1__ = __nested_webpack_require_350__( /*! ./fileloader */"./src-ts/fileloader.ts");
      class FileLayerLoad extends leaflet__WEBPACK_IMPORTED_MODULE_0___default().Control {
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

      /***/
    },

    /***/"./src-ts/fileloader.ts":
    /*!******************************!*\
      !*** ./src-ts/fileloader.ts ***!
      \******************************/
    /***/
    function (__unused_webpack_module, __webpack_exports__, __nested_webpack_require_8124__) {
      __nested_webpack_require_8124__.r(__webpack_exports__);
      /* harmony export */
      __nested_webpack_require_8124__.d(__webpack_exports__, {
        /* harmony export */"FileLayer": function () {
          return (/* binding */FileLayer
          );
        },
        /* harmony export */"FileLoader": function () {
          return (/* binding */FileLoader
          );
        }
        /* harmony export */
      });
      /* harmony import */
      var leaflet__WEBPACK_IMPORTED_MODULE_0__ = __nested_webpack_require_8124__( /*! leaflet */"leaflet");
      /* harmony import */
      var leaflet__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__nested_webpack_require_8124__.n(leaflet__WEBPACK_IMPORTED_MODULE_0__);
      /* harmony import */
      var togeojson__WEBPACK_IMPORTED_MODULE_1__ = __nested_webpack_require_8124__( /*! togeojson */"togeojson");
      /* harmony import */
      var togeojson__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__nested_webpack_require_8124__.n(togeojson__WEBPACK_IMPORTED_MODULE_1__);
      class FileLoader extends leaflet__WEBPACK_IMPORTED_MODULE_0___default().Layer {
        constructor(map, options) {
          super(options);
          this.options = {
            layer: leaflet__WEBPACK_IMPORTED_MODULE_0___default().geoJSON,
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

      /***/
    },

    /***/"leaflet":
    /*!********************!*\
      !*** external "L" ***!
      \********************/
    /***/
    function (module) {
      module.exports = L;

      /***/
    },

    /***/"togeojson":
    /*!****************************!*\
      !*** external "toGeoJSON" ***!
      \****************************/
    /***/
    function (module) {
      module.exports = toGeoJSON;

      /***/
    }

    /******/
  };
  /************************************************************************/
  /******/ // The module cache
  /******/
  var __webpack_module_cache__ = {};
  /******/
  /******/ // The require function
  /******/
  function __nested_webpack_require_16279__(moduleId) {
    /******/ // Check if module is in cache
    /******/var cachedModule = __webpack_module_cache__[moduleId];
    /******/
    if (cachedModule !== undefined) {
      /******/return cachedModule.exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/
    var module = __webpack_module_cache__[moduleId] = {
      /******/ // no module.id needed
      /******/ // no module.loaded needed
      /******/exports: {}
      /******/
    };
    /******/
    /******/ // Execute the module function
    /******/
    __webpack_modules__[moduleId](module, module.exports, __nested_webpack_require_16279__);
    /******/
    /******/ // Return the exports of the module
    /******/
    return module.exports;
    /******/
  }
  /******/
  /************************************************************************/
  /******/ /* webpack/runtime/compat get default export */
  /******/
  !function () {
    /******/ // getDefaultExport function for compatibility with non-harmony modules
    /******/__nested_webpack_require_16279__.n = function (module) {
      /******/var getter = module && module.__esModule ? /******/function () {
        return module['default'];
      } : /******/function () {
        return module;
      };
      /******/
      __nested_webpack_require_16279__.d(getter, {
        a: getter
      });
      /******/
      return getter;
      /******/
    };
    /******/
  }();
  /******/
  /******/ /* webpack/runtime/define property getters */
  /******/
  !function () {
    /******/ // define getter functions for harmony exports
    /******/__nested_webpack_require_16279__.d = function (exports, definition) {
      /******/for (var key in definition) {
        /******/if (__nested_webpack_require_16279__.o(definition, key) && !__nested_webpack_require_16279__.o(exports, key)) {
          /******/Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key]
          });
          /******/
        }
        /******/
      }
      /******/
    };
    /******/
  }();
  /******/
  /******/ /* webpack/runtime/hasOwnProperty shorthand */
  /******/
  !function () {
    /******/__nested_webpack_require_16279__.o = function (obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    };
    /******/
  }();
  /******/
  /******/ /* webpack/runtime/make namespace object */
  /******/
  !function () {
    /******/ // define __esModule on exports
    /******/__nested_webpack_require_16279__.r = function (exports) {
      /******/if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        /******/Object.defineProperty(exports, Symbol.toStringTag, {
          value: 'Module'
        });
        /******/
      }
      /******/
      Object.defineProperty(exports, '__esModule', {
        value: true
      });
      /******/
    };
    /******/
  }();
  /******/
  /************************************************************************/
  var __webpack_exports__ = {};
  // This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
  !function () {
    /*!*************************!*\
      !*** ./src-ts/index.ts ***!
      \*************************/
    __nested_webpack_require_16279__.r(__webpack_exports__);
    /* harmony import */
    var leaflet__WEBPACK_IMPORTED_MODULE_0__ = __nested_webpack_require_16279__( /*! leaflet */"leaflet");
    /* harmony import */
    var leaflet__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__nested_webpack_require_16279__.n(leaflet__WEBPACK_IMPORTED_MODULE_0__);
    /* harmony import */
    var _filelayerload__WEBPACK_IMPORTED_MODULE_1__ = __nested_webpack_require_16279__( /*! ./filelayerload */"./src-ts/filelayerload.ts");
    /* harmony import */
    var _fileloader__WEBPACK_IMPORTED_MODULE_2__ = __nested_webpack_require_16279__( /*! ./fileloader */"./src-ts/fileloader.ts");

    //import './filelayerload';
    //import './fileloader';
    //import { fileLoader, LayerOptions, ControlOptions, fileLayerLoad } from './interfaces'
    //import './interfaces'
    // @ts-ignore
    leaflet__WEBPACK_IMPORTED_MODULE_0___default().FileLayer = {};
    // @ts-ignore
    leaflet__WEBPACK_IMPORTED_MODULE_0___default().FileLayer.FileLoader = _fileloader__WEBPACK_IMPORTED_MODULE_2__.FileLoader;
    // @ts-ignore
    leaflet__WEBPACK_IMPORTED_MODULE_0___default().FileLayer.fileLoader = _fileloader__WEBPACK_IMPORTED_MODULE_2__.FileLayer.fileLoader;
    // @ts-ignore
    leaflet__WEBPACK_IMPORTED_MODULE_0___default().Control.FileLayerLoad = _filelayerload__WEBPACK_IMPORTED_MODULE_1__.FileLayerLoad;
    // @ts-ignore
    leaflet__WEBPACK_IMPORTED_MODULE_0___default().Control.fileLayerLoad = _filelayerload__WEBPACK_IMPORTED_MODULE_1__.Control.fileLayerLoad;
  }();
  /******/
})();

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
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
!function() {
"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _src_css_style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _leaflet_filelayer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var _leaflet_filelayer__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_leaflet_filelayer__WEBPACK_IMPORTED_MODULE_1__);

//import L from 'leaflet';

//import { filelayer } from './leaflet.filelayer';


/* // @ts-ignore
L.FileLayer = filelayer.FileLayer;
// @ts-ignore
//L.FileLayer.fileLoader =filelayer.FileLayer.fileLoader
// @ts-ignore
L.Control.FileLayerLoad = filelayer.Control.FileLayerLoad;
// @ts-ignore
L.Control.fileLayerLoad = filelayer.Control.fileLayerLoad; */

/* L.FileLayer = {};
L.FileLayer.FileLoader = filelayer.FileLoader;
L.FileLayer.fileLoader = filelayer.FileLayer.fileLoader

L.Control.FileLayerLoad = filelayer.FileLayerLoad;
L.Control.fileLayerLoad = filelayer.Control.fileLayerLoad;
 */
}();
/******/ })()
;
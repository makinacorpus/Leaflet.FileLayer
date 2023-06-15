import * as L from 'leaflet'
import { FileLayerLoad, Control } from './filelayerload';
import { FileLoader, FileLayer } from './fileloader';

//import 'require'
declare const define: any;
declare global {
  interface Window {
    L: typeof import('leaflet');
    toGeoJSON: typeof import('togeojson');
  }
}
(function (factory: Function, window: Window) {
  // define an AMD module that relies on 'leaflet'
  if (typeof define === 'function' && define.amd && window.toGeoJSON) {
    define(['leaflet'], function (L: typeof import('leaflet')) {
      factory(L, window.toGeoJSON);
    });
  } else if (typeof module === 'object' && module.exports) {
    // require('LIBRARY') returns a factory that requires window to
    // build a LIBRARY instance, we normalize how we use modules
    // that require this pattern but the window provided is a noop
    // if it's defined
    module.exports = function (root: any, L: typeof import('leaflet'), toGeoJSON: typeof import('togeojson')) {
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
  } else if (typeof window !== 'undefined' && window.L && window.toGeoJSON) {
    factory(window.L, window.toGeoJSON);
  }
})(function fileLoaderFactory(L: typeof import('leaflet'), toGeoJSON: typeof import('togeojson')) {
  if (L && toGeoJSON) {
    // @ts-ignore
    L.FileLayer = {};
    // @ts-ignore
    L.FileLayer.FileLoader = FileLoader;
    // @ts-ignore
    L.FileLayer.fileLoader = FileLayer.fileLoader;
    // @ts-ignore
    L.Control.FileLayerLoad = FileLayerLoad;
    // @ts-ignore
    L.Control.fileLayerLoad = Control.fileLayerLoad;
  }
}, window);

export { FileLayerLoad, Control, FileLoader, FileLayer };


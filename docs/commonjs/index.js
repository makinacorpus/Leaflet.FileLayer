'use strict';

var L = require('leaflet');
var leafletFileLayer = require('../../src/leaflet.filelayer.js');
var osm;
var myMap;
var style;

L.Util.FileLoader = leafletFileLayer.fileLoader;
L.Util.fileLoader = function (map, options) {
    return new L.Util.FileLoader(map, options);
};

L.Control.FileLayerLoad = leafletFileLayer.fileLoaderController;
L.Control.fileLayerLoad = function (options) {
    return new window.L.Control.FileLayerLoad(options);
};

osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; 2013 OpenStreetMap contributors'
});
myMap = L.map('map', {
    center: [0, 0],
    zoom: 2
}).addLayer(osm);
style = {
    color: 'red',
    opacity: 1.0,
    fillOpacity: 1.0,
    weight: 2,
    clickable: false
};

L.Control.FileLayerLoad.LABEL = '<img class="icon" src="../folder.svg" alt="file icon"/>';
L.Control.fileLayerLoad({
    fitBounds: true,
    layerOptions: {
        style: style,
        pointToLayer: function (data, latlng) {
            return L.circleMarker(
              latlng,
              { style: style }
            );
        }
    }
}).addTo(myMap);

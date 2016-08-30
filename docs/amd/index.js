(function (window) {
    'use strict';
    var requirejs = window.requirejs;

    requirejs.config({
        baseUrl: '/',
        paths: {
            leaflet: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/leaflet'
        }
    });

    requirejs([
        'leaflet',
        '../../src/leaflet.filelayer.js'
    ],
    function (L) {
        var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; 2013 OpenStreetMap contributors'
        });
        var map = L.map('map', {
            center: [0, 0],
            zoom: 2
        }).addLayer(osm);
        var style = {
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
        }).addTo(map);
    });
}(window));

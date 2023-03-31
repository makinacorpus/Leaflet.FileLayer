
import '../node_modules/leaflet/dist/leaflet.css'
import '../src/svg/folder.svg'
import $ from "jquery";
window.$ =$;
window.$ ='jquery'
import L from '../node_modules/leaflet/dist/leaflet.js';
window.L =L;
//This code is needed to properly load the images in the Leaflet CSS 
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
(function (window) {
  'use strict';

  function initMap() {
      var control;
      var L = window.L;
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
      L.Control.FileLayerLoad.LABEL = '<img class="icon" src="./svg/folder.svg" alt="file icon"/>';
      control = L.Control.fileLayerLoad({
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
      });
      control.addTo(map);
      control.loader.on('data:loaded', function (e) {
          var layer = e.layer;
          console.log(layer);
      });
  }

  window.addEventListener('load', function () {
      initMap();
  });
}(window));
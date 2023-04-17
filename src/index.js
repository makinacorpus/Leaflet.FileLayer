import '../src/css/style.css';

var map = L.map('map').setView([51.505, 1], 6);
L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);
L.circle([51.505, 1], 500000, {
  color: 'red',
  fillColor: '#f03',
  fillOpacity: 0.5,
}).addTo(map);
L.circle([55, 5], 50000, {
  color: 'green',
  fillColor: 'darkgreen',
  fillOpacity: 0.8,
}).addTo(map);

var style = {
  color: 'red',
  opacity: 1.0,
  fillOpacity: 1.0,
  weight: 2,
  clickable: false,
};
//var browserPrint = L.browserPrint(map, { debug: false, cancelWithEsc: true });
//L.Control.FileLayerLoad.LABEL = '<img class="icon" src="./assets/images/folder.svg" alt="file icon"/>';
var control = L.Control.fileLayerLoad({
  fitBounds: true,
  layerOptions: {
    style: style,
    pointToLayer: function (data, latlng) {
      return L.circleMarker(latlng, { style: style });
    },
  },
});
control.addTo(map);
control.loader.on('data:loaded', function (e) {
  var layer = e.layer;
  console.log(layer);
});

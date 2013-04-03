Leaflet.FileLayer
=================

Loads local files (GeoJSON, GPX) into the map using the HTML5 File API.

* A simple map control
* The user can browse a file locally
* It is read locally (``FileReader``) and converted to GeoJSON
* And loaded as a layer eventually!

For GPX files, it currently depends on [Pavel Shramov's GPX.js](https://github.com/shramov/leaflet-plugins/blob/d74d67/layer/vector/GPX.js).

Usage
-----

```
    var map = L.map('map').fitWorld();
    ...
    L.Control.fileLayerLoad({
        layerOptions: {style: {color:'red'}}
    }).addTo(map);
```

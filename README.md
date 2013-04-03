Leaflet.FileLayer
=================

Loads local files (GeoJSON, GPX, KML) into the map using the HTML5 File API, **without server call** !

* A simple map control
* The user can browse a file locally
* It is read locally (``FileReader``) and converted to GeoJSON
* And loaded as a layer eventually!

For GPX and KML files, it currently depends on [Tom MacWright's togeojson.js](https://github.com/tmcw/togeojson).

Check out the [demo](http://makinacorpus.github.com/Leaflet.FileLayer/)

Usage
-----

```
    var map = L.map('map').fitWorld();
    ...
    L.Control.fileLayerLoad({
        layerOptions: {style: {color:'red'}}
    }).addTo(map);
```

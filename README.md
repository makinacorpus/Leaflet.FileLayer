Leaflet.FileLayer
=================

Loads local files (GeoJSON, GPX) into the map using the HTML5 File API.

On the button click, the user can browse a file locally, and it is loaded as a layer.

Usage
-----

```
    var map = L.map('map').fitWorld();
    ...
    L.Control.FileLayerLoad({
        layerOptions: {style: {color:'red'}}
    }).addTo(map);
```

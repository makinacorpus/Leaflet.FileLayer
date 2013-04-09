Leaflet.FileLayer
=================

Loads local files (GeoJSON, GPX, KML) into the map using the [HTML5 FileReader API](http://caniuse.com/filereader), **without server call** !

* A simple map control
* The user can browse a file locally
* It is read locally (``FileReader``) and converted to GeoJSON
* And loaded as a layer eventually!

Check out the [demo](http://makinacorpus.github.com/Leaflet.FileLayer/) !

For GPX and KML files, it currently depends on [Tom MacWright's togeojson.js](https://github.com/tmcw/togeojson).

Usage
-----

```
    var map = L.map('map').fitWorld();
    ...
    L.Control.fileLayerLoad({
        layerOptions: {style: {color:'red'}}
    }).addTo(map);
```

Events:

```
    var control = L.Control.fileLayerLoad();
    control.loader.on('data:loaded', function (e) {
        // Add to map layer switcher
        layerswitcher.addOverlay(e.layer, e.filename);
    });
```


Authors
-------

[![Makina Corpus](http://depot.makina-corpus.org/public/logo.gif)](http://makinacorpus.com)

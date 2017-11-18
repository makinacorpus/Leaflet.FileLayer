Leaflet.FileLayer
=================

Loads local files (GeoJSON, JSON, GPX, KML) into the map using the [HTML5 FileReader API](http://caniuse.com/filereader), **without server call** !

* A simple map control
* The user can browse a file locally
* It is read locally (``FileReader``) and converted to GeoJSON
* And loaded as a layer eventually!

Check out the [demo](http://makinacorpus.github.com/Leaflet.FileLayer/) !

For GPX and KML files, it currently depends on [Tom MacWright's togeojson.js](https://github.com/tmcw/togeojson).

[![Build Status](https://travis-ci.org/makinacorpus/Leaflet.FileLayer.png?branch=master)](https://travis-ci.org/makinacorpus/Leaflet.FileLayer)

Install
-----
In order to use this plugin in your app you can either:
* install it via your favorite package manager:
    * `npm i leaflet-filelayer`
    * `bower install git://github.com:makinacorpus/Leaflet.FileLayer.git`
* download the repository and import the `leaflet.filelayer.js` file in your app.

Dependencies and compatibilities
-----
In order to use this plugin, you need to have both `leaflet` and `togeojson` installed.
If you're using Leaflet < 1, you need to use the version `0.6.0` of this plugin. After that, Leaflet > 1 is required.

Usage
-----

```javascript
    var map = L.map('map').fitWorld();
    ...
    L.Control.fileLayerLoad({
        // Allows you to use a customized version of L.geoJson.
        // For example if you are using the Proj4Leaflet leaflet plugin,
        // you can pass L.Proj.geoJson and load the files into the
        // L.Proj.GeoJson instead of the L.geoJson.
        layer: L.geoJson,
        // See http://leafletjs.com/reference.html#geojson-options
        layerOptions: {style: {color:'red'}},
        // Add to map after loading (default: true) ?
        addToMap: true,
        // File size limit in kb (default: 1024) ?
        fileSizeLimit: 1024,
        // Restrict accepted file formats (default: .geojson, .json, .kml, and .gpx) ?
        formats: [
            '.geojson',
            '.kml'
        ]
    }).addTo(map);
```

Events:

* **data:loaded** (event)

```javascript
    var control = L.Control.fileLayerLoad();
    control.loader.on('data:loaded', function (event) {
        // event.layer gives you access to the layers you just uploaded!

        // Add to map layer switcher
        layerswitcher.addOverlay(event.layer, event.filename);
    });
```

* **data:error** (error)
```javascript
    var control = L.Control.fileLayerLoad();
    control.loader.on('data:error', function (error) {
        // Do something usefull with the error!
        console,error(error);
    });
```

Changelog
---------

### 1.2.0 ###

* Leaflet 1.2.0 compatibility
* Accept `json` file as input (thanks kkdd)

### 1.1.0 ###

* Leaflet 1.1.0 compatibility (thanks @thorinii)

### 0.6.0 ###

* Better plugin packaging and dependencies
* Adding bower support (thanks @george-silva)
* Adding support for custom geoJson layers (thanks @MuellerMatthew)
* Treating json files as geoJson (thanks @Jmuccigr)

### 0.5.0 ###

* Load multiple files (thanks @jens-duttke)

### 0.4.0 ###

* Support whitelist for file formats (thanks CJ Cenizal)

### 0.3.0 ###

* Add `data:error` event (thanks @joeybaker)
* Fix multiple uploads (thanks @joeybaker)
* Add `addToMap` option (thanks @joeybaker)

(* Did not release version 0.2 to prevent conflicts with Joey's fork. *)

### 0.1.0 ###

* Initial working version

Authors
-------

[![Makina Corpus](http://depot.makina-corpus.org/public/logo.gif)](http://makinacorpus.com)

Contributions

* Mathieu Leplatre
* Joey Baker http://byjoeybaker.com
* CJ Cenizal
* Jens-duttke
* Jmuccigr
* Matthew Mueller
* George Silva
* Simon Bats
* Opoto
* Lachlan Phillips
* kkdd

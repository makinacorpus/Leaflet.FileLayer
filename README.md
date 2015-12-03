Leaflet.FileLayer
=================

Loads local files (GeoJSON, GPX, KML) into the map using the [HTML5 FileReader API](http://caniuse.com/filereader), **without server call** !

* A simple map control
* The user can browse a file locally
* It is read locally (``FileReader``) and converted to GeoJSON
* And loaded as a layer eventually!

Check out the [demo](http://makinacorpus.github.com/Leaflet.FileLayer/) !

For GPX and KML files, it currently depends on [Tom MacWright's togeojson.js](https://github.com/tmcw/togeojson).

[![Build Status](https://travis-ci.org/makinacorpus/Leaflet.FileLayer.png?branch=gh-pages)](https://travis-ci.org/makinacorpus/Leaflet.FileLayer)

Usage
-----

```javascript
    var map = L.map('map').fitWorld();
    ...
    L.Control.fileLayerLoad({
        // See http://leafletjs.com/reference.html#geojson-options
        layerOptions: {style: {color:'red'}},
        // Add to map after loading (default: true) ?
        addToMap: true,
        // File size limit in kb (default: 1024) ?
        fileSizeLimit: 1024,
        // Restrict accepted file formats (default: .geojson, .kml, and .gpx) ?
        formats: [
            '.geojson',
            '.kml'
        ]
    }).addTo(map);
```

Events:

```javascript
    var control = L.Control.fileLayerLoad();
    control.loader.on('data:loaded', function (e) {
        // Add to map layer switcher
        layerswitcher.addOverlay(e.layer, e.filename);
    });
```

* **data:error** (error)

#ADDED SOME NEW OPTIONS <br />

**1) layer**: you can pass tot the FileLoader your personal Layer for example a L.FeatureGroup or a L.LayerGroup
                 where are already stored some information. <br />
**2) popupTable**:   if true all the information of the popup are pushed on a html table for a immediate better view,if false is 
                 saved on a json object and you can use your specific view with the onEachFeature function of Leaflet. <br />
                                
**SUPPLEMENT FOR CSV** <br />
**3) headers**:     if true the first line of a csv file has headers (if false launch exception) <br />
**4) latitudeColumn**: the default column name for the latitude coordinates, you must specify what column has the vaule of the latitude <br />
**5) longitudeColumn**: the default column name for the longitude coordinates, you must specify what column has the value of the longitude <br />
**6) titlesToInspect**: can be a array or a object, here you can set only the columns you need to put in the generate geoJson 
                    i recommended to avoid if possible works only for csv or oher comma separated text file. <br />

**SUPPLEMENT FOR XML** <br />
**7) xmlRooTag**: set the Json path to the collection of json object to inspect, you can many subRoot  <br /> 
              e.g. '...,subRoot2:xxx,subRoot3:yyy' or if you prefer set a Array e.g. ["Root","Row"]    <br />
              works only for XML .
**SUPPLEMENT FOR RDF/XML (EXPERIMENTAL)** <br />
**8) rdfRootTag**: set the Json path to the collection of json object to inspect <br />
**9) rdfLink**: if you want merge the json object created from a rdf file you can specify the property of a link... <br />
**10) rdfAbout**: the value for the property rdf:about of a rdf file... <br />
**11) rdfAboutLink**: the value for the property rdf:about for linking different classes of triple... <br />

**OTHER**  <br /> 
**12) titleForSearch**:  if you want mark some information like the title/id of the json object.  <br />
**13) validateGeoJson**: if you want to validate the geojson with a ajax call at a Web-Service (Note required ajax call).

# WORK WITH CSV FILE
For CSV files, it currently depends on [Mholt papaparse.js](https://github.com/mholt), that made us the courtesy to 
let us use it in this project. <br />
If you really hate to use the parser csv of other people you can convert your CSV file into a file GeoJSON and use the
 '_loadGeoJSON' method. <br />
```javascript
L.Control.fileLayerLoad({
    latitudeColumn: 'lat', //the field name for the latitude coordinates 
    longitudeColumn: 'lng',//the field name for the longitude coordinates 
    titlesToInspect: ['name','lat','lng'], //if you want get only some specific field from csv
    popupTable:true,
            layerOptions: {
                pointToLayer: function (feature, latlng) {
                    return new L.marker(latlng);
                },
                onEachFeature:function(feature, layer){
                        var popupContent = '';
                        if (feature.properties && feature.properties.popupContent) {
                            popupContent += feature.properties.popupContent;
                        }
                        layer.bindPopup(popupContent);
                }
            },
        }).addTo(map);
```
# WORK WITH XML FILE  <br />
The most common use case is with the response XML from some API like Google Maps,with all the information on some
locations, the only thing you need are two fields related to latitude and longitude. <br />

```javascript
L.Control.fileLayerLoad({
    latitudeColumn: 'Latitude',   //the  field name for the latitude 
    longitudeColumn: 'Longitude', //the field name for the longitude
    titlesToInspect: ['Name','Latitude','Longitude'], //if you want get only some specific field from xml
    //be sure to point to the path of the element contains the info you need
    //in this case the xml file you loaded probably has more information than you need
    //so you can filter with some path e.g. xml = xml[Root][Row];
    xmlRooTag: ["Root","Row"], //is okay use your personal object e.g. {root:"Root", anyName: "Row"}
    popupTable:true,
            layerOptions: {
                pointToLayer: function (feature, latlng) {
                    return new L.marker(latlng);
                },
                onEachFeature:function(feature, layer){
                        var popupContent = '';
                        if (feature.properties && feature.properties.popupContent) {
                            popupContent += feature.properties.popupContent;
                        }
                        layer.bindPopup(popupContent);
                }
            },
        }).addTo(map);
```
Here a result image of the popup content of the markers:
![testo alt](https://github.com/p4535992/repositoryForTest/blob/master/testWitSources/fileForTest/Immagine%202%20xml%20test.png "Example loading of a rdf")
<br />

# WORK WITH GTFS (Experimental)
Ty to [kaezarrex](https://github.com/kaezarrex), we can draw some gtfs file zip on the leaflet Map, for more information read 
the this [blog](http://bl.ocks.org/kaezarrex/7a100491d541031b6c24)



# WORK WITH RDF/XML FILE (Experimental) <br />
This is a little function, i don't know if anyone can found useful for something, usually is best use ajax request on
the repository of triple, but once the code is written let's share it. <br />
Anyway, You can use a RDF/XML with all the information on some locations, the only thing you need are two fields
related to latitude and longitude. <br />
```javascript
L.Control.fileLayerLoad({
    latitudeColumn: 'geo:lat',
    longitudeColumn: 'geo:long',
    rdfLink: ['gr:hasPOS'],
    rdfAboutLink: 'rdf:about',
    rdfRootTag: {root:"rdf:RDF",subRoot:"rdf:Description"},
    popupTable:true,
            layerOptions: {
                pointToLayer: function (feature, latlng) {
                    return new L.marker(latlng);
                },
                onEachFeature:function(feature, layer){
                    try {
                        var popupContent = '';
                        if (feature.properties && feature.properties.popupContent) {
                            popupContent += feature.properties.popupContent;
                        }
                        layer.bindPopup(popupContent);
                    }catch(e){alert(e.message);}
                }
            },
        }).addTo(map);
```
you can have multiple classes on the rdf , so you can try to link to each other, for that you can do a merge of 
the json objects generated , where the specific property link 'rdfLink' and 'rdfAboutLink' are present. <br />
Example: <br />
```javascript
//set options rdfAboutLink = 'rdf:id' and rdfLink:[hasID].
L.Control.fileLayerLoad({
    latitudeColumn: 'geo:lat',    //the  field name for the latitude 
    longitudeColumn: 'geo:long',  //the field name for the longitude
    rdfLink: ['geo:hasID'],       //you can specify the property of a link and from that you can start the search of relations
    rdfAboutLink: 'rdf:id',       //the value for the property 'rdfLink' to search to the values of the 'rdfaboutLink'
            layerOptions: {
                pointToLayer: function (feature, latlng) {
                    return new L.marker(latlng);
                },
                onEachFeature:function(feature, layer){
                    try {
                        var popupContent = '';
                        if (feature.properties && feature.properties.popupContent) {
                            popupContent += feature.properties.popupContent;
                        }
                        layer.bindPopup(popupContent);
                    }catch(e){alert(e.message);}
                }
            },
        }).addTo(map);
```
```javascript
//....................................................................
//What happened ?
json1 = {name:New York, population:10000000, isACapital:true,geo:hasID:233}
json2  = {rdf:id:233,info:'Great city'}
//The question is "for each json object with hasPOS property exists a jsonObject with 'rdf:id' with the same value?"
//if true make a merge of the info, because there are all info for the same location. These two json are merged and //the result is:
json3 = {name:New York, population:10000000, isACapital:true,geo:hasID:233,rdf:id:233,info:'Great city'}
```

Here a result image of the popup content of the markers:
![testo alt](https://github.com/p4535992/repositoryForTest/blob/master/testWitSources/fileForTest/Immagine%201.png "Example loading of a rdf")
<br />
Changelog
---------

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

* Joey Baker http://byjoeybaker.com
* Mholt https://github.com/mholt
* Kaezarrex  https://github.com/kaezarrex
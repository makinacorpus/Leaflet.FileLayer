var assert = chai.assert;
var _VALID_GEOJSON = {
    type: "FeatureCollection",
    features: [
        { type: "Point", coordinates: [0, 0] }
    ]
};
var _VALID_KML = '<kml><Placemark><Point><coordinates>0,0,0</coordinates></Point></Placemark></kml>';
console.log(sinon);

describe('L.Control.FileLayerLoad', function() {

    var map;

    beforeEach(function() {
        map = L.map('map').fitWorld();
    });

    afterEach(function() {
        map.remove();
    });

    describe('Initialization', function() {

        it("should listen to click once added.", function(done) {
            L.Control.fileLayerLoad().addTo(map);

            var fileinput = document.querySelector('input.hidden');
            var callback = sinon.spy();
            L.DomEvent.on(fileinput, 'click', callback);

            var button = document.querySelector('a.leaflet-control-filelayer');
            happen.click(button);
            assert.isTrue(callback.called);

            done();
        });

        it("should be able to load several files", function(done) {
            var control = L.Control.fileLayerLoad().addTo(map);

            var fileinput = document.querySelector('input.hidden');
            assert.isTrue(fileinput.multiple);

            done();
        });

    });


    describe('Map layers', function() {

        it("should add the layer to the map by default", function(done) {
            var control = L.Control.fileLayerLoad().addTo(map);

            var callback = sinon.spy();
            map.on('layeradd', callback);
            var reader = control.loader.load({name: 'name.geojson', testing: true});
            reader.onload({target: {result: _VALID_GEOJSON}});

            assert.isTrue(callback.called);
            done();
        });

        it("should not add the layer if `addToMap` is false", function(done) {
            var control = L.Control.fileLayerLoad({addToMap: false}).addTo(map);

            var callback = sinon.spy();
            map.on('layeradd', callback);

            var reader = control.loader.load({name: 'name.geojson', testing: true});
            reader.onload({target: {result: _VALID_GEOJSON}});

            assert.isFalse(callback.called);
            done();
        });


    });

});

describe('FileLoader', function() {

    var map,
        loader;

    before(function() {
        map = L.map('map').fitWorld();
        loader = new L.Util.FileLoader(map);
    });

    after(function() {
        map.remove();
    });

    describe('Load file', function() {

        it("should warn if format is not supported.", function(done) {
            var file = {name: 'name.csv', testing: true},
                callback = sinon.spy();
            loader.on('data:error', callback);
            loader.load(file);
            assert.isTrue(callback.calledOnce);
            done();
        });

        it("should fire data:loading and data:loaded", function(done) {
            var file = {name: 'name.geojson', testing: true};
            var loadingcb = sinon.spy(),
                loadedcb = sinon.spy();
            loader.on('data:loading', loadingcb);
            loader.on('data:loaded', loadedcb);
            var reader = loader.load(file);
            reader.onload({target: {result: _VALID_GEOJSON}});
            assert.isTrue(loadingcb.called);
            assert.isTrue(loadedcb.called);
            done();
        });

        it("should be able to load KML", function(done) {
            var file = {name: 'name.kml', testing: true};
            loader.on('data:loaded', function (e) {
                assert.equal(e.format, 'kml');
                assert.equal(e.filename, 'name.kml');
                assert.isTrue(e.layer instanceof L.GeoJSON);
                done();
            });
            var reader = loader.load(file);
            reader.onload({target: {result: _VALID_KML}});
        });

        it("should warn if size exceeds limit from option", function(done) {
            var file = {name: 'name.kml', size: 9999999, testing: true},
                callback = sinon.spy();
            loader.on('data:error', callback);
            loader.load(file);
            assert.isTrue(callback.calledOnce);
            done();
        });

        it("should warn if imported layer has no feature", function(done) {
            var file = {name: 'name.geojson', testing: true},
                callback = sinon.spy();
            loader.on('data:error', callback);
            var reader = loader.load(file);
            reader.onload({target: {result: {}}});
            assert.isTrue(callback.called);
            done();
        });
    });

    describe('Load data', function() {
        
        before(function() {
            loader.removeEventListener('data:loading');
            loader.removeEventListener('data:loaded');
        });
        
        it("should warn if format is not supported.", function(done) {
            var name = 'name.csv',
                data = '';
                callback = sinon.spy();
            loader.on('data:error', callback);
            loader.loadData(data, name);
            assert.isTrue(callback.calledOnce);
            done();
        });

        it("should fire data:loading and data:loaded", function(done) {
            var name = 'name.geojson',
                data = _VALID_GEOJSON;
            var loadingcb = sinon.spy(),
                loadedcb = sinon.spy();
            loader.on('data:loading', loadingcb);
            loader.on('data:loaded', loadedcb);
            var reader = loader.loadData(data, name);
            assert.isTrue(loadingcb.called);
            assert.isTrue(loadedcb.called);
            done();
        });

        it("should be able to load KML", function(done) {
            var name = 'name.kml',
                data = _VALID_KML;
            loader.on('data:loaded', function (e) {
                assert.equal(e.format, 'kml');
                assert.equal(e.filename, 'name.kml');
                assert.isTrue(e.layer instanceof L.GeoJSON);
                done();
            });
            loader.loadData(data, name);
        });

        it("should warn if size exceeds limit from option", function(done) {
            var name = 'name.kml',
                data  = '',
                callback = sinon.spy();
            for (var i = 0 ; i < 1030 ; i++) {
              data += '0';
            }
            loader.on('data:error', callback);
            loader.loadData(data, name);
            assert.isTrue(callback.calledOnce);
            done();
        });

        it("should warn if imported layer has no feature", function(done) {
            var name = 'name.geojson',
                data = {},
                callback = sinon.spy();
            loader.on('data:error', callback);
            loader.loadData(data, name);
            assert.isTrue(callback.called);
            done();
        });

    });


});

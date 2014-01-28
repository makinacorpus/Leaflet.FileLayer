var assert = chai.assert;

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
            map.on('mousemovesample', callback);
            L.DomEvent.on(fileinput, 'click', callback);

            var button = document.querySelector('a.leaflet-control-filelayer');
            happen.click(button);
            assert.isTrue(callback.called);

            done();
        });

    });

});

describe('FileLoader', function() {

    var map,
        loader;

    before(function() {
        map = L.map('map').fitWorld();
        loader = new FileLoader(map);
    });

    after(function() {
        map.remove();
    });

    describe('Load file', function() {

        it("should warn if format is not supported.", function(done) {
            var file = {name: 'name.csv'};
            var stub = sinon.stub(window, "alert", function() {});
            loader.load(file);
            assert.isTrue(stub.calledOnce);
            done();
        });

        it("should fire data:loading and data:loaded", function(done) {
            var file = {name: 'name.geojson'};
            var loadingcb = sinon.spy(),
                loadedcb = sinon.spy();
            loader.on('data:loading', loadingcb);
            loader.on('data:loaded', loadedcb);
            var reader = loader.load(file);
            reader.onload({target: {}});
            assert.isTrue(loadingcb.called);
            assert.isTrue(loadedcb.called);
            done();
        });

        it("should be able to load KML", function(done) {
            var file = {name: 'name.kml'};
            loader.on('data:loaded', function (e) {
                assert.equal(e.format, 'kml');
                assert.equal(e.filename, 'name.kml');
                assert.isTrue(e.layer instanceof L.GeoJSON);
                done();
            });
            var reader = loader.load(file);
            reader.onload({target: {result: '<kml>'}});
        });

    });

});

(function() {

    //zip.workerScriptsPath = './'

    var readEntry = function(entry, onend, onprogress) {
        entry.getData(new zip.TextWriter(), onend, onprogress);
    };

    var getEntries = function(file, callback) {
        zip.createReader(new zip.BlobReader(file), function(zipReader) {
            zipReader.getEntries(callback);
        }, onerror);
    };

    var mapEntries = function(entries, callbackMap) {
        var feedFiles = d3.map();
        var cbMap = d3.map(callbackMap);

        entries.forEach(function(entry) {
            feedFiles.set(entry.filename,  entry);
        });

        cbMap.forEach(function(filename, callback) {
            if (feedFiles.has(filename)) readEntry(feedFiles.get(filename), callback);
            else alert(filename + ' does not exist');
        });
    };

    window.parseGtfs = function(file, actions) {
        getEntries(file, function(entries) {
            mapEntries(entries, actions);
        });
    };

})();

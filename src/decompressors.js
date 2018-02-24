/*
* Decompression of gzipped files using ukyo's jsziptools.js (jz)
* Requires ukyo's jsziptools.js to be in global scope when decompressing gzipped files
* https://github.com/ukyo/jsziptools
* http://ukyo.github.io/jsziptools/jsziptools.js
*/
var gzip = (function () {
    return {
        decompress: function(arrayBuffer) {
            var hexarr = jz.gz.decompress(arrayBuffer);
            return _hextostring(hexarr);
        },
    };
    function _hextostring(hexarr){
        for (var w = '', i = 0, l = hexarr.length; i < l; i++) {
            w += String.fromCharCode(hexarr[i])
        }
        return decodeURIComponent(escape(w));
    }
})();

var DECOMPRESSORS = {
    gz: function (x) {return gzip.decompress(x);}
};

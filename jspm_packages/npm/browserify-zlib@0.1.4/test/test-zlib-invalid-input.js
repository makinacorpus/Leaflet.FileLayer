/* */ 
var tape = require('tape'),
    zlib = require('../src/index');
tape('non-strings', function(t) {
  var nonStringInputs = [1, true, {a: 1}, ['a']];
  t.plan(12);
  nonStringInputs.forEach(function(input) {
    t.doesNotThrow(function() {
      zlib.gunzip(input, function(err, buffer) {
        t.ok(err);
      });
    });
  });
});
tape('unzips', function(t) {
  var unzips = [zlib.Unzip(), zlib.Gunzip(), zlib.Inflate(), zlib.InflateRaw()];
  t.plan(4);
  unzips.forEach(function(uz, i) {
    uz.on('error', function(er) {
      t.ok(er);
    });
    uz.on('end', function(er) {
      throw new Error('end event should not be emitted ' + uz.constructor.name);
    });
    uz.write('this is not valid compressed data.');
  });
});

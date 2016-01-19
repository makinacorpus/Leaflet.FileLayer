/* */ 
(function(Buffer) {
  var tape = require('tape');
  var zlib = require('../src/index');
  var expect = 'blahblahblahblahblahblah';
  var opts = {
    level: 9,
    chunkSize: 1024
  };
  [['gzip', 'gunzip'], ['gzip', 'unzip'], ['deflate', 'inflate'], ['deflateRaw', 'inflateRaw']].forEach(function(method) {
    tape(method.join(' '), function(t) {
      t.plan(4);
      zlib[method[0]](expect, opts, function(err, result) {
        zlib[method[1]](result, opts, function(err, result) {
          t.deepEqual(result, new Buffer(expect), 'Should get original string after ' + method[0] + '/' + method[1] + ' with options.');
        });
      });
      zlib[method[0]](expect, function(err, result) {
        zlib[method[1]](result, function(err, result) {
          t.deepEqual(result, new Buffer(expect), 'Should get original string after ' + method[0] + '/' + method[1] + ' without options.');
        });
      });
      var result = zlib[method[0] + 'Sync'](expect, opts);
      result = zlib[method[1] + 'Sync'](result, opts);
      t.deepEqual(result, new Buffer(expect), 'Should get original string after ' + method[0] + '/' + method[1] + ' with options.');
      result = zlib[method[0] + 'Sync'](expect);
      result = zlib[method[1] + 'Sync'](result);
      t.deepEqual(result, new Buffer(expect), 'Should get original string after ' + method[0] + '/' + method[1] + ' without options.');
    });
  });
})(require('buffer').Buffer);

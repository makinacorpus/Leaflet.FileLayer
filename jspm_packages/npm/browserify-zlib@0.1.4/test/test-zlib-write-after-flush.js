/* */ 
var tape = require('tape');
var zlib = require('../src/index');
var fs = require('fs');
tape('write after flush', function(t) {
  t.plan(2);
  var gzip = zlib.createGzip();
  var gunz = zlib.createUnzip();
  gzip.pipe(gunz);
  var output = '';
  var input = 'A line of data\n';
  gunz.setEncoding('utf8');
  gunz.on('data', function(c) {
    output += c;
  });
  gunz.on('end', function() {
    t.equal(output, input);
    t.equal(gzip._flushFlag, zlib.Z_NO_FLUSH);
  });
  gzip.flush();
  write();
  function write() {
    gzip.write(input);
    gzip.end();
    gunz.read(0);
  }
});

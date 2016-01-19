/* */ 
(function(Buffer) {
  var tape = require('tape');
  var zlib = require('../src/index');
  tape('zero byte', function(t) {
    t.plan(2);
    var gz = zlib.Gzip();
    var emptyBuffer = new Buffer(0);
    var received = 0;
    gz.on('data', function(c) {
      received += c.length;
    });
    gz.on('end', function() {
      t.equal(received, 20);
    });
    gz.on('finish', function() {
      t.ok(true);
    });
    gz.write(emptyBuffer);
    gz.end();
  });
})(require('buffer').Buffer);

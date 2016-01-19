/* */ 
(function(Buffer) {
  var common = require('../common');
  var assert = require('assert');
  var zlib = require('zlib');
  (function() {
    var stream = zlib.createInflate();
    stream.on('error', common.mustCall(function(err) {
      assert(/Missing dictionary/.test(err.message));
    }));
    stream.write(Buffer([0x78, 0xBB, 0x04, 0x09, 0x01, 0xA5]));
  })();
  (function() {
    var stream = zlib.createInflate({dictionary: Buffer('fail')});
    stream.on('error', common.mustCall(function(err) {
      assert(/Bad dictionary/.test(err.message));
    }));
    stream.write(Buffer([0x78, 0xBB, 0x04, 0x09, 0x01, 0xA5]));
  })();
})(require('buffer').Buffer);

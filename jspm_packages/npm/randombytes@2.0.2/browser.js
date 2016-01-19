/* */ 
(function(Buffer, process) {
  'use strict';
  function oldBrowser() {
    throw new Error('secure random number generation not supported by this browser\nuse chrome, FireFox or Internet Explorer 11');
  }
  var crypto = global.crypto || global.msCrypto;
  if (crypto && crypto.getRandomValues) {
    module.exports = randomBytes;
  } else {
    module.exports = oldBrowser;
  }
  function randomBytes(size, cb) {
    if (size > 65536)
      throw new Error('requested too many random bytes');
    var rawBytes = new global.Uint8Array(size);
    crypto.getRandomValues(rawBytes);
    var bytes = new Buffer(rawBytes.buffer);
    if (typeof cb === 'function') {
      return process.nextTick(function() {
        cb(null, bytes);
      });
    }
    return bytes;
  }
})(require('buffer').Buffer, require('process'));

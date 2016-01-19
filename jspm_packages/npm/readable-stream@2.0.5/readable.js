/* */ 
var Stream = (function() {
  try {
    return require('st' + 'ream');
  } catch (_) {}
}());
exports = module.exports = require('./lib/_stream_readable');
exports.Stream = Stream || exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable');
exports.Duplex = require('./lib/_stream_duplex');
exports.Transform = require('./lib/_stream_transform');
exports.PassThrough = require('./lib/_stream_passthrough');

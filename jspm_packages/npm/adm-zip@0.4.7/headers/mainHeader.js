/* */ 
(function(Buffer) {
  var Utils = require('../util/index'),
      Constants = Utils.Constants;
  module.exports = function() {
    var _volumeEntries = 0,
        _totalEntries = 0,
        _size = 0,
        _offset = 0,
        _commentLength = 0;
    return {
      get diskEntries() {
        return _volumeEntries;
      },
      set diskEntries(val) {
        _volumeEntries = _totalEntries = val;
      },
      get totalEntries() {
        return _totalEntries;
      },
      set totalEntries(val) {
        _totalEntries = _volumeEntries = val;
      },
      get size() {
        return _size;
      },
      set size(val) {
        _size = val;
      },
      get offset() {
        return _offset;
      },
      set offset(val) {
        _offset = val;
      },
      get commentLength() {
        return _commentLength;
      },
      set commentLength(val) {
        _commentLength = val;
      },
      get mainHeaderSize() {
        return Constants.ENDHDR + _commentLength;
      },
      loadFromBinary: function(data) {
        if (data.length != Constants.ENDHDR || data.readUInt32LE(0) != Constants.ENDSIG)
          throw Utils.Errors.INVALID_END;
        _volumeEntries = data.readUInt16LE(Constants.ENDSUB);
        _totalEntries = data.readUInt16LE(Constants.ENDTOT);
        _size = data.readUInt32LE(Constants.ENDSIZ);
        _offset = data.readUInt32LE(Constants.ENDOFF);
        _commentLength = data.readUInt16LE(Constants.ENDCOM);
      },
      toBinary: function() {
        var b = new Buffer(Constants.ENDHDR + _commentLength);
        b.writeUInt32LE(Constants.ENDSIG, 0);
        b.writeUInt32LE(0, 4);
        b.writeUInt16LE(_volumeEntries, Constants.ENDSUB);
        b.writeUInt16LE(_totalEntries, Constants.ENDTOT);
        b.writeUInt32LE(_size, Constants.ENDSIZ);
        b.writeUInt32LE(_offset, Constants.ENDOFF);
        b.writeUInt16LE(_commentLength, Constants.ENDCOM);
        b.fill(" ", Constants.ENDHDR);
        return b;
      },
      toString: function() {
        return '{\n' + '\t"diskEntries" : ' + _volumeEntries + ",\n" + '\t"totalEntries" : ' + _totalEntries + ",\n" + '\t"size" : ' + _size + " bytes,\n" + '\t"offset" : 0x' + _offset.toString(16).toUpperCase() + ",\n" + '\t"commentLength" : 0x' + _commentLength + "\n" + '}';
      }
    };
  };
})(require('buffer').Buffer);

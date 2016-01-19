/* */ 
(function(Buffer) {
  var Utils = require('../util/index'),
      Constants = Utils.Constants;
  module.exports = function() {
    var _verMade = 0x0A,
        _version = 0x0A,
        _flags = 0,
        _method = 0,
        _time = 0,
        _crc = 0,
        _compressedSize = 0,
        _size = 0,
        _fnameLen = 0,
        _extraLen = 0,
        _comLen = 0,
        _diskStart = 0,
        _inattr = 0,
        _attr = 0,
        _offset = 0;
    var _dataHeader = {};
    function setTime(val) {
      var val = new Date(val);
      _time = (val.getFullYear() - 1980 & 0x7f) << 25 | (val.getMonth() + 1) << 21 | val.getDay() << 16 | val.getHours() << 11 | val.getMinutes() << 5 | val.getSeconds() >> 1;
    }
    setTime(+new Date());
    return {
      get made() {
        return _verMade;
      },
      set made(val) {
        _verMade = val;
      },
      get version() {
        return _version;
      },
      set version(val) {
        _version = val;
      },
      get flags() {
        return _flags;
      },
      set flags(val) {
        _flags = val;
      },
      get method() {
        return _method;
      },
      set method(val) {
        _method = val;
      },
      get time() {
        return new Date(((_time >> 25) & 0x7f) + 1980, ((_time >> 21) & 0x0f) - 1, (_time >> 16) & 0x1f, (_time >> 11) & 0x1f, (_time >> 5) & 0x3f, (_time & 0x1f) << 1);
      },
      set time(val) {
        setTime(val);
      },
      get crc() {
        return _crc;
      },
      set crc(val) {
        _crc = val;
      },
      get compressedSize() {
        return _compressedSize;
      },
      set compressedSize(val) {
        _compressedSize = val;
      },
      get size() {
        return _size;
      },
      set size(val) {
        _size = val;
      },
      get fileNameLength() {
        return _fnameLen;
      },
      set fileNameLength(val) {
        _fnameLen = val;
      },
      get extraLength() {
        return _extraLen;
      },
      set extraLength(val) {
        _extraLen = val;
      },
      get commentLength() {
        return _comLen;
      },
      set commentLength(val) {
        _comLen = val;
      },
      get diskNumStart() {
        return _diskStart;
      },
      set diskNumStart(val) {
        _diskStart = val;
      },
      get inAttr() {
        return _inattr;
      },
      set inAttr(val) {
        _inattr = val;
      },
      get attr() {
        return _attr;
      },
      set attr(val) {
        _attr = val;
      },
      get offset() {
        return _offset;
      },
      set offset(val) {
        _offset = val;
      },
      get encripted() {
        return (_flags & 1) == 1;
      },
      get entryHeaderSize() {
        return Constants.CENHDR + _fnameLen + _extraLen + _comLen;
      },
      get realDataOffset() {
        return _offset + Constants.LOCHDR + _dataHeader.fnameLen + _dataHeader.extraLen;
      },
      get dataHeader() {
        return _dataHeader;
      },
      loadDataHeaderFromBinary: function(input) {
        var data = input.slice(_offset, _offset + Constants.LOCHDR);
        if (data.readUInt32LE(0) != Constants.LOCSIG) {
          throw Utils.Errors.INVALID_LOC;
        }
        _dataHeader = {
          version: data.readUInt16LE(Constants.LOCVER),
          flags: data.readUInt16LE(Constants.LOCFLG),
          method: data.readUInt16LE(Constants.LOCHOW),
          time: data.readUInt32LE(Constants.LOCTIM),
          crc: data.readUInt32LE(Constants.LOCCRC),
          compressedSize: data.readUInt32LE(Constants.LOCSIZ),
          size: data.readUInt32LE(Constants.LOCLEN),
          fnameLen: data.readUInt16LE(Constants.LOCNAM),
          extraLen: data.readUInt16LE(Constants.LOCEXT)
        };
      },
      loadFromBinary: function(data) {
        if (data.length != Constants.CENHDR || data.readUInt32LE(0) != Constants.CENSIG) {
          throw Utils.Errors.INVALID_CEN;
        }
        _verMade = data.readUInt16LE(Constants.CENVEM);
        _version = data.readUInt16LE(Constants.CENVER);
        _flags = data.readUInt16LE(Constants.CENFLG);
        _method = data.readUInt16LE(Constants.CENHOW);
        _time = data.readUInt32LE(Constants.CENTIM);
        _crc = data.readUInt32LE(Constants.CENCRC);
        _compressedSize = data.readUInt32LE(Constants.CENSIZ);
        _size = data.readUInt32LE(Constants.CENLEN);
        _fnameLen = data.readUInt16LE(Constants.CENNAM);
        _extraLen = data.readUInt16LE(Constants.CENEXT);
        _comLen = data.readUInt16LE(Constants.CENCOM);
        _diskStart = data.readUInt16LE(Constants.CENDSK);
        _inattr = data.readUInt16LE(Constants.CENATT);
        _attr = data.readUInt32LE(Constants.CENATX);
        _offset = data.readUInt32LE(Constants.CENOFF);
      },
      dataHeaderToBinary: function() {
        var data = new Buffer(Constants.LOCHDR);
        data.writeUInt32LE(Constants.LOCSIG, 0);
        data.writeUInt16LE(_version, Constants.LOCVER);
        data.writeUInt16LE(_flags, Constants.LOCFLG);
        data.writeUInt16LE(_method, Constants.LOCHOW);
        data.writeUInt32LE(_time, Constants.LOCTIM);
        data.writeUInt32LE(_crc, Constants.LOCCRC);
        data.writeUInt32LE(_compressedSize, Constants.LOCSIZ);
        data.writeUInt32LE(_size, Constants.LOCLEN);
        data.writeUInt16LE(_fnameLen, Constants.LOCNAM);
        data.writeUInt16LE(_extraLen, Constants.LOCEXT);
        return data;
      },
      entryHeaderToBinary: function() {
        var data = new Buffer(Constants.CENHDR + _fnameLen + _extraLen + _comLen);
        data.writeUInt32LE(Constants.CENSIG, 0);
        data.writeUInt16LE(_verMade, Constants.CENVEM);
        data.writeUInt16LE(_version, Constants.CENVER);
        data.writeUInt16LE(_flags, Constants.CENFLG);
        data.writeUInt16LE(_method, Constants.CENHOW);
        data.writeUInt32LE(_time, Constants.CENTIM);
        data.writeInt32LE(_crc, Constants.CENCRC, true);
        data.writeUInt32LE(_compressedSize, Constants.CENSIZ);
        data.writeUInt32LE(_size, Constants.CENLEN);
        data.writeUInt16LE(_fnameLen, Constants.CENNAM);
        data.writeUInt16LE(_extraLen, Constants.CENEXT);
        data.writeUInt16LE(_comLen, Constants.CENCOM);
        data.writeUInt16LE(_diskStart, Constants.CENDSK);
        data.writeUInt16LE(_inattr, Constants.CENATT);
        data.writeUInt32LE(_attr, Constants.CENATX);
        data.writeUInt32LE(_offset, Constants.CENOFF);
        data.fill(0x00, Constants.CENHDR);
        return data;
      },
      toString: function() {
        return '{\n' + '\t"made" : ' + _verMade + ",\n" + '\t"version" : ' + _version + ",\n" + '\t"flags" : ' + _flags + ",\n" + '\t"method" : ' + Utils.methodToString(_method) + ",\n" + '\t"time" : ' + _time + ",\n" + '\t"crc" : 0x' + _crc.toString(16).toUpperCase() + ",\n" + '\t"compressedSize" : ' + _compressedSize + " bytes,\n" + '\t"size" : ' + _size + " bytes,\n" + '\t"fileNameLength" : ' + _fnameLen + ",\n" + '\t"extraLength" : ' + _extraLen + " bytes,\n" + '\t"commentLength" : ' + _comLen + " bytes,\n" + '\t"diskNumStart" : ' + _diskStart + ",\n" + '\t"inAttr" : ' + _inattr + ",\n" + '\t"attr" : ' + _attr + ",\n" + '\t"offset" : ' + _offset + ",\n" + '\t"entryHeaderSize" : ' + (Constants.CENHDR + _fnameLen + _extraLen + _comLen) + " bytes\n" + '}';
      }
    };
  };
})(require('buffer').Buffer);

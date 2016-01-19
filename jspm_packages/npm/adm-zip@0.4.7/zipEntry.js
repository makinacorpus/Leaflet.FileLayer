/* */ 
(function(Buffer) {
  var Utils = require('./util/index'),
      Headers = require('./headers/index'),
      Constants = Utils.Constants,
      Methods = require('./methods/index');
  module.exports = function(input) {
    var _entryHeader = new Headers.EntryHeader(),
        _entryName = new Buffer(0),
        _comment = new Buffer(0),
        _isDirectory = false,
        uncompressedData = null,
        _extra = new Buffer(0);
    function getCompressedDataFromZip() {
      if (!input || !Buffer.isBuffer(input)) {
        return new Buffer(0);
      }
      _entryHeader.loadDataHeaderFromBinary(input);
      return input.slice(_entryHeader.realDataOffset, _entryHeader.realDataOffset + _entryHeader.compressedSize);
    }
    function crc32OK(data) {
      if (_entryHeader.flags & 0x8 != 0x8) {
        if (Utils.crc32(data) != _entryHeader.crc) {
          return false;
        }
      } else {}
      return true;
    }
    function decompress(async, callback, pass) {
      if (typeof callback === 'undefined' && typeof async === 'string') {
        pass = async;
        async = void 0;
      }
      if (_isDirectory) {
        if (async && callback) {
          callback(new Buffer(0), Utils.Errors.DIRECTORY_CONTENT_ERROR);
        }
        return new Buffer(0);
      }
      var compressedData = getCompressedDataFromZip();
      if (compressedData.length == 0) {
        if (async && callback)
          callback(compressedData, Utils.Errors.NO_DATA);
        return compressedData;
      }
      var data = new Buffer(_entryHeader.size);
      data.fill(0);
      switch (_entryHeader.method) {
        case Utils.Constants.STORED:
          compressedData.copy(data);
          if (!crc32OK(data)) {
            if (async && callback)
              callback(data, Utils.Errors.BAD_CRC);
            return Utils.Errors.BAD_CRC;
          } else {
            if (async && callback)
              callback(data);
            return data;
          }
          break;
        case Utils.Constants.DEFLATED:
          var inflater = new Methods.Inflater(compressedData);
          if (!async) {
            inflater.inflate(data);
            if (!crc32OK(data)) {
              console.warn(Utils.Errors.BAD_CRC + " " + _entryName.toString());
            }
            return data;
          } else {
            inflater.inflateAsync(function(result) {
              result.copy(data, 0);
              if (!crc32OK(data)) {
                if (callback)
                  callback(data, Utils.Errors.BAD_CRC);
              } else {
                if (callback)
                  callback(data);
              }
            });
          }
          break;
        default:
          if (async && callback)
            callback(new Buffer(0), Utils.Errors.UNKNOWN_METHOD);
          return Utils.Errors.UNKNOWN_METHOD;
      }
    }
    function compress(async, callback) {
      if ((!uncompressedData || !uncompressedData.length) && Buffer.isBuffer(input)) {
        if (async && callback)
          callback(getCompressedDataFromZip());
        return getCompressedDataFromZip();
      }
      if (uncompressedData.length && !_isDirectory) {
        var compressedData;
        switch (_entryHeader.method) {
          case Utils.Constants.STORED:
            _entryHeader.compressedSize = _entryHeader.size;
            compressedData = new Buffer(uncompressedData.length);
            uncompressedData.copy(compressedData);
            if (async && callback)
              callback(compressedData);
            return compressedData;
            break;
          default:
          case Utils.Constants.DEFLATED:
            var deflater = new Methods.Deflater(uncompressedData);
            if (!async) {
              var deflated = deflater.deflate();
              _entryHeader.compressedSize = deflated.length;
              return deflated;
            } else {
              deflater.deflateAsync(function(data) {
                compressedData = new Buffer(data.length);
                _entryHeader.compressedSize = data.length;
                data.copy(compressedData);
                callback && callback(compressedData);
              });
            }
            deflater = null;
            break;
        }
      } else {
        if (async && callback) {
          callback(new Buffer(0));
        } else {
          return new Buffer(0);
        }
      }
    }
    function readUInt64LE(buffer, offset) {
      return (buffer.readUInt32LE(offset + 4) << 4) + buffer.readUInt32LE(offset);
    }
    function parseExtra(data) {
      var offset = 0;
      var signature,
          size,
          part;
      while (offset < data.length) {
        signature = data.readUInt16LE(offset);
        offset += 2;
        size = data.readUInt16LE(offset);
        offset += 2;
        part = data.slice(offset, offset + size);
        offset += size;
        if (Constants.ID_ZIP64 === signature) {
          parseZip64ExtendedInformation(part);
        }
      }
    }
    function parseZip64ExtendedInformation(data) {
      var size,
          compressedSize,
          offset,
          diskNumStart;
      if (data.length >= Constants.EF_ZIP64_SCOMP) {
        size = readUInt64LE(data, Constants.EF_ZIP64_SUNCOMP);
        if (_entryHeader.size === Constants.EF_ZIP64_OR_32) {
          _entryHeader.size = size;
        }
      }
      if (data.length >= Constants.EF_ZIP64_RHO) {
        compressedSize = readUInt64LE(data, Constants.EF_ZIP64_SCOMP);
        if (_entryHeader.compressedSize === Constants.EF_ZIP64_OR_32) {
          _entryHeader.compressedSize = compressedSize;
        }
      }
      if (data.length >= Constants.EF_ZIP64_DSN) {
        offset = readUInt64LE(data, Constants.EF_ZIP64_RHO);
        if (_entryHeader.offset === Constants.EF_ZIP64_OR_32) {
          _entryHeader.offset = offset;
        }
      }
      if (data.length >= Constants.EF_ZIP64_DSN + 4) {
        diskNumStart = data.readUInt32LE(Constants.EF_ZIP64_DSN);
        if (_entryHeader.diskNumStart === Constants.EF_ZIP64_OR_16) {
          _entryHeader.diskNumStart = diskNumStart;
        }
      }
    }
    return {
      get entryName() {
        return _entryName.toString();
      },
      get rawEntryName() {
        return _entryName;
      },
      set entryName(val) {
        _entryName = Utils.toBuffer(val);
        var lastChar = _entryName[_entryName.length - 1];
        _isDirectory = (lastChar == 47) || (lastChar == 92);
        _entryHeader.fileNameLength = _entryName.length;
      },
      get extra() {
        return _extra;
      },
      set extra(val) {
        _extra = val;
        _entryHeader.extraLength = val.length;
        parseExtra(val);
      },
      get comment() {
        return _comment.toString();
      },
      set comment(val) {
        _comment = Utils.toBuffer(val);
        _entryHeader.commentLength = _comment.length;
      },
      get name() {
        var n = _entryName.toString();
        return _isDirectory ? n.substr(n.length - 1).split("/").pop() : n.split("/").pop();
      },
      get isDirectory() {
        return _isDirectory;
      },
      getCompressedData: function() {
        return compress(false, null);
      },
      getCompressedDataAsync: function(callback) {
        compress(true, callback);
      },
      setData: function(value) {
        uncompressedData = Utils.toBuffer(value);
        if (!_isDirectory && uncompressedData.length) {
          _entryHeader.size = uncompressedData.length;
          _entryHeader.method = Utils.Constants.DEFLATED;
          _entryHeader.crc = Utils.crc32(value);
        } else {
          _entryHeader.method = Utils.Constants.STORED;
        }
      },
      getData: function(pass) {
        return decompress(false, null, pass);
      },
      getDataAsync: function(callback, pass) {
        decompress(true, callback, pass);
      },
      set attr(attr) {
        _entryHeader.attr = attr;
      },
      get attr() {
        return _entryHeader.attr;
      },
      set header(data) {
        _entryHeader.loadFromBinary(data);
      },
      get header() {
        return _entryHeader;
      },
      packHeader: function() {
        var header = _entryHeader.entryHeaderToBinary();
        _entryName.copy(header, Utils.Constants.CENHDR);
        if (_entryHeader.extraLength) {
          _extra.copy(header, Utils.Constants.CENHDR + _entryName.length);
        }
        if (_entryHeader.commentLength) {
          _comment.copy(header, Utils.Constants.CENHDR + _entryName.length + _entryHeader.extraLength, _comment.length);
        }
        return header;
      },
      toString: function() {
        return '{\n' + '\t"entryName" : "' + _entryName.toString() + "\",\n" + '\t"name" : "' + _entryName.toString().split("/").pop() + "\",\n" + '\t"comment" : "' + _comment.toString() + "\",\n" + '\t"isDirectory" : ' + _isDirectory + ",\n" + '\t"header" : ' + _entryHeader.toString().replace(/\t/mg, "\t\t") + ",\n" + '\t"compressedData" : <' + (input && input.length + " bytes buffer" || "null") + ">\n" + '\t"data" : <' + (uncompressedData && uncompressedData.length + " bytes buffer" || "null") + ">\n" + '}';
      }
    };
  };
})(require('buffer').Buffer);

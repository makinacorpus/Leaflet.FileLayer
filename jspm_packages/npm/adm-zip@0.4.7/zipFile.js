/* */ 
(function(Buffer) {
  var ZipEntry = require('./zipEntry'),
      Headers = require('./headers/index'),
      Utils = require('./util/index');
  module.exports = function(input, inputType) {
    var entryList = [],
        entryTable = {},
        _comment = new Buffer(0),
        filename = "",
        fs = require('fs'),
        inBuffer = null,
        mainHeader = new Headers.MainHeader();
    if (inputType == Utils.Constants.FILE) {
      filename = input;
      inBuffer = fs.readFileSync(filename);
      readMainHeader();
    } else if (inputType == Utils.Constants.BUFFER) {
      inBuffer = input;
      readMainHeader();
    } else {}
    function readEntries() {
      entryTable = {};
      entryList = new Array(mainHeader.diskEntries);
      var index = mainHeader.offset;
      for (var i = 0; i < entryList.length; i++) {
        var tmp = index,
            entry = new ZipEntry(inBuffer);
        entry.header = inBuffer.slice(tmp, tmp += Utils.Constants.CENHDR);
        entry.entryName = inBuffer.slice(tmp, tmp += entry.header.fileNameLength);
        if (entry.header.extraLength) {
          entry.extra = inBuffer.slice(tmp, tmp += entry.header.extraLength);
        }
        if (entry.header.commentLength)
          entry.comment = inBuffer.slice(tmp, tmp + entry.header.commentLength);
        index += entry.header.entryHeaderSize;
        entryList[i] = entry;
        entryTable[entry.entryName] = entry;
      }
    }
    function readMainHeader() {
      var i = inBuffer.length - Utils.Constants.ENDHDR,
          n = Math.max(0, i - 0xFFFF),
          endOffset = -1;
      for (i; i >= n; i--) {
        if (inBuffer[i] != 0x50)
          continue;
        if (inBuffer.readUInt32LE(i) == Utils.Constants.ENDSIG) {
          endOffset = i;
          break;
        }
      }
      if (!~endOffset)
        throw Utils.Errors.INVALID_FORMAT;
      mainHeader.loadFromBinary(inBuffer.slice(endOffset, endOffset + Utils.Constants.ENDHDR));
      if (mainHeader.commentLength) {
        _comment = inBuffer.slice(endOffset + Utils.Constants.ENDHDR);
      }
      readEntries();
    }
    return {
      get entries() {
        return entryList;
      },
      get comment() {
        return _comment.toString();
      },
      set comment(val) {
        mainHeader.commentLength = val.length;
        _comment = val;
      },
      getEntry: function(entryName) {
        return entryTable[entryName] || null;
      },
      setEntry: function(entry) {
        entryList.push(entry);
        entryTable[entry.entryName] = entry;
        mainHeader.totalEntries = entryList.length;
      },
      deleteEntry: function(entryName) {
        var entry = entryTable[entryName];
        if (entry && entry.isDirectory) {
          var _self = this;
          this.getEntryChildren(entry).forEach(function(child) {
            if (child.entryName != entryName) {
              _self.deleteEntry(child.entryName);
            }
          });
        }
        entryList.splice(entryList.indexOf(entry), 1);
        delete(entryTable[entryName]);
        mainHeader.totalEntries = entryList.length;
      },
      getEntryChildren: function(entry) {
        if (entry.isDirectory) {
          var list = [],
              name = entry.entryName,
              len = name.length;
          entryList.forEach(function(zipEntry) {
            if (zipEntry.entryName.substr(0, len) == name) {
              list.push(zipEntry);
            }
          });
          return list;
        }
        return [];
      },
      compressToBuffer: function() {
        if (entryList.length > 1) {
          entryList.sort(function(a, b) {
            var nameA = a.entryName.toLowerCase();
            var nameB = b.entryName.toLowerCase();
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            return 0;
          });
        }
        var totalSize = 0,
            dataBlock = [],
            entryHeaders = [],
            dindex = 0;
        mainHeader.size = 0;
        mainHeader.offset = 0;
        entryList.forEach(function(entry) {
          entry.header.offset = dindex;
          var compressedData = entry.getCompressedData();
          var dataHeader = entry.header.dataHeaderToBinary();
          var postHeader = new Buffer(entry.entryName + entry.extra.toString());
          var dataLength = dataHeader.length + postHeader.length + compressedData.length;
          dindex += dataLength;
          dataBlock.push(dataHeader);
          dataBlock.push(postHeader);
          dataBlock.push(compressedData);
          var entryHeader = entry.packHeader();
          entryHeaders.push(entryHeader);
          mainHeader.size += entryHeader.length;
          totalSize += (dataLength + entryHeader.length);
        });
        totalSize += mainHeader.mainHeaderSize;
        mainHeader.offset = dindex;
        dindex = 0;
        var outBuffer = new Buffer(totalSize);
        dataBlock.forEach(function(content) {
          content.copy(outBuffer, dindex);
          dindex += content.length;
        });
        entryHeaders.forEach(function(content) {
          content.copy(outBuffer, dindex);
          dindex += content.length;
        });
        var mh = mainHeader.toBinary();
        if (_comment) {
          _comment.copy(mh, Utils.Constants.ENDHDR);
        }
        mh.copy(outBuffer, dindex);
        return outBuffer;
      },
      toAsyncBuffer: function(onSuccess, onFail, onItemStart, onItemEnd) {
        if (entryList.length > 1) {
          entryList.sort(function(a, b) {
            var nameA = a.entryName.toLowerCase();
            var nameB = b.entryName.toLowerCase();
            if (nameA > nameB) {
              return -1;
            }
            if (nameA < nameB) {
              return 1;
            }
            return 0;
          });
        }
        var totalSize = 0,
            dataBlock = [],
            entryHeaders = [],
            dindex = 0;
        mainHeader.size = 0;
        mainHeader.offset = 0;
        var compress = function(entryList) {
          var self = arguments.callee;
          var entry;
          if (entryList.length) {
            var entry = entryList.pop();
            var name = entry.entryName + entry.extra.toString();
            if (onItemStart)
              onItemStart(name);
            entry.getCompressedDataAsync(function(compressedData) {
              if (onItemEnd)
                onItemEnd(name);
              entry.header.offset = dindex;
              var dataHeader = entry.header.dataHeaderToBinary();
              var postHeader = new Buffer(name);
              var dataLength = dataHeader.length + postHeader.length + compressedData.length;
              dindex += dataLength;
              dataBlock.push(dataHeader);
              dataBlock.push(postHeader);
              dataBlock.push(compressedData);
              var entryHeader = entry.packHeader();
              entryHeaders.push(entryHeader);
              mainHeader.size += entryHeader.length;
              totalSize += (dataLength + entryHeader.length);
              if (entryList.length) {
                self(entryList);
              } else {
                totalSize += mainHeader.mainHeaderSize;
                mainHeader.offset = dindex;
                dindex = 0;
                var outBuffer = new Buffer(totalSize);
                dataBlock.forEach(function(content) {
                  content.copy(outBuffer, dindex);
                  dindex += content.length;
                });
                entryHeaders.forEach(function(content) {
                  content.copy(outBuffer, dindex);
                  dindex += content.length;
                });
                var mh = mainHeader.toBinary();
                if (_comment) {
                  _comment.copy(mh, Utils.Constants.ENDHDR);
                }
                mh.copy(outBuffer, dindex);
                onSuccess(outBuffer);
              }
            });
          }
        };
        compress(entryList);
      }
    };
  };
})(require('buffer').Buffer);

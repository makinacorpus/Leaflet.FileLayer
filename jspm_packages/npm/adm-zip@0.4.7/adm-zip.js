/* */ 
(function(Buffer) {
  var fs = require('fs'),
      pth = require('path');
  fs.existsSync = fs.existsSync || pth.existsSync;
  var ZipEntry = require('./zipEntry'),
      ZipFile = require('./zipFile'),
      Utils = require('./util/index');
  module.exports = function(input) {
    var _zip = undefined,
        _filename = "";
    if (input && typeof input === "string") {
      if (fs.existsSync(input)) {
        _filename = input;
        _zip = new ZipFile(input, Utils.Constants.FILE);
      } else {
        throw Utils.Errors.INVALID_FILENAME;
      }
    } else if (input && Buffer.isBuffer(input)) {
      _zip = new ZipFile(input, Utils.Constants.BUFFER);
    } else {
      _zip = new ZipFile(null, Utils.Constants.NONE);
    }
    function getEntry(entry) {
      if (entry && _zip) {
        var item;
        if (typeof entry === "string")
          item = _zip.getEntry(entry);
        if (typeof entry === "object" && entry.entryName != undefined && entry.header != undefined)
          item = _zip.getEntry(entry.entryName);
        if (item) {
          return item;
        }
      }
      return null;
    }
    return {
      readFile: function(entry) {
        var item = getEntry(entry);
        return item && item.getData() || null;
      },
      readFileAsync: function(entry, callback) {
        var item = getEntry(entry);
        if (item) {
          item.getDataAsync(callback);
        } else {
          callback(null, "getEntry failed for:" + entry);
        }
      },
      readAsText: function(entry, encoding) {
        var item = getEntry(entry);
        if (item) {
          var data = item.getData();
          if (data && data.length) {
            return data.toString(encoding || "utf8");
          }
        }
        return "";
      },
      readAsTextAsync: function(entry, callback, encoding) {
        var item = getEntry(entry);
        if (item) {
          item.getDataAsync(function(data) {
            if (data && data.length) {
              callback(data.toString(encoding || "utf8"));
            } else {
              callback("");
            }
          });
        } else {
          callback("");
        }
      },
      deleteFile: function(entry) {
        var item = getEntry(entry);
        if (item) {
          _zip.deleteEntry(item.entryName);
        }
      },
      addZipComment: function(comment) {
        _zip.comment = comment;
      },
      getZipComment: function() {
        return _zip.comment || '';
      },
      addZipEntryComment: function(entry, comment) {
        var item = getEntry(entry);
        if (item) {
          item.comment = comment;
        }
      },
      getZipEntryComment: function(entry) {
        var item = getEntry(entry);
        if (item) {
          return item.comment || '';
        }
        return '';
      },
      updateFile: function(entry, content) {
        var item = getEntry(entry);
        if (item) {
          item.setData(content);
        }
      },
      addLocalFile: function(localPath, zipPath, zipName) {
        if (fs.existsSync(localPath)) {
          if (zipPath) {
            zipPath = zipPath.split("\\").join("/");
            if (zipPath.charAt(zipPath.length - 1) != "/") {
              zipPath += "/";
            }
          } else {
            zipPath = "";
          }
          var p = localPath.split("\\").join("/").split("/").pop();
          if (zipName) {
            this.addFile(zipPath + zipName, fs.readFileSync(localPath), "", 0);
          } else {
            this.addFile(zipPath + p, fs.readFileSync(localPath), "", 0);
          }
        } else {
          throw Utils.Errors.FILE_NOT_FOUND.replace("%s", localPath);
        }
      },
      addLocalFolder: function(localPath, zipPath, filter) {
        if (filter === undefined) {
          filter = function() {
            return true;
          };
        } else if (filter instanceof RegExp) {
          filter = function(filter) {
            return function(filename) {
              return filter.test(filename);
            };
          }(filter);
        }
        if (zipPath) {
          zipPath = zipPath.split("\\").join("/");
          if (zipPath.charAt(zipPath.length - 1) != "/") {
            zipPath += "/";
          }
        } else {
          zipPath = "";
        }
        localPath = localPath.split("\\").join("/");
        localPath = pth.normalize(localPath);
        if (localPath.charAt(localPath.length - 1) != "/")
          localPath += "/";
        if (fs.existsSync(localPath)) {
          var items = Utils.findFiles(localPath),
              self = this;
          if (items.length) {
            items.forEach(function(path) {
              var p = path.split("\\").join("/").replace(new RegExp(localPath, 'i'), "");
              if (filter(p)) {
                if (p.charAt(p.length - 1) !== "/") {
                  self.addFile(zipPath + p, fs.readFileSync(path), "", 0);
                } else {
                  self.addFile(zipPath + p, new Buffer(0), "", 0);
                }
              }
            });
          }
        } else {
          throw Utils.Errors.FILE_NOT_FOUND.replace("%s", localPath);
        }
      },
      addFile: function(entryName, content, comment, attr) {
        var entry = new ZipEntry();
        entry.entryName = entryName;
        entry.comment = comment || "";
        entry.attr = attr || 438;
        if (entry.isDirectory && content.length) {}
        entry.setData(content);
        _zip.setEntry(entry);
      },
      getEntries: function() {
        if (_zip) {
          return _zip.entries;
        } else {
          return [];
        }
      },
      getEntry: function(name) {
        return getEntry(name);
      },
      extractEntryTo: function(entry, targetPath, maintainEntryPath, overwrite) {
        overwrite = overwrite || false;
        maintainEntryPath = typeof maintainEntryPath == "undefined" ? true : maintainEntryPath;
        var item = getEntry(entry);
        if (!item) {
          throw Utils.Errors.NO_ENTRY;
        }
        var target = pth.resolve(targetPath, maintainEntryPath ? item.entryName : pth.basename(item.entryName));
        if (item.isDirectory) {
          target = pth.resolve(target, "..");
          var children = _zip.getEntryChildren(item);
          children.forEach(function(child) {
            if (child.isDirectory)
              return;
            var content = child.getData();
            if (!content) {
              throw Utils.Errors.CANT_EXTRACT_FILE;
            }
            Utils.writeFileTo(pth.resolve(targetPath, maintainEntryPath ? child.entryName : child.entryName.substr(item.entryName.length)), content, overwrite);
          });
          return true;
        }
        var content = item.getData();
        if (!content)
          throw Utils.Errors.CANT_EXTRACT_FILE;
        if (fs.existsSync(target) && !overwrite) {
          throw Utils.Errors.CANT_OVERRIDE;
        }
        Utils.writeFileTo(target, content, overwrite);
        return true;
      },
      extractAllTo: function(targetPath, overwrite) {
        overwrite = overwrite || false;
        if (!_zip) {
          throw Utils.Errors.NO_ZIP;
        }
        _zip.entries.forEach(function(entry) {
          if (entry.isDirectory) {
            Utils.makeDir(pth.resolve(targetPath, entry.entryName.toString()));
            return;
          }
          var content = entry.getData();
          if (!content) {
            throw Utils.Errors.CANT_EXTRACT_FILE + "2";
          }
          Utils.writeFileTo(pth.resolve(targetPath, entry.entryName.toString()), content, overwrite);
        });
      },
      extractAllToAsync: function(targetPath, overwrite, callback) {
        overwrite = overwrite || false;
        if (!_zip) {
          callback(new Error(Utils.Errors.NO_ZIP));
          return;
        }
        var entries = _zip.entries;
        var i = entries.length;
        entries.forEach(function(entry) {
          if (i <= 0)
            return;
          if (entry.isDirectory) {
            Utils.makeDir(pth.resolve(targetPath, entry.entryName.toString()));
            if (--i == 0)
              callback(undefined);
            return;
          }
          entry.getDataAsync(function(content) {
            if (i <= 0)
              return;
            if (!content) {
              i = 0;
              callback(new Error(Utils.Errors.CANT_EXTRACT_FILE + "2"));
              return;
            }
            Utils.writeFileToAsync(pth.resolve(targetPath, entry.entryName.toString()), content, overwrite, function(succ) {
              if (i <= 0)
                return;
              if (!succ) {
                i = 0;
                callback(new Error('Unable to write'));
                return;
              }
              if (--i == 0)
                callback(undefined);
            });
          });
        });
      },
      writeZip: function(targetFileName, callback) {
        if (arguments.length == 1) {
          if (typeof targetFileName == "function") {
            callback = targetFileName;
            targetFileName = "";
          }
        }
        if (!targetFileName && _filename) {
          targetFileName = _filename;
        }
        if (!targetFileName)
          return;
        var zipData = _zip.compressToBuffer();
        if (zipData) {
          var ok = Utils.writeFileTo(targetFileName, zipData, true);
          if (typeof callback == 'function')
            callback(!ok ? new Error("failed") : null, "");
        }
      },
      toBuffer: function(onSuccess, onFail, onItemStart, onItemEnd) {
        this.valueOf = 2;
        if (typeof onSuccess == "function") {
          _zip.toAsyncBuffer(onSuccess, onFail, onItemStart, onItemEnd);
          return null;
        }
        return _zip.compressToBuffer();
      }
    };
  };
})(require('buffer').Buffer);

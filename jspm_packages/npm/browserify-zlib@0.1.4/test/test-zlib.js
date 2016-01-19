/* */ 
(function(Buffer, process) {
  var assert = require('assert');
  var zlib = require('../src/index');
  var path = require('path');
  var zlibPairs = [[zlib.Deflate, zlib.Inflate], [zlib.Gzip, zlib.Gunzip], [zlib.Deflate, zlib.Unzip], [zlib.Gzip, zlib.Unzip], [zlib.DeflateRaw, zlib.InflateRaw]];
  var trickle = [128, 1024, 1024 * 1024];
  var chunkSize = [128, 1024, 1024 * 16, 1024 * 1024];
  var level = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  var windowBits = [8, 9, 10, 11, 12, 13, 14, 15];
  var memLevel = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  var strategy = [0, 1, 2, 3, 4];
  if (!process.env.PUMMEL) {
    trickle = [1024];
    chunkSize = [1024 * 16];
    level = [6];
    memLevel = [8];
    windowBits = [15];
    strategy = [0];
  }
  var fs = require('fs');
  if (process.env.FAST) {
    zlibPairs = [[zlib.Gzip, zlib.Unzip]];
  }
  var tests = {
    'person.jpg': fs.readFileSync(__dirname + '/fixtures/person.jpg'),
    'elipses.txt': fs.readFileSync(__dirname + '/fixtures/elipses.txt'),
    'empty.txt': fs.readFileSync(__dirname + '/fixtures/empty.txt')
  };
  var util = require('util');
  var stream = require('stream');
  function BufferStream() {
    this.chunks = [];
    this.length = 0;
    this.writable = true;
    this.readable = true;
  }
  util.inherits(BufferStream, stream.Stream);
  BufferStream.prototype.write = function(c) {
    this.chunks.push(c);
    this.length += c.length;
    return true;
  };
  BufferStream.prototype.end = function(c) {
    if (c)
      this.write(c);
    var buf = new Buffer(this.length);
    var i = 0;
    this.chunks.forEach(function(c) {
      c.copy(buf, i);
      i += c.length;
    });
    this.emit('data', buf);
    this.emit('end');
    return true;
  };
  function SlowStream(trickle) {
    this.trickle = trickle;
    this.offset = 0;
    this.readable = this.writable = true;
  }
  util.inherits(SlowStream, stream.Stream);
  SlowStream.prototype.write = function() {
    throw new Error('not implemented, just call ss.end(chunk)');
  };
  SlowStream.prototype.pause = function() {
    this.paused = true;
    this.emit('pause');
  };
  SlowStream.prototype.resume = function() {
    var self = this;
    if (self.ended)
      return;
    self.emit('resume');
    if (!self.chunk)
      return;
    self.paused = false;
    emit();
    function emit() {
      if (self.paused)
        return;
      if (self.offset >= self.length) {
        self.ended = true;
        return self.emit('end');
      }
      var end = Math.min(self.offset + self.trickle, self.length);
      var c = self.chunk.slice(self.offset, end);
      self.offset += c.length;
      self.emit('data', c);
      process.nextTick(emit);
    }
  };
  SlowStream.prototype.end = function(chunk) {
    var self = this;
    self.chunk = chunk;
    self.length = chunk.length;
    self.resume();
    return self.ended;
  };
  var tape = require('tape');
  Object.keys(tests).forEach(function(file) {
    var test = tests[file];
    chunkSize.forEach(function(chunkSize) {
      trickle.forEach(function(trickle) {
        windowBits.forEach(function(windowBits) {
          level.forEach(function(level) {
            memLevel.forEach(function(memLevel) {
              strategy.forEach(function(strategy) {
                zlibPairs.forEach(function(pair) {
                  var Def = pair[0];
                  var Inf = pair[1];
                  var opts = {
                    level: level,
                    windowBits: windowBits,
                    memLevel: memLevel,
                    strategy: strategy
                  };
                  var msg = file + ' ' + chunkSize + ' ' + JSON.stringify(opts) + ' ' + Def.name + ' -> ' + Inf.name;
                  tape('zlib ' + msg, function(t) {
                    t.plan(1);
                    var def = new Def(opts);
                    var inf = new Inf(opts);
                    var ss = new SlowStream(trickle);
                    var buf = new BufferStream();
                    buf.on('data', function(c) {
                      t.deepEqual(c, test);
                    });
                    ss.pipe(def).pipe(inf).pipe(buf);
                    ss.end(test);
                  });
                });
              });
            });
          });
        });
      });
    });
  });
})(require('buffer').Buffer, require('process'));

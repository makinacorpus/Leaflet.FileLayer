/* */ 
(function(Buffer, process) {
  var crypto = require('crypto');
  var stream = require('stream');
  var Stream = stream.Stream;
  var util = require('util');
  var tape = require('tape');
  var zlib = require('../src/index');
  function RandomReadStream(opt) {
    Stream.call(this);
    this.readable = true;
    this._paused = false;
    this._processing = false;
    this._hasher = crypto.createHash('sha1');
    opt = opt || {};
    opt.block = opt.block || 256 * 1024;
    opt.total = opt.total || 256 * 1024 * 1024;
    this._remaining = opt.total;
    opt.jitter = opt.jitter || 1024;
    this._opt = opt;
    this._process = this._process.bind(this);
    process.nextTick(this._process);
  }
  util.inherits(RandomReadStream, Stream);
  RandomReadStream.prototype.pause = function() {
    this._paused = true;
    this.emit('pause');
  };
  RandomReadStream.prototype.resume = function() {
    this._paused = false;
    this.emit('resume');
    this._process();
  };
  RandomReadStream.prototype._process = function() {
    if (this._processing)
      return;
    if (this._paused)
      return;
    this._processing = true;
    if (!this._remaining) {
      this._hash = this._hasher.digest('hex').toLowerCase().trim();
      this._processing = false;
      this.emit('end');
      return;
    }
    var block = this._opt.block;
    var jitter = this._opt.jitter;
    if (jitter) {
      block += Math.ceil(Math.random() * jitter - (jitter / 2));
    }
    block = Math.min(block, this._remaining);
    var buf = new Buffer(block);
    for (var i = 0; i < block; i++) {
      buf[i] = Math.random() * 256;
    }
    this._hasher.update(buf);
    this._remaining -= block;
    this._processing = false;
    this.emit('data', buf);
    process.nextTick(this._process);
  };
  function HashStream() {
    Stream.call(this);
    this.readable = this.writable = true;
    this._hasher = crypto.createHash('sha1');
  }
  util.inherits(HashStream, Stream);
  HashStream.prototype.write = function(c) {
    this._hasher.update(c);
    process.nextTick(this.resume.bind(this));
    return false;
  };
  HashStream.prototype.resume = function() {
    this.emit('resume');
    process.nextTick(this.emit.bind(this, 'drain'));
  };
  HashStream.prototype.end = function(c) {
    if (c) {
      this.write(c);
    }
    this._hash = this._hasher.digest('hex').toLowerCase().trim();
    this.emit('data', this._hash);
    this.emit('end');
  };
  tape('random byte pipes', function(t) {
    var inp = new RandomReadStream({
      total: 1024,
      block: 256,
      jitter: 16
    });
    var out = new HashStream();
    var gzip = zlib.createGzip();
    var gunz = zlib.createGunzip();
    inp.pipe(gzip).pipe(gunz).pipe(out);
    inp.on('data', function(c) {
      t.ok(c.length);
    });
    gzip.on('data', function(c) {
      t.ok(c.length);
    });
    gunz.on('data', function(c) {
      t.ok(c.length);
    });
    out.on('data', function(c) {
      t.ok(c.length);
    });
    out.on('data', function(c) {
      t.ok(c.length);
      t.equal(c, inp._hash, 'hashes should match');
    });
    out.on('end', function() {
      t.end();
    });
  });
})(require('buffer').Buffer, require('process'));

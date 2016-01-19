/* */ 
"format cjs";
(function(Buffer, process) {
  (function(f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = f();
    } else if (typeof define === "function" && define.amd) {
      define([], f);
    } else {
      var g;
      if (typeof window !== "undefined") {
        g = window;
      } else if (typeof global !== "undefined") {
        g = global;
      } else if (typeof self !== "undefined") {
        g = self;
      } else {
        g = this;
      }
      g.pako = f();
    }
  })(function() {
    var define,
        module,
        exports;
    return (function e(t, n, r) {
      function s(o, u) {
        if (!n[o]) {
          if (!t[o]) {
            var a = typeof require == "function" && require;
            if (!u && a)
              return a(o, !0);
            if (i)
              return i(o, !0);
            var f = new Error("Cannot find module '" + o + "'");
            throw f.code = "MODULE_NOT_FOUND", f;
          }
          var l = n[o] = {exports: {}};
          t[o][0].call(l.exports, function(e) {
            var n = t[o][1][e];
            return s(n ? n : e);
          }, l, l.exports, e, t, n, r);
        }
        return n[o].exports;
      }
      var i = typeof require == "function" && require;
      for (var o = 0; o < r.length; o++)
        s(r[o]);
      return s;
    })({
      1: [function(require, module, exports) {
        'use strict';
        var TYPED_OK = (typeof Uint8Array !== 'undefined') && (typeof Uint16Array !== 'undefined') && (typeof Int32Array !== 'undefined');
        exports.assign = function(obj) {
          var sources = Array.prototype.slice.call(arguments, 1);
          while (sources.length) {
            var source = sources.shift();
            if (!source) {
              continue;
            }
            if (typeof source !== 'object') {
              throw new TypeError(source + 'must be non-object');
            }
            for (var p in source) {
              if (source.hasOwnProperty(p)) {
                obj[p] = source[p];
              }
            }
          }
          return obj;
        };
        exports.shrinkBuf = function(buf, size) {
          if (buf.length === size) {
            return buf;
          }
          if (buf.subarray) {
            return buf.subarray(0, size);
          }
          buf.length = size;
          return buf;
        };
        var fnTyped = {
          arraySet: function(dest, src, src_offs, len, dest_offs) {
            if (src.subarray && dest.subarray) {
              dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
              return;
            }
            for (var i = 0; i < len; i++) {
              dest[dest_offs + i] = src[src_offs + i];
            }
          },
          flattenChunks: function(chunks) {
            var i,
                l,
                len,
                pos,
                chunk,
                result;
            len = 0;
            for (i = 0, l = chunks.length; i < l; i++) {
              len += chunks[i].length;
            }
            result = new Uint8Array(len);
            pos = 0;
            for (i = 0, l = chunks.length; i < l; i++) {
              chunk = chunks[i];
              result.set(chunk, pos);
              pos += chunk.length;
            }
            return result;
          }
        };
        var fnUntyped = {
          arraySet: function(dest, src, src_offs, len, dest_offs) {
            for (var i = 0; i < len; i++) {
              dest[dest_offs + i] = src[src_offs + i];
            }
          },
          flattenChunks: function(chunks) {
            return [].concat.apply([], chunks);
          }
        };
        exports.setTyped = function(on) {
          if (on) {
            exports.Buf8 = Uint8Array;
            exports.Buf16 = Uint16Array;
            exports.Buf32 = Int32Array;
            exports.assign(exports, fnTyped);
          } else {
            exports.Buf8 = Array;
            exports.Buf16 = Array;
            exports.Buf32 = Array;
            exports.assign(exports, fnUntyped);
          }
        };
        exports.setTyped(TYPED_OK);
      }, {}],
      2: [function(require, module, exports) {
        'use strict';
        var utils = require('./common');
        var STR_APPLY_OK = true;
        var STR_APPLY_UIA_OK = true;
        try {
          String.fromCharCode.apply(null, [0]);
        } catch (__) {
          STR_APPLY_OK = false;
        }
        try {
          String.fromCharCode.apply(null, new Uint8Array(1));
        } catch (__) {
          STR_APPLY_UIA_OK = false;
        }
        var _utf8len = new utils.Buf8(256);
        for (var q = 0; q < 256; q++) {
          _utf8len[q] = (q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1);
        }
        _utf8len[254] = _utf8len[254] = 1;
        exports.string2buf = function(str) {
          var buf,
              c,
              c2,
              m_pos,
              i,
              str_len = str.length,
              buf_len = 0;
          for (m_pos = 0; m_pos < str_len; m_pos++) {
            c = str.charCodeAt(m_pos);
            if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
              c2 = str.charCodeAt(m_pos + 1);
              if ((c2 & 0xfc00) === 0xdc00) {
                c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
                m_pos++;
              }
            }
            buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
          }
          buf = new utils.Buf8(buf_len);
          for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
            c = str.charCodeAt(m_pos);
            if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
              c2 = str.charCodeAt(m_pos + 1);
              if ((c2 & 0xfc00) === 0xdc00) {
                c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
                m_pos++;
              }
            }
            if (c < 0x80) {
              buf[i++] = c;
            } else if (c < 0x800) {
              buf[i++] = 0xC0 | (c >>> 6);
              buf[i++] = 0x80 | (c & 0x3f);
            } else if (c < 0x10000) {
              buf[i++] = 0xE0 | (c >>> 12);
              buf[i++] = 0x80 | (c >>> 6 & 0x3f);
              buf[i++] = 0x80 | (c & 0x3f);
            } else {
              buf[i++] = 0xf0 | (c >>> 18);
              buf[i++] = 0x80 | (c >>> 12 & 0x3f);
              buf[i++] = 0x80 | (c >>> 6 & 0x3f);
              buf[i++] = 0x80 | (c & 0x3f);
            }
          }
          return buf;
        };
        function buf2binstring(buf, len) {
          if (len < 65537) {
            if ((buf.subarray && STR_APPLY_UIA_OK) || (!buf.subarray && STR_APPLY_OK)) {
              return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
            }
          }
          var result = '';
          for (var i = 0; i < len; i++) {
            result += String.fromCharCode(buf[i]);
          }
          return result;
        }
        exports.buf2binstring = function(buf) {
          return buf2binstring(buf, buf.length);
        };
        exports.binstring2buf = function(str) {
          var buf = new utils.Buf8(str.length);
          for (var i = 0,
              len = buf.length; i < len; i++) {
            buf[i] = str.charCodeAt(i);
          }
          return buf;
        };
        exports.buf2string = function(buf, max) {
          var i,
              out,
              c,
              c_len;
          var len = max || buf.length;
          var utf16buf = new Array(len * 2);
          for (out = 0, i = 0; i < len; ) {
            c = buf[i++];
            if (c < 0x80) {
              utf16buf[out++] = c;
              continue;
            }
            c_len = _utf8len[c];
            if (c_len > 4) {
              utf16buf[out++] = 0xfffd;
              i += c_len - 1;
              continue;
            }
            c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
            while (c_len > 1 && i < len) {
              c = (c << 6) | (buf[i++] & 0x3f);
              c_len--;
            }
            if (c_len > 1) {
              utf16buf[out++] = 0xfffd;
              continue;
            }
            if (c < 0x10000) {
              utf16buf[out++] = c;
            } else {
              c -= 0x10000;
              utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
              utf16buf[out++] = 0xdc00 | (c & 0x3ff);
            }
          }
          return buf2binstring(utf16buf, out);
        };
        exports.utf8border = function(buf, max) {
          var pos;
          max = max || buf.length;
          if (max > buf.length) {
            max = buf.length;
          }
          pos = max - 1;
          while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) {
            pos--;
          }
          if (pos < 0) {
            return max;
          }
          if (pos === 0) {
            return max;
          }
          return (pos + _utf8len[buf[pos]] > max) ? pos : max;
        };
      }, {"./common": 1}],
      3: [function(require, module, exports) {
        'use strict';
        function adler32(adler, buf, len, pos) {
          var s1 = (adler & 0xffff) | 0,
              s2 = ((adler >>> 16) & 0xffff) | 0,
              n = 0;
          while (len !== 0) {
            n = len > 2000 ? 2000 : len;
            len -= n;
            do {
              s1 = (s1 + buf[pos++]) | 0;
              s2 = (s2 + s1) | 0;
            } while (--n);
            s1 %= 65521;
            s2 %= 65521;
          }
          return (s1 | (s2 << 16)) | 0;
        }
        module.exports = adler32;
      }, {}],
      4: [function(require, module, exports) {
        'use strict';
        function makeTable() {
          var c,
              table = [];
          for (var n = 0; n < 256; n++) {
            c = n;
            for (var k = 0; k < 8; k++) {
              c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
            }
            table[n] = c;
          }
          return table;
        }
        var crcTable = makeTable();
        function crc32(crc, buf, len, pos) {
          var t = crcTable,
              end = pos + len;
          crc = crc ^ (-1);
          for (var i = pos; i < end; i++) {
            crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
          }
          return (crc ^ (-1));
        }
        module.exports = crc32;
      }, {}],
      5: [function(require, module, exports) {
        'use strict';
        var utils = require('../utils/common');
        var trees = require('./trees');
        var adler32 = require('./adler32');
        var crc32 = require('./crc32');
        var msg = require('./messages');
        var Z_NO_FLUSH = 0;
        var Z_PARTIAL_FLUSH = 1;
        var Z_FULL_FLUSH = 3;
        var Z_FINISH = 4;
        var Z_BLOCK = 5;
        var Z_OK = 0;
        var Z_STREAM_END = 1;
        var Z_STREAM_ERROR = -2;
        var Z_DATA_ERROR = -3;
        var Z_BUF_ERROR = -5;
        var Z_DEFAULT_COMPRESSION = -1;
        var Z_FILTERED = 1;
        var Z_HUFFMAN_ONLY = 2;
        var Z_RLE = 3;
        var Z_FIXED = 4;
        var Z_DEFAULT_STRATEGY = 0;
        var Z_UNKNOWN = 2;
        var Z_DEFLATED = 8;
        var MAX_MEM_LEVEL = 9;
        var MAX_WBITS = 15;
        var DEF_MEM_LEVEL = 8;
        var LENGTH_CODES = 29;
        var LITERALS = 256;
        var L_CODES = LITERALS + 1 + LENGTH_CODES;
        var D_CODES = 30;
        var BL_CODES = 19;
        var HEAP_SIZE = 2 * L_CODES + 1;
        var MAX_BITS = 15;
        var MIN_MATCH = 3;
        var MAX_MATCH = 258;
        var MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);
        var PRESET_DICT = 0x20;
        var INIT_STATE = 42;
        var EXTRA_STATE = 69;
        var NAME_STATE = 73;
        var COMMENT_STATE = 91;
        var HCRC_STATE = 103;
        var BUSY_STATE = 113;
        var FINISH_STATE = 666;
        var BS_NEED_MORE = 1;
        var BS_BLOCK_DONE = 2;
        var BS_FINISH_STARTED = 3;
        var BS_FINISH_DONE = 4;
        var OS_CODE = 0x03;
        function err(strm, errorCode) {
          strm.msg = msg[errorCode];
          return errorCode;
        }
        function rank(f) {
          return ((f) << 1) - ((f) > 4 ? 9 : 0);
        }
        function zero(buf) {
          var len = buf.length;
          while (--len >= 0) {
            buf[len] = 0;
          }
        }
        function flush_pending(strm) {
          var s = strm.state;
          var len = s.pending;
          if (len > strm.avail_out) {
            len = strm.avail_out;
          }
          if (len === 0) {
            return;
          }
          utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
          strm.next_out += len;
          s.pending_out += len;
          strm.total_out += len;
          strm.avail_out -= len;
          s.pending -= len;
          if (s.pending === 0) {
            s.pending_out = 0;
          }
        }
        function flush_block_only(s, last) {
          trees._tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
          s.block_start = s.strstart;
          flush_pending(s.strm);
        }
        function put_byte(s, b) {
          s.pending_buf[s.pending++] = b;
        }
        function putShortMSB(s, b) {
          s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
          s.pending_buf[s.pending++] = b & 0xff;
        }
        function read_buf(strm, buf, start, size) {
          var len = strm.avail_in;
          if (len > size) {
            len = size;
          }
          if (len === 0) {
            return 0;
          }
          strm.avail_in -= len;
          utils.arraySet(buf, strm.input, strm.next_in, len, start);
          if (strm.state.wrap === 1) {
            strm.adler = adler32(strm.adler, buf, len, start);
          } else if (strm.state.wrap === 2) {
            strm.adler = crc32(strm.adler, buf, len, start);
          }
          strm.next_in += len;
          strm.total_in += len;
          return len;
        }
        function longest_match(s, cur_match) {
          var chain_length = s.max_chain_length;
          var scan = s.strstart;
          var match;
          var len;
          var best_len = s.prev_length;
          var nice_match = s.nice_match;
          var limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ? s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0;
          var _win = s.window;
          var wmask = s.w_mask;
          var prev = s.prev;
          var strend = s.strstart + MAX_MATCH;
          var scan_end1 = _win[scan + best_len - 1];
          var scan_end = _win[scan + best_len];
          if (s.prev_length >= s.good_match) {
            chain_length >>= 2;
          }
          if (nice_match > s.lookahead) {
            nice_match = s.lookahead;
          }
          do {
            match = cur_match;
            if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) {
              continue;
            }
            scan += 2;
            match++;
            do {} while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
            len = MAX_MATCH - (strend - scan);
            scan = strend - MAX_MATCH;
            if (len > best_len) {
              s.match_start = cur_match;
              best_len = len;
              if (len >= nice_match) {
                break;
              }
              scan_end1 = _win[scan + best_len - 1];
              scan_end = _win[scan + best_len];
            }
          } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
          if (best_len <= s.lookahead) {
            return best_len;
          }
          return s.lookahead;
        }
        function fill_window(s) {
          var _w_size = s.w_size;
          var p,
              n,
              m,
              more,
              str;
          do {
            more = s.window_size - s.lookahead - s.strstart;
            if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
              utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
              s.match_start -= _w_size;
              s.strstart -= _w_size;
              s.block_start -= _w_size;
              n = s.hash_size;
              p = n;
              do {
                m = s.head[--p];
                s.head[p] = (m >= _w_size ? m - _w_size : 0);
              } while (--n);
              n = _w_size;
              p = n;
              do {
                m = s.prev[--p];
                s.prev[p] = (m >= _w_size ? m - _w_size : 0);
              } while (--n);
              more += _w_size;
            }
            if (s.strm.avail_in === 0) {
              break;
            }
            n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
            s.lookahead += n;
            if (s.lookahead + s.insert >= MIN_MATCH) {
              str = s.strstart - s.insert;
              s.ins_h = s.window[str];
              s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;
              while (s.insert) {
                s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;
                s.prev[str & s.w_mask] = s.head[s.ins_h];
                s.head[s.ins_h] = str;
                str++;
                s.insert--;
                if (s.lookahead + s.insert < MIN_MATCH) {
                  break;
                }
              }
            }
          } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
        }
        function deflate_stored(s, flush) {
          var max_block_size = 0xffff;
          if (max_block_size > s.pending_buf_size - 5) {
            max_block_size = s.pending_buf_size - 5;
          }
          for (; ; ) {
            if (s.lookahead <= 1) {
              fill_window(s);
              if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              if (s.lookahead === 0) {
                break;
              }
            }
            s.strstart += s.lookahead;
            s.lookahead = 0;
            var max_start = s.block_start + max_block_size;
            if (s.strstart === 0 || s.strstart >= max_start) {
              s.lookahead = s.strstart - max_start;
              s.strstart = max_start;
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
            if (s.strstart - s.block_start >= (s.w_size - MIN_LOOKAHEAD)) {
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
          }
          s.insert = 0;
          if (flush === Z_FINISH) {
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            return BS_FINISH_DONE;
          }
          if (s.strstart > s.block_start) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          return BS_NEED_MORE;
        }
        function deflate_fast(s, flush) {
          var hash_head;
          var bflush;
          for (; ; ) {
            if (s.lookahead < MIN_LOOKAHEAD) {
              fill_window(s);
              if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              if (s.lookahead === 0) {
                break;
              }
            }
            hash_head = 0;
            if (s.lookahead >= MIN_MATCH) {
              s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
            }
            if (hash_head !== 0 && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
              s.match_length = longest_match(s, hash_head);
            }
            if (s.match_length >= MIN_MATCH) {
              bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);
              s.lookahead -= s.match_length;
              if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH) {
                s.match_length--;
                do {
                  s.strstart++;
                  s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
                  hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                  s.head[s.ins_h] = s.strstart;
                } while (--s.match_length !== 0);
                s.strstart++;
              } else {
                s.strstart += s.match_length;
                s.match_length = 0;
                s.ins_h = s.window[s.strstart];
                s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) & s.hash_mask;
              }
            } else {
              bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
              s.lookahead--;
              s.strstart++;
            }
            if (bflush) {
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
          }
          s.insert = ((s.strstart < (MIN_MATCH - 1)) ? s.strstart : MIN_MATCH - 1);
          if (flush === Z_FINISH) {
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            return BS_FINISH_DONE;
          }
          if (s.last_lit) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          return BS_BLOCK_DONE;
        }
        function deflate_slow(s, flush) {
          var hash_head;
          var bflush;
          var max_insert;
          for (; ; ) {
            if (s.lookahead < MIN_LOOKAHEAD) {
              fill_window(s);
              if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              if (s.lookahead === 0) {
                break;
              }
            }
            hash_head = 0;
            if (s.lookahead >= MIN_MATCH) {
              s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
            }
            s.prev_length = s.match_length;
            s.prev_match = s.match_start;
            s.match_length = MIN_MATCH - 1;
            if (hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD)) {
              s.match_length = longest_match(s, hash_head);
              if (s.match_length <= 5 && (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096))) {
                s.match_length = MIN_MATCH - 1;
              }
            }
            if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
              max_insert = s.strstart + s.lookahead - MIN_MATCH;
              bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
              s.lookahead -= s.prev_length - 1;
              s.prev_length -= 2;
              do {
                if (++s.strstart <= max_insert) {
                  s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
                  hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                  s.head[s.ins_h] = s.strstart;
                }
              } while (--s.prev_length !== 0);
              s.match_available = 0;
              s.match_length = MIN_MATCH - 1;
              s.strstart++;
              if (bflush) {
                flush_block_only(s, false);
                if (s.strm.avail_out === 0) {
                  return BS_NEED_MORE;
                }
              }
            } else if (s.match_available) {
              bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
              if (bflush) {
                flush_block_only(s, false);
              }
              s.strstart++;
              s.lookahead--;
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            } else {
              s.match_available = 1;
              s.strstart++;
              s.lookahead--;
            }
          }
          if (s.match_available) {
            bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
            s.match_available = 0;
          }
          s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
          if (flush === Z_FINISH) {
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            return BS_FINISH_DONE;
          }
          if (s.last_lit) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          return BS_BLOCK_DONE;
        }
        function deflate_rle(s, flush) {
          var bflush;
          var prev;
          var scan,
              strend;
          var _win = s.window;
          for (; ; ) {
            if (s.lookahead <= MAX_MATCH) {
              fill_window(s);
              if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              if (s.lookahead === 0) {
                break;
              }
            }
            s.match_length = 0;
            if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
              scan = s.strstart - 1;
              prev = _win[scan];
              if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
                strend = s.strstart + MAX_MATCH;
                do {} while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
                s.match_length = MAX_MATCH - (strend - scan);
                if (s.match_length > s.lookahead) {
                  s.match_length = s.lookahead;
                }
              }
            }
            if (s.match_length >= MIN_MATCH) {
              bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);
              s.lookahead -= s.match_length;
              s.strstart += s.match_length;
              s.match_length = 0;
            } else {
              bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
              s.lookahead--;
              s.strstart++;
            }
            if (bflush) {
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
          }
          s.insert = 0;
          if (flush === Z_FINISH) {
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            return BS_FINISH_DONE;
          }
          if (s.last_lit) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          return BS_BLOCK_DONE;
        }
        function deflate_huff(s, flush) {
          var bflush;
          for (; ; ) {
            if (s.lookahead === 0) {
              fill_window(s);
              if (s.lookahead === 0) {
                if (flush === Z_NO_FLUSH) {
                  return BS_NEED_MORE;
                }
                break;
              }
            }
            s.match_length = 0;
            bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
            s.lookahead--;
            s.strstart++;
            if (bflush) {
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
          }
          s.insert = 0;
          if (flush === Z_FINISH) {
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            return BS_FINISH_DONE;
          }
          if (s.last_lit) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          return BS_BLOCK_DONE;
        }
        var Config = function(good_length, max_lazy, nice_length, max_chain, func) {
          this.good_length = good_length;
          this.max_lazy = max_lazy;
          this.nice_length = nice_length;
          this.max_chain = max_chain;
          this.func = func;
        };
        var configuration_table;
        configuration_table = [new Config(0, 0, 0, 0, deflate_stored), new Config(4, 4, 8, 4, deflate_fast), new Config(4, 5, 16, 8, deflate_fast), new Config(4, 6, 32, 32, deflate_fast), new Config(4, 4, 16, 16, deflate_slow), new Config(8, 16, 32, 32, deflate_slow), new Config(8, 16, 128, 128, deflate_slow), new Config(8, 32, 128, 256, deflate_slow), new Config(32, 128, 258, 1024, deflate_slow), new Config(32, 258, 258, 4096, deflate_slow)];
        function lm_init(s) {
          s.window_size = 2 * s.w_size;
          zero(s.head);
          s.max_lazy_match = configuration_table[s.level].max_lazy;
          s.good_match = configuration_table[s.level].good_length;
          s.nice_match = configuration_table[s.level].nice_length;
          s.max_chain_length = configuration_table[s.level].max_chain;
          s.strstart = 0;
          s.block_start = 0;
          s.lookahead = 0;
          s.insert = 0;
          s.match_length = s.prev_length = MIN_MATCH - 1;
          s.match_available = 0;
          s.ins_h = 0;
        }
        function DeflateState() {
          this.strm = null;
          this.status = 0;
          this.pending_buf = null;
          this.pending_buf_size = 0;
          this.pending_out = 0;
          this.pending = 0;
          this.wrap = 0;
          this.gzhead = null;
          this.gzindex = 0;
          this.method = Z_DEFLATED;
          this.last_flush = -1;
          this.w_size = 0;
          this.w_bits = 0;
          this.w_mask = 0;
          this.window = null;
          this.window_size = 0;
          this.prev = null;
          this.head = null;
          this.ins_h = 0;
          this.hash_size = 0;
          this.hash_bits = 0;
          this.hash_mask = 0;
          this.hash_shift = 0;
          this.block_start = 0;
          this.match_length = 0;
          this.prev_match = 0;
          this.match_available = 0;
          this.strstart = 0;
          this.match_start = 0;
          this.lookahead = 0;
          this.prev_length = 0;
          this.max_chain_length = 0;
          this.max_lazy_match = 0;
          this.level = 0;
          this.strategy = 0;
          this.good_match = 0;
          this.nice_match = 0;
          this.dyn_ltree = new utils.Buf16(HEAP_SIZE * 2);
          this.dyn_dtree = new utils.Buf16((2 * D_CODES + 1) * 2);
          this.bl_tree = new utils.Buf16((2 * BL_CODES + 1) * 2);
          zero(this.dyn_ltree);
          zero(this.dyn_dtree);
          zero(this.bl_tree);
          this.l_desc = null;
          this.d_desc = null;
          this.bl_desc = null;
          this.bl_count = new utils.Buf16(MAX_BITS + 1);
          this.heap = new utils.Buf16(2 * L_CODES + 1);
          zero(this.heap);
          this.heap_len = 0;
          this.heap_max = 0;
          this.depth = new utils.Buf16(2 * L_CODES + 1);
          zero(this.depth);
          this.l_buf = 0;
          this.lit_bufsize = 0;
          this.last_lit = 0;
          this.d_buf = 0;
          this.opt_len = 0;
          this.static_len = 0;
          this.matches = 0;
          this.insert = 0;
          this.bi_buf = 0;
          this.bi_valid = 0;
        }
        function deflateResetKeep(strm) {
          var s;
          if (!strm || !strm.state) {
            return err(strm, Z_STREAM_ERROR);
          }
          strm.total_in = strm.total_out = 0;
          strm.data_type = Z_UNKNOWN;
          s = strm.state;
          s.pending = 0;
          s.pending_out = 0;
          if (s.wrap < 0) {
            s.wrap = -s.wrap;
          }
          s.status = (s.wrap ? INIT_STATE : BUSY_STATE);
          strm.adler = (s.wrap === 2) ? 0 : 1;
          s.last_flush = Z_NO_FLUSH;
          trees._tr_init(s);
          return Z_OK;
        }
        function deflateReset(strm) {
          var ret = deflateResetKeep(strm);
          if (ret === Z_OK) {
            lm_init(strm.state);
          }
          return ret;
        }
        function deflateSetHeader(strm, head) {
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          if (strm.state.wrap !== 2) {
            return Z_STREAM_ERROR;
          }
          strm.state.gzhead = head;
          return Z_OK;
        }
        function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
          if (!strm) {
            return Z_STREAM_ERROR;
          }
          var wrap = 1;
          if (level === Z_DEFAULT_COMPRESSION) {
            level = 6;
          }
          if (windowBits < 0) {
            wrap = 0;
            windowBits = -windowBits;
          } else if (windowBits > 15) {
            wrap = 2;
            windowBits -= 16;
          }
          if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED) {
            return err(strm, Z_STREAM_ERROR);
          }
          if (windowBits === 8) {
            windowBits = 9;
          }
          var s = new DeflateState();
          strm.state = s;
          s.strm = strm;
          s.wrap = wrap;
          s.gzhead = null;
          s.w_bits = windowBits;
          s.w_size = 1 << s.w_bits;
          s.w_mask = s.w_size - 1;
          s.hash_bits = memLevel + 7;
          s.hash_size = 1 << s.hash_bits;
          s.hash_mask = s.hash_size - 1;
          s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
          s.window = new utils.Buf8(s.w_size * 2);
          s.head = new utils.Buf16(s.hash_size);
          s.prev = new utils.Buf16(s.w_size);
          s.lit_bufsize = 1 << (memLevel + 6);
          s.pending_buf_size = s.lit_bufsize * 4;
          s.pending_buf = new utils.Buf8(s.pending_buf_size);
          s.d_buf = s.lit_bufsize >> 1;
          s.l_buf = (1 + 2) * s.lit_bufsize;
          s.level = level;
          s.strategy = strategy;
          s.method = method;
          return deflateReset(strm);
        }
        function deflateInit(strm, level) {
          return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
        }
        function deflate(strm, flush) {
          var old_flush,
              s;
          var beg,
              val;
          if (!strm || !strm.state || flush > Z_BLOCK || flush < 0) {
            return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
          }
          s = strm.state;
          if (!strm.output || (!strm.input && strm.avail_in !== 0) || (s.status === FINISH_STATE && flush !== Z_FINISH)) {
            return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR : Z_STREAM_ERROR);
          }
          s.strm = strm;
          old_flush = s.last_flush;
          s.last_flush = flush;
          if (s.status === INIT_STATE) {
            if (s.wrap === 2) {
              strm.adler = 0;
              put_byte(s, 31);
              put_byte(s, 139);
              put_byte(s, 8);
              if (!s.gzhead) {
                put_byte(s, 0);
                put_byte(s, 0);
                put_byte(s, 0);
                put_byte(s, 0);
                put_byte(s, 0);
                put_byte(s, s.level === 9 ? 2 : (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0));
                put_byte(s, OS_CODE);
                s.status = BUSY_STATE;
              } else {
                put_byte(s, (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16));
                put_byte(s, s.gzhead.time & 0xff);
                put_byte(s, (s.gzhead.time >> 8) & 0xff);
                put_byte(s, (s.gzhead.time >> 16) & 0xff);
                put_byte(s, (s.gzhead.time >> 24) & 0xff);
                put_byte(s, s.level === 9 ? 2 : (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0));
                put_byte(s, s.gzhead.os & 0xff);
                if (s.gzhead.extra && s.gzhead.extra.length) {
                  put_byte(s, s.gzhead.extra.length & 0xff);
                  put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
                }
                if (s.gzhead.hcrc) {
                  strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
                }
                s.gzindex = 0;
                s.status = EXTRA_STATE;
              }
            } else {
              var header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;
              var level_flags = -1;
              if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
                level_flags = 0;
              } else if (s.level < 6) {
                level_flags = 1;
              } else if (s.level === 6) {
                level_flags = 2;
              } else {
                level_flags = 3;
              }
              header |= (level_flags << 6);
              if (s.strstart !== 0) {
                header |= PRESET_DICT;
              }
              header += 31 - (header % 31);
              s.status = BUSY_STATE;
              putShortMSB(s, header);
              if (s.strstart !== 0) {
                putShortMSB(s, strm.adler >>> 16);
                putShortMSB(s, strm.adler & 0xffff);
              }
              strm.adler = 1;
            }
          }
          if (s.status === EXTRA_STATE) {
            if (s.gzhead.extra) {
              beg = s.pending;
              while (s.gzindex < (s.gzhead.extra.length & 0xffff)) {
                if (s.pending === s.pending_buf_size) {
                  if (s.gzhead.hcrc && s.pending > beg) {
                    strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                  }
                  flush_pending(strm);
                  beg = s.pending;
                  if (s.pending === s.pending_buf_size) {
                    break;
                  }
                }
                put_byte(s, s.gzhead.extra[s.gzindex] & 0xff);
                s.gzindex++;
              }
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              if (s.gzindex === s.gzhead.extra.length) {
                s.gzindex = 0;
                s.status = NAME_STATE;
              }
            } else {
              s.status = NAME_STATE;
            }
          }
          if (s.status === NAME_STATE) {
            if (s.gzhead.name) {
              beg = s.pending;
              do {
                if (s.pending === s.pending_buf_size) {
                  if (s.gzhead.hcrc && s.pending > beg) {
                    strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                  }
                  flush_pending(strm);
                  beg = s.pending;
                  if (s.pending === s.pending_buf_size) {
                    val = 1;
                    break;
                  }
                }
                if (s.gzindex < s.gzhead.name.length) {
                  val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
                } else {
                  val = 0;
                }
                put_byte(s, val);
              } while (val !== 0);
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              if (val === 0) {
                s.gzindex = 0;
                s.status = COMMENT_STATE;
              }
            } else {
              s.status = COMMENT_STATE;
            }
          }
          if (s.status === COMMENT_STATE) {
            if (s.gzhead.comment) {
              beg = s.pending;
              do {
                if (s.pending === s.pending_buf_size) {
                  if (s.gzhead.hcrc && s.pending > beg) {
                    strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                  }
                  flush_pending(strm);
                  beg = s.pending;
                  if (s.pending === s.pending_buf_size) {
                    val = 1;
                    break;
                  }
                }
                if (s.gzindex < s.gzhead.comment.length) {
                  val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
                } else {
                  val = 0;
                }
                put_byte(s, val);
              } while (val !== 0);
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              if (val === 0) {
                s.status = HCRC_STATE;
              }
            } else {
              s.status = HCRC_STATE;
            }
          }
          if (s.status === HCRC_STATE) {
            if (s.gzhead.hcrc) {
              if (s.pending + 2 > s.pending_buf_size) {
                flush_pending(strm);
              }
              if (s.pending + 2 <= s.pending_buf_size) {
                put_byte(s, strm.adler & 0xff);
                put_byte(s, (strm.adler >> 8) & 0xff);
                strm.adler = 0;
                s.status = BUSY_STATE;
              }
            } else {
              s.status = BUSY_STATE;
            }
          }
          if (s.pending !== 0) {
            flush_pending(strm);
            if (strm.avail_out === 0) {
              s.last_flush = -1;
              return Z_OK;
            }
          } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== Z_FINISH) {
            return err(strm, Z_BUF_ERROR);
          }
          if (s.status === FINISH_STATE && strm.avail_in !== 0) {
            return err(strm, Z_BUF_ERROR);
          }
          if (strm.avail_in !== 0 || s.lookahead !== 0 || (flush !== Z_NO_FLUSH && s.status !== FINISH_STATE)) {
            var bstate = (s.strategy === Z_HUFFMAN_ONLY) ? deflate_huff(s, flush) : (s.strategy === Z_RLE ? deflate_rle(s, flush) : configuration_table[s.level].func(s, flush));
            if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
              s.status = FINISH_STATE;
            }
            if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
              if (strm.avail_out === 0) {
                s.last_flush = -1;
              }
              return Z_OK;
            }
            if (bstate === BS_BLOCK_DONE) {
              if (flush === Z_PARTIAL_FLUSH) {
                trees._tr_align(s);
              } else if (flush !== Z_BLOCK) {
                trees._tr_stored_block(s, 0, 0, false);
                if (flush === Z_FULL_FLUSH) {
                  zero(s.head);
                  if (s.lookahead === 0) {
                    s.strstart = 0;
                    s.block_start = 0;
                    s.insert = 0;
                  }
                }
              }
              flush_pending(strm);
              if (strm.avail_out === 0) {
                s.last_flush = -1;
                return Z_OK;
              }
            }
          }
          if (flush !== Z_FINISH) {
            return Z_OK;
          }
          if (s.wrap <= 0) {
            return Z_STREAM_END;
          }
          if (s.wrap === 2) {
            put_byte(s, strm.adler & 0xff);
            put_byte(s, (strm.adler >> 8) & 0xff);
            put_byte(s, (strm.adler >> 16) & 0xff);
            put_byte(s, (strm.adler >> 24) & 0xff);
            put_byte(s, strm.total_in & 0xff);
            put_byte(s, (strm.total_in >> 8) & 0xff);
            put_byte(s, (strm.total_in >> 16) & 0xff);
            put_byte(s, (strm.total_in >> 24) & 0xff);
          } else {
            putShortMSB(s, strm.adler >>> 16);
            putShortMSB(s, strm.adler & 0xffff);
          }
          flush_pending(strm);
          if (s.wrap > 0) {
            s.wrap = -s.wrap;
          }
          return s.pending !== 0 ? Z_OK : Z_STREAM_END;
        }
        function deflateEnd(strm) {
          var status;
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          status = strm.state.status;
          if (status !== INIT_STATE && status !== EXTRA_STATE && status !== NAME_STATE && status !== COMMENT_STATE && status !== HCRC_STATE && status !== BUSY_STATE && status !== FINISH_STATE) {
            return err(strm, Z_STREAM_ERROR);
          }
          strm.state = null;
          return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
        }
        exports.deflateInit = deflateInit;
        exports.deflateInit2 = deflateInit2;
        exports.deflateReset = deflateReset;
        exports.deflateResetKeep = deflateResetKeep;
        exports.deflateSetHeader = deflateSetHeader;
        exports.deflate = deflate;
        exports.deflateEnd = deflateEnd;
        exports.deflateInfo = 'pako deflate (from Nodeca project)';
      }, {
        "../utils/common": 1,
        "./adler32": 3,
        "./crc32": 4,
        "./messages": 6,
        "./trees": 7
      }],
      6: [function(require, module, exports) {
        'use strict';
        module.exports = {
          '2': 'need dictionary',
          '1': 'stream end',
          '0': '',
          '-1': 'file error',
          '-2': 'stream error',
          '-3': 'data error',
          '-4': 'insufficient memory',
          '-5': 'buffer error',
          '-6': 'incompatible version'
        };
      }, {}],
      7: [function(require, module, exports) {
        'use strict';
        var utils = require('../utils/common');
        var Z_FIXED = 4;
        var Z_BINARY = 0;
        var Z_TEXT = 1;
        var Z_UNKNOWN = 2;
        function zero(buf) {
          var len = buf.length;
          while (--len >= 0) {
            buf[len] = 0;
          }
        }
        var STORED_BLOCK = 0;
        var STATIC_TREES = 1;
        var DYN_TREES = 2;
        var MIN_MATCH = 3;
        var MAX_MATCH = 258;
        var LENGTH_CODES = 29;
        var LITERALS = 256;
        var L_CODES = LITERALS + 1 + LENGTH_CODES;
        var D_CODES = 30;
        var BL_CODES = 19;
        var HEAP_SIZE = 2 * L_CODES + 1;
        var MAX_BITS = 15;
        var Buf_size = 16;
        var MAX_BL_BITS = 7;
        var END_BLOCK = 256;
        var REP_3_6 = 16;
        var REPZ_3_10 = 17;
        var REPZ_11_138 = 18;
        var extra_lbits = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
        var extra_dbits = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
        var extra_blbits = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7];
        var bl_order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
        var DIST_CODE_LEN = 512;
        var static_ltree = new Array((L_CODES + 2) * 2);
        zero(static_ltree);
        var static_dtree = new Array(D_CODES * 2);
        zero(static_dtree);
        var _dist_code = new Array(DIST_CODE_LEN);
        zero(_dist_code);
        var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
        zero(_length_code);
        var base_length = new Array(LENGTH_CODES);
        zero(base_length);
        var base_dist = new Array(D_CODES);
        zero(base_dist);
        var StaticTreeDesc = function(static_tree, extra_bits, extra_base, elems, max_length) {
          this.static_tree = static_tree;
          this.extra_bits = extra_bits;
          this.extra_base = extra_base;
          this.elems = elems;
          this.max_length = max_length;
          this.has_stree = static_tree && static_tree.length;
        };
        var static_l_desc;
        var static_d_desc;
        var static_bl_desc;
        var TreeDesc = function(dyn_tree, stat_desc) {
          this.dyn_tree = dyn_tree;
          this.max_code = 0;
          this.stat_desc = stat_desc;
        };
        function d_code(dist) {
          return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
        }
        function put_short(s, w) {
          s.pending_buf[s.pending++] = (w) & 0xff;
          s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
        }
        function send_bits(s, value, length) {
          if (s.bi_valid > (Buf_size - length)) {
            s.bi_buf |= (value << s.bi_valid) & 0xffff;
            put_short(s, s.bi_buf);
            s.bi_buf = value >> (Buf_size - s.bi_valid);
            s.bi_valid += length - Buf_size;
          } else {
            s.bi_buf |= (value << s.bi_valid) & 0xffff;
            s.bi_valid += length;
          }
        }
        function send_code(s, c, tree) {
          send_bits(s, tree[c * 2], tree[c * 2 + 1]);
        }
        function bi_reverse(code, len) {
          var res = 0;
          do {
            res |= code & 1;
            code >>>= 1;
            res <<= 1;
          } while (--len > 0);
          return res >>> 1;
        }
        function bi_flush(s) {
          if (s.bi_valid === 16) {
            put_short(s, s.bi_buf);
            s.bi_buf = 0;
            s.bi_valid = 0;
          } else if (s.bi_valid >= 8) {
            s.pending_buf[s.pending++] = s.bi_buf & 0xff;
            s.bi_buf >>= 8;
            s.bi_valid -= 8;
          }
        }
        function gen_bitlen(s, desc) {
          var tree = desc.dyn_tree;
          var max_code = desc.max_code;
          var stree = desc.stat_desc.static_tree;
          var has_stree = desc.stat_desc.has_stree;
          var extra = desc.stat_desc.extra_bits;
          var base = desc.stat_desc.extra_base;
          var max_length = desc.stat_desc.max_length;
          var h;
          var n,
              m;
          var bits;
          var xbits;
          var f;
          var overflow = 0;
          for (bits = 0; bits <= MAX_BITS; bits++) {
            s.bl_count[bits] = 0;
          }
          tree[s.heap[s.heap_max] * 2 + 1] = 0;
          for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
            n = s.heap[h];
            bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
            if (bits > max_length) {
              bits = max_length;
              overflow++;
            }
            tree[n * 2 + 1] = bits;
            if (n > max_code) {
              continue;
            }
            s.bl_count[bits]++;
            xbits = 0;
            if (n >= base) {
              xbits = extra[n - base];
            }
            f = tree[n * 2];
            s.opt_len += f * (bits + xbits);
            if (has_stree) {
              s.static_len += f * (stree[n * 2 + 1] + xbits);
            }
          }
          if (overflow === 0) {
            return;
          }
          do {
            bits = max_length - 1;
            while (s.bl_count[bits] === 0) {
              bits--;
            }
            s.bl_count[bits]--;
            s.bl_count[bits + 1] += 2;
            s.bl_count[max_length]--;
            overflow -= 2;
          } while (overflow > 0);
          for (bits = max_length; bits !== 0; bits--) {
            n = s.bl_count[bits];
            while (n !== 0) {
              m = s.heap[--h];
              if (m > max_code) {
                continue;
              }
              if (tree[m * 2 + 1] !== bits) {
                s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
                tree[m * 2 + 1] = bits;
              }
              n--;
            }
          }
        }
        function gen_codes(tree, max_code, bl_count) {
          var next_code = new Array(MAX_BITS + 1);
          var code = 0;
          var bits;
          var n;
          for (bits = 1; bits <= MAX_BITS; bits++) {
            next_code[bits] = code = (code + bl_count[bits - 1]) << 1;
          }
          for (n = 0; n <= max_code; n++) {
            var len = tree[n * 2 + 1];
            if (len === 0) {
              continue;
            }
            tree[n * 2] = bi_reverse(next_code[len]++, len);
          }
        }
        function tr_static_init() {
          var n;
          var bits;
          var length;
          var code;
          var dist;
          var bl_count = new Array(MAX_BITS + 1);
          length = 0;
          for (code = 0; code < LENGTH_CODES - 1; code++) {
            base_length[code] = length;
            for (n = 0; n < (1 << extra_lbits[code]); n++) {
              _length_code[length++] = code;
            }
          }
          _length_code[length - 1] = code;
          dist = 0;
          for (code = 0; code < 16; code++) {
            base_dist[code] = dist;
            for (n = 0; n < (1 << extra_dbits[code]); n++) {
              _dist_code[dist++] = code;
            }
          }
          dist >>= 7;
          for (; code < D_CODES; code++) {
            base_dist[code] = dist << 7;
            for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {
              _dist_code[256 + dist++] = code;
            }
          }
          for (bits = 0; bits <= MAX_BITS; bits++) {
            bl_count[bits] = 0;
          }
          n = 0;
          while (n <= 143) {
            static_ltree[n * 2 + 1] = 8;
            n++;
            bl_count[8]++;
          }
          while (n <= 255) {
            static_ltree[n * 2 + 1] = 9;
            n++;
            bl_count[9]++;
          }
          while (n <= 279) {
            static_ltree[n * 2 + 1] = 7;
            n++;
            bl_count[7]++;
          }
          while (n <= 287) {
            static_ltree[n * 2 + 1] = 8;
            n++;
            bl_count[8]++;
          }
          gen_codes(static_ltree, L_CODES + 1, bl_count);
          for (n = 0; n < D_CODES; n++) {
            static_dtree[n * 2 + 1] = 5;
            static_dtree[n * 2] = bi_reverse(n, 5);
          }
          static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
          static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS);
          static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);
        }
        function init_block(s) {
          var n;
          for (n = 0; n < L_CODES; n++) {
            s.dyn_ltree[n * 2] = 0;
          }
          for (n = 0; n < D_CODES; n++) {
            s.dyn_dtree[n * 2] = 0;
          }
          for (n = 0; n < BL_CODES; n++) {
            s.bl_tree[n * 2] = 0;
          }
          s.dyn_ltree[END_BLOCK * 2] = 1;
          s.opt_len = s.static_len = 0;
          s.last_lit = s.matches = 0;
        }
        function bi_windup(s) {
          if (s.bi_valid > 8) {
            put_short(s, s.bi_buf);
          } else if (s.bi_valid > 0) {
            s.pending_buf[s.pending++] = s.bi_buf;
          }
          s.bi_buf = 0;
          s.bi_valid = 0;
        }
        function copy_block(s, buf, len, header) {
          bi_windup(s);
          if (header) {
            put_short(s, len);
            put_short(s, ~len);
          }
          utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
          s.pending += len;
        }
        function smaller(tree, n, m, depth) {
          var _n2 = n * 2;
          var _m2 = m * 2;
          return (tree[_n2] < tree[_m2] || (tree[_n2] === tree[_m2] && depth[n] <= depth[m]));
        }
        function pqdownheap(s, tree, k) {
          var v = s.heap[k];
          var j = k << 1;
          while (j <= s.heap_len) {
            if (j < s.heap_len && smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
              j++;
            }
            if (smaller(tree, v, s.heap[j], s.depth)) {
              break;
            }
            s.heap[k] = s.heap[j];
            k = j;
            j <<= 1;
          }
          s.heap[k] = v;
        }
        function compress_block(s, ltree, dtree) {
          var dist;
          var lc;
          var lx = 0;
          var code;
          var extra;
          if (s.last_lit !== 0) {
            do {
              dist = (s.pending_buf[s.d_buf + lx * 2] << 8) | (s.pending_buf[s.d_buf + lx * 2 + 1]);
              lc = s.pending_buf[s.l_buf + lx];
              lx++;
              if (dist === 0) {
                send_code(s, lc, ltree);
              } else {
                code = _length_code[lc];
                send_code(s, code + LITERALS + 1, ltree);
                extra = extra_lbits[code];
                if (extra !== 0) {
                  lc -= base_length[code];
                  send_bits(s, lc, extra);
                }
                dist--;
                code = d_code(dist);
                send_code(s, code, dtree);
                extra = extra_dbits[code];
                if (extra !== 0) {
                  dist -= base_dist[code];
                  send_bits(s, dist, extra);
                }
              }
            } while (lx < s.last_lit);
          }
          send_code(s, END_BLOCK, ltree);
        }
        function build_tree(s, desc) {
          var tree = desc.dyn_tree;
          var stree = desc.stat_desc.static_tree;
          var has_stree = desc.stat_desc.has_stree;
          var elems = desc.stat_desc.elems;
          var n,
              m;
          var max_code = -1;
          var node;
          s.heap_len = 0;
          s.heap_max = HEAP_SIZE;
          for (n = 0; n < elems; n++) {
            if (tree[n * 2] !== 0) {
              s.heap[++s.heap_len] = max_code = n;
              s.depth[n] = 0;
            } else {
              tree[n * 2 + 1] = 0;
            }
          }
          while (s.heap_len < 2) {
            node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
            tree[node * 2] = 1;
            s.depth[node] = 0;
            s.opt_len--;
            if (has_stree) {
              s.static_len -= stree[node * 2 + 1];
            }
          }
          desc.max_code = max_code;
          for (n = (s.heap_len >> 1); n >= 1; n--) {
            pqdownheap(s, tree, n);
          }
          node = elems;
          do {
            n = s.heap[1];
            s.heap[1] = s.heap[s.heap_len--];
            pqdownheap(s, tree, 1);
            m = s.heap[1];
            s.heap[--s.heap_max] = n;
            s.heap[--s.heap_max] = m;
            tree[node * 2] = tree[n * 2] + tree[m * 2];
            s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
            tree[n * 2 + 1] = tree[m * 2 + 1] = node;
            s.heap[1] = node++;
            pqdownheap(s, tree, 1);
          } while (s.heap_len >= 2);
          s.heap[--s.heap_max] = s.heap[1];
          gen_bitlen(s, desc);
          gen_codes(tree, max_code, s.bl_count);
        }
        function scan_tree(s, tree, max_code) {
          var n;
          var prevlen = -1;
          var curlen;
          var nextlen = tree[0 * 2 + 1];
          var count = 0;
          var max_count = 7;
          var min_count = 4;
          if (nextlen === 0) {
            max_count = 138;
            min_count = 3;
          }
          tree[(max_code + 1) * 2 + 1] = 0xffff;
          for (n = 0; n <= max_code; n++) {
            curlen = nextlen;
            nextlen = tree[(n + 1) * 2 + 1];
            if (++count < max_count && curlen === nextlen) {
              continue;
            } else if (count < min_count) {
              s.bl_tree[curlen * 2] += count;
            } else if (curlen !== 0) {
              if (curlen !== prevlen) {
                s.bl_tree[curlen * 2]++;
              }
              s.bl_tree[REP_3_6 * 2]++;
            } else if (count <= 10) {
              s.bl_tree[REPZ_3_10 * 2]++;
            } else {
              s.bl_tree[REPZ_11_138 * 2]++;
            }
            count = 0;
            prevlen = curlen;
            if (nextlen === 0) {
              max_count = 138;
              min_count = 3;
            } else if (curlen === nextlen) {
              max_count = 6;
              min_count = 3;
            } else {
              max_count = 7;
              min_count = 4;
            }
          }
        }
        function send_tree(s, tree, max_code) {
          var n;
          var prevlen = -1;
          var curlen;
          var nextlen = tree[0 * 2 + 1];
          var count = 0;
          var max_count = 7;
          var min_count = 4;
          if (nextlen === 0) {
            max_count = 138;
            min_count = 3;
          }
          for (n = 0; n <= max_code; n++) {
            curlen = nextlen;
            nextlen = tree[(n + 1) * 2 + 1];
            if (++count < max_count && curlen === nextlen) {
              continue;
            } else if (count < min_count) {
              do {
                send_code(s, curlen, s.bl_tree);
              } while (--count !== 0);
            } else if (curlen !== 0) {
              if (curlen !== prevlen) {
                send_code(s, curlen, s.bl_tree);
                count--;
              }
              send_code(s, REP_3_6, s.bl_tree);
              send_bits(s, count - 3, 2);
            } else if (count <= 10) {
              send_code(s, REPZ_3_10, s.bl_tree);
              send_bits(s, count - 3, 3);
            } else {
              send_code(s, REPZ_11_138, s.bl_tree);
              send_bits(s, count - 11, 7);
            }
            count = 0;
            prevlen = curlen;
            if (nextlen === 0) {
              max_count = 138;
              min_count = 3;
            } else if (curlen === nextlen) {
              max_count = 6;
              min_count = 3;
            } else {
              max_count = 7;
              min_count = 4;
            }
          }
        }
        function build_bl_tree(s) {
          var max_blindex;
          scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
          scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
          build_tree(s, s.bl_desc);
          for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
            if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
              break;
            }
          }
          s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
          return max_blindex;
        }
        function send_all_trees(s, lcodes, dcodes, blcodes) {
          var rank;
          send_bits(s, lcodes - 257, 5);
          send_bits(s, dcodes - 1, 5);
          send_bits(s, blcodes - 4, 4);
          for (rank = 0; rank < blcodes; rank++) {
            send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1], 3);
          }
          send_tree(s, s.dyn_ltree, lcodes - 1);
          send_tree(s, s.dyn_dtree, dcodes - 1);
        }
        function detect_data_type(s) {
          var black_mask = 0xf3ffc07f;
          var n;
          for (n = 0; n <= 31; n++, black_mask >>>= 1) {
            if ((black_mask & 1) && (s.dyn_ltree[n * 2] !== 0)) {
              return Z_BINARY;
            }
          }
          if (s.dyn_ltree[9 * 2] !== 0 || s.dyn_ltree[10 * 2] !== 0 || s.dyn_ltree[13 * 2] !== 0) {
            return Z_TEXT;
          }
          for (n = 32; n < LITERALS; n++) {
            if (s.dyn_ltree[n * 2] !== 0) {
              return Z_TEXT;
            }
          }
          return Z_BINARY;
        }
        var static_init_done = false;
        function _tr_init(s) {
          if (!static_init_done) {
            tr_static_init();
            static_init_done = true;
          }
          s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
          s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
          s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
          s.bi_buf = 0;
          s.bi_valid = 0;
          init_block(s);
        }
        function _tr_stored_block(s, buf, stored_len, last) {
          send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
          copy_block(s, buf, stored_len, true);
        }
        function _tr_align(s) {
          send_bits(s, STATIC_TREES << 1, 3);
          send_code(s, END_BLOCK, static_ltree);
          bi_flush(s);
        }
        function _tr_flush_block(s, buf, stored_len, last) {
          var opt_lenb,
              static_lenb;
          var max_blindex = 0;
          if (s.level > 0) {
            if (s.strm.data_type === Z_UNKNOWN) {
              s.strm.data_type = detect_data_type(s);
            }
            build_tree(s, s.l_desc);
            build_tree(s, s.d_desc);
            max_blindex = build_bl_tree(s);
            opt_lenb = (s.opt_len + 3 + 7) >>> 3;
            static_lenb = (s.static_len + 3 + 7) >>> 3;
            if (static_lenb <= opt_lenb) {
              opt_lenb = static_lenb;
            }
          } else {
            opt_lenb = static_lenb = stored_len + 5;
          }
          if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {
            _tr_stored_block(s, buf, stored_len, last);
          } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {
            send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
            compress_block(s, static_ltree, static_dtree);
          } else {
            send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
            send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
            compress_block(s, s.dyn_ltree, s.dyn_dtree);
          }
          init_block(s);
          if (last) {
            bi_windup(s);
          }
        }
        function _tr_tally(s, dist, lc) {
          s.pending_buf[s.d_buf + s.last_lit * 2] = (dist >>> 8) & 0xff;
          s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 0xff;
          s.pending_buf[s.l_buf + s.last_lit] = lc & 0xff;
          s.last_lit++;
          if (dist === 0) {
            s.dyn_ltree[lc * 2]++;
          } else {
            s.matches++;
            dist--;
            s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]++;
            s.dyn_dtree[d_code(dist) * 2]++;
          }
          return (s.last_lit === s.lit_bufsize - 1);
        }
        exports._tr_init = _tr_init;
        exports._tr_stored_block = _tr_stored_block;
        exports._tr_flush_block = _tr_flush_block;
        exports._tr_tally = _tr_tally;
        exports._tr_align = _tr_align;
      }, {"../utils/common": 1}],
      8: [function(require, module, exports) {
        'use strict';
        function ZStream() {
          this.input = null;
          this.next_in = 0;
          this.avail_in = 0;
          this.total_in = 0;
          this.output = null;
          this.next_out = 0;
          this.avail_out = 0;
          this.total_out = 0;
          this.msg = '';
          this.state = null;
          this.data_type = 2;
          this.adler = 0;
        }
        module.exports = ZStream;
      }, {}],
      "/lib/deflate.js": [function(require, module, exports) {
        'use strict';
        var zlib_deflate = require('./zlib/deflate');
        var utils = require('./utils/common');
        var strings = require('./utils/strings');
        var msg = require('./zlib/messages');
        var zstream = require('./zlib/zstream');
        var toString = Object.prototype.toString;
        var Z_NO_FLUSH = 0;
        var Z_FINISH = 4;
        var Z_OK = 0;
        var Z_STREAM_END = 1;
        var Z_SYNC_FLUSH = 2;
        var Z_DEFAULT_COMPRESSION = -1;
        var Z_DEFAULT_STRATEGY = 0;
        var Z_DEFLATED = 8;
        var Deflate = function(options) {
          this.options = utils.assign({
            level: Z_DEFAULT_COMPRESSION,
            method: Z_DEFLATED,
            chunkSize: 16384,
            windowBits: 15,
            memLevel: 8,
            strategy: Z_DEFAULT_STRATEGY,
            to: ''
          }, options || {});
          var opt = this.options;
          if (opt.raw && (opt.windowBits > 0)) {
            opt.windowBits = -opt.windowBits;
          } else if (opt.gzip && (opt.windowBits > 0) && (opt.windowBits < 16)) {
            opt.windowBits += 16;
          }
          this.err = 0;
          this.msg = '';
          this.ended = false;
          this.chunks = [];
          this.strm = new zstream();
          this.strm.avail_out = 0;
          var status = zlib_deflate.deflateInit2(this.strm, opt.level, opt.method, opt.windowBits, opt.memLevel, opt.strategy);
          if (status !== Z_OK) {
            throw new Error(msg[status]);
          }
          if (opt.header) {
            zlib_deflate.deflateSetHeader(this.strm, opt.header);
          }
        };
        Deflate.prototype.push = function(data, mode) {
          var strm = this.strm;
          var chunkSize = this.options.chunkSize;
          var status,
              _mode;
          if (this.ended) {
            return false;
          }
          _mode = (mode === ~~mode) ? mode : ((mode === true) ? Z_FINISH : Z_NO_FLUSH);
          if (typeof data === 'string') {
            strm.input = strings.string2buf(data);
          } else if (toString.call(data) === '[object ArrayBuffer]') {
            strm.input = new Uint8Array(data);
          } else {
            strm.input = data;
          }
          strm.next_in = 0;
          strm.avail_in = strm.input.length;
          do {
            if (strm.avail_out === 0) {
              strm.output = new utils.Buf8(chunkSize);
              strm.next_out = 0;
              strm.avail_out = chunkSize;
            }
            status = zlib_deflate.deflate(strm, _mode);
            if (status !== Z_STREAM_END && status !== Z_OK) {
              this.onEnd(status);
              this.ended = true;
              return false;
            }
            if (strm.avail_out === 0 || (strm.avail_in === 0 && (_mode === Z_FINISH || _mode === Z_SYNC_FLUSH))) {
              if (this.options.to === 'string') {
                this.onData(strings.buf2binstring(utils.shrinkBuf(strm.output, strm.next_out)));
              } else {
                this.onData(utils.shrinkBuf(strm.output, strm.next_out));
              }
            }
          } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END);
          if (_mode === Z_FINISH) {
            status = zlib_deflate.deflateEnd(this.strm);
            this.onEnd(status);
            this.ended = true;
            return status === Z_OK;
          }
          if (_mode === Z_SYNC_FLUSH) {
            this.onEnd(Z_OK);
            strm.avail_out = 0;
            return true;
          }
          return true;
        };
        Deflate.prototype.onData = function(chunk) {
          this.chunks.push(chunk);
        };
        Deflate.prototype.onEnd = function(status) {
          if (status === Z_OK) {
            if (this.options.to === 'string') {
              this.result = this.chunks.join('');
            } else {
              this.result = utils.flattenChunks(this.chunks);
            }
          }
          this.chunks = [];
          this.err = status;
          this.msg = this.strm.msg;
        };
        function deflate(input, options) {
          var deflator = new Deflate(options);
          deflator.push(input, true);
          if (deflator.err) {
            throw deflator.msg;
          }
          return deflator.result;
        }
        function deflateRaw(input, options) {
          options = options || {};
          options.raw = true;
          return deflate(input, options);
        }
        function gzip(input, options) {
          options = options || {};
          options.gzip = true;
          return deflate(input, options);
        }
        exports.Deflate = Deflate;
        exports.deflate = deflate;
        exports.deflateRaw = deflateRaw;
        exports.gzip = gzip;
      }, {
        "./utils/common": 1,
        "./utils/strings": 2,
        "./zlib/deflate.js": 5,
        "./zlib/messages": 6,
        "./zlib/zstream": 8
      }]
    }, {}, [])("/lib/deflate.js");
  });
})(require('buffer').Buffer, require('process'));

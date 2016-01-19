/* */ 
(function(Buffer) {
  (function(global, module) {
    if ('undefined' == typeof module) {
      var module = {exports: {}},
          exports = module.exports;
    }
    module.exports = expect;
    expect.Assertion = Assertion;
    expect.version = '0.1.2';
    var flags = {
      not: ['to', 'be', 'have', 'include', 'only'],
      to: ['be', 'have', 'include', 'only', 'not'],
      only: ['have'],
      have: ['own'],
      be: ['an']
    };
    function expect(obj) {
      return new Assertion(obj);
    }
    function Assertion(obj, flag, parent) {
      this.obj = obj;
      this.flags = {};
      if (undefined != parent) {
        this.flags[flag] = true;
        for (var i in parent.flags) {
          if (parent.flags.hasOwnProperty(i)) {
            this.flags[i] = true;
          }
        }
      }
      var $flags = flag ? flags[flag] : keys(flags),
          self = this;
      if ($flags) {
        for (var i = 0,
            l = $flags.length; i < l; i++) {
          if (this.flags[$flags[i]])
            continue;
          var name = $flags[i],
              assertion = new Assertion(this.obj, name, this);
          if ('function' == typeof Assertion.prototype[name]) {
            var old = this[name];
            this[name] = function() {
              return old.apply(self, arguments);
            };
            for (var fn in Assertion.prototype) {
              if (Assertion.prototype.hasOwnProperty(fn) && fn != name) {
                this[name][fn] = bind(assertion[fn], assertion);
              }
            }
          } else {
            this[name] = assertion;
          }
        }
      }
    }
    ;
    Assertion.prototype.assert = function(truth, msg, error) {
      var msg = this.flags.not ? error : msg,
          ok = this.flags.not ? !truth : truth;
      if (!ok) {
        throw new Error(msg.call(this));
      }
      this.and = new Assertion(this.obj);
    };
    Assertion.prototype.ok = function() {
      this.assert(!!this.obj, function() {
        return 'expected ' + i(this.obj) + ' to be truthy';
      }, function() {
        return 'expected ' + i(this.obj) + ' to be falsy';
      });
    };
    Assertion.prototype.throwError = Assertion.prototype.throwException = function(fn) {
      expect(this.obj).to.be.a('function');
      var thrown = false,
          not = this.flags.not;
      try {
        this.obj();
      } catch (e) {
        if ('function' == typeof fn) {
          fn(e);
        } else if ('object' == typeof fn) {
          var subject = 'string' == typeof e ? e : e.message;
          if (not) {
            expect(subject).to.not.match(fn);
          } else {
            expect(subject).to.match(fn);
          }
        }
        thrown = true;
      }
      if ('object' == typeof fn && not) {
        this.flags.not = false;
      }
      var name = this.obj.name || 'fn';
      this.assert(thrown, function() {
        return 'expected ' + name + ' to throw an exception';
      }, function() {
        return 'expected ' + name + ' not to throw an exception';
      });
    };
    Assertion.prototype.empty = function() {
      var expectation;
      if ('object' == typeof this.obj && null !== this.obj && !isArray(this.obj)) {
        if ('number' == typeof this.obj.length) {
          expectation = !this.obj.length;
        } else {
          expectation = !keys(this.obj).length;
        }
      } else {
        if ('string' != typeof this.obj) {
          expect(this.obj).to.be.an('object');
        }
        expect(this.obj).to.have.property('length');
        expectation = !this.obj.length;
      }
      this.assert(expectation, function() {
        return 'expected ' + i(this.obj) + ' to be empty';
      }, function() {
        return 'expected ' + i(this.obj) + ' to not be empty';
      });
      return this;
    };
    Assertion.prototype.be = Assertion.prototype.equal = function(obj) {
      this.assert(obj === this.obj, function() {
        return 'expected ' + i(this.obj) + ' to equal ' + i(obj);
      }, function() {
        return 'expected ' + i(this.obj) + ' to not equal ' + i(obj);
      });
      return this;
    };
    Assertion.prototype.eql = function(obj) {
      this.assert(expect.eql(obj, this.obj), function() {
        return 'expected ' + i(this.obj) + ' to sort of equal ' + i(obj);
      }, function() {
        return 'expected ' + i(this.obj) + ' to sort of not equal ' + i(obj);
      });
      return this;
    };
    Assertion.prototype.within = function(start, finish) {
      var range = start + '..' + finish;
      this.assert(this.obj >= start && this.obj <= finish, function() {
        return 'expected ' + i(this.obj) + ' to be within ' + range;
      }, function() {
        return 'expected ' + i(this.obj) + ' to not be within ' + range;
      });
      return this;
    };
    Assertion.prototype.a = Assertion.prototype.an = function(type) {
      if ('string' == typeof type) {
        var n = /^[aeiou]/.test(type) ? 'n' : '';
        this.assert('array' == type ? isArray(this.obj) : 'object' == type ? 'object' == typeof this.obj && null !== this.obj : type == typeof this.obj, function() {
          return 'expected ' + i(this.obj) + ' to be a' + n + ' ' + type;
        }, function() {
          return 'expected ' + i(this.obj) + ' not to be a' + n + ' ' + type;
        });
      } else {
        var name = type.name || 'supplied constructor';
        this.assert(this.obj instanceof type, function() {
          return 'expected ' + i(this.obj) + ' to be an instance of ' + name;
        }, function() {
          return 'expected ' + i(this.obj) + ' not to be an instance of ' + name;
        });
      }
      return this;
    };
    Assertion.prototype.greaterThan = Assertion.prototype.above = function(n) {
      this.assert(this.obj > n, function() {
        return 'expected ' + i(this.obj) + ' to be above ' + n;
      }, function() {
        return 'expected ' + i(this.obj) + ' to be below ' + n;
      });
      return this;
    };
    Assertion.prototype.lessThan = Assertion.prototype.below = function(n) {
      this.assert(this.obj < n, function() {
        return 'expected ' + i(this.obj) + ' to be below ' + n;
      }, function() {
        return 'expected ' + i(this.obj) + ' to be above ' + n;
      });
      return this;
    };
    Assertion.prototype.match = function(regexp) {
      this.assert(regexp.exec(this.obj), function() {
        return 'expected ' + i(this.obj) + ' to match ' + regexp;
      }, function() {
        return 'expected ' + i(this.obj) + ' not to match ' + regexp;
      });
      return this;
    };
    Assertion.prototype.length = function(n) {
      expect(this.obj).to.have.property('length');
      var len = this.obj.length;
      this.assert(n == len, function() {
        return 'expected ' + i(this.obj) + ' to have a length of ' + n + ' but got ' + len;
      }, function() {
        return 'expected ' + i(this.obj) + ' to not have a length of ' + len;
      });
      return this;
    };
    Assertion.prototype.property = function(name, val) {
      if (this.flags.own) {
        this.assert(Object.prototype.hasOwnProperty.call(this.obj, name), function() {
          return 'expected ' + i(this.obj) + ' to have own property ' + i(name);
        }, function() {
          return 'expected ' + i(this.obj) + ' to not have own property ' + i(name);
        });
        return this;
      }
      if (this.flags.not && undefined !== val) {
        if (undefined === this.obj[name]) {
          throw new Error(i(this.obj) + ' has no property ' + i(name));
        }
      } else {
        var hasProp;
        try {
          hasProp = name in this.obj;
        } catch (e) {
          hasProp = undefined !== this.obj[name];
        }
        this.assert(hasProp, function() {
          return 'expected ' + i(this.obj) + ' to have a property ' + i(name);
        }, function() {
          return 'expected ' + i(this.obj) + ' to not have a property ' + i(name);
        });
      }
      if (undefined !== val) {
        this.assert(val === this.obj[name], function() {
          return 'expected ' + i(this.obj) + ' to have a property ' + i(name) + ' of ' + i(val) + ', but got ' + i(this.obj[name]);
        }, function() {
          return 'expected ' + i(this.obj) + ' to not have a property ' + i(name) + ' of ' + i(val);
        });
      }
      this.obj = this.obj[name];
      return this;
    };
    Assertion.prototype.string = Assertion.prototype.contain = function(obj) {
      if ('string' == typeof this.obj) {
        this.assert(~this.obj.indexOf(obj), function() {
          return 'expected ' + i(this.obj) + ' to contain ' + i(obj);
        }, function() {
          return 'expected ' + i(this.obj) + ' to not contain ' + i(obj);
        });
      } else {
        this.assert(~indexOf(this.obj, obj), function() {
          return 'expected ' + i(this.obj) + ' to contain ' + i(obj);
        }, function() {
          return 'expected ' + i(this.obj) + ' to not contain ' + i(obj);
        });
      }
      return this;
    };
    Assertion.prototype.key = Assertion.prototype.keys = function($keys) {
      var str,
          ok = true;
      $keys = isArray($keys) ? $keys : Array.prototype.slice.call(arguments);
      if (!$keys.length)
        throw new Error('keys required');
      var actual = keys(this.obj),
          len = $keys.length;
      ok = every($keys, function(key) {
        return ~indexOf(actual, key);
      });
      if (!this.flags.not && this.flags.only) {
        ok = ok && $keys.length == actual.length;
      }
      if (len > 1) {
        $keys = map($keys, function(key) {
          return i(key);
        });
        var last = $keys.pop();
        str = $keys.join(', ') + ', and ' + last;
      } else {
        str = i($keys[0]);
      }
      str = (len > 1 ? 'keys ' : 'key ') + str;
      str = (!this.flags.only ? 'include ' : 'only have ') + str;
      this.assert(ok, function() {
        return 'expected ' + i(this.obj) + ' to ' + str;
      }, function() {
        return 'expected ' + i(this.obj) + ' to not ' + str;
      });
      return this;
    };
    Assertion.prototype.fail = function(msg) {
      msg = msg || "explicit failure";
      this.assert(false, msg, msg);
      return this;
    };
    function bind(fn, scope) {
      return function() {
        return fn.apply(scope, arguments);
      };
    }
    function every(arr, fn, thisObj) {
      var scope = thisObj || global;
      for (var i = 0,
          j = arr.length; i < j; ++i) {
        if (!fn.call(scope, arr[i], i, arr)) {
          return false;
        }
      }
      return true;
    }
    ;
    function indexOf(arr, o, i) {
      if (Array.prototype.indexOf) {
        return Array.prototype.indexOf.call(arr, o, i);
      }
      if (arr.length === undefined) {
        return -1;
      }
      for (var j = arr.length,
          i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0; i < j && arr[i] !== o; i++)
        ;
      return j <= i ? -1 : i;
    }
    ;
    var getOuterHTML = function(element) {
      if ('outerHTML' in element)
        return element.outerHTML;
      var ns = "http://www.w3.org/1999/xhtml";
      var container = document.createElementNS(ns, '_');
      var elemProto = (window.HTMLElement || window.Element).prototype;
      var xmlSerializer = new XMLSerializer();
      var html;
      if (document.xmlVersion) {
        return xmlSerializer.serializeToString(element);
      } else {
        container.appendChild(element.cloneNode(false));
        html = container.innerHTML.replace('><', '>' + element.innerHTML + '<');
        container.innerHTML = '';
        return html;
      }
    };
    var isDOMElement = function(object) {
      if (typeof HTMLElement === 'object') {
        return object instanceof HTMLElement;
      } else {
        return object && typeof object === 'object' && object.nodeType === 1 && typeof object.nodeName === 'string';
      }
    };
    function i(obj, showHidden, depth) {
      var seen = [];
      function stylize(str) {
        return str;
      }
      ;
      function format(value, recurseTimes) {
        if (value && typeof value.inspect === 'function' && value !== exports && !(value.constructor && value.constructor.prototype === value)) {
          return value.inspect(recurseTimes);
        }
        switch (typeof value) {
          case 'undefined':
            return stylize('undefined', 'undefined');
          case 'string':
            var simple = '\'' + json.stringify(value).replace(/^"|"$/g, '').replace(/'/g, "\\'").replace(/\\"/g, '"') + '\'';
            return stylize(simple, 'string');
          case 'number':
            return stylize('' + value, 'number');
          case 'boolean':
            return stylize('' + value, 'boolean');
        }
        if (value === null) {
          return stylize('null', 'null');
        }
        if (isDOMElement(value)) {
          return getOuterHTML(value);
        }
        var visible_keys = keys(value);
        var $keys = showHidden ? Object.getOwnPropertyNames(value) : visible_keys;
        if (typeof value === 'function' && $keys.length === 0) {
          if (isRegExp(value)) {
            return stylize('' + value, 'regexp');
          } else {
            var name = value.name ? ': ' + value.name : '';
            return stylize('[Function' + name + ']', 'special');
          }
        }
        if (isDate(value) && $keys.length === 0) {
          return stylize(value.toUTCString(), 'date');
        }
        var base,
            type,
            braces;
        if (isArray(value)) {
          type = 'Array';
          braces = ['[', ']'];
        } else {
          type = 'Object';
          braces = ['{', '}'];
        }
        if (typeof value === 'function') {
          var n = value.name ? ': ' + value.name : '';
          base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
        } else {
          base = '';
        }
        if (isDate(value)) {
          base = ' ' + value.toUTCString();
        }
        if ($keys.length === 0) {
          return braces[0] + base + braces[1];
        }
        if (recurseTimes < 0) {
          if (isRegExp(value)) {
            return stylize('' + value, 'regexp');
          } else {
            return stylize('[Object]', 'special');
          }
        }
        seen.push(value);
        var output = map($keys, function(key) {
          var name,
              str;
          if (value.__lookupGetter__) {
            if (value.__lookupGetter__(key)) {
              if (value.__lookupSetter__(key)) {
                str = stylize('[Getter/Setter]', 'special');
              } else {
                str = stylize('[Getter]', 'special');
              }
            } else {
              if (value.__lookupSetter__(key)) {
                str = stylize('[Setter]', 'special');
              }
            }
          }
          if (indexOf(visible_keys, key) < 0) {
            name = '[' + key + ']';
          }
          if (!str) {
            if (indexOf(seen, value[key]) < 0) {
              if (recurseTimes === null) {
                str = format(value[key]);
              } else {
                str = format(value[key], recurseTimes - 1);
              }
              if (str.indexOf('\n') > -1) {
                if (isArray(value)) {
                  str = map(str.split('\n'), function(line) {
                    return '  ' + line;
                  }).join('\n').substr(2);
                } else {
                  str = '\n' + map(str.split('\n'), function(line) {
                    return '   ' + line;
                  }).join('\n');
                }
              }
            } else {
              str = stylize('[Circular]', 'special');
            }
          }
          if (typeof name === 'undefined') {
            if (type === 'Array' && key.match(/^\d+$/)) {
              return str;
            }
            name = json.stringify('' + key);
            if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
              name = name.substr(1, name.length - 2);
              name = stylize(name, 'name');
            } else {
              name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
              name = stylize(name, 'string');
            }
          }
          return name + ': ' + str;
        });
        seen.pop();
        var numLinesEst = 0;
        var length = reduce(output, function(prev, cur) {
          numLinesEst++;
          if (indexOf(cur, '\n') >= 0)
            numLinesEst++;
          return prev + cur.length + 1;
        }, 0);
        if (length > 50) {
          output = braces[0] + (base === '' ? '' : base + '\n ') + ' ' + output.join(',\n  ') + ' ' + braces[1];
        } else {
          output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
        }
        return output;
      }
      return format(obj, (typeof depth === 'undefined' ? 2 : depth));
    }
    ;
    function isArray(ar) {
      return Object.prototype.toString.call(ar) == '[object Array]';
    }
    ;
    function isRegExp(re) {
      var s;
      try {
        s = '' + re;
      } catch (e) {
        return false;
      }
      return re instanceof RegExp || typeof(re) === 'function' && re.constructor.name === 'RegExp' && re.compile && re.test && re.exec && s.match(/^\/.*\/[gim]{0,3}$/);
    }
    ;
    function isDate(d) {
      if (d instanceof Date)
        return true;
      return false;
    }
    ;
    function keys(obj) {
      if (Object.keys) {
        return Object.keys(obj);
      }
      var keys = [];
      for (var i in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, i)) {
          keys.push(i);
        }
      }
      return keys;
    }
    function map(arr, mapper, that) {
      if (Array.prototype.map) {
        return Array.prototype.map.call(arr, mapper, that);
      }
      var other = new Array(arr.length);
      for (var i = 0,
          n = arr.length; i < n; i++)
        if (i in arr)
          other[i] = mapper.call(that, arr[i], i, arr);
      return other;
    }
    ;
    function reduce(arr, fun) {
      if (Array.prototype.reduce) {
        return Array.prototype.reduce.apply(arr, Array.prototype.slice.call(arguments, 1));
      }
      var len = +this.length;
      if (typeof fun !== "function")
        throw new TypeError();
      if (len === 0 && arguments.length === 1)
        throw new TypeError();
      var i = 0;
      if (arguments.length >= 2) {
        var rv = arguments[1];
      } else {
        do {
          if (i in this) {
            rv = this[i++];
            break;
          }
          if (++i >= len)
            throw new TypeError();
        } while (true);
      }
      for (; i < len; i++) {
        if (i in this)
          rv = fun.call(null, rv, this[i], i, this);
      }
      return rv;
    }
    ;
    expect.eql = function eql(actual, expected) {
      if (actual === expected) {
        return true;
      } else if ('undefined' != typeof Buffer && Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
        if (actual.length != expected.length)
          return false;
        for (var i = 0; i < actual.length; i++) {
          if (actual[i] !== expected[i])
            return false;
        }
        return true;
      } else if (actual instanceof Date && expected instanceof Date) {
        return actual.getTime() === expected.getTime();
      } else if (typeof actual != 'object' && typeof expected != 'object') {
        return actual == expected;
      } else {
        return objEquiv(actual, expected);
      }
    };
    function isUndefinedOrNull(value) {
      return value === null || value === undefined;
    }
    function isArguments(object) {
      return Object.prototype.toString.call(object) == '[object Arguments]';
    }
    function objEquiv(a, b) {
      if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
        return false;
      if (a.prototype !== b.prototype)
        return false;
      if (isArguments(a)) {
        if (!isArguments(b)) {
          return false;
        }
        a = pSlice.call(a);
        b = pSlice.call(b);
        return expect.eql(a, b);
      }
      try {
        var ka = keys(a),
            kb = keys(b),
            key,
            i;
      } catch (e) {
        return false;
      }
      if (ka.length != kb.length)
        return false;
      ka.sort();
      kb.sort();
      for (i = ka.length - 1; i >= 0; i--) {
        if (ka[i] != kb[i])
          return false;
      }
      for (i = ka.length - 1; i >= 0; i--) {
        key = ka[i];
        if (!expect.eql(a[key], b[key]))
          return false;
      }
      return true;
    }
    var json = (function() {
      "use strict";
      if ('object' == typeof JSON && JSON.parse && JSON.stringify) {
        return {
          parse: nativeJSON.parse,
          stringify: nativeJSON.stringify
        };
      }
      var JSON = {};
      function f(n) {
        return n < 10 ? '0' + n : n;
      }
      function date(d, key) {
        return isFinite(d.valueOf()) ? d.getUTCFullYear() + '-' + f(d.getUTCMonth() + 1) + '-' + f(d.getUTCDate()) + 'T' + f(d.getUTCHours()) + ':' + f(d.getUTCMinutes()) + ':' + f(d.getUTCSeconds()) + 'Z' : null;
      }
      ;
      var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
          escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
          gap,
          indent,
          meta = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
          },
          rep;
      function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
          var c = meta[a];
          return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
      }
      function str(key, holder) {
        var i,
            k,
            v,
            length,
            mind = gap,
            partial,
            value = holder[key];
        if (value instanceof Date) {
          value = date(key);
        }
        if (typeof rep === 'function') {
          value = rep.call(holder, key, value);
        }
        switch (typeof value) {
          case 'string':
            return quote(value);
          case 'number':
            return isFinite(value) ? String(value) : 'null';
          case 'boolean':
          case 'null':
            return String(value);
          case 'object':
            if (!value) {
              return 'null';
            }
            gap += indent;
            partial = [];
            if (Object.prototype.toString.apply(value) === '[object Array]') {
              length = value.length;
              for (i = 0; i < length; i += 1) {
                partial[i] = str(i, value) || 'null';
              }
              v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
              gap = mind;
              return v;
            }
            if (rep && typeof rep === 'object') {
              length = rep.length;
              for (i = 0; i < length; i += 1) {
                if (typeof rep[i] === 'string') {
                  k = rep[i];
                  v = str(k, value);
                  if (v) {
                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                  }
                }
              }
            } else {
              for (k in value) {
                if (Object.prototype.hasOwnProperty.call(value, k)) {
                  v = str(k, value);
                  if (v) {
                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                  }
                }
              }
            }
            v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
      }
      JSON.stringify = function(value, replacer, space) {
        var i;
        gap = '';
        indent = '';
        if (typeof space === 'number') {
          for (i = 0; i < space; i += 1) {
            indent += ' ';
          }
        } else if (typeof space === 'string') {
          indent = space;
        }
        rep = replacer;
        if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
          throw new Error('JSON.stringify');
        }
        return str('', {'': value});
      };
      JSON.parse = function(text, reviver) {
        var j;
        function walk(holder, key) {
          var k,
              v,
              value = holder[key];
          if (value && typeof value === 'object') {
            for (k in value) {
              if (Object.prototype.hasOwnProperty.call(value, k)) {
                v = walk(value, k);
                if (v !== undefined) {
                  value[k] = v;
                } else {
                  delete value[k];
                }
              }
            }
          }
          return reviver.call(holder, key, value);
        }
        text = String(text);
        cx.lastIndex = 0;
        if (cx.test(text)) {
          text = text.replace(cx, function(a) {
            return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
          });
        }
        if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
          j = eval('(' + text + ')');
          return typeof reviver === 'function' ? walk({'': j}, '') : j;
        }
        throw new SyntaxError('JSON.parse');
      };
      return JSON;
    })();
    if ('undefined' != typeof window) {
      window.expect = module.exports;
    }
  })(this, 'undefined' != typeof module ? module : {}, 'undefined' != typeof exports ? exports : {});
})(require('buffer').Buffer);

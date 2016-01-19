"bundle";
System.registerDynamic("npm:leaflet@0.7.7/dist/leaflet-src", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "format cjs";
  (function(window, document, undefined) {
    var oldL = window.L,
        L = {};
    L.version = '0.7.7';
    if (typeof module === 'object' && typeof module.exports === 'object') {
      module.exports = L;
    } else if (typeof define === 'function' && define.amd) {
      define(L);
    }
    L.noConflict = function() {
      window.L = oldL;
      return this;
    };
    window.L = L;
    L.Util = {
      extend: function(dest) {
        var sources = Array.prototype.slice.call(arguments, 1),
            i,
            j,
            len,
            src;
        for (j = 0, len = sources.length; j < len; j++) {
          src = sources[j] || {};
          for (i in src) {
            if (src.hasOwnProperty(i)) {
              dest[i] = src[i];
            }
          }
        }
        return dest;
      },
      bind: function(fn, obj) {
        var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;
        return function() {
          return fn.apply(obj, args || arguments);
        };
      },
      stamp: (function() {
        var lastId = 0,
            key = '_leaflet_id';
        return function(obj) {
          obj[key] = obj[key] || ++lastId;
          return obj[key];
        };
      }()),
      invokeEach: function(obj, method, context) {
        var i,
            args;
        if (typeof obj === 'object') {
          args = Array.prototype.slice.call(arguments, 3);
          for (i in obj) {
            method.apply(context, [i, obj[i]].concat(args));
          }
          return true;
        }
        return false;
      },
      limitExecByInterval: function(fn, time, context) {
        var lock,
            execOnUnlock;
        return function wrapperFn() {
          var args = arguments;
          if (lock) {
            execOnUnlock = true;
            return;
          }
          lock = true;
          setTimeout(function() {
            lock = false;
            if (execOnUnlock) {
              wrapperFn.apply(context, args);
              execOnUnlock = false;
            }
          }, time);
          fn.apply(context, args);
        };
      },
      falseFn: function() {
        return false;
      },
      formatNum: function(num, digits) {
        var pow = Math.pow(10, digits || 5);
        return Math.round(num * pow) / pow;
      },
      trim: function(str) {
        return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
      },
      splitWords: function(str) {
        return L.Util.trim(str).split(/\s+/);
      },
      setOptions: function(obj, options) {
        obj.options = L.extend({}, obj.options, options);
        return obj.options;
      },
      getParamString: function(obj, existingUrl, uppercase) {
        var params = [];
        for (var i in obj) {
          params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
        }
        return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
      },
      template: function(str, data) {
        return str.replace(/\{ *([\w_]+) *\}/g, function(str, key) {
          var value = data[key];
          if (value === undefined) {
            throw new Error('No value provided for variable ' + str);
          } else if (typeof value === 'function') {
            value = value(data);
          }
          return value;
        });
      },
      isArray: Array.isArray || function(obj) {
        return (Object.prototype.toString.call(obj) === '[object Array]');
      },
      emptyImageUrl: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
    };
    (function() {
      function getPrefixed(name) {
        var i,
            fn,
            prefixes = ['webkit', 'moz', 'o', 'ms'];
        for (i = 0; i < prefixes.length && !fn; i++) {
          fn = window[prefixes[i] + name];
        }
        return fn;
      }
      var lastTime = 0;
      function timeoutDefer(fn) {
        var time = +new Date(),
            timeToCall = Math.max(0, 16 - (time - lastTime));
        lastTime = time + timeToCall;
        return window.setTimeout(fn, timeToCall);
      }
      var requestFn = window.requestAnimationFrame || getPrefixed('RequestAnimationFrame') || timeoutDefer;
      var cancelFn = window.cancelAnimationFrame || getPrefixed('CancelAnimationFrame') || getPrefixed('CancelRequestAnimationFrame') || function(id) {
        window.clearTimeout(id);
      };
      L.Util.requestAnimFrame = function(fn, context, immediate, element) {
        fn = L.bind(fn, context);
        if (immediate && requestFn === timeoutDefer) {
          fn();
        } else {
          return requestFn.call(window, fn, element);
        }
      };
      L.Util.cancelAnimFrame = function(id) {
        if (id) {
          cancelFn.call(window, id);
        }
      };
    }());
    L.extend = L.Util.extend;
    L.bind = L.Util.bind;
    L.stamp = L.Util.stamp;
    L.setOptions = L.Util.setOptions;
    L.Class = function() {};
    L.Class.extend = function(props) {
      var NewClass = function() {
        if (this.initialize) {
          this.initialize.apply(this, arguments);
        }
        if (this._initHooks) {
          this.callInitHooks();
        }
      };
      var F = function() {};
      F.prototype = this.prototype;
      var proto = new F();
      proto.constructor = NewClass;
      NewClass.prototype = proto;
      for (var i in this) {
        if (this.hasOwnProperty(i) && i !== 'prototype') {
          NewClass[i] = this[i];
        }
      }
      if (props.statics) {
        L.extend(NewClass, props.statics);
        delete props.statics;
      }
      if (props.includes) {
        L.Util.extend.apply(null, [proto].concat(props.includes));
        delete props.includes;
      }
      if (props.options && proto.options) {
        props.options = L.extend({}, proto.options, props.options);
      }
      L.extend(proto, props);
      proto._initHooks = [];
      var parent = this;
      NewClass.__super__ = parent.prototype;
      proto.callInitHooks = function() {
        if (this._initHooksCalled) {
          return;
        }
        if (parent.prototype.callInitHooks) {
          parent.prototype.callInitHooks.call(this);
        }
        this._initHooksCalled = true;
        for (var i = 0,
            len = proto._initHooks.length; i < len; i++) {
          proto._initHooks[i].call(this);
        }
      };
      return NewClass;
    };
    L.Class.include = function(props) {
      L.extend(this.prototype, props);
    };
    L.Class.mergeOptions = function(options) {
      L.extend(this.prototype.options, options);
    };
    L.Class.addInitHook = function(fn) {
      var args = Array.prototype.slice.call(arguments, 1);
      var init = typeof fn === 'function' ? fn : function() {
        this[fn].apply(this, args);
      };
      this.prototype._initHooks = this.prototype._initHooks || [];
      this.prototype._initHooks.push(init);
    };
    var eventsKey = '_leaflet_events';
    L.Mixin = {};
    L.Mixin.Events = {
      addEventListener: function(types, fn, context) {
        if (L.Util.invokeEach(types, this.addEventListener, this, fn, context)) {
          return this;
        }
        var events = this[eventsKey] = this[eventsKey] || {},
            contextId = context && context !== this && L.stamp(context),
            i,
            len,
            event,
            type,
            indexKey,
            indexLenKey,
            typeIndex;
        types = L.Util.splitWords(types);
        for (i = 0, len = types.length; i < len; i++) {
          event = {
            action: fn,
            context: context || this
          };
          type = types[i];
          if (contextId) {
            indexKey = type + '_idx';
            indexLenKey = indexKey + '_len';
            typeIndex = events[indexKey] = events[indexKey] || {};
            if (!typeIndex[contextId]) {
              typeIndex[contextId] = [];
              events[indexLenKey] = (events[indexLenKey] || 0) + 1;
            }
            typeIndex[contextId].push(event);
          } else {
            events[type] = events[type] || [];
            events[type].push(event);
          }
        }
        return this;
      },
      hasEventListeners: function(type) {
        var events = this[eventsKey];
        return !!events && ((type in events && events[type].length > 0) || (type + '_idx' in events && events[type + '_idx_len'] > 0));
      },
      removeEventListener: function(types, fn, context) {
        if (!this[eventsKey]) {
          return this;
        }
        if (!types) {
          return this.clearAllEventListeners();
        }
        if (L.Util.invokeEach(types, this.removeEventListener, this, fn, context)) {
          return this;
        }
        var events = this[eventsKey],
            contextId = context && context !== this && L.stamp(context),
            i,
            len,
            type,
            listeners,
            j,
            indexKey,
            indexLenKey,
            typeIndex,
            removed;
        types = L.Util.splitWords(types);
        for (i = 0, len = types.length; i < len; i++) {
          type = types[i];
          indexKey = type + '_idx';
          indexLenKey = indexKey + '_len';
          typeIndex = events[indexKey];
          if (!fn) {
            delete events[type];
            delete events[indexKey];
            delete events[indexLenKey];
          } else {
            listeners = contextId && typeIndex ? typeIndex[contextId] : events[type];
            if (listeners) {
              for (j = listeners.length - 1; j >= 0; j--) {
                if ((listeners[j].action === fn) && (!context || (listeners[j].context === context))) {
                  removed = listeners.splice(j, 1);
                  removed[0].action = L.Util.falseFn;
                }
              }
              if (context && typeIndex && (listeners.length === 0)) {
                delete typeIndex[contextId];
                events[indexLenKey]--;
              }
            }
          }
        }
        return this;
      },
      clearAllEventListeners: function() {
        delete this[eventsKey];
        return this;
      },
      fireEvent: function(type, data) {
        if (!this.hasEventListeners(type)) {
          return this;
        }
        var event = L.Util.extend({}, data, {
          type: type,
          target: this
        });
        var events = this[eventsKey],
            listeners,
            i,
            len,
            typeIndex,
            contextId;
        if (events[type]) {
          listeners = events[type].slice();
          for (i = 0, len = listeners.length; i < len; i++) {
            listeners[i].action.call(listeners[i].context, event);
          }
        }
        typeIndex = events[type + '_idx'];
        for (contextId in typeIndex) {
          listeners = typeIndex[contextId].slice();
          if (listeners) {
            for (i = 0, len = listeners.length; i < len; i++) {
              listeners[i].action.call(listeners[i].context, event);
            }
          }
        }
        return this;
      },
      addOneTimeEventListener: function(types, fn, context) {
        if (L.Util.invokeEach(types, this.addOneTimeEventListener, this, fn, context)) {
          return this;
        }
        var handler = L.bind(function() {
          this.removeEventListener(types, fn, context).removeEventListener(types, handler, context);
        }, this);
        return this.addEventListener(types, fn, context).addEventListener(types, handler, context);
      }
    };
    L.Mixin.Events.on = L.Mixin.Events.addEventListener;
    L.Mixin.Events.off = L.Mixin.Events.removeEventListener;
    L.Mixin.Events.once = L.Mixin.Events.addOneTimeEventListener;
    L.Mixin.Events.fire = L.Mixin.Events.fireEvent;
    (function() {
      var ie = 'ActiveXObject' in window,
          ielt9 = ie && !document.addEventListener,
          ua = navigator.userAgent.toLowerCase(),
          webkit = ua.indexOf('webkit') !== -1,
          chrome = ua.indexOf('chrome') !== -1,
          phantomjs = ua.indexOf('phantom') !== -1,
          android = ua.indexOf('android') !== -1,
          android23 = ua.search('android [23]') !== -1,
          gecko = ua.indexOf('gecko') !== -1,
          mobile = typeof orientation !== undefined + '',
          msPointer = !window.PointerEvent && window.MSPointerEvent,
          pointer = (window.PointerEvent && window.navigator.pointerEnabled) || msPointer,
          retina = ('devicePixelRatio' in window && window.devicePixelRatio > 1) || ('matchMedia' in window && window.matchMedia('(min-resolution:144dpi)') && window.matchMedia('(min-resolution:144dpi)').matches),
          doc = document.documentElement,
          ie3d = ie && ('transition' in doc.style),
          webkit3d = ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !android23,
          gecko3d = 'MozPerspective' in doc.style,
          opera3d = 'OTransition' in doc.style,
          any3d = !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d || opera3d) && !phantomjs;
      var touch = !window.L_NO_TOUCH && !phantomjs && (pointer || 'ontouchstart' in window || (window.DocumentTouch && document instanceof window.DocumentTouch));
      L.Browser = {
        ie: ie,
        ielt9: ielt9,
        webkit: webkit,
        gecko: gecko && !webkit && !window.opera && !ie,
        android: android,
        android23: android23,
        chrome: chrome,
        ie3d: ie3d,
        webkit3d: webkit3d,
        gecko3d: gecko3d,
        opera3d: opera3d,
        any3d: any3d,
        mobile: mobile,
        mobileWebkit: mobile && webkit,
        mobileWebkit3d: mobile && webkit3d,
        mobileOpera: mobile && window.opera,
        touch: touch,
        msPointer: msPointer,
        pointer: pointer,
        retina: retina
      };
    }());
    L.Point = function(x, y, round) {
      this.x = (round ? Math.round(x) : x);
      this.y = (round ? Math.round(y) : y);
    };
    L.Point.prototype = {
      clone: function() {
        return new L.Point(this.x, this.y);
      },
      add: function(point) {
        return this.clone()._add(L.point(point));
      },
      _add: function(point) {
        this.x += point.x;
        this.y += point.y;
        return this;
      },
      subtract: function(point) {
        return this.clone()._subtract(L.point(point));
      },
      _subtract: function(point) {
        this.x -= point.x;
        this.y -= point.y;
        return this;
      },
      divideBy: function(num) {
        return this.clone()._divideBy(num);
      },
      _divideBy: function(num) {
        this.x /= num;
        this.y /= num;
        return this;
      },
      multiplyBy: function(num) {
        return this.clone()._multiplyBy(num);
      },
      _multiplyBy: function(num) {
        this.x *= num;
        this.y *= num;
        return this;
      },
      round: function() {
        return this.clone()._round();
      },
      _round: function() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
      },
      floor: function() {
        return this.clone()._floor();
      },
      _floor: function() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
      },
      distanceTo: function(point) {
        point = L.point(point);
        var x = point.x - this.x,
            y = point.y - this.y;
        return Math.sqrt(x * x + y * y);
      },
      equals: function(point) {
        point = L.point(point);
        return point.x === this.x && point.y === this.y;
      },
      contains: function(point) {
        point = L.point(point);
        return Math.abs(point.x) <= Math.abs(this.x) && Math.abs(point.y) <= Math.abs(this.y);
      },
      toString: function() {
        return 'Point(' + L.Util.formatNum(this.x) + ', ' + L.Util.formatNum(this.y) + ')';
      }
    };
    L.point = function(x, y, round) {
      if (x instanceof L.Point) {
        return x;
      }
      if (L.Util.isArray(x)) {
        return new L.Point(x[0], x[1]);
      }
      if (x === undefined || x === null) {
        return x;
      }
      return new L.Point(x, y, round);
    };
    L.Bounds = function(a, b) {
      if (!a) {
        return;
      }
      var points = b ? [a, b] : a;
      for (var i = 0,
          len = points.length; i < len; i++) {
        this.extend(points[i]);
      }
    };
    L.Bounds.prototype = {
      extend: function(point) {
        point = L.point(point);
        if (!this.min && !this.max) {
          this.min = point.clone();
          this.max = point.clone();
        } else {
          this.min.x = Math.min(point.x, this.min.x);
          this.max.x = Math.max(point.x, this.max.x);
          this.min.y = Math.min(point.y, this.min.y);
          this.max.y = Math.max(point.y, this.max.y);
        }
        return this;
      },
      getCenter: function(round) {
        return new L.Point((this.min.x + this.max.x) / 2, (this.min.y + this.max.y) / 2, round);
      },
      getBottomLeft: function() {
        return new L.Point(this.min.x, this.max.y);
      },
      getTopRight: function() {
        return new L.Point(this.max.x, this.min.y);
      },
      getSize: function() {
        return this.max.subtract(this.min);
      },
      contains: function(obj) {
        var min,
            max;
        if (typeof obj[0] === 'number' || obj instanceof L.Point) {
          obj = L.point(obj);
        } else {
          obj = L.bounds(obj);
        }
        if (obj instanceof L.Bounds) {
          min = obj.min;
          max = obj.max;
        } else {
          min = max = obj;
        }
        return (min.x >= this.min.x) && (max.x <= this.max.x) && (min.y >= this.min.y) && (max.y <= this.max.y);
      },
      intersects: function(bounds) {
        bounds = L.bounds(bounds);
        var min = this.min,
            max = this.max,
            min2 = bounds.min,
            max2 = bounds.max,
            xIntersects = (max2.x >= min.x) && (min2.x <= max.x),
            yIntersects = (max2.y >= min.y) && (min2.y <= max.y);
        return xIntersects && yIntersects;
      },
      isValid: function() {
        return !!(this.min && this.max);
      }
    };
    L.bounds = function(a, b) {
      if (!a || a instanceof L.Bounds) {
        return a;
      }
      return new L.Bounds(a, b);
    };
    L.Transformation = function(a, b, c, d) {
      this._a = a;
      this._b = b;
      this._c = c;
      this._d = d;
    };
    L.Transformation.prototype = {
      transform: function(point, scale) {
        return this._transform(point.clone(), scale);
      },
      _transform: function(point, scale) {
        scale = scale || 1;
        point.x = scale * (this._a * point.x + this._b);
        point.y = scale * (this._c * point.y + this._d);
        return point;
      },
      untransform: function(point, scale) {
        scale = scale || 1;
        return new L.Point((point.x / scale - this._b) / this._a, (point.y / scale - this._d) / this._c);
      }
    };
    L.DomUtil = {
      get: function(id) {
        return (typeof id === 'string' ? document.getElementById(id) : id);
      },
      getStyle: function(el, style) {
        var value = el.style[style];
        if (!value && el.currentStyle) {
          value = el.currentStyle[style];
        }
        if ((!value || value === 'auto') && document.defaultView) {
          var css = document.defaultView.getComputedStyle(el, null);
          value = css ? css[style] : null;
        }
        return value === 'auto' ? null : value;
      },
      getViewportOffset: function(element) {
        var top = 0,
            left = 0,
            el = element,
            docBody = document.body,
            docEl = document.documentElement,
            pos;
        do {
          top += el.offsetTop || 0;
          left += el.offsetLeft || 0;
          top += parseInt(L.DomUtil.getStyle(el, 'borderTopWidth'), 10) || 0;
          left += parseInt(L.DomUtil.getStyle(el, 'borderLeftWidth'), 10) || 0;
          pos = L.DomUtil.getStyle(el, 'position');
          if (el.offsetParent === docBody && pos === 'absolute') {
            break;
          }
          if (pos === 'fixed') {
            top += docBody.scrollTop || docEl.scrollTop || 0;
            left += docBody.scrollLeft || docEl.scrollLeft || 0;
            break;
          }
          if (pos === 'relative' && !el.offsetLeft) {
            var width = L.DomUtil.getStyle(el, 'width'),
                maxWidth = L.DomUtil.getStyle(el, 'max-width'),
                r = el.getBoundingClientRect();
            if (width !== 'none' || maxWidth !== 'none') {
              left += r.left + el.clientLeft;
            }
            top += r.top + (docBody.scrollTop || docEl.scrollTop || 0);
            break;
          }
          el = el.offsetParent;
        } while (el);
        el = element;
        do {
          if (el === docBody) {
            break;
          }
          top -= el.scrollTop || 0;
          left -= el.scrollLeft || 0;
          el = el.parentNode;
        } while (el);
        return new L.Point(left, top);
      },
      documentIsLtr: function() {
        if (!L.DomUtil._docIsLtrCached) {
          L.DomUtil._docIsLtrCached = true;
          L.DomUtil._docIsLtr = L.DomUtil.getStyle(document.body, 'direction') === 'ltr';
        }
        return L.DomUtil._docIsLtr;
      },
      create: function(tagName, className, container) {
        var el = document.createElement(tagName);
        el.className = className;
        if (container) {
          container.appendChild(el);
        }
        return el;
      },
      hasClass: function(el, name) {
        if (el.classList !== undefined) {
          return el.classList.contains(name);
        }
        var className = L.DomUtil._getClass(el);
        return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
      },
      addClass: function(el, name) {
        if (el.classList !== undefined) {
          var classes = L.Util.splitWords(name);
          for (var i = 0,
              len = classes.length; i < len; i++) {
            el.classList.add(classes[i]);
          }
        } else if (!L.DomUtil.hasClass(el, name)) {
          var className = L.DomUtil._getClass(el);
          L.DomUtil._setClass(el, (className ? className + ' ' : '') + name);
        }
      },
      removeClass: function(el, name) {
        if (el.classList !== undefined) {
          el.classList.remove(name);
        } else {
          L.DomUtil._setClass(el, L.Util.trim((' ' + L.DomUtil._getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
        }
      },
      _setClass: function(el, name) {
        if (el.className.baseVal === undefined) {
          el.className = name;
        } else {
          el.className.baseVal = name;
        }
      },
      _getClass: function(el) {
        return el.className.baseVal === undefined ? el.className : el.className.baseVal;
      },
      setOpacity: function(el, value) {
        if ('opacity' in el.style) {
          el.style.opacity = value;
        } else if ('filter' in el.style) {
          var filter = false,
              filterName = 'DXImageTransform.Microsoft.Alpha';
          try {
            filter = el.filters.item(filterName);
          } catch (e) {
            if (value === 1) {
              return;
            }
          }
          value = Math.round(value * 100);
          if (filter) {
            filter.Enabled = (value !== 100);
            filter.Opacity = value;
          } else {
            el.style.filter += ' progid:' + filterName + '(opacity=' + value + ')';
          }
        }
      },
      testProp: function(props) {
        var style = document.documentElement.style;
        for (var i = 0; i < props.length; i++) {
          if (props[i] in style) {
            return props[i];
          }
        }
        return false;
      },
      getTranslateString: function(point) {
        var is3d = L.Browser.webkit3d,
            open = 'translate' + (is3d ? '3d' : '') + '(',
            close = (is3d ? ',0' : '') + ')';
        return open + point.x + 'px,' + point.y + 'px' + close;
      },
      getScaleString: function(scale, origin) {
        var preTranslateStr = L.DomUtil.getTranslateString(origin.add(origin.multiplyBy(-1 * scale))),
            scaleStr = ' scale(' + scale + ') ';
        return preTranslateStr + scaleStr;
      },
      setPosition: function(el, point, disable3D) {
        el._leaflet_pos = point;
        if (!disable3D && L.Browser.any3d) {
          el.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(point);
        } else {
          el.style.left = point.x + 'px';
          el.style.top = point.y + 'px';
        }
      },
      getPosition: function(el) {
        return el._leaflet_pos;
      }
    };
    L.DomUtil.TRANSFORM = L.DomUtil.testProp(['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform']);
    L.DomUtil.TRANSITION = L.DomUtil.testProp(['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']);
    L.DomUtil.TRANSITION_END = L.DomUtil.TRANSITION === 'webkitTransition' || L.DomUtil.TRANSITION === 'OTransition' ? L.DomUtil.TRANSITION + 'End' : 'transitionend';
    (function() {
      if ('onselectstart' in document) {
        L.extend(L.DomUtil, {
          disableTextSelection: function() {
            L.DomEvent.on(window, 'selectstart', L.DomEvent.preventDefault);
          },
          enableTextSelection: function() {
            L.DomEvent.off(window, 'selectstart', L.DomEvent.preventDefault);
          }
        });
      } else {
        var userSelectProperty = L.DomUtil.testProp(['userSelect', 'WebkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);
        L.extend(L.DomUtil, {
          disableTextSelection: function() {
            if (userSelectProperty) {
              var style = document.documentElement.style;
              this._userSelect = style[userSelectProperty];
              style[userSelectProperty] = 'none';
            }
          },
          enableTextSelection: function() {
            if (userSelectProperty) {
              document.documentElement.style[userSelectProperty] = this._userSelect;
              delete this._userSelect;
            }
          }
        });
      }
      L.extend(L.DomUtil, {
        disableImageDrag: function() {
          L.DomEvent.on(window, 'dragstart', L.DomEvent.preventDefault);
        },
        enableImageDrag: function() {
          L.DomEvent.off(window, 'dragstart', L.DomEvent.preventDefault);
        }
      });
    })();
    L.LatLng = function(lat, lng, alt) {
      lat = parseFloat(lat);
      lng = parseFloat(lng);
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
      }
      this.lat = lat;
      this.lng = lng;
      if (alt !== undefined) {
        this.alt = parseFloat(alt);
      }
    };
    L.extend(L.LatLng, {
      DEG_TO_RAD: Math.PI / 180,
      RAD_TO_DEG: 180 / Math.PI,
      MAX_MARGIN: 1.0E-9
    });
    L.LatLng.prototype = {
      equals: function(obj) {
        if (!obj) {
          return false;
        }
        obj = L.latLng(obj);
        var margin = Math.max(Math.abs(this.lat - obj.lat), Math.abs(this.lng - obj.lng));
        return margin <= L.LatLng.MAX_MARGIN;
      },
      toString: function(precision) {
        return 'LatLng(' + L.Util.formatNum(this.lat, precision) + ', ' + L.Util.formatNum(this.lng, precision) + ')';
      },
      distanceTo: function(other) {
        other = L.latLng(other);
        var R = 6378137,
            d2r = L.LatLng.DEG_TO_RAD,
            dLat = (other.lat - this.lat) * d2r,
            dLon = (other.lng - this.lng) * d2r,
            lat1 = this.lat * d2r,
            lat2 = other.lat * d2r,
            sin1 = Math.sin(dLat / 2),
            sin2 = Math.sin(dLon / 2);
        var a = sin1 * sin1 + sin2 * sin2 * Math.cos(lat1) * Math.cos(lat2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      },
      wrap: function(a, b) {
        var lng = this.lng;
        a = a || -180;
        b = b || 180;
        lng = (lng + b) % (b - a) + (lng < a || lng === b ? b : a);
        return new L.LatLng(this.lat, lng);
      }
    };
    L.latLng = function(a, b) {
      if (a instanceof L.LatLng) {
        return a;
      }
      if (L.Util.isArray(a)) {
        if (typeof a[0] === 'number' || typeof a[0] === 'string') {
          return new L.LatLng(a[0], a[1], a[2]);
        } else {
          return null;
        }
      }
      if (a === undefined || a === null) {
        return a;
      }
      if (typeof a === 'object' && 'lat' in a) {
        return new L.LatLng(a.lat, 'lng' in a ? a.lng : a.lon);
      }
      if (b === undefined) {
        return null;
      }
      return new L.LatLng(a, b);
    };
    L.LatLngBounds = function(southWest, northEast) {
      if (!southWest) {
        return;
      }
      var latlngs = northEast ? [southWest, northEast] : southWest;
      for (var i = 0,
          len = latlngs.length; i < len; i++) {
        this.extend(latlngs[i]);
      }
    };
    L.LatLngBounds.prototype = {
      extend: function(obj) {
        if (!obj) {
          return this;
        }
        var latLng = L.latLng(obj);
        if (latLng !== null) {
          obj = latLng;
        } else {
          obj = L.latLngBounds(obj);
        }
        if (obj instanceof L.LatLng) {
          if (!this._southWest && !this._northEast) {
            this._southWest = new L.LatLng(obj.lat, obj.lng);
            this._northEast = new L.LatLng(obj.lat, obj.lng);
          } else {
            this._southWest.lat = Math.min(obj.lat, this._southWest.lat);
            this._southWest.lng = Math.min(obj.lng, this._southWest.lng);
            this._northEast.lat = Math.max(obj.lat, this._northEast.lat);
            this._northEast.lng = Math.max(obj.lng, this._northEast.lng);
          }
        } else if (obj instanceof L.LatLngBounds) {
          this.extend(obj._southWest);
          this.extend(obj._northEast);
        }
        return this;
      },
      pad: function(bufferRatio) {
        var sw = this._southWest,
            ne = this._northEast,
            heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio,
            widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio;
        return new L.LatLngBounds(new L.LatLng(sw.lat - heightBuffer, sw.lng - widthBuffer), new L.LatLng(ne.lat + heightBuffer, ne.lng + widthBuffer));
      },
      getCenter: function() {
        return new L.LatLng((this._southWest.lat + this._northEast.lat) / 2, (this._southWest.lng + this._northEast.lng) / 2);
      },
      getSouthWest: function() {
        return this._southWest;
      },
      getNorthEast: function() {
        return this._northEast;
      },
      getNorthWest: function() {
        return new L.LatLng(this.getNorth(), this.getWest());
      },
      getSouthEast: function() {
        return new L.LatLng(this.getSouth(), this.getEast());
      },
      getWest: function() {
        return this._southWest.lng;
      },
      getSouth: function() {
        return this._southWest.lat;
      },
      getEast: function() {
        return this._northEast.lng;
      },
      getNorth: function() {
        return this._northEast.lat;
      },
      contains: function(obj) {
        if (typeof obj[0] === 'number' || obj instanceof L.LatLng) {
          obj = L.latLng(obj);
        } else {
          obj = L.latLngBounds(obj);
        }
        var sw = this._southWest,
            ne = this._northEast,
            sw2,
            ne2;
        if (obj instanceof L.LatLngBounds) {
          sw2 = obj.getSouthWest();
          ne2 = obj.getNorthEast();
        } else {
          sw2 = ne2 = obj;
        }
        return (sw2.lat >= sw.lat) && (ne2.lat <= ne.lat) && (sw2.lng >= sw.lng) && (ne2.lng <= ne.lng);
      },
      intersects: function(bounds) {
        bounds = L.latLngBounds(bounds);
        var sw = this._southWest,
            ne = this._northEast,
            sw2 = bounds.getSouthWest(),
            ne2 = bounds.getNorthEast(),
            latIntersects = (ne2.lat >= sw.lat) && (sw2.lat <= ne.lat),
            lngIntersects = (ne2.lng >= sw.lng) && (sw2.lng <= ne.lng);
        return latIntersects && lngIntersects;
      },
      toBBoxString: function() {
        return [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()].join(',');
      },
      equals: function(bounds) {
        if (!bounds) {
          return false;
        }
        bounds = L.latLngBounds(bounds);
        return this._southWest.equals(bounds.getSouthWest()) && this._northEast.equals(bounds.getNorthEast());
      },
      isValid: function() {
        return !!(this._southWest && this._northEast);
      }
    };
    L.latLngBounds = function(a, b) {
      if (!a || a instanceof L.LatLngBounds) {
        return a;
      }
      return new L.LatLngBounds(a, b);
    };
    L.Projection = {};
    L.Projection.SphericalMercator = {
      MAX_LATITUDE: 85.0511287798,
      project: function(latlng) {
        var d = L.LatLng.DEG_TO_RAD,
            max = this.MAX_LATITUDE,
            lat = Math.max(Math.min(max, latlng.lat), -max),
            x = latlng.lng * d,
            y = lat * d;
        y = Math.log(Math.tan((Math.PI / 4) + (y / 2)));
        return new L.Point(x, y);
      },
      unproject: function(point) {
        var d = L.LatLng.RAD_TO_DEG,
            lng = point.x * d,
            lat = (2 * Math.atan(Math.exp(point.y)) - (Math.PI / 2)) * d;
        return new L.LatLng(lat, lng);
      }
    };
    L.Projection.LonLat = {
      project: function(latlng) {
        return new L.Point(latlng.lng, latlng.lat);
      },
      unproject: function(point) {
        return new L.LatLng(point.y, point.x);
      }
    };
    L.CRS = {
      latLngToPoint: function(latlng, zoom) {
        var projectedPoint = this.projection.project(latlng),
            scale = this.scale(zoom);
        return this.transformation._transform(projectedPoint, scale);
      },
      pointToLatLng: function(point, zoom) {
        var scale = this.scale(zoom),
            untransformedPoint = this.transformation.untransform(point, scale);
        return this.projection.unproject(untransformedPoint);
      },
      project: function(latlng) {
        return this.projection.project(latlng);
      },
      scale: function(zoom) {
        return 256 * Math.pow(2, zoom);
      },
      getSize: function(zoom) {
        var s = this.scale(zoom);
        return L.point(s, s);
      }
    };
    L.CRS.Simple = L.extend({}, L.CRS, {
      projection: L.Projection.LonLat,
      transformation: new L.Transformation(1, 0, -1, 0),
      scale: function(zoom) {
        return Math.pow(2, zoom);
      }
    });
    L.CRS.EPSG3857 = L.extend({}, L.CRS, {
      code: 'EPSG:3857',
      projection: L.Projection.SphericalMercator,
      transformation: new L.Transformation(0.5 / Math.PI, 0.5, -0.5 / Math.PI, 0.5),
      project: function(latlng) {
        var projectedPoint = this.projection.project(latlng),
            earthRadius = 6378137;
        return projectedPoint.multiplyBy(earthRadius);
      }
    });
    L.CRS.EPSG900913 = L.extend({}, L.CRS.EPSG3857, {code: 'EPSG:900913'});
    L.CRS.EPSG4326 = L.extend({}, L.CRS, {
      code: 'EPSG:4326',
      projection: L.Projection.LonLat,
      transformation: new L.Transformation(1 / 360, 0.5, -1 / 360, 0.5)
    });
    L.Map = L.Class.extend({
      includes: L.Mixin.Events,
      options: {
        crs: L.CRS.EPSG3857,
        fadeAnimation: L.DomUtil.TRANSITION && !L.Browser.android23,
        trackResize: true,
        markerZoomAnimation: L.DomUtil.TRANSITION && L.Browser.any3d
      },
      initialize: function(id, options) {
        options = L.setOptions(this, options);
        this._initContainer(id);
        this._initLayout();
        this._onResize = L.bind(this._onResize, this);
        this._initEvents();
        if (options.maxBounds) {
          this.setMaxBounds(options.maxBounds);
        }
        if (options.center && options.zoom !== undefined) {
          this.setView(L.latLng(options.center), options.zoom, {reset: true});
        }
        this._handlers = [];
        this._layers = {};
        this._zoomBoundLayers = {};
        this._tileLayersNum = 0;
        this.callInitHooks();
        this._addLayers(options.layers);
      },
      setView: function(center, zoom) {
        zoom = zoom === undefined ? this.getZoom() : zoom;
        this._resetView(L.latLng(center), this._limitZoom(zoom));
        return this;
      },
      setZoom: function(zoom, options) {
        if (!this._loaded) {
          this._zoom = this._limitZoom(zoom);
          return this;
        }
        return this.setView(this.getCenter(), zoom, {zoom: options});
      },
      zoomIn: function(delta, options) {
        return this.setZoom(this._zoom + (delta || 1), options);
      },
      zoomOut: function(delta, options) {
        return this.setZoom(this._zoom - (delta || 1), options);
      },
      setZoomAround: function(latlng, zoom, options) {
        var scale = this.getZoomScale(zoom),
            viewHalf = this.getSize().divideBy(2),
            containerPoint = latlng instanceof L.Point ? latlng : this.latLngToContainerPoint(latlng),
            centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale),
            newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset));
        return this.setView(newCenter, zoom, {zoom: options});
      },
      fitBounds: function(bounds, options) {
        options = options || {};
        bounds = bounds.getBounds ? bounds.getBounds() : L.latLngBounds(bounds);
        var paddingTL = L.point(options.paddingTopLeft || options.padding || [0, 0]),
            paddingBR = L.point(options.paddingBottomRight || options.padding || [0, 0]),
            zoom = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR));
        zoom = (options.maxZoom) ? Math.min(options.maxZoom, zoom) : zoom;
        var paddingOffset = paddingBR.subtract(paddingTL).divideBy(2),
            swPoint = this.project(bounds.getSouthWest(), zoom),
            nePoint = this.project(bounds.getNorthEast(), zoom),
            center = this.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom);
        return this.setView(center, zoom, options);
      },
      fitWorld: function(options) {
        return this.fitBounds([[-90, -180], [90, 180]], options);
      },
      panTo: function(center, options) {
        return this.setView(center, this._zoom, {pan: options});
      },
      panBy: function(offset) {
        this.fire('movestart');
        this._rawPanBy(L.point(offset));
        this.fire('move');
        return this.fire('moveend');
      },
      setMaxBounds: function(bounds) {
        bounds = L.latLngBounds(bounds);
        this.options.maxBounds = bounds;
        if (!bounds) {
          return this.off('moveend', this._panInsideMaxBounds, this);
        }
        if (this._loaded) {
          this._panInsideMaxBounds();
        }
        return this.on('moveend', this._panInsideMaxBounds, this);
      },
      panInsideBounds: function(bounds, options) {
        var center = this.getCenter(),
            newCenter = this._limitCenter(center, this._zoom, bounds);
        if (center.equals(newCenter)) {
          return this;
        }
        return this.panTo(newCenter, options);
      },
      addLayer: function(layer) {
        var id = L.stamp(layer);
        if (this._layers[id]) {
          return this;
        }
        this._layers[id] = layer;
        if (layer.options && (!isNaN(layer.options.maxZoom) || !isNaN(layer.options.minZoom))) {
          this._zoomBoundLayers[id] = layer;
          this._updateZoomLevels();
        }
        if (this.options.zoomAnimation && L.TileLayer && (layer instanceof L.TileLayer)) {
          this._tileLayersNum++;
          this._tileLayersToLoad++;
          layer.on('load', this._onTileLayerLoad, this);
        }
        if (this._loaded) {
          this._layerAdd(layer);
        }
        return this;
      },
      removeLayer: function(layer) {
        var id = L.stamp(layer);
        if (!this._layers[id]) {
          return this;
        }
        if (this._loaded) {
          layer.onRemove(this);
        }
        delete this._layers[id];
        if (this._loaded) {
          this.fire('layerremove', {layer: layer});
        }
        if (this._zoomBoundLayers[id]) {
          delete this._zoomBoundLayers[id];
          this._updateZoomLevels();
        }
        if (this.options.zoomAnimation && L.TileLayer && (layer instanceof L.TileLayer)) {
          this._tileLayersNum--;
          this._tileLayersToLoad--;
          layer.off('load', this._onTileLayerLoad, this);
        }
        return this;
      },
      hasLayer: function(layer) {
        if (!layer) {
          return false;
        }
        return (L.stamp(layer) in this._layers);
      },
      eachLayer: function(method, context) {
        for (var i in this._layers) {
          method.call(context, this._layers[i]);
        }
        return this;
      },
      invalidateSize: function(options) {
        if (!this._loaded) {
          return this;
        }
        options = L.extend({
          animate: false,
          pan: true
        }, options === true ? {animate: true} : options);
        var oldSize = this.getSize();
        this._sizeChanged = true;
        this._initialCenter = null;
        var newSize = this.getSize(),
            oldCenter = oldSize.divideBy(2).round(),
            newCenter = newSize.divideBy(2).round(),
            offset = oldCenter.subtract(newCenter);
        if (!offset.x && !offset.y) {
          return this;
        }
        if (options.animate && options.pan) {
          this.panBy(offset);
        } else {
          if (options.pan) {
            this._rawPanBy(offset);
          }
          this.fire('move');
          if (options.debounceMoveend) {
            clearTimeout(this._sizeTimer);
            this._sizeTimer = setTimeout(L.bind(this.fire, this, 'moveend'), 200);
          } else {
            this.fire('moveend');
          }
        }
        return this.fire('resize', {
          oldSize: oldSize,
          newSize: newSize
        });
      },
      addHandler: function(name, HandlerClass) {
        if (!HandlerClass) {
          return this;
        }
        var handler = this[name] = new HandlerClass(this);
        this._handlers.push(handler);
        if (this.options[name]) {
          handler.enable();
        }
        return this;
      },
      remove: function() {
        if (this._loaded) {
          this.fire('unload');
        }
        this._initEvents('off');
        try {
          delete this._container._leaflet;
        } catch (e) {
          this._container._leaflet = undefined;
        }
        this._clearPanes();
        if (this._clearControlPos) {
          this._clearControlPos();
        }
        this._clearHandlers();
        return this;
      },
      getCenter: function() {
        this._checkIfLoaded();
        if (this._initialCenter && !this._moved()) {
          return this._initialCenter;
        }
        return this.layerPointToLatLng(this._getCenterLayerPoint());
      },
      getZoom: function() {
        return this._zoom;
      },
      getBounds: function() {
        var bounds = this.getPixelBounds(),
            sw = this.unproject(bounds.getBottomLeft()),
            ne = this.unproject(bounds.getTopRight());
        return new L.LatLngBounds(sw, ne);
      },
      getMinZoom: function() {
        return this.options.minZoom === undefined ? (this._layersMinZoom === undefined ? 0 : this._layersMinZoom) : this.options.minZoom;
      },
      getMaxZoom: function() {
        return this.options.maxZoom === undefined ? (this._layersMaxZoom === undefined ? Infinity : this._layersMaxZoom) : this.options.maxZoom;
      },
      getBoundsZoom: function(bounds, inside, padding) {
        bounds = L.latLngBounds(bounds);
        var zoom = this.getMinZoom() - (inside ? 1 : 0),
            maxZoom = this.getMaxZoom(),
            size = this.getSize(),
            nw = bounds.getNorthWest(),
            se = bounds.getSouthEast(),
            zoomNotFound = true,
            boundsSize;
        padding = L.point(padding || [0, 0]);
        do {
          zoom++;
          boundsSize = this.project(se, zoom).subtract(this.project(nw, zoom)).add(padding);
          zoomNotFound = !inside ? size.contains(boundsSize) : boundsSize.x < size.x || boundsSize.y < size.y;
        } while (zoomNotFound && zoom <= maxZoom);
        if (zoomNotFound && inside) {
          return null;
        }
        return inside ? zoom : zoom - 1;
      },
      getSize: function() {
        if (!this._size || this._sizeChanged) {
          this._size = new L.Point(this._container.clientWidth, this._container.clientHeight);
          this._sizeChanged = false;
        }
        return this._size.clone();
      },
      getPixelBounds: function() {
        var topLeftPoint = this._getTopLeftPoint();
        return new L.Bounds(topLeftPoint, topLeftPoint.add(this.getSize()));
      },
      getPixelOrigin: function() {
        this._checkIfLoaded();
        return this._initialTopLeftPoint;
      },
      getPanes: function() {
        return this._panes;
      },
      getContainer: function() {
        return this._container;
      },
      getZoomScale: function(toZoom) {
        var crs = this.options.crs;
        return crs.scale(toZoom) / crs.scale(this._zoom);
      },
      getScaleZoom: function(scale) {
        return this._zoom + (Math.log(scale) / Math.LN2);
      },
      project: function(latlng, zoom) {
        zoom = zoom === undefined ? this._zoom : zoom;
        return this.options.crs.latLngToPoint(L.latLng(latlng), zoom);
      },
      unproject: function(point, zoom) {
        zoom = zoom === undefined ? this._zoom : zoom;
        return this.options.crs.pointToLatLng(L.point(point), zoom);
      },
      layerPointToLatLng: function(point) {
        var projectedPoint = L.point(point).add(this.getPixelOrigin());
        return this.unproject(projectedPoint);
      },
      latLngToLayerPoint: function(latlng) {
        var projectedPoint = this.project(L.latLng(latlng))._round();
        return projectedPoint._subtract(this.getPixelOrigin());
      },
      containerPointToLayerPoint: function(point) {
        return L.point(point).subtract(this._getMapPanePos());
      },
      layerPointToContainerPoint: function(point) {
        return L.point(point).add(this._getMapPanePos());
      },
      containerPointToLatLng: function(point) {
        var layerPoint = this.containerPointToLayerPoint(L.point(point));
        return this.layerPointToLatLng(layerPoint);
      },
      latLngToContainerPoint: function(latlng) {
        return this.layerPointToContainerPoint(this.latLngToLayerPoint(L.latLng(latlng)));
      },
      mouseEventToContainerPoint: function(e) {
        return L.DomEvent.getMousePosition(e, this._container);
      },
      mouseEventToLayerPoint: function(e) {
        return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(e));
      },
      mouseEventToLatLng: function(e) {
        return this.layerPointToLatLng(this.mouseEventToLayerPoint(e));
      },
      _initContainer: function(id) {
        var container = this._container = L.DomUtil.get(id);
        if (!container) {
          throw new Error('Map container not found.');
        } else if (container._leaflet) {
          throw new Error('Map container is already initialized.');
        }
        container._leaflet = true;
      },
      _initLayout: function() {
        var container = this._container;
        L.DomUtil.addClass(container, 'leaflet-container' + (L.Browser.touch ? ' leaflet-touch' : '') + (L.Browser.retina ? ' leaflet-retina' : '') + (L.Browser.ielt9 ? ' leaflet-oldie' : '') + (this.options.fadeAnimation ? ' leaflet-fade-anim' : ''));
        var position = L.DomUtil.getStyle(container, 'position');
        if (position !== 'absolute' && position !== 'relative' && position !== 'fixed') {
          container.style.position = 'relative';
        }
        this._initPanes();
        if (this._initControlPos) {
          this._initControlPos();
        }
      },
      _initPanes: function() {
        var panes = this._panes = {};
        this._mapPane = panes.mapPane = this._createPane('leaflet-map-pane', this._container);
        this._tilePane = panes.tilePane = this._createPane('leaflet-tile-pane', this._mapPane);
        panes.objectsPane = this._createPane('leaflet-objects-pane', this._mapPane);
        panes.shadowPane = this._createPane('leaflet-shadow-pane');
        panes.overlayPane = this._createPane('leaflet-overlay-pane');
        panes.markerPane = this._createPane('leaflet-marker-pane');
        panes.popupPane = this._createPane('leaflet-popup-pane');
        var zoomHide = ' leaflet-zoom-hide';
        if (!this.options.markerZoomAnimation) {
          L.DomUtil.addClass(panes.markerPane, zoomHide);
          L.DomUtil.addClass(panes.shadowPane, zoomHide);
          L.DomUtil.addClass(panes.popupPane, zoomHide);
        }
      },
      _createPane: function(className, container) {
        return L.DomUtil.create('div', className, container || this._panes.objectsPane);
      },
      _clearPanes: function() {
        this._container.removeChild(this._mapPane);
      },
      _addLayers: function(layers) {
        layers = layers ? (L.Util.isArray(layers) ? layers : [layers]) : [];
        for (var i = 0,
            len = layers.length; i < len; i++) {
          this.addLayer(layers[i]);
        }
      },
      _resetView: function(center, zoom, preserveMapOffset, afterZoomAnim) {
        var zoomChanged = (this._zoom !== zoom);
        if (!afterZoomAnim) {
          this.fire('movestart');
          if (zoomChanged) {
            this.fire('zoomstart');
          }
        }
        this._zoom = zoom;
        this._initialCenter = center;
        this._initialTopLeftPoint = this._getNewTopLeftPoint(center);
        if (!preserveMapOffset) {
          L.DomUtil.setPosition(this._mapPane, new L.Point(0, 0));
        } else {
          this._initialTopLeftPoint._add(this._getMapPanePos());
        }
        this._tileLayersToLoad = this._tileLayersNum;
        var loading = !this._loaded;
        this._loaded = true;
        this.fire('viewreset', {hard: !preserveMapOffset});
        if (loading) {
          this.fire('load');
          this.eachLayer(this._layerAdd, this);
        }
        this.fire('move');
        if (zoomChanged || afterZoomAnim) {
          this.fire('zoomend');
        }
        this.fire('moveend', {hard: !preserveMapOffset});
      },
      _rawPanBy: function(offset) {
        L.DomUtil.setPosition(this._mapPane, this._getMapPanePos().subtract(offset));
      },
      _getZoomSpan: function() {
        return this.getMaxZoom() - this.getMinZoom();
      },
      _updateZoomLevels: function() {
        var i,
            minZoom = Infinity,
            maxZoom = -Infinity,
            oldZoomSpan = this._getZoomSpan();
        for (i in this._zoomBoundLayers) {
          var layer = this._zoomBoundLayers[i];
          if (!isNaN(layer.options.minZoom)) {
            minZoom = Math.min(minZoom, layer.options.minZoom);
          }
          if (!isNaN(layer.options.maxZoom)) {
            maxZoom = Math.max(maxZoom, layer.options.maxZoom);
          }
        }
        if (i === undefined) {
          this._layersMaxZoom = this._layersMinZoom = undefined;
        } else {
          this._layersMaxZoom = maxZoom;
          this._layersMinZoom = minZoom;
        }
        if (oldZoomSpan !== this._getZoomSpan()) {
          this.fire('zoomlevelschange');
        }
      },
      _panInsideMaxBounds: function() {
        this.panInsideBounds(this.options.maxBounds);
      },
      _checkIfLoaded: function() {
        if (!this._loaded) {
          throw new Error('Set map center and zoom first.');
        }
      },
      _initEvents: function(onOff) {
        if (!L.DomEvent) {
          return;
        }
        onOff = onOff || 'on';
        L.DomEvent[onOff](this._container, 'click', this._onMouseClick, this);
        var events = ['dblclick', 'mousedown', 'mouseup', 'mouseenter', 'mouseleave', 'mousemove', 'contextmenu'],
            i,
            len;
        for (i = 0, len = events.length; i < len; i++) {
          L.DomEvent[onOff](this._container, events[i], this._fireMouseEvent, this);
        }
        if (this.options.trackResize) {
          L.DomEvent[onOff](window, 'resize', this._onResize, this);
        }
      },
      _onResize: function() {
        L.Util.cancelAnimFrame(this._resizeRequest);
        this._resizeRequest = L.Util.requestAnimFrame(function() {
          this.invalidateSize({debounceMoveend: true});
        }, this, false, this._container);
      },
      _onMouseClick: function(e) {
        if (!this._loaded || (!e._simulated && ((this.dragging && this.dragging.moved()) || (this.boxZoom && this.boxZoom.moved()))) || L.DomEvent._skipped(e)) {
          return;
        }
        this.fire('preclick');
        this._fireMouseEvent(e);
      },
      _fireMouseEvent: function(e) {
        if (!this._loaded || L.DomEvent._skipped(e)) {
          return;
        }
        var type = e.type;
        type = (type === 'mouseenter' ? 'mouseover' : (type === 'mouseleave' ? 'mouseout' : type));
        if (!this.hasEventListeners(type)) {
          return;
        }
        if (type === 'contextmenu') {
          L.DomEvent.preventDefault(e);
        }
        var containerPoint = this.mouseEventToContainerPoint(e),
            layerPoint = this.containerPointToLayerPoint(containerPoint),
            latlng = this.layerPointToLatLng(layerPoint);
        this.fire(type, {
          latlng: latlng,
          layerPoint: layerPoint,
          containerPoint: containerPoint,
          originalEvent: e
        });
      },
      _onTileLayerLoad: function() {
        this._tileLayersToLoad--;
        if (this._tileLayersNum && !this._tileLayersToLoad) {
          this.fire('tilelayersload');
        }
      },
      _clearHandlers: function() {
        for (var i = 0,
            len = this._handlers.length; i < len; i++) {
          this._handlers[i].disable();
        }
      },
      whenReady: function(callback, context) {
        if (this._loaded) {
          callback.call(context || this, this);
        } else {
          this.on('load', callback, context);
        }
        return this;
      },
      _layerAdd: function(layer) {
        layer.onAdd(this);
        this.fire('layeradd', {layer: layer});
      },
      _getMapPanePos: function() {
        return L.DomUtil.getPosition(this._mapPane);
      },
      _moved: function() {
        var pos = this._getMapPanePos();
        return pos && !pos.equals([0, 0]);
      },
      _getTopLeftPoint: function() {
        return this.getPixelOrigin().subtract(this._getMapPanePos());
      },
      _getNewTopLeftPoint: function(center, zoom) {
        var viewHalf = this.getSize()._divideBy(2);
        return this.project(center, zoom)._subtract(viewHalf)._round();
      },
      _latLngToNewLayerPoint: function(latlng, newZoom, newCenter) {
        var topLeft = this._getNewTopLeftPoint(newCenter, newZoom).add(this._getMapPanePos());
        return this.project(latlng, newZoom)._subtract(topLeft);
      },
      _getCenterLayerPoint: function() {
        return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
      },
      _getCenterOffset: function(latlng) {
        return this.latLngToLayerPoint(latlng).subtract(this._getCenterLayerPoint());
      },
      _limitCenter: function(center, zoom, bounds) {
        if (!bounds) {
          return center;
        }
        var centerPoint = this.project(center, zoom),
            viewHalf = this.getSize().divideBy(2),
            viewBounds = new L.Bounds(centerPoint.subtract(viewHalf), centerPoint.add(viewHalf)),
            offset = this._getBoundsOffset(viewBounds, bounds, zoom);
        return this.unproject(centerPoint.add(offset), zoom);
      },
      _limitOffset: function(offset, bounds) {
        if (!bounds) {
          return offset;
        }
        var viewBounds = this.getPixelBounds(),
            newBounds = new L.Bounds(viewBounds.min.add(offset), viewBounds.max.add(offset));
        return offset.add(this._getBoundsOffset(newBounds, bounds));
      },
      _getBoundsOffset: function(pxBounds, maxBounds, zoom) {
        var nwOffset = this.project(maxBounds.getNorthWest(), zoom).subtract(pxBounds.min),
            seOffset = this.project(maxBounds.getSouthEast(), zoom).subtract(pxBounds.max),
            dx = this._rebound(nwOffset.x, -seOffset.x),
            dy = this._rebound(nwOffset.y, -seOffset.y);
        return new L.Point(dx, dy);
      },
      _rebound: function(left, right) {
        return left + right > 0 ? Math.round(left - right) / 2 : Math.max(0, Math.ceil(left)) - Math.max(0, Math.floor(right));
      },
      _limitZoom: function(zoom) {
        var min = this.getMinZoom(),
            max = this.getMaxZoom();
        return Math.max(min, Math.min(max, zoom));
      }
    });
    L.map = function(id, options) {
      return new L.Map(id, options);
    };
    L.Projection.Mercator = {
      MAX_LATITUDE: 85.0840591556,
      R_MINOR: 6356752.314245179,
      R_MAJOR: 6378137,
      project: function(latlng) {
        var d = L.LatLng.DEG_TO_RAD,
            max = this.MAX_LATITUDE,
            lat = Math.max(Math.min(max, latlng.lat), -max),
            r = this.R_MAJOR,
            r2 = this.R_MINOR,
            x = latlng.lng * d * r,
            y = lat * d,
            tmp = r2 / r,
            eccent = Math.sqrt(1.0 - tmp * tmp),
            con = eccent * Math.sin(y);
        con = Math.pow((1 - con) / (1 + con), eccent * 0.5);
        var ts = Math.tan(0.5 * ((Math.PI * 0.5) - y)) / con;
        y = -r * Math.log(ts);
        return new L.Point(x, y);
      },
      unproject: function(point) {
        var d = L.LatLng.RAD_TO_DEG,
            r = this.R_MAJOR,
            r2 = this.R_MINOR,
            lng = point.x * d / r,
            tmp = r2 / r,
            eccent = Math.sqrt(1 - (tmp * tmp)),
            ts = Math.exp(-point.y / r),
            phi = (Math.PI / 2) - 2 * Math.atan(ts),
            numIter = 15,
            tol = 1e-7,
            i = numIter,
            dphi = 0.1,
            con;
        while ((Math.abs(dphi) > tol) && (--i > 0)) {
          con = eccent * Math.sin(phi);
          dphi = (Math.PI / 2) - 2 * Math.atan(ts * Math.pow((1.0 - con) / (1.0 + con), 0.5 * eccent)) - phi;
          phi += dphi;
        }
        return new L.LatLng(phi * d, lng);
      }
    };
    L.CRS.EPSG3395 = L.extend({}, L.CRS, {
      code: 'EPSG:3395',
      projection: L.Projection.Mercator,
      transformation: (function() {
        var m = L.Projection.Mercator,
            r = m.R_MAJOR,
            scale = 0.5 / (Math.PI * r);
        return new L.Transformation(scale, 0.5, -scale, 0.5);
      }())
    });
    L.TileLayer = L.Class.extend({
      includes: L.Mixin.Events,
      options: {
        minZoom: 0,
        maxZoom: 18,
        tileSize: 256,
        subdomains: 'abc',
        errorTileUrl: '',
        attribution: '',
        zoomOffset: 0,
        opacity: 1,
        unloadInvisibleTiles: L.Browser.mobile,
        updateWhenIdle: L.Browser.mobile
      },
      initialize: function(url, options) {
        options = L.setOptions(this, options);
        if (options.detectRetina && L.Browser.retina && options.maxZoom > 0) {
          options.tileSize = Math.floor(options.tileSize / 2);
          options.zoomOffset++;
          if (options.minZoom > 0) {
            options.minZoom--;
          }
          this.options.maxZoom--;
        }
        if (options.bounds) {
          options.bounds = L.latLngBounds(options.bounds);
        }
        this._url = url;
        var subdomains = this.options.subdomains;
        if (typeof subdomains === 'string') {
          this.options.subdomains = subdomains.split('');
        }
      },
      onAdd: function(map) {
        this._map = map;
        this._animated = map._zoomAnimated;
        this._initContainer();
        map.on({
          'viewreset': this._reset,
          'moveend': this._update
        }, this);
        if (this._animated) {
          map.on({
            'zoomanim': this._animateZoom,
            'zoomend': this._endZoomAnim
          }, this);
        }
        if (!this.options.updateWhenIdle) {
          this._limitedUpdate = L.Util.limitExecByInterval(this._update, 150, this);
          map.on('move', this._limitedUpdate, this);
        }
        this._reset();
        this._update();
      },
      addTo: function(map) {
        map.addLayer(this);
        return this;
      },
      onRemove: function(map) {
        this._container.parentNode.removeChild(this._container);
        map.off({
          'viewreset': this._reset,
          'moveend': this._update
        }, this);
        if (this._animated) {
          map.off({
            'zoomanim': this._animateZoom,
            'zoomend': this._endZoomAnim
          }, this);
        }
        if (!this.options.updateWhenIdle) {
          map.off('move', this._limitedUpdate, this);
        }
        this._container = null;
        this._map = null;
      },
      bringToFront: function() {
        var pane = this._map._panes.tilePane;
        if (this._container) {
          pane.appendChild(this._container);
          this._setAutoZIndex(pane, Math.max);
        }
        return this;
      },
      bringToBack: function() {
        var pane = this._map._panes.tilePane;
        if (this._container) {
          pane.insertBefore(this._container, pane.firstChild);
          this._setAutoZIndex(pane, Math.min);
        }
        return this;
      },
      getAttribution: function() {
        return this.options.attribution;
      },
      getContainer: function() {
        return this._container;
      },
      setOpacity: function(opacity) {
        this.options.opacity = opacity;
        if (this._map) {
          this._updateOpacity();
        }
        return this;
      },
      setZIndex: function(zIndex) {
        this.options.zIndex = zIndex;
        this._updateZIndex();
        return this;
      },
      setUrl: function(url, noRedraw) {
        this._url = url;
        if (!noRedraw) {
          this.redraw();
        }
        return this;
      },
      redraw: function() {
        if (this._map) {
          this._reset({hard: true});
          this._update();
        }
        return this;
      },
      _updateZIndex: function() {
        if (this._container && this.options.zIndex !== undefined) {
          this._container.style.zIndex = this.options.zIndex;
        }
      },
      _setAutoZIndex: function(pane, compare) {
        var layers = pane.children,
            edgeZIndex = -compare(Infinity, -Infinity),
            zIndex,
            i,
            len;
        for (i = 0, len = layers.length; i < len; i++) {
          if (layers[i] !== this._container) {
            zIndex = parseInt(layers[i].style.zIndex, 10);
            if (!isNaN(zIndex)) {
              edgeZIndex = compare(edgeZIndex, zIndex);
            }
          }
        }
        this.options.zIndex = this._container.style.zIndex = (isFinite(edgeZIndex) ? edgeZIndex : 0) + compare(1, -1);
      },
      _updateOpacity: function() {
        var i,
            tiles = this._tiles;
        if (L.Browser.ielt9) {
          for (i in tiles) {
            L.DomUtil.setOpacity(tiles[i], this.options.opacity);
          }
        } else {
          L.DomUtil.setOpacity(this._container, this.options.opacity);
        }
      },
      _initContainer: function() {
        var tilePane = this._map._panes.tilePane;
        if (!this._container) {
          this._container = L.DomUtil.create('div', 'leaflet-layer');
          this._updateZIndex();
          if (this._animated) {
            var className = 'leaflet-tile-container';
            this._bgBuffer = L.DomUtil.create('div', className, this._container);
            this._tileContainer = L.DomUtil.create('div', className, this._container);
          } else {
            this._tileContainer = this._container;
          }
          tilePane.appendChild(this._container);
          if (this.options.opacity < 1) {
            this._updateOpacity();
          }
        }
      },
      _reset: function(e) {
        for (var key in this._tiles) {
          this.fire('tileunload', {tile: this._tiles[key]});
        }
        this._tiles = {};
        this._tilesToLoad = 0;
        if (this.options.reuseTiles) {
          this._unusedTiles = [];
        }
        this._tileContainer.innerHTML = '';
        if (this._animated && e && e.hard) {
          this._clearBgBuffer();
        }
        this._initContainer();
      },
      _getTileSize: function() {
        var map = this._map,
            zoom = map.getZoom() + this.options.zoomOffset,
            zoomN = this.options.maxNativeZoom,
            tileSize = this.options.tileSize;
        if (zoomN && zoom > zoomN) {
          tileSize = Math.round(map.getZoomScale(zoom) / map.getZoomScale(zoomN) * tileSize);
        }
        return tileSize;
      },
      _update: function() {
        if (!this._map) {
          return;
        }
        var map = this._map,
            bounds = map.getPixelBounds(),
            zoom = map.getZoom(),
            tileSize = this._getTileSize();
        if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
          return;
        }
        var tileBounds = L.bounds(bounds.min.divideBy(tileSize)._floor(), bounds.max.divideBy(tileSize)._floor());
        this._addTilesFromCenterOut(tileBounds);
        if (this.options.unloadInvisibleTiles || this.options.reuseTiles) {
          this._removeOtherTiles(tileBounds);
        }
      },
      _addTilesFromCenterOut: function(bounds) {
        var queue = [],
            center = bounds.getCenter();
        var j,
            i,
            point;
        for (j = bounds.min.y; j <= bounds.max.y; j++) {
          for (i = bounds.min.x; i <= bounds.max.x; i++) {
            point = new L.Point(i, j);
            if (this._tileShouldBeLoaded(point)) {
              queue.push(point);
            }
          }
        }
        var tilesToLoad = queue.length;
        if (tilesToLoad === 0) {
          return;
        }
        queue.sort(function(a, b) {
          return a.distanceTo(center) - b.distanceTo(center);
        });
        var fragment = document.createDocumentFragment();
        if (!this._tilesToLoad) {
          this.fire('loading');
        }
        this._tilesToLoad += tilesToLoad;
        for (i = 0; i < tilesToLoad; i++) {
          this._addTile(queue[i], fragment);
        }
        this._tileContainer.appendChild(fragment);
      },
      _tileShouldBeLoaded: function(tilePoint) {
        if ((tilePoint.x + ':' + tilePoint.y) in this._tiles) {
          return false;
        }
        var options = this.options;
        if (!options.continuousWorld) {
          var limit = this._getWrapTileNum();
          if ((options.noWrap && (tilePoint.x < 0 || tilePoint.x >= limit.x)) || tilePoint.y < 0 || tilePoint.y >= limit.y) {
            return false;
          }
        }
        if (options.bounds) {
          var tileSize = this._getTileSize(),
              nwPoint = tilePoint.multiplyBy(tileSize),
              sePoint = nwPoint.add([tileSize, tileSize]),
              nw = this._map.unproject(nwPoint),
              se = this._map.unproject(sePoint);
          if (!options.continuousWorld && !options.noWrap) {
            nw = nw.wrap();
            se = se.wrap();
          }
          if (!options.bounds.intersects([nw, se])) {
            return false;
          }
        }
        return true;
      },
      _removeOtherTiles: function(bounds) {
        var kArr,
            x,
            y,
            key;
        for (key in this._tiles) {
          kArr = key.split(':');
          x = parseInt(kArr[0], 10);
          y = parseInt(kArr[1], 10);
          if (x < bounds.min.x || x > bounds.max.x || y < bounds.min.y || y > bounds.max.y) {
            this._removeTile(key);
          }
        }
      },
      _removeTile: function(key) {
        var tile = this._tiles[key];
        this.fire('tileunload', {
          tile: tile,
          url: tile.src
        });
        if (this.options.reuseTiles) {
          L.DomUtil.removeClass(tile, 'leaflet-tile-loaded');
          this._unusedTiles.push(tile);
        } else if (tile.parentNode === this._tileContainer) {
          this._tileContainer.removeChild(tile);
        }
        if (!L.Browser.android) {
          tile.onload = null;
          tile.src = L.Util.emptyImageUrl;
        }
        delete this._tiles[key];
      },
      _addTile: function(tilePoint, container) {
        var tilePos = this._getTilePos(tilePoint);
        var tile = this._getTile();
        L.DomUtil.setPosition(tile, tilePos, L.Browser.chrome);
        this._tiles[tilePoint.x + ':' + tilePoint.y] = tile;
        this._loadTile(tile, tilePoint);
        if (tile.parentNode !== this._tileContainer) {
          container.appendChild(tile);
        }
      },
      _getZoomForUrl: function() {
        var options = this.options,
            zoom = this._map.getZoom();
        if (options.zoomReverse) {
          zoom = options.maxZoom - zoom;
        }
        zoom += options.zoomOffset;
        return options.maxNativeZoom ? Math.min(zoom, options.maxNativeZoom) : zoom;
      },
      _getTilePos: function(tilePoint) {
        var origin = this._map.getPixelOrigin(),
            tileSize = this._getTileSize();
        return tilePoint.multiplyBy(tileSize).subtract(origin);
      },
      getTileUrl: function(tilePoint) {
        return L.Util.template(this._url, L.extend({
          s: this._getSubdomain(tilePoint),
          z: tilePoint.z,
          x: tilePoint.x,
          y: tilePoint.y
        }, this.options));
      },
      _getWrapTileNum: function() {
        var crs = this._map.options.crs,
            size = crs.getSize(this._map.getZoom());
        return size.divideBy(this._getTileSize())._floor();
      },
      _adjustTilePoint: function(tilePoint) {
        var limit = this._getWrapTileNum();
        if (!this.options.continuousWorld && !this.options.noWrap) {
          tilePoint.x = ((tilePoint.x % limit.x) + limit.x) % limit.x;
        }
        if (this.options.tms) {
          tilePoint.y = limit.y - tilePoint.y - 1;
        }
        tilePoint.z = this._getZoomForUrl();
      },
      _getSubdomain: function(tilePoint) {
        var index = Math.abs(tilePoint.x + tilePoint.y) % this.options.subdomains.length;
        return this.options.subdomains[index];
      },
      _getTile: function() {
        if (this.options.reuseTiles && this._unusedTiles.length > 0) {
          var tile = this._unusedTiles.pop();
          this._resetTile(tile);
          return tile;
        }
        return this._createTile();
      },
      _resetTile: function() {},
      _createTile: function() {
        var tile = L.DomUtil.create('img', 'leaflet-tile');
        tile.style.width = tile.style.height = this._getTileSize() + 'px';
        tile.galleryimg = 'no';
        tile.onselectstart = tile.onmousemove = L.Util.falseFn;
        if (L.Browser.ielt9 && this.options.opacity !== undefined) {
          L.DomUtil.setOpacity(tile, this.options.opacity);
        }
        if (L.Browser.mobileWebkit3d) {
          tile.style.WebkitBackfaceVisibility = 'hidden';
        }
        return tile;
      },
      _loadTile: function(tile, tilePoint) {
        tile._layer = this;
        tile.onload = this._tileOnLoad;
        tile.onerror = this._tileOnError;
        this._adjustTilePoint(tilePoint);
        tile.src = this.getTileUrl(tilePoint);
        this.fire('tileloadstart', {
          tile: tile,
          url: tile.src
        });
      },
      _tileLoaded: function() {
        this._tilesToLoad--;
        if (this._animated) {
          L.DomUtil.addClass(this._tileContainer, 'leaflet-zoom-animated');
        }
        if (!this._tilesToLoad) {
          this.fire('load');
          if (this._animated) {
            clearTimeout(this._clearBgBufferTimer);
            this._clearBgBufferTimer = setTimeout(L.bind(this._clearBgBuffer, this), 500);
          }
        }
      },
      _tileOnLoad: function() {
        var layer = this._layer;
        if (this.src !== L.Util.emptyImageUrl) {
          L.DomUtil.addClass(this, 'leaflet-tile-loaded');
          layer.fire('tileload', {
            tile: this,
            url: this.src
          });
        }
        layer._tileLoaded();
      },
      _tileOnError: function() {
        var layer = this._layer;
        layer.fire('tileerror', {
          tile: this,
          url: this.src
        });
        var newUrl = layer.options.errorTileUrl;
        if (newUrl) {
          this.src = newUrl;
        }
        layer._tileLoaded();
      }
    });
    L.tileLayer = function(url, options) {
      return new L.TileLayer(url, options);
    };
    L.TileLayer.WMS = L.TileLayer.extend({
      defaultWmsParams: {
        service: 'WMS',
        request: 'GetMap',
        version: '1.1.1',
        layers: '',
        styles: '',
        format: 'image/jpeg',
        transparent: false
      },
      initialize: function(url, options) {
        this._url = url;
        var wmsParams = L.extend({}, this.defaultWmsParams),
            tileSize = options.tileSize || this.options.tileSize;
        if (options.detectRetina && L.Browser.retina) {
          wmsParams.width = wmsParams.height = tileSize * 2;
        } else {
          wmsParams.width = wmsParams.height = tileSize;
        }
        for (var i in options) {
          if (!this.options.hasOwnProperty(i) && i !== 'crs') {
            wmsParams[i] = options[i];
          }
        }
        this.wmsParams = wmsParams;
        L.setOptions(this, options);
      },
      onAdd: function(map) {
        this._crs = this.options.crs || map.options.crs;
        this._wmsVersion = parseFloat(this.wmsParams.version);
        var projectionKey = this._wmsVersion >= 1.3 ? 'crs' : 'srs';
        this.wmsParams[projectionKey] = this._crs.code;
        L.TileLayer.prototype.onAdd.call(this, map);
      },
      getTileUrl: function(tilePoint) {
        var map = this._map,
            tileSize = this.options.tileSize,
            nwPoint = tilePoint.multiplyBy(tileSize),
            sePoint = nwPoint.add([tileSize, tileSize]),
            nw = this._crs.project(map.unproject(nwPoint, tilePoint.z)),
            se = this._crs.project(map.unproject(sePoint, tilePoint.z)),
            bbox = this._wmsVersion >= 1.3 && this._crs === L.CRS.EPSG4326 ? [se.y, nw.x, nw.y, se.x].join(',') : [nw.x, se.y, se.x, nw.y].join(','),
            url = L.Util.template(this._url, {s: this._getSubdomain(tilePoint)});
        return url + L.Util.getParamString(this.wmsParams, url, true) + '&BBOX=' + bbox;
      },
      setParams: function(params, noRedraw) {
        L.extend(this.wmsParams, params);
        if (!noRedraw) {
          this.redraw();
        }
        return this;
      }
    });
    L.tileLayer.wms = function(url, options) {
      return new L.TileLayer.WMS(url, options);
    };
    L.TileLayer.Canvas = L.TileLayer.extend({
      options: {async: false},
      initialize: function(options) {
        L.setOptions(this, options);
      },
      redraw: function() {
        if (this._map) {
          this._reset({hard: true});
          this._update();
        }
        for (var i in this._tiles) {
          this._redrawTile(this._tiles[i]);
        }
        return this;
      },
      _redrawTile: function(tile) {
        this.drawTile(tile, tile._tilePoint, this._map._zoom);
      },
      _createTile: function() {
        var tile = L.DomUtil.create('canvas', 'leaflet-tile');
        tile.width = tile.height = this.options.tileSize;
        tile.onselectstart = tile.onmousemove = L.Util.falseFn;
        return tile;
      },
      _loadTile: function(tile, tilePoint) {
        tile._layer = this;
        tile._tilePoint = tilePoint;
        this._redrawTile(tile);
        if (!this.options.async) {
          this.tileDrawn(tile);
        }
      },
      drawTile: function() {},
      tileDrawn: function(tile) {
        this._tileOnLoad.call(tile);
      }
    });
    L.tileLayer.canvas = function(options) {
      return new L.TileLayer.Canvas(options);
    };
    L.ImageOverlay = L.Class.extend({
      includes: L.Mixin.Events,
      options: {opacity: 1},
      initialize: function(url, bounds, options) {
        this._url = url;
        this._bounds = L.latLngBounds(bounds);
        L.setOptions(this, options);
      },
      onAdd: function(map) {
        this._map = map;
        if (!this._image) {
          this._initImage();
        }
        map._panes.overlayPane.appendChild(this._image);
        map.on('viewreset', this._reset, this);
        if (map.options.zoomAnimation && L.Browser.any3d) {
          map.on('zoomanim', this._animateZoom, this);
        }
        this._reset();
      },
      onRemove: function(map) {
        map.getPanes().overlayPane.removeChild(this._image);
        map.off('viewreset', this._reset, this);
        if (map.options.zoomAnimation) {
          map.off('zoomanim', this._animateZoom, this);
        }
      },
      addTo: function(map) {
        map.addLayer(this);
        return this;
      },
      setOpacity: function(opacity) {
        this.options.opacity = opacity;
        this._updateOpacity();
        return this;
      },
      bringToFront: function() {
        if (this._image) {
          this._map._panes.overlayPane.appendChild(this._image);
        }
        return this;
      },
      bringToBack: function() {
        var pane = this._map._panes.overlayPane;
        if (this._image) {
          pane.insertBefore(this._image, pane.firstChild);
        }
        return this;
      },
      setUrl: function(url) {
        this._url = url;
        this._image.src = this._url;
      },
      getAttribution: function() {
        return this.options.attribution;
      },
      _initImage: function() {
        this._image = L.DomUtil.create('img', 'leaflet-image-layer');
        if (this._map.options.zoomAnimation && L.Browser.any3d) {
          L.DomUtil.addClass(this._image, 'leaflet-zoom-animated');
        } else {
          L.DomUtil.addClass(this._image, 'leaflet-zoom-hide');
        }
        this._updateOpacity();
        L.extend(this._image, {
          galleryimg: 'no',
          onselectstart: L.Util.falseFn,
          onmousemove: L.Util.falseFn,
          onload: L.bind(this._onImageLoad, this),
          src: this._url
        });
      },
      _animateZoom: function(e) {
        var map = this._map,
            image = this._image,
            scale = map.getZoomScale(e.zoom),
            nw = this._bounds.getNorthWest(),
            se = this._bounds.getSouthEast(),
            topLeft = map._latLngToNewLayerPoint(nw, e.zoom, e.center),
            size = map._latLngToNewLayerPoint(se, e.zoom, e.center)._subtract(topLeft),
            origin = topLeft._add(size._multiplyBy((1 / 2) * (1 - 1 / scale)));
        image.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(origin) + ' scale(' + scale + ') ';
      },
      _reset: function() {
        var image = this._image,
            topLeft = this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
            size = this._map.latLngToLayerPoint(this._bounds.getSouthEast())._subtract(topLeft);
        L.DomUtil.setPosition(image, topLeft);
        image.style.width = size.x + 'px';
        image.style.height = size.y + 'px';
      },
      _onImageLoad: function() {
        this.fire('load');
      },
      _updateOpacity: function() {
        L.DomUtil.setOpacity(this._image, this.options.opacity);
      }
    });
    L.imageOverlay = function(url, bounds, options) {
      return new L.ImageOverlay(url, bounds, options);
    };
    L.Icon = L.Class.extend({
      options: {className: ''},
      initialize: function(options) {
        L.setOptions(this, options);
      },
      createIcon: function(oldIcon) {
        return this._createIcon('icon', oldIcon);
      },
      createShadow: function(oldIcon) {
        return this._createIcon('shadow', oldIcon);
      },
      _createIcon: function(name, oldIcon) {
        var src = this._getIconUrl(name);
        if (!src) {
          if (name === 'icon') {
            throw new Error('iconUrl not set in Icon options (see the docs).');
          }
          return null;
        }
        var img;
        if (!oldIcon || oldIcon.tagName !== 'IMG') {
          img = this._createImg(src);
        } else {
          img = this._createImg(src, oldIcon);
        }
        this._setIconStyles(img, name);
        return img;
      },
      _setIconStyles: function(img, name) {
        var options = this.options,
            size = L.point(options[name + 'Size']),
            anchor;
        if (name === 'shadow') {
          anchor = L.point(options.shadowAnchor || options.iconAnchor);
        } else {
          anchor = L.point(options.iconAnchor);
        }
        if (!anchor && size) {
          anchor = size.divideBy(2, true);
        }
        img.className = 'leaflet-marker-' + name + ' ' + options.className;
        if (anchor) {
          img.style.marginLeft = (-anchor.x) + 'px';
          img.style.marginTop = (-anchor.y) + 'px';
        }
        if (size) {
          img.style.width = size.x + 'px';
          img.style.height = size.y + 'px';
        }
      },
      _createImg: function(src, el) {
        el = el || document.createElement('img');
        el.src = src;
        return el;
      },
      _getIconUrl: function(name) {
        if (L.Browser.retina && this.options[name + 'RetinaUrl']) {
          return this.options[name + 'RetinaUrl'];
        }
        return this.options[name + 'Url'];
      }
    });
    L.icon = function(options) {
      return new L.Icon(options);
    };
    L.Icon.Default = L.Icon.extend({
      options: {
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      },
      _getIconUrl: function(name) {
        var key = name + 'Url';
        if (this.options[key]) {
          return this.options[key];
        }
        if (L.Browser.retina && name === 'icon') {
          name += '-2x';
        }
        var path = L.Icon.Default.imagePath;
        if (!path) {
          throw new Error('Couldn\'t autodetect L.Icon.Default.imagePath, set it manually.');
        }
        return path + '/marker-' + name + '.png';
      }
    });
    L.Icon.Default.imagePath = (function() {
      var scripts = document.getElementsByTagName('script'),
          leafletRe = /[\/^]leaflet[\-\._]?([\w\-\._]*)\.js\??/;
      var i,
          len,
          src,
          matches,
          path;
      for (i = 0, len = scripts.length; i < len; i++) {
        src = scripts[i].src;
        matches = src.match(leafletRe);
        if (matches) {
          path = src.split(leafletRe)[0];
          return (path ? path + '/' : '') + 'images';
        }
      }
    }());
    L.Marker = L.Class.extend({
      includes: L.Mixin.Events,
      options: {
        icon: new L.Icon.Default(),
        title: '',
        alt: '',
        clickable: true,
        draggable: false,
        keyboard: true,
        zIndexOffset: 0,
        opacity: 1,
        riseOnHover: false,
        riseOffset: 250
      },
      initialize: function(latlng, options) {
        L.setOptions(this, options);
        this._latlng = L.latLng(latlng);
      },
      onAdd: function(map) {
        this._map = map;
        map.on('viewreset', this.update, this);
        this._initIcon();
        this.update();
        this.fire('add');
        if (map.options.zoomAnimation && map.options.markerZoomAnimation) {
          map.on('zoomanim', this._animateZoom, this);
        }
      },
      addTo: function(map) {
        map.addLayer(this);
        return this;
      },
      onRemove: function(map) {
        if (this.dragging) {
          this.dragging.disable();
        }
        this._removeIcon();
        this._removeShadow();
        this.fire('remove');
        map.off({
          'viewreset': this.update,
          'zoomanim': this._animateZoom
        }, this);
        this._map = null;
      },
      getLatLng: function() {
        return this._latlng;
      },
      setLatLng: function(latlng) {
        this._latlng = L.latLng(latlng);
        this.update();
        return this.fire('move', {latlng: this._latlng});
      },
      setZIndexOffset: function(offset) {
        this.options.zIndexOffset = offset;
        this.update();
        return this;
      },
      setIcon: function(icon) {
        this.options.icon = icon;
        if (this._map) {
          this._initIcon();
          this.update();
        }
        if (this._popup) {
          this.bindPopup(this._popup);
        }
        return this;
      },
      update: function() {
        if (this._icon) {
          this._setPos(this._map.latLngToLayerPoint(this._latlng).round());
        }
        return this;
      },
      _initIcon: function() {
        var options = this.options,
            map = this._map,
            animation = (map.options.zoomAnimation && map.options.markerZoomAnimation),
            classToAdd = animation ? 'leaflet-zoom-animated' : 'leaflet-zoom-hide';
        var icon = options.icon.createIcon(this._icon),
            addIcon = false;
        if (icon !== this._icon) {
          if (this._icon) {
            this._removeIcon();
          }
          addIcon = true;
          if (options.title) {
            icon.title = options.title;
          }
          if (options.alt) {
            icon.alt = options.alt;
          }
        }
        L.DomUtil.addClass(icon, classToAdd);
        if (options.keyboard) {
          icon.tabIndex = '0';
        }
        this._icon = icon;
        this._initInteraction();
        if (options.riseOnHover) {
          L.DomEvent.on(icon, 'mouseover', this._bringToFront, this).on(icon, 'mouseout', this._resetZIndex, this);
        }
        var newShadow = options.icon.createShadow(this._shadow),
            addShadow = false;
        if (newShadow !== this._shadow) {
          this._removeShadow();
          addShadow = true;
        }
        if (newShadow) {
          L.DomUtil.addClass(newShadow, classToAdd);
        }
        this._shadow = newShadow;
        if (options.opacity < 1) {
          this._updateOpacity();
        }
        var panes = this._map._panes;
        if (addIcon) {
          panes.markerPane.appendChild(this._icon);
        }
        if (newShadow && addShadow) {
          panes.shadowPane.appendChild(this._shadow);
        }
      },
      _removeIcon: function() {
        if (this.options.riseOnHover) {
          L.DomEvent.off(this._icon, 'mouseover', this._bringToFront).off(this._icon, 'mouseout', this._resetZIndex);
        }
        this._map._panes.markerPane.removeChild(this._icon);
        this._icon = null;
      },
      _removeShadow: function() {
        if (this._shadow) {
          this._map._panes.shadowPane.removeChild(this._shadow);
        }
        this._shadow = null;
      },
      _setPos: function(pos) {
        L.DomUtil.setPosition(this._icon, pos);
        if (this._shadow) {
          L.DomUtil.setPosition(this._shadow, pos);
        }
        this._zIndex = pos.y + this.options.zIndexOffset;
        this._resetZIndex();
      },
      _updateZIndex: function(offset) {
        this._icon.style.zIndex = this._zIndex + offset;
      },
      _animateZoom: function(opt) {
        var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();
        this._setPos(pos);
      },
      _initInteraction: function() {
        if (!this.options.clickable) {
          return;
        }
        var icon = this._icon,
            events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];
        L.DomUtil.addClass(icon, 'leaflet-clickable');
        L.DomEvent.on(icon, 'click', this._onMouseClick, this);
        L.DomEvent.on(icon, 'keypress', this._onKeyPress, this);
        for (var i = 0; i < events.length; i++) {
          L.DomEvent.on(icon, events[i], this._fireMouseEvent, this);
        }
        if (L.Handler.MarkerDrag) {
          this.dragging = new L.Handler.MarkerDrag(this);
          if (this.options.draggable) {
            this.dragging.enable();
          }
        }
      },
      _onMouseClick: function(e) {
        var wasDragged = this.dragging && this.dragging.moved();
        if (this.hasEventListeners(e.type) || wasDragged) {
          L.DomEvent.stopPropagation(e);
        }
        if (wasDragged) {
          return;
        }
        if ((!this.dragging || !this.dragging._enabled) && this._map.dragging && this._map.dragging.moved()) {
          return;
        }
        this.fire(e.type, {
          originalEvent: e,
          latlng: this._latlng
        });
      },
      _onKeyPress: function(e) {
        if (e.keyCode === 13) {
          this.fire('click', {
            originalEvent: e,
            latlng: this._latlng
          });
        }
      },
      _fireMouseEvent: function(e) {
        this.fire(e.type, {
          originalEvent: e,
          latlng: this._latlng
        });
        if (e.type === 'contextmenu' && this.hasEventListeners(e.type)) {
          L.DomEvent.preventDefault(e);
        }
        if (e.type !== 'mousedown') {
          L.DomEvent.stopPropagation(e);
        } else {
          L.DomEvent.preventDefault(e);
        }
      },
      setOpacity: function(opacity) {
        this.options.opacity = opacity;
        if (this._map) {
          this._updateOpacity();
        }
        return this;
      },
      _updateOpacity: function() {
        L.DomUtil.setOpacity(this._icon, this.options.opacity);
        if (this._shadow) {
          L.DomUtil.setOpacity(this._shadow, this.options.opacity);
        }
      },
      _bringToFront: function() {
        this._updateZIndex(this.options.riseOffset);
      },
      _resetZIndex: function() {
        this._updateZIndex(0);
      }
    });
    L.marker = function(latlng, options) {
      return new L.Marker(latlng, options);
    };
    L.DivIcon = L.Icon.extend({
      options: {
        iconSize: [12, 12],
        className: 'leaflet-div-icon',
        html: false
      },
      createIcon: function(oldIcon) {
        var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
            options = this.options;
        if (options.html !== false) {
          div.innerHTML = options.html;
        } else {
          div.innerHTML = '';
        }
        if (options.bgPos) {
          div.style.backgroundPosition = (-options.bgPos.x) + 'px ' + (-options.bgPos.y) + 'px';
        }
        this._setIconStyles(div, 'icon');
        return div;
      },
      createShadow: function() {
        return null;
      }
    });
    L.divIcon = function(options) {
      return new L.DivIcon(options);
    };
    L.Map.mergeOptions({closePopupOnClick: true});
    L.Popup = L.Class.extend({
      includes: L.Mixin.Events,
      options: {
        minWidth: 50,
        maxWidth: 300,
        autoPan: true,
        closeButton: true,
        offset: [0, 7],
        autoPanPadding: [5, 5],
        keepInView: false,
        className: '',
        zoomAnimation: true
      },
      initialize: function(options, source) {
        L.setOptions(this, options);
        this._source = source;
        this._animated = L.Browser.any3d && this.options.zoomAnimation;
        this._isOpen = false;
      },
      onAdd: function(map) {
        this._map = map;
        if (!this._container) {
          this._initLayout();
        }
        var animFade = map.options.fadeAnimation;
        if (animFade) {
          L.DomUtil.setOpacity(this._container, 0);
        }
        map._panes.popupPane.appendChild(this._container);
        map.on(this._getEvents(), this);
        this.update();
        if (animFade) {
          L.DomUtil.setOpacity(this._container, 1);
        }
        this.fire('open');
        map.fire('popupopen', {popup: this});
        if (this._source) {
          this._source.fire('popupopen', {popup: this});
        }
      },
      addTo: function(map) {
        map.addLayer(this);
        return this;
      },
      openOn: function(map) {
        map.openPopup(this);
        return this;
      },
      onRemove: function(map) {
        map._panes.popupPane.removeChild(this._container);
        L.Util.falseFn(this._container.offsetWidth);
        map.off(this._getEvents(), this);
        if (map.options.fadeAnimation) {
          L.DomUtil.setOpacity(this._container, 0);
        }
        this._map = null;
        this.fire('close');
        map.fire('popupclose', {popup: this});
        if (this._source) {
          this._source.fire('popupclose', {popup: this});
        }
      },
      getLatLng: function() {
        return this._latlng;
      },
      setLatLng: function(latlng) {
        this._latlng = L.latLng(latlng);
        if (this._map) {
          this._updatePosition();
          this._adjustPan();
        }
        return this;
      },
      getContent: function() {
        return this._content;
      },
      setContent: function(content) {
        this._content = content;
        this.update();
        return this;
      },
      update: function() {
        if (!this._map) {
          return;
        }
        this._container.style.visibility = 'hidden';
        this._updateContent();
        this._updateLayout();
        this._updatePosition();
        this._container.style.visibility = '';
        this._adjustPan();
      },
      _getEvents: function() {
        var events = {viewreset: this._updatePosition};
        if (this._animated) {
          events.zoomanim = this._zoomAnimation;
        }
        if ('closeOnClick' in this.options ? this.options.closeOnClick : this._map.options.closePopupOnClick) {
          events.preclick = this._close;
        }
        if (this.options.keepInView) {
          events.moveend = this._adjustPan;
        }
        return events;
      },
      _close: function() {
        if (this._map) {
          this._map.closePopup(this);
        }
      },
      _initLayout: function() {
        var prefix = 'leaflet-popup',
            containerClass = prefix + ' ' + this.options.className + ' leaflet-zoom-' + (this._animated ? 'animated' : 'hide'),
            container = this._container = L.DomUtil.create('div', containerClass),
            closeButton;
        if (this.options.closeButton) {
          closeButton = this._closeButton = L.DomUtil.create('a', prefix + '-close-button', container);
          closeButton.href = '#close';
          closeButton.innerHTML = '&#215;';
          L.DomEvent.disableClickPropagation(closeButton);
          L.DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this);
        }
        var wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
        L.DomEvent.disableClickPropagation(wrapper);
        this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);
        L.DomEvent.disableScrollPropagation(this._contentNode);
        L.DomEvent.on(wrapper, 'contextmenu', L.DomEvent.stopPropagation);
        this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
        this._tip = L.DomUtil.create('div', prefix + '-tip', this._tipContainer);
      },
      _updateContent: function() {
        if (!this._content) {
          return;
        }
        if (typeof this._content === 'string') {
          this._contentNode.innerHTML = this._content;
        } else {
          while (this._contentNode.hasChildNodes()) {
            this._contentNode.removeChild(this._contentNode.firstChild);
          }
          this._contentNode.appendChild(this._content);
        }
        this.fire('contentupdate');
      },
      _updateLayout: function() {
        var container = this._contentNode,
            style = container.style;
        style.width = '';
        style.whiteSpace = 'nowrap';
        var width = container.offsetWidth;
        width = Math.min(width, this.options.maxWidth);
        width = Math.max(width, this.options.minWidth);
        style.width = (width + 1) + 'px';
        style.whiteSpace = '';
        style.height = '';
        var height = container.offsetHeight,
            maxHeight = this.options.maxHeight,
            scrolledClass = 'leaflet-popup-scrolled';
        if (maxHeight && height > maxHeight) {
          style.height = maxHeight + 'px';
          L.DomUtil.addClass(container, scrolledClass);
        } else {
          L.DomUtil.removeClass(container, scrolledClass);
        }
        this._containerWidth = this._container.offsetWidth;
      },
      _updatePosition: function() {
        if (!this._map) {
          return;
        }
        var pos = this._map.latLngToLayerPoint(this._latlng),
            animated = this._animated,
            offset = L.point(this.options.offset);
        if (animated) {
          L.DomUtil.setPosition(this._container, pos);
        }
        this._containerBottom = -offset.y - (animated ? 0 : pos.y);
        this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x + (animated ? 0 : pos.x);
        this._container.style.bottom = this._containerBottom + 'px';
        this._container.style.left = this._containerLeft + 'px';
      },
      _zoomAnimation: function(opt) {
        var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center);
        L.DomUtil.setPosition(this._container, pos);
      },
      _adjustPan: function() {
        if (!this.options.autoPan) {
          return;
        }
        var map = this._map,
            containerHeight = this._container.offsetHeight,
            containerWidth = this._containerWidth,
            layerPos = new L.Point(this._containerLeft, -containerHeight - this._containerBottom);
        if (this._animated) {
          layerPos._add(L.DomUtil.getPosition(this._container));
        }
        var containerPos = map.layerPointToContainerPoint(layerPos),
            padding = L.point(this.options.autoPanPadding),
            paddingTL = L.point(this.options.autoPanPaddingTopLeft || padding),
            paddingBR = L.point(this.options.autoPanPaddingBottomRight || padding),
            size = map.getSize(),
            dx = 0,
            dy = 0;
        if (containerPos.x + containerWidth + paddingBR.x > size.x) {
          dx = containerPos.x + containerWidth - size.x + paddingBR.x;
        }
        if (containerPos.x - dx - paddingTL.x < 0) {
          dx = containerPos.x - paddingTL.x;
        }
        if (containerPos.y + containerHeight + paddingBR.y > size.y) {
          dy = containerPos.y + containerHeight - size.y + paddingBR.y;
        }
        if (containerPos.y - dy - paddingTL.y < 0) {
          dy = containerPos.y - paddingTL.y;
        }
        if (dx || dy) {
          map.fire('autopanstart').panBy([dx, dy]);
        }
      },
      _onCloseButtonClick: function(e) {
        this._close();
        L.DomEvent.stop(e);
      }
    });
    L.popup = function(options, source) {
      return new L.Popup(options, source);
    };
    L.Map.include({
      openPopup: function(popup, latlng, options) {
        this.closePopup();
        if (!(popup instanceof L.Popup)) {
          var content = popup;
          popup = new L.Popup(options).setLatLng(latlng).setContent(content);
        }
        popup._isOpen = true;
        this._popup = popup;
        return this.addLayer(popup);
      },
      closePopup: function(popup) {
        if (!popup || popup === this._popup) {
          popup = this._popup;
          this._popup = null;
        }
        if (popup) {
          this.removeLayer(popup);
          popup._isOpen = false;
        }
        return this;
      }
    });
    L.Marker.include({
      openPopup: function() {
        if (this._popup && this._map && !this._map.hasLayer(this._popup)) {
          this._popup.setLatLng(this._latlng);
          this._map.openPopup(this._popup);
        }
        return this;
      },
      closePopup: function() {
        if (this._popup) {
          this._popup._close();
        }
        return this;
      },
      togglePopup: function() {
        if (this._popup) {
          if (this._popup._isOpen) {
            this.closePopup();
          } else {
            this.openPopup();
          }
        }
        return this;
      },
      bindPopup: function(content, options) {
        var anchor = L.point(this.options.icon.options.popupAnchor || [0, 0]);
        anchor = anchor.add(L.Popup.prototype.options.offset);
        if (options && options.offset) {
          anchor = anchor.add(options.offset);
        }
        options = L.extend({offset: anchor}, options);
        if (!this._popupHandlersAdded) {
          this.on('click', this.togglePopup, this).on('remove', this.closePopup, this).on('move', this._movePopup, this);
          this._popupHandlersAdded = true;
        }
        if (content instanceof L.Popup) {
          L.setOptions(content, options);
          this._popup = content;
          content._source = this;
        } else {
          this._popup = new L.Popup(options, this).setContent(content);
        }
        return this;
      },
      setPopupContent: function(content) {
        if (this._popup) {
          this._popup.setContent(content);
        }
        return this;
      },
      unbindPopup: function() {
        if (this._popup) {
          this._popup = null;
          this.off('click', this.togglePopup, this).off('remove', this.closePopup, this).off('move', this._movePopup, this);
          this._popupHandlersAdded = false;
        }
        return this;
      },
      getPopup: function() {
        return this._popup;
      },
      _movePopup: function(e) {
        this._popup.setLatLng(e.latlng);
      }
    });
    L.LayerGroup = L.Class.extend({
      initialize: function(layers) {
        this._layers = {};
        var i,
            len;
        if (layers) {
          for (i = 0, len = layers.length; i < len; i++) {
            this.addLayer(layers[i]);
          }
        }
      },
      addLayer: function(layer) {
        var id = this.getLayerId(layer);
        this._layers[id] = layer;
        if (this._map) {
          this._map.addLayer(layer);
        }
        return this;
      },
      removeLayer: function(layer) {
        var id = layer in this._layers ? layer : this.getLayerId(layer);
        if (this._map && this._layers[id]) {
          this._map.removeLayer(this._layers[id]);
        }
        delete this._layers[id];
        return this;
      },
      hasLayer: function(layer) {
        if (!layer) {
          return false;
        }
        return (layer in this._layers || this.getLayerId(layer) in this._layers);
      },
      clearLayers: function() {
        this.eachLayer(this.removeLayer, this);
        return this;
      },
      invoke: function(methodName) {
        var args = Array.prototype.slice.call(arguments, 1),
            i,
            layer;
        for (i in this._layers) {
          layer = this._layers[i];
          if (layer[methodName]) {
            layer[methodName].apply(layer, args);
          }
        }
        return this;
      },
      onAdd: function(map) {
        this._map = map;
        this.eachLayer(map.addLayer, map);
      },
      onRemove: function(map) {
        this.eachLayer(map.removeLayer, map);
        this._map = null;
      },
      addTo: function(map) {
        map.addLayer(this);
        return this;
      },
      eachLayer: function(method, context) {
        for (var i in this._layers) {
          method.call(context, this._layers[i]);
        }
        return this;
      },
      getLayer: function(id) {
        return this._layers[id];
      },
      getLayers: function() {
        var layers = [];
        for (var i in this._layers) {
          layers.push(this._layers[i]);
        }
        return layers;
      },
      setZIndex: function(zIndex) {
        return this.invoke('setZIndex', zIndex);
      },
      getLayerId: function(layer) {
        return L.stamp(layer);
      }
    });
    L.layerGroup = function(layers) {
      return new L.LayerGroup(layers);
    };
    L.FeatureGroup = L.LayerGroup.extend({
      includes: L.Mixin.Events,
      statics: {EVENTS: 'click dblclick mouseover mouseout mousemove contextmenu popupopen popupclose'},
      addLayer: function(layer) {
        if (this.hasLayer(layer)) {
          return this;
        }
        if ('on' in layer) {
          layer.on(L.FeatureGroup.EVENTS, this._propagateEvent, this);
        }
        L.LayerGroup.prototype.addLayer.call(this, layer);
        if (this._popupContent && layer.bindPopup) {
          layer.bindPopup(this._popupContent, this._popupOptions);
        }
        return this.fire('layeradd', {layer: layer});
      },
      removeLayer: function(layer) {
        if (!this.hasLayer(layer)) {
          return this;
        }
        if (layer in this._layers) {
          layer = this._layers[layer];
        }
        if ('off' in layer) {
          layer.off(L.FeatureGroup.EVENTS, this._propagateEvent, this);
        }
        L.LayerGroup.prototype.removeLayer.call(this, layer);
        if (this._popupContent) {
          this.invoke('unbindPopup');
        }
        return this.fire('layerremove', {layer: layer});
      },
      bindPopup: function(content, options) {
        this._popupContent = content;
        this._popupOptions = options;
        return this.invoke('bindPopup', content, options);
      },
      openPopup: function(latlng) {
        for (var id in this._layers) {
          this._layers[id].openPopup(latlng);
          break;
        }
        return this;
      },
      setStyle: function(style) {
        return this.invoke('setStyle', style);
      },
      bringToFront: function() {
        return this.invoke('bringToFront');
      },
      bringToBack: function() {
        return this.invoke('bringToBack');
      },
      getBounds: function() {
        var bounds = new L.LatLngBounds();
        this.eachLayer(function(layer) {
          bounds.extend(layer instanceof L.Marker ? layer.getLatLng() : layer.getBounds());
        });
        return bounds;
      },
      _propagateEvent: function(e) {
        e = L.extend({
          layer: e.target,
          target: this
        }, e);
        this.fire(e.type, e);
      }
    });
    L.featureGroup = function(layers) {
      return new L.FeatureGroup(layers);
    };
    L.Path = L.Class.extend({
      includes: [L.Mixin.Events],
      statics: {CLIP_PADDING: (function() {
          var max = L.Browser.mobile ? 1280 : 2000,
              target = (max / Math.max(window.outerWidth, window.outerHeight) - 1) / 2;
          return Math.max(0, Math.min(0.5, target));
        })()},
      options: {
        stroke: true,
        color: '#0033ff',
        dashArray: null,
        lineCap: null,
        lineJoin: null,
        weight: 5,
        opacity: 0.5,
        fill: false,
        fillColor: null,
        fillOpacity: 0.2,
        clickable: true
      },
      initialize: function(options) {
        L.setOptions(this, options);
      },
      onAdd: function(map) {
        this._map = map;
        if (!this._container) {
          this._initElements();
          this._initEvents();
        }
        this.projectLatlngs();
        this._updatePath();
        if (this._container) {
          this._map._pathRoot.appendChild(this._container);
        }
        this.fire('add');
        map.on({
          'viewreset': this.projectLatlngs,
          'moveend': this._updatePath
        }, this);
      },
      addTo: function(map) {
        map.addLayer(this);
        return this;
      },
      onRemove: function(map) {
        map._pathRoot.removeChild(this._container);
        this.fire('remove');
        this._map = null;
        if (L.Browser.vml) {
          this._container = null;
          this._stroke = null;
          this._fill = null;
        }
        map.off({
          'viewreset': this.projectLatlngs,
          'moveend': this._updatePath
        }, this);
      },
      projectLatlngs: function() {},
      setStyle: function(style) {
        L.setOptions(this, style);
        if (this._container) {
          this._updateStyle();
        }
        return this;
      },
      redraw: function() {
        if (this._map) {
          this.projectLatlngs();
          this._updatePath();
        }
        return this;
      }
    });
    L.Map.include({_updatePathViewport: function() {
        var p = L.Path.CLIP_PADDING,
            size = this.getSize(),
            panePos = L.DomUtil.getPosition(this._mapPane),
            min = panePos.multiplyBy(-1)._subtract(size.multiplyBy(p)._round()),
            max = min.add(size.multiplyBy(1 + p * 2)._round());
        this._pathViewport = new L.Bounds(min, max);
      }});
    L.Path.SVG_NS = 'http://www.w3.org/2000/svg';
    L.Browser.svg = !!(document.createElementNS && document.createElementNS(L.Path.SVG_NS, 'svg').createSVGRect);
    L.Path = L.Path.extend({
      statics: {SVG: L.Browser.svg},
      bringToFront: function() {
        var root = this._map._pathRoot,
            path = this._container;
        if (path && root.lastChild !== path) {
          root.appendChild(path);
        }
        return this;
      },
      bringToBack: function() {
        var root = this._map._pathRoot,
            path = this._container,
            first = root.firstChild;
        if (path && first !== path) {
          root.insertBefore(path, first);
        }
        return this;
      },
      getPathString: function() {},
      _createElement: function(name) {
        return document.createElementNS(L.Path.SVG_NS, name);
      },
      _initElements: function() {
        this._map._initPathRoot();
        this._initPath();
        this._initStyle();
      },
      _initPath: function() {
        this._container = this._createElement('g');
        this._path = this._createElement('path');
        if (this.options.className) {
          L.DomUtil.addClass(this._path, this.options.className);
        }
        this._container.appendChild(this._path);
      },
      _initStyle: function() {
        if (this.options.stroke) {
          this._path.setAttribute('stroke-linejoin', 'round');
          this._path.setAttribute('stroke-linecap', 'round');
        }
        if (this.options.fill) {
          this._path.setAttribute('fill-rule', 'evenodd');
        }
        if (this.options.pointerEvents) {
          this._path.setAttribute('pointer-events', this.options.pointerEvents);
        }
        if (!this.options.clickable && !this.options.pointerEvents) {
          this._path.setAttribute('pointer-events', 'none');
        }
        this._updateStyle();
      },
      _updateStyle: function() {
        if (this.options.stroke) {
          this._path.setAttribute('stroke', this.options.color);
          this._path.setAttribute('stroke-opacity', this.options.opacity);
          this._path.setAttribute('stroke-width', this.options.weight);
          if (this.options.dashArray) {
            this._path.setAttribute('stroke-dasharray', this.options.dashArray);
          } else {
            this._path.removeAttribute('stroke-dasharray');
          }
          if (this.options.lineCap) {
            this._path.setAttribute('stroke-linecap', this.options.lineCap);
          }
          if (this.options.lineJoin) {
            this._path.setAttribute('stroke-linejoin', this.options.lineJoin);
          }
        } else {
          this._path.setAttribute('stroke', 'none');
        }
        if (this.options.fill) {
          this._path.setAttribute('fill', this.options.fillColor || this.options.color);
          this._path.setAttribute('fill-opacity', this.options.fillOpacity);
        } else {
          this._path.setAttribute('fill', 'none');
        }
      },
      _updatePath: function() {
        var str = this.getPathString();
        if (!str) {
          str = 'M0 0';
        }
        this._path.setAttribute('d', str);
      },
      _initEvents: function() {
        if (this.options.clickable) {
          if (L.Browser.svg || !L.Browser.vml) {
            L.DomUtil.addClass(this._path, 'leaflet-clickable');
          }
          L.DomEvent.on(this._container, 'click', this._onMouseClick, this);
          var events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'mousemove', 'contextmenu'];
          for (var i = 0; i < events.length; i++) {
            L.DomEvent.on(this._container, events[i], this._fireMouseEvent, this);
          }
        }
      },
      _onMouseClick: function(e) {
        if (this._map.dragging && this._map.dragging.moved()) {
          return;
        }
        this._fireMouseEvent(e);
      },
      _fireMouseEvent: function(e) {
        if (!this._map || !this.hasEventListeners(e.type)) {
          return;
        }
        var map = this._map,
            containerPoint = map.mouseEventToContainerPoint(e),
            layerPoint = map.containerPointToLayerPoint(containerPoint),
            latlng = map.layerPointToLatLng(layerPoint);
        this.fire(e.type, {
          latlng: latlng,
          layerPoint: layerPoint,
          containerPoint: containerPoint,
          originalEvent: e
        });
        if (e.type === 'contextmenu') {
          L.DomEvent.preventDefault(e);
        }
        if (e.type !== 'mousemove') {
          L.DomEvent.stopPropagation(e);
        }
      }
    });
    L.Map.include({
      _initPathRoot: function() {
        if (!this._pathRoot) {
          this._pathRoot = L.Path.prototype._createElement('svg');
          this._panes.overlayPane.appendChild(this._pathRoot);
          if (this.options.zoomAnimation && L.Browser.any3d) {
            L.DomUtil.addClass(this._pathRoot, 'leaflet-zoom-animated');
            this.on({
              'zoomanim': this._animatePathZoom,
              'zoomend': this._endPathZoom
            });
          } else {
            L.DomUtil.addClass(this._pathRoot, 'leaflet-zoom-hide');
          }
          this.on('moveend', this._updateSvgViewport);
          this._updateSvgViewport();
        }
      },
      _animatePathZoom: function(e) {
        var scale = this.getZoomScale(e.zoom),
            offset = this._getCenterOffset(e.center)._multiplyBy(-scale)._add(this._pathViewport.min);
        this._pathRoot.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ') ';
        this._pathZooming = true;
      },
      _endPathZoom: function() {
        this._pathZooming = false;
      },
      _updateSvgViewport: function() {
        if (this._pathZooming) {
          return;
        }
        this._updatePathViewport();
        var vp = this._pathViewport,
            min = vp.min,
            max = vp.max,
            width = max.x - min.x,
            height = max.y - min.y,
            root = this._pathRoot,
            pane = this._panes.overlayPane;
        if (L.Browser.mobileWebkit) {
          pane.removeChild(root);
        }
        L.DomUtil.setPosition(root, min);
        root.setAttribute('width', width);
        root.setAttribute('height', height);
        root.setAttribute('viewBox', [min.x, min.y, width, height].join(' '));
        if (L.Browser.mobileWebkit) {
          pane.appendChild(root);
        }
      }
    });
    L.Path.include({
      bindPopup: function(content, options) {
        if (content instanceof L.Popup) {
          this._popup = content;
        } else {
          if (!this._popup || options) {
            this._popup = new L.Popup(options, this);
          }
          this._popup.setContent(content);
        }
        if (!this._popupHandlersAdded) {
          this.on('click', this._openPopup, this).on('remove', this.closePopup, this);
          this._popupHandlersAdded = true;
        }
        return this;
      },
      unbindPopup: function() {
        if (this._popup) {
          this._popup = null;
          this.off('click', this._openPopup).off('remove', this.closePopup);
          this._popupHandlersAdded = false;
        }
        return this;
      },
      openPopup: function(latlng) {
        if (this._popup) {
          latlng = latlng || this._latlng || this._latlngs[Math.floor(this._latlngs.length / 2)];
          this._openPopup({latlng: latlng});
        }
        return this;
      },
      closePopup: function() {
        if (this._popup) {
          this._popup._close();
        }
        return this;
      },
      _openPopup: function(e) {
        this._popup.setLatLng(e.latlng);
        this._map.openPopup(this._popup);
      }
    });
    L.Browser.vml = !L.Browser.svg && (function() {
      try {
        var div = document.createElement('div');
        div.innerHTML = '<v:shape adj="1"/>';
        var shape = div.firstChild;
        shape.style.behavior = 'url(#default#VML)';
        return shape && (typeof shape.adj === 'object');
      } catch (e) {
        return false;
      }
    }());
    L.Path = L.Browser.svg || !L.Browser.vml ? L.Path : L.Path.extend({
      statics: {
        VML: true,
        CLIP_PADDING: 0.02
      },
      _createElement: (function() {
        try {
          document.namespaces.add('lvml', 'urn:schemas-microsoft-com:vml');
          return function(name) {
            return document.createElement('<lvml:' + name + ' class="lvml">');
          };
        } catch (e) {
          return function(name) {
            return document.createElement('<' + name + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">');
          };
        }
      }()),
      _initPath: function() {
        var container = this._container = this._createElement('shape');
        L.DomUtil.addClass(container, 'leaflet-vml-shape' + (this.options.className ? ' ' + this.options.className : ''));
        if (this.options.clickable) {
          L.DomUtil.addClass(container, 'leaflet-clickable');
        }
        container.coordsize = '1 1';
        this._path = this._createElement('path');
        container.appendChild(this._path);
        this._map._pathRoot.appendChild(container);
      },
      _initStyle: function() {
        this._updateStyle();
      },
      _updateStyle: function() {
        var stroke = this._stroke,
            fill = this._fill,
            options = this.options,
            container = this._container;
        container.stroked = options.stroke;
        container.filled = options.fill;
        if (options.stroke) {
          if (!stroke) {
            stroke = this._stroke = this._createElement('stroke');
            stroke.endcap = 'round';
            container.appendChild(stroke);
          }
          stroke.weight = options.weight + 'px';
          stroke.color = options.color;
          stroke.opacity = options.opacity;
          if (options.dashArray) {
            stroke.dashStyle = L.Util.isArray(options.dashArray) ? options.dashArray.join(' ') : options.dashArray.replace(/( *, *)/g, ' ');
          } else {
            stroke.dashStyle = '';
          }
          if (options.lineCap) {
            stroke.endcap = options.lineCap.replace('butt', 'flat');
          }
          if (options.lineJoin) {
            stroke.joinstyle = options.lineJoin;
          }
        } else if (stroke) {
          container.removeChild(stroke);
          this._stroke = null;
        }
        if (options.fill) {
          if (!fill) {
            fill = this._fill = this._createElement('fill');
            container.appendChild(fill);
          }
          fill.color = options.fillColor || options.color;
          fill.opacity = options.fillOpacity;
        } else if (fill) {
          container.removeChild(fill);
          this._fill = null;
        }
      },
      _updatePath: function() {
        var style = this._container.style;
        style.display = 'none';
        this._path.v = this.getPathString() + ' ';
        style.display = '';
      }
    });
    L.Map.include(L.Browser.svg || !L.Browser.vml ? {} : {_initPathRoot: function() {
        if (this._pathRoot) {
          return;
        }
        var root = this._pathRoot = document.createElement('div');
        root.className = 'leaflet-vml-container';
        this._panes.overlayPane.appendChild(root);
        this.on('moveend', this._updatePathViewport);
        this._updatePathViewport();
      }});
    L.Browser.canvas = (function() {
      return !!document.createElement('canvas').getContext;
    }());
    L.Path = (L.Path.SVG && !window.L_PREFER_CANVAS) || !L.Browser.canvas ? L.Path : L.Path.extend({
      statics: {
        CANVAS: true,
        SVG: false
      },
      redraw: function() {
        if (this._map) {
          this.projectLatlngs();
          this._requestUpdate();
        }
        return this;
      },
      setStyle: function(style) {
        L.setOptions(this, style);
        if (this._map) {
          this._updateStyle();
          this._requestUpdate();
        }
        return this;
      },
      onRemove: function(map) {
        map.off('viewreset', this.projectLatlngs, this).off('moveend', this._updatePath, this);
        if (this.options.clickable) {
          this._map.off('click', this._onClick, this);
          this._map.off('mousemove', this._onMouseMove, this);
        }
        this._requestUpdate();
        this.fire('remove');
        this._map = null;
      },
      _requestUpdate: function() {
        if (this._map && !L.Path._updateRequest) {
          L.Path._updateRequest = L.Util.requestAnimFrame(this._fireMapMoveEnd, this._map);
        }
      },
      _fireMapMoveEnd: function() {
        L.Path._updateRequest = null;
        this.fire('moveend');
      },
      _initElements: function() {
        this._map._initPathRoot();
        this._ctx = this._map._canvasCtx;
      },
      _updateStyle: function() {
        var options = this.options;
        if (options.stroke) {
          this._ctx.lineWidth = options.weight;
          this._ctx.strokeStyle = options.color;
        }
        if (options.fill) {
          this._ctx.fillStyle = options.fillColor || options.color;
        }
        if (options.lineCap) {
          this._ctx.lineCap = options.lineCap;
        }
        if (options.lineJoin) {
          this._ctx.lineJoin = options.lineJoin;
        }
      },
      _drawPath: function() {
        var i,
            j,
            len,
            len2,
            point,
            drawMethod;
        this._ctx.beginPath();
        for (i = 0, len = this._parts.length; i < len; i++) {
          for (j = 0, len2 = this._parts[i].length; j < len2; j++) {
            point = this._parts[i][j];
            drawMethod = (j === 0 ? 'move' : 'line') + 'To';
            this._ctx[drawMethod](point.x, point.y);
          }
          if (this instanceof L.Polygon) {
            this._ctx.closePath();
          }
        }
      },
      _checkIfEmpty: function() {
        return !this._parts.length;
      },
      _updatePath: function() {
        if (this._checkIfEmpty()) {
          return;
        }
        var ctx = this._ctx,
            options = this.options;
        this._drawPath();
        ctx.save();
        this._updateStyle();
        if (options.fill) {
          ctx.globalAlpha = options.fillOpacity;
          ctx.fill(options.fillRule || 'evenodd');
        }
        if (options.stroke) {
          ctx.globalAlpha = options.opacity;
          ctx.stroke();
        }
        ctx.restore();
      },
      _initEvents: function() {
        if (this.options.clickable) {
          this._map.on('mousemove', this._onMouseMove, this);
          this._map.on('click dblclick contextmenu', this._fireMouseEvent, this);
        }
      },
      _fireMouseEvent: function(e) {
        if (this._containsPoint(e.layerPoint)) {
          this.fire(e.type, e);
        }
      },
      _onMouseMove: function(e) {
        if (!this._map || this._map._animatingZoom) {
          return;
        }
        if (this._containsPoint(e.layerPoint)) {
          this._ctx.canvas.style.cursor = 'pointer';
          this._mouseInside = true;
          this.fire('mouseover', e);
        } else if (this._mouseInside) {
          this._ctx.canvas.style.cursor = '';
          this._mouseInside = false;
          this.fire('mouseout', e);
        }
      }
    });
    L.Map.include((L.Path.SVG && !window.L_PREFER_CANVAS) || !L.Browser.canvas ? {} : {
      _initPathRoot: function() {
        var root = this._pathRoot,
            ctx;
        if (!root) {
          root = this._pathRoot = document.createElement('canvas');
          root.style.position = 'absolute';
          ctx = this._canvasCtx = root.getContext('2d');
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          this._panes.overlayPane.appendChild(root);
          if (this.options.zoomAnimation) {
            this._pathRoot.className = 'leaflet-zoom-animated';
            this.on('zoomanim', this._animatePathZoom);
            this.on('zoomend', this._endPathZoom);
          }
          this.on('moveend', this._updateCanvasViewport);
          this._updateCanvasViewport();
        }
      },
      _updateCanvasViewport: function() {
        if (this._pathZooming) {
          return;
        }
        this._updatePathViewport();
        var vp = this._pathViewport,
            min = vp.min,
            size = vp.max.subtract(min),
            root = this._pathRoot;
        L.DomUtil.setPosition(root, min);
        root.width = size.x;
        root.height = size.y;
        root.getContext('2d').translate(-min.x, -min.y);
      }
    });
    L.LineUtil = {
      simplify: function(points, tolerance) {
        if (!tolerance || !points.length) {
          return points.slice();
        }
        var sqTolerance = tolerance * tolerance;
        points = this._reducePoints(points, sqTolerance);
        points = this._simplifyDP(points, sqTolerance);
        return points;
      },
      pointToSegmentDistance: function(p, p1, p2) {
        return Math.sqrt(this._sqClosestPointOnSegment(p, p1, p2, true));
      },
      closestPointOnSegment: function(p, p1, p2) {
        return this._sqClosestPointOnSegment(p, p1, p2);
      },
      _simplifyDP: function(points, sqTolerance) {
        var len = points.length,
            ArrayConstructor = typeof Uint8Array !== undefined + '' ? Uint8Array : Array,
            markers = new ArrayConstructor(len);
        markers[0] = markers[len - 1] = 1;
        this._simplifyDPStep(points, markers, sqTolerance, 0, len - 1);
        var i,
            newPoints = [];
        for (i = 0; i < len; i++) {
          if (markers[i]) {
            newPoints.push(points[i]);
          }
        }
        return newPoints;
      },
      _simplifyDPStep: function(points, markers, sqTolerance, first, last) {
        var maxSqDist = 0,
            index,
            i,
            sqDist;
        for (i = first + 1; i <= last - 1; i++) {
          sqDist = this._sqClosestPointOnSegment(points[i], points[first], points[last], true);
          if (sqDist > maxSqDist) {
            index = i;
            maxSqDist = sqDist;
          }
        }
        if (maxSqDist > sqTolerance) {
          markers[index] = 1;
          this._simplifyDPStep(points, markers, sqTolerance, first, index);
          this._simplifyDPStep(points, markers, sqTolerance, index, last);
        }
      },
      _reducePoints: function(points, sqTolerance) {
        var reducedPoints = [points[0]];
        for (var i = 1,
            prev = 0,
            len = points.length; i < len; i++) {
          if (this._sqDist(points[i], points[prev]) > sqTolerance) {
            reducedPoints.push(points[i]);
            prev = i;
          }
        }
        if (prev < len - 1) {
          reducedPoints.push(points[len - 1]);
        }
        return reducedPoints;
      },
      clipSegment: function(a, b, bounds, useLastCode) {
        var codeA = useLastCode ? this._lastCode : this._getBitCode(a, bounds),
            codeB = this._getBitCode(b, bounds),
            codeOut,
            p,
            newCode;
        this._lastCode = codeB;
        while (true) {
          if (!(codeA | codeB)) {
            return [a, b];
          } else if (codeA & codeB) {
            return false;
          } else {
            codeOut = codeA || codeB;
            p = this._getEdgeIntersection(a, b, codeOut, bounds);
            newCode = this._getBitCode(p, bounds);
            if (codeOut === codeA) {
              a = p;
              codeA = newCode;
            } else {
              b = p;
              codeB = newCode;
            }
          }
        }
      },
      _getEdgeIntersection: function(a, b, code, bounds) {
        var dx = b.x - a.x,
            dy = b.y - a.y,
            min = bounds.min,
            max = bounds.max;
        if (code & 8) {
          return new L.Point(a.x + dx * (max.y - a.y) / dy, max.y);
        } else if (code & 4) {
          return new L.Point(a.x + dx * (min.y - a.y) / dy, min.y);
        } else if (code & 2) {
          return new L.Point(max.x, a.y + dy * (max.x - a.x) / dx);
        } else if (code & 1) {
          return new L.Point(min.x, a.y + dy * (min.x - a.x) / dx);
        }
      },
      _getBitCode: function(p, bounds) {
        var code = 0;
        if (p.x < bounds.min.x) {
          code |= 1;
        } else if (p.x > bounds.max.x) {
          code |= 2;
        }
        if (p.y < bounds.min.y) {
          code |= 4;
        } else if (p.y > bounds.max.y) {
          code |= 8;
        }
        return code;
      },
      _sqDist: function(p1, p2) {
        var dx = p2.x - p1.x,
            dy = p2.y - p1.y;
        return dx * dx + dy * dy;
      },
      _sqClosestPointOnSegment: function(p, p1, p2, sqDist) {
        var x = p1.x,
            y = p1.y,
            dx = p2.x - x,
            dy = p2.y - y,
            dot = dx * dx + dy * dy,
            t;
        if (dot > 0) {
          t = ((p.x - x) * dx + (p.y - y) * dy) / dot;
          if (t > 1) {
            x = p2.x;
            y = p2.y;
          } else if (t > 0) {
            x += dx * t;
            y += dy * t;
          }
        }
        dx = p.x - x;
        dy = p.y - y;
        return sqDist ? dx * dx + dy * dy : new L.Point(x, y);
      }
    };
    L.Polyline = L.Path.extend({
      initialize: function(latlngs, options) {
        L.Path.prototype.initialize.call(this, options);
        this._latlngs = this._convertLatLngs(latlngs);
      },
      options: {
        smoothFactor: 1.0,
        noClip: false
      },
      projectLatlngs: function() {
        this._originalPoints = [];
        for (var i = 0,
            len = this._latlngs.length; i < len; i++) {
          this._originalPoints[i] = this._map.latLngToLayerPoint(this._latlngs[i]);
        }
      },
      getPathString: function() {
        for (var i = 0,
            len = this._parts.length,
            str = ''; i < len; i++) {
          str += this._getPathPartStr(this._parts[i]);
        }
        return str;
      },
      getLatLngs: function() {
        return this._latlngs;
      },
      setLatLngs: function(latlngs) {
        this._latlngs = this._convertLatLngs(latlngs);
        return this.redraw();
      },
      addLatLng: function(latlng) {
        this._latlngs.push(L.latLng(latlng));
        return this.redraw();
      },
      spliceLatLngs: function() {
        var removed = [].splice.apply(this._latlngs, arguments);
        this._convertLatLngs(this._latlngs, true);
        this.redraw();
        return removed;
      },
      closestLayerPoint: function(p) {
        var minDistance = Infinity,
            parts = this._parts,
            p1,
            p2,
            minPoint = null;
        for (var j = 0,
            jLen = parts.length; j < jLen; j++) {
          var points = parts[j];
          for (var i = 1,
              len = points.length; i < len; i++) {
            p1 = points[i - 1];
            p2 = points[i];
            var sqDist = L.LineUtil._sqClosestPointOnSegment(p, p1, p2, true);
            if (sqDist < minDistance) {
              minDistance = sqDist;
              minPoint = L.LineUtil._sqClosestPointOnSegment(p, p1, p2);
            }
          }
        }
        if (minPoint) {
          minPoint.distance = Math.sqrt(minDistance);
        }
        return minPoint;
      },
      getBounds: function() {
        return new L.LatLngBounds(this.getLatLngs());
      },
      _convertLatLngs: function(latlngs, overwrite) {
        var i,
            len,
            target = overwrite ? latlngs : [];
        for (i = 0, len = latlngs.length; i < len; i++) {
          if (L.Util.isArray(latlngs[i]) && typeof latlngs[i][0] !== 'number') {
            return;
          }
          target[i] = L.latLng(latlngs[i]);
        }
        return target;
      },
      _initEvents: function() {
        L.Path.prototype._initEvents.call(this);
      },
      _getPathPartStr: function(points) {
        var round = L.Path.VML;
        for (var j = 0,
            len2 = points.length,
            str = '',
            p; j < len2; j++) {
          p = points[j];
          if (round) {
            p._round();
          }
          str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
        }
        return str;
      },
      _clipPoints: function() {
        var points = this._originalPoints,
            len = points.length,
            i,
            k,
            segment;
        if (this.options.noClip) {
          this._parts = [points];
          return;
        }
        this._parts = [];
        var parts = this._parts,
            vp = this._map._pathViewport,
            lu = L.LineUtil;
        for (i = 0, k = 0; i < len - 1; i++) {
          segment = lu.clipSegment(points[i], points[i + 1], vp, i);
          if (!segment) {
            continue;
          }
          parts[k] = parts[k] || [];
          parts[k].push(segment[0]);
          if ((segment[1] !== points[i + 1]) || (i === len - 2)) {
            parts[k].push(segment[1]);
            k++;
          }
        }
      },
      _simplifyPoints: function() {
        var parts = this._parts,
            lu = L.LineUtil;
        for (var i = 0,
            len = parts.length; i < len; i++) {
          parts[i] = lu.simplify(parts[i], this.options.smoothFactor);
        }
      },
      _updatePath: function() {
        if (!this._map) {
          return;
        }
        this._clipPoints();
        this._simplifyPoints();
        L.Path.prototype._updatePath.call(this);
      }
    });
    L.polyline = function(latlngs, options) {
      return new L.Polyline(latlngs, options);
    };
    L.PolyUtil = {};
    L.PolyUtil.clipPolygon = function(points, bounds) {
      var clippedPoints,
          edges = [1, 4, 2, 8],
          i,
          j,
          k,
          a,
          b,
          len,
          edge,
          p,
          lu = L.LineUtil;
      for (i = 0, len = points.length; i < len; i++) {
        points[i]._code = lu._getBitCode(points[i], bounds);
      }
      for (k = 0; k < 4; k++) {
        edge = edges[k];
        clippedPoints = [];
        for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
          a = points[i];
          b = points[j];
          if (!(a._code & edge)) {
            if (b._code & edge) {
              p = lu._getEdgeIntersection(b, a, edge, bounds);
              p._code = lu._getBitCode(p, bounds);
              clippedPoints.push(p);
            }
            clippedPoints.push(a);
          } else if (!(b._code & edge)) {
            p = lu._getEdgeIntersection(b, a, edge, bounds);
            p._code = lu._getBitCode(p, bounds);
            clippedPoints.push(p);
          }
        }
        points = clippedPoints;
      }
      return points;
    };
    L.Polygon = L.Polyline.extend({
      options: {fill: true},
      initialize: function(latlngs, options) {
        L.Polyline.prototype.initialize.call(this, latlngs, options);
        this._initWithHoles(latlngs);
      },
      _initWithHoles: function(latlngs) {
        var i,
            len,
            hole;
        if (latlngs && L.Util.isArray(latlngs[0]) && (typeof latlngs[0][0] !== 'number')) {
          this._latlngs = this._convertLatLngs(latlngs[0]);
          this._holes = latlngs.slice(1);
          for (i = 0, len = this._holes.length; i < len; i++) {
            hole = this._holes[i] = this._convertLatLngs(this._holes[i]);
            if (hole[0].equals(hole[hole.length - 1])) {
              hole.pop();
            }
          }
        }
        latlngs = this._latlngs;
        if (latlngs.length >= 2 && latlngs[0].equals(latlngs[latlngs.length - 1])) {
          latlngs.pop();
        }
      },
      projectLatlngs: function() {
        L.Polyline.prototype.projectLatlngs.call(this);
        this._holePoints = [];
        if (!this._holes) {
          return;
        }
        var i,
            j,
            len,
            len2;
        for (i = 0, len = this._holes.length; i < len; i++) {
          this._holePoints[i] = [];
          for (j = 0, len2 = this._holes[i].length; j < len2; j++) {
            this._holePoints[i][j] = this._map.latLngToLayerPoint(this._holes[i][j]);
          }
        }
      },
      setLatLngs: function(latlngs) {
        if (latlngs && L.Util.isArray(latlngs[0]) && (typeof latlngs[0][0] !== 'number')) {
          this._initWithHoles(latlngs);
          return this.redraw();
        } else {
          return L.Polyline.prototype.setLatLngs.call(this, latlngs);
        }
      },
      _clipPoints: function() {
        var points = this._originalPoints,
            newParts = [];
        this._parts = [points].concat(this._holePoints);
        if (this.options.noClip) {
          return;
        }
        for (var i = 0,
            len = this._parts.length; i < len; i++) {
          var clipped = L.PolyUtil.clipPolygon(this._parts[i], this._map._pathViewport);
          if (clipped.length) {
            newParts.push(clipped);
          }
        }
        this._parts = newParts;
      },
      _getPathPartStr: function(points) {
        var str = L.Polyline.prototype._getPathPartStr.call(this, points);
        return str + (L.Browser.svg ? 'z' : 'x');
      }
    });
    L.polygon = function(latlngs, options) {
      return new L.Polygon(latlngs, options);
    };
    (function() {
      function createMulti(Klass) {
        return L.FeatureGroup.extend({
          initialize: function(latlngs, options) {
            this._layers = {};
            this._options = options;
            this.setLatLngs(latlngs);
          },
          setLatLngs: function(latlngs) {
            var i = 0,
                len = latlngs.length;
            this.eachLayer(function(layer) {
              if (i < len) {
                layer.setLatLngs(latlngs[i++]);
              } else {
                this.removeLayer(layer);
              }
            }, this);
            while (i < len) {
              this.addLayer(new Klass(latlngs[i++], this._options));
            }
            return this;
          },
          getLatLngs: function() {
            var latlngs = [];
            this.eachLayer(function(layer) {
              latlngs.push(layer.getLatLngs());
            });
            return latlngs;
          }
        });
      }
      L.MultiPolyline = createMulti(L.Polyline);
      L.MultiPolygon = createMulti(L.Polygon);
      L.multiPolyline = function(latlngs, options) {
        return new L.MultiPolyline(latlngs, options);
      };
      L.multiPolygon = function(latlngs, options) {
        return new L.MultiPolygon(latlngs, options);
      };
    }());
    L.Rectangle = L.Polygon.extend({
      initialize: function(latLngBounds, options) {
        L.Polygon.prototype.initialize.call(this, this._boundsToLatLngs(latLngBounds), options);
      },
      setBounds: function(latLngBounds) {
        this.setLatLngs(this._boundsToLatLngs(latLngBounds));
      },
      _boundsToLatLngs: function(latLngBounds) {
        latLngBounds = L.latLngBounds(latLngBounds);
        return [latLngBounds.getSouthWest(), latLngBounds.getNorthWest(), latLngBounds.getNorthEast(), latLngBounds.getSouthEast()];
      }
    });
    L.rectangle = function(latLngBounds, options) {
      return new L.Rectangle(latLngBounds, options);
    };
    L.Circle = L.Path.extend({
      initialize: function(latlng, radius, options) {
        L.Path.prototype.initialize.call(this, options);
        this._latlng = L.latLng(latlng);
        this._mRadius = radius;
      },
      options: {fill: true},
      setLatLng: function(latlng) {
        this._latlng = L.latLng(latlng);
        return this.redraw();
      },
      setRadius: function(radius) {
        this._mRadius = radius;
        return this.redraw();
      },
      projectLatlngs: function() {
        var lngRadius = this._getLngRadius(),
            latlng = this._latlng,
            pointLeft = this._map.latLngToLayerPoint([latlng.lat, latlng.lng - lngRadius]);
        this._point = this._map.latLngToLayerPoint(latlng);
        this._radius = Math.max(this._point.x - pointLeft.x, 1);
      },
      getBounds: function() {
        var lngRadius = this._getLngRadius(),
            latRadius = (this._mRadius / 40075017) * 360,
            latlng = this._latlng;
        return new L.LatLngBounds([latlng.lat - latRadius, latlng.lng - lngRadius], [latlng.lat + latRadius, latlng.lng + lngRadius]);
      },
      getLatLng: function() {
        return this._latlng;
      },
      getPathString: function() {
        var p = this._point,
            r = this._radius;
        if (this._checkIfEmpty()) {
          return '';
        }
        if (L.Browser.svg) {
          return 'M' + p.x + ',' + (p.y - r) + 'A' + r + ',' + r + ',0,1,1,' + (p.x - 0.1) + ',' + (p.y - r) + ' z';
        } else {
          p._round();
          r = Math.round(r);
          return 'AL ' + p.x + ',' + p.y + ' ' + r + ',' + r + ' 0,' + (65535 * 360);
        }
      },
      getRadius: function() {
        return this._mRadius;
      },
      _getLatRadius: function() {
        return (this._mRadius / 40075017) * 360;
      },
      _getLngRadius: function() {
        return this._getLatRadius() / Math.cos(L.LatLng.DEG_TO_RAD * this._latlng.lat);
      },
      _checkIfEmpty: function() {
        if (!this._map) {
          return false;
        }
        var vp = this._map._pathViewport,
            r = this._radius,
            p = this._point;
        return p.x - r > vp.max.x || p.y - r > vp.max.y || p.x + r < vp.min.x || p.y + r < vp.min.y;
      }
    });
    L.circle = function(latlng, radius, options) {
      return new L.Circle(latlng, radius, options);
    };
    L.CircleMarker = L.Circle.extend({
      options: {
        radius: 10,
        weight: 2
      },
      initialize: function(latlng, options) {
        L.Circle.prototype.initialize.call(this, latlng, null, options);
        this._radius = this.options.radius;
      },
      projectLatlngs: function() {
        this._point = this._map.latLngToLayerPoint(this._latlng);
      },
      _updateStyle: function() {
        L.Circle.prototype._updateStyle.call(this);
        this.setRadius(this.options.radius);
      },
      setLatLng: function(latlng) {
        L.Circle.prototype.setLatLng.call(this, latlng);
        if (this._popup && this._popup._isOpen) {
          this._popup.setLatLng(latlng);
        }
        return this;
      },
      setRadius: function(radius) {
        this.options.radius = this._radius = radius;
        return this.redraw();
      },
      getRadius: function() {
        return this._radius;
      }
    });
    L.circleMarker = function(latlng, options) {
      return new L.CircleMarker(latlng, options);
    };
    L.Polyline.include(!L.Path.CANVAS ? {} : {_containsPoint: function(p, closed) {
        var i,
            j,
            k,
            len,
            len2,
            dist,
            part,
            w = this.options.weight / 2;
        if (L.Browser.touch) {
          w += 10;
        }
        for (i = 0, len = this._parts.length; i < len; i++) {
          part = this._parts[i];
          for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
            if (!closed && (j === 0)) {
              continue;
            }
            dist = L.LineUtil.pointToSegmentDistance(p, part[k], part[j]);
            if (dist <= w) {
              return true;
            }
          }
        }
        return false;
      }});
    L.Polygon.include(!L.Path.CANVAS ? {} : {_containsPoint: function(p) {
        var inside = false,
            part,
            p1,
            p2,
            i,
            j,
            k,
            len,
            len2;
        if (L.Polyline.prototype._containsPoint.call(this, p, true)) {
          return true;
        }
        for (i = 0, len = this._parts.length; i < len; i++) {
          part = this._parts[i];
          for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
            p1 = part[j];
            p2 = part[k];
            if (((p1.y > p.y) !== (p2.y > p.y)) && (p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
              inside = !inside;
            }
          }
        }
        return inside;
      }});
    L.Circle.include(!L.Path.CANVAS ? {} : {
      _drawPath: function() {
        var p = this._point;
        this._ctx.beginPath();
        this._ctx.arc(p.x, p.y, this._radius, 0, Math.PI * 2, false);
      },
      _containsPoint: function(p) {
        var center = this._point,
            w2 = this.options.stroke ? this.options.weight / 2 : 0;
        return (p.distanceTo(center) <= this._radius + w2);
      }
    });
    L.CircleMarker.include(!L.Path.CANVAS ? {} : {_updateStyle: function() {
        L.Path.prototype._updateStyle.call(this);
      }});
    L.GeoJSON = L.FeatureGroup.extend({
      initialize: function(geojson, options) {
        L.setOptions(this, options);
        this._layers = {};
        if (geojson) {
          this.addData(geojson);
        }
      },
      addData: function(geojson) {
        var features = L.Util.isArray(geojson) ? geojson : geojson.features,
            i,
            len,
            feature;
        if (features) {
          for (i = 0, len = features.length; i < len; i++) {
            feature = features[i];
            if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
              this.addData(features[i]);
            }
          }
          return this;
        }
        var options = this.options;
        if (options.filter && !options.filter(geojson)) {
          return;
        }
        var layer = L.GeoJSON.geometryToLayer(geojson, options.pointToLayer, options.coordsToLatLng, options);
        layer.feature = L.GeoJSON.asFeature(geojson);
        layer.defaultOptions = layer.options;
        this.resetStyle(layer);
        if (options.onEachFeature) {
          options.onEachFeature(geojson, layer);
        }
        return this.addLayer(layer);
      },
      resetStyle: function(layer) {
        var style = this.options.style;
        if (style) {
          L.Util.extend(layer.options, layer.defaultOptions);
          this._setLayerStyle(layer, style);
        }
      },
      setStyle: function(style) {
        this.eachLayer(function(layer) {
          this._setLayerStyle(layer, style);
        }, this);
      },
      _setLayerStyle: function(layer, style) {
        if (typeof style === 'function') {
          style = style(layer.feature);
        }
        if (layer.setStyle) {
          layer.setStyle(style);
        }
      }
    });
    L.extend(L.GeoJSON, {
      geometryToLayer: function(geojson, pointToLayer, coordsToLatLng, vectorOptions) {
        var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
            coords = geometry.coordinates,
            layers = [],
            latlng,
            latlngs,
            i,
            len;
        coordsToLatLng = coordsToLatLng || this.coordsToLatLng;
        switch (geometry.type) {
          case 'Point':
            latlng = coordsToLatLng(coords);
            return pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng);
          case 'MultiPoint':
            for (i = 0, len = coords.length; i < len; i++) {
              latlng = coordsToLatLng(coords[i]);
              layers.push(pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng));
            }
            return new L.FeatureGroup(layers);
          case 'LineString':
            latlngs = this.coordsToLatLngs(coords, 0, coordsToLatLng);
            return new L.Polyline(latlngs, vectorOptions);
          case 'Polygon':
            if (coords.length === 2 && !coords[1].length) {
              throw new Error('Invalid GeoJSON object.');
            }
            latlngs = this.coordsToLatLngs(coords, 1, coordsToLatLng);
            return new L.Polygon(latlngs, vectorOptions);
          case 'MultiLineString':
            latlngs = this.coordsToLatLngs(coords, 1, coordsToLatLng);
            return new L.MultiPolyline(latlngs, vectorOptions);
          case 'MultiPolygon':
            latlngs = this.coordsToLatLngs(coords, 2, coordsToLatLng);
            return new L.MultiPolygon(latlngs, vectorOptions);
          case 'GeometryCollection':
            for (i = 0, len = geometry.geometries.length; i < len; i++) {
              layers.push(this.geometryToLayer({
                geometry: geometry.geometries[i],
                type: 'Feature',
                properties: geojson.properties
              }, pointToLayer, coordsToLatLng, vectorOptions));
            }
            return new L.FeatureGroup(layers);
          default:
            throw new Error('Invalid GeoJSON object.');
        }
      },
      coordsToLatLng: function(coords) {
        return new L.LatLng(coords[1], coords[0], coords[2]);
      },
      coordsToLatLngs: function(coords, levelsDeep, coordsToLatLng) {
        var latlng,
            i,
            len,
            latlngs = [];
        for (i = 0, len = coords.length; i < len; i++) {
          latlng = levelsDeep ? this.coordsToLatLngs(coords[i], levelsDeep - 1, coordsToLatLng) : (coordsToLatLng || this.coordsToLatLng)(coords[i]);
          latlngs.push(latlng);
        }
        return latlngs;
      },
      latLngToCoords: function(latlng) {
        var coords = [latlng.lng, latlng.lat];
        if (latlng.alt !== undefined) {
          coords.push(latlng.alt);
        }
        return coords;
      },
      latLngsToCoords: function(latLngs) {
        var coords = [];
        for (var i = 0,
            len = latLngs.length; i < len; i++) {
          coords.push(L.GeoJSON.latLngToCoords(latLngs[i]));
        }
        return coords;
      },
      getFeature: function(layer, newGeometry) {
        return layer.feature ? L.extend({}, layer.feature, {geometry: newGeometry}) : L.GeoJSON.asFeature(newGeometry);
      },
      asFeature: function(geoJSON) {
        if (geoJSON.type === 'Feature') {
          return geoJSON;
        }
        return {
          type: 'Feature',
          properties: {},
          geometry: geoJSON
        };
      }
    });
    var PointToGeoJSON = {toGeoJSON: function() {
        return L.GeoJSON.getFeature(this, {
          type: 'Point',
          coordinates: L.GeoJSON.latLngToCoords(this.getLatLng())
        });
      }};
    L.Marker.include(PointToGeoJSON);
    L.Circle.include(PointToGeoJSON);
    L.CircleMarker.include(PointToGeoJSON);
    L.Polyline.include({toGeoJSON: function() {
        return L.GeoJSON.getFeature(this, {
          type: 'LineString',
          coordinates: L.GeoJSON.latLngsToCoords(this.getLatLngs())
        });
      }});
    L.Polygon.include({toGeoJSON: function() {
        var coords = [L.GeoJSON.latLngsToCoords(this.getLatLngs())],
            i,
            len,
            hole;
        coords[0].push(coords[0][0]);
        if (this._holes) {
          for (i = 0, len = this._holes.length; i < len; i++) {
            hole = L.GeoJSON.latLngsToCoords(this._holes[i]);
            hole.push(hole[0]);
            coords.push(hole);
          }
        }
        return L.GeoJSON.getFeature(this, {
          type: 'Polygon',
          coordinates: coords
        });
      }});
    (function() {
      function multiToGeoJSON(type) {
        return function() {
          var coords = [];
          this.eachLayer(function(layer) {
            coords.push(layer.toGeoJSON().geometry.coordinates);
          });
          return L.GeoJSON.getFeature(this, {
            type: type,
            coordinates: coords
          });
        };
      }
      L.MultiPolyline.include({toGeoJSON: multiToGeoJSON('MultiLineString')});
      L.MultiPolygon.include({toGeoJSON: multiToGeoJSON('MultiPolygon')});
      L.LayerGroup.include({toGeoJSON: function() {
          var geometry = this.feature && this.feature.geometry,
              jsons = [],
              json;
          if (geometry && geometry.type === 'MultiPoint') {
            return multiToGeoJSON('MultiPoint').call(this);
          }
          var isGeometryCollection = geometry && geometry.type === 'GeometryCollection';
          this.eachLayer(function(layer) {
            if (layer.toGeoJSON) {
              json = layer.toGeoJSON();
              jsons.push(isGeometryCollection ? json.geometry : L.GeoJSON.asFeature(json));
            }
          });
          if (isGeometryCollection) {
            return L.GeoJSON.getFeature(this, {
              geometries: jsons,
              type: 'GeometryCollection'
            });
          }
          return {
            type: 'FeatureCollection',
            features: jsons
          };
        }});
    }());
    L.geoJson = function(geojson, options) {
      return new L.GeoJSON(geojson, options);
    };
    L.DomEvent = {
      addListener: function(obj, type, fn, context) {
        var id = L.stamp(fn),
            key = '_leaflet_' + type + id,
            handler,
            originalHandler,
            newType;
        if (obj[key]) {
          return this;
        }
        handler = function(e) {
          return fn.call(context || obj, e || L.DomEvent._getEvent());
        };
        if (L.Browser.pointer && type.indexOf('touch') === 0) {
          return this.addPointerListener(obj, type, handler, id);
        }
        if (L.Browser.touch && (type === 'dblclick') && this.addDoubleTapListener) {
          this.addDoubleTapListener(obj, handler, id);
        }
        if ('addEventListener' in obj) {
          if (type === 'mousewheel') {
            obj.addEventListener('DOMMouseScroll', handler, false);
            obj.addEventListener(type, handler, false);
          } else if ((type === 'mouseenter') || (type === 'mouseleave')) {
            originalHandler = handler;
            newType = (type === 'mouseenter' ? 'mouseover' : 'mouseout');
            handler = function(e) {
              if (!L.DomEvent._checkMouse(obj, e)) {
                return;
              }
              return originalHandler(e);
            };
            obj.addEventListener(newType, handler, false);
          } else if (type === 'click' && L.Browser.android) {
            originalHandler = handler;
            handler = function(e) {
              return L.DomEvent._filterClick(e, originalHandler);
            };
            obj.addEventListener(type, handler, false);
          } else {
            obj.addEventListener(type, handler, false);
          }
        } else if ('attachEvent' in obj) {
          obj.attachEvent('on' + type, handler);
        }
        obj[key] = handler;
        return this;
      },
      removeListener: function(obj, type, fn) {
        var id = L.stamp(fn),
            key = '_leaflet_' + type + id,
            handler = obj[key];
        if (!handler) {
          return this;
        }
        if (L.Browser.pointer && type.indexOf('touch') === 0) {
          this.removePointerListener(obj, type, id);
        } else if (L.Browser.touch && (type === 'dblclick') && this.removeDoubleTapListener) {
          this.removeDoubleTapListener(obj, id);
        } else if ('removeEventListener' in obj) {
          if (type === 'mousewheel') {
            obj.removeEventListener('DOMMouseScroll', handler, false);
            obj.removeEventListener(type, handler, false);
          } else if ((type === 'mouseenter') || (type === 'mouseleave')) {
            obj.removeEventListener((type === 'mouseenter' ? 'mouseover' : 'mouseout'), handler, false);
          } else {
            obj.removeEventListener(type, handler, false);
          }
        } else if ('detachEvent' in obj) {
          obj.detachEvent('on' + type, handler);
        }
        obj[key] = null;
        return this;
      },
      stopPropagation: function(e) {
        if (e.stopPropagation) {
          e.stopPropagation();
        } else {
          e.cancelBubble = true;
        }
        L.DomEvent._skipped(e);
        return this;
      },
      disableScrollPropagation: function(el) {
        var stop = L.DomEvent.stopPropagation;
        return L.DomEvent.on(el, 'mousewheel', stop).on(el, 'MozMousePixelScroll', stop);
      },
      disableClickPropagation: function(el) {
        var stop = L.DomEvent.stopPropagation;
        for (var i = L.Draggable.START.length - 1; i >= 0; i--) {
          L.DomEvent.on(el, L.Draggable.START[i], stop);
        }
        return L.DomEvent.on(el, 'click', L.DomEvent._fakeStop).on(el, 'dblclick', stop);
      },
      preventDefault: function(e) {
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          e.returnValue = false;
        }
        return this;
      },
      stop: function(e) {
        return L.DomEvent.preventDefault(e).stopPropagation(e);
      },
      getMousePosition: function(e, container) {
        if (!container) {
          return new L.Point(e.clientX, e.clientY);
        }
        var rect = container.getBoundingClientRect();
        return new L.Point(e.clientX - rect.left - container.clientLeft, e.clientY - rect.top - container.clientTop);
      },
      getWheelDelta: function(e) {
        var delta = 0;
        if (e.wheelDelta) {
          delta = e.wheelDelta / 120;
        }
        if (e.detail) {
          delta = -e.detail / 3;
        }
        return delta;
      },
      _skipEvents: {},
      _fakeStop: function(e) {
        L.DomEvent._skipEvents[e.type] = true;
      },
      _skipped: function(e) {
        var skipped = this._skipEvents[e.type];
        this._skipEvents[e.type] = false;
        return skipped;
      },
      _checkMouse: function(el, e) {
        var related = e.relatedTarget;
        if (!related) {
          return true;
        }
        try {
          while (related && (related !== el)) {
            related = related.parentNode;
          }
        } catch (err) {
          return false;
        }
        return (related !== el);
      },
      _getEvent: function() {
        var e = window.event;
        if (!e) {
          var caller = arguments.callee.caller;
          while (caller) {
            e = caller['arguments'][0];
            if (e && window.Event === e.constructor) {
              break;
            }
            caller = caller.caller;
          }
        }
        return e;
      },
      _filterClick: function(e, handler) {
        var timeStamp = (e.timeStamp || e.originalEvent.timeStamp),
            elapsed = L.DomEvent._lastClick && (timeStamp - L.DomEvent._lastClick);
        if ((elapsed && elapsed > 100 && elapsed < 500) || (e.target._simulatedClick && !e._simulated)) {
          L.DomEvent.stop(e);
          return;
        }
        L.DomEvent._lastClick = timeStamp;
        return handler(e);
      }
    };
    L.DomEvent.on = L.DomEvent.addListener;
    L.DomEvent.off = L.DomEvent.removeListener;
    L.Draggable = L.Class.extend({
      includes: L.Mixin.Events,
      statics: {
        START: L.Browser.touch ? ['touchstart', 'mousedown'] : ['mousedown'],
        END: {
          mousedown: 'mouseup',
          touchstart: 'touchend',
          pointerdown: 'touchend',
          MSPointerDown: 'touchend'
        },
        MOVE: {
          mousedown: 'mousemove',
          touchstart: 'touchmove',
          pointerdown: 'touchmove',
          MSPointerDown: 'touchmove'
        }
      },
      initialize: function(element, dragStartTarget) {
        this._element = element;
        this._dragStartTarget = dragStartTarget || element;
      },
      enable: function() {
        if (this._enabled) {
          return;
        }
        for (var i = L.Draggable.START.length - 1; i >= 0; i--) {
          L.DomEvent.on(this._dragStartTarget, L.Draggable.START[i], this._onDown, this);
        }
        this._enabled = true;
      },
      disable: function() {
        if (!this._enabled) {
          return;
        }
        for (var i = L.Draggable.START.length - 1; i >= 0; i--) {
          L.DomEvent.off(this._dragStartTarget, L.Draggable.START[i], this._onDown, this);
        }
        this._enabled = false;
        this._moved = false;
      },
      _onDown: function(e) {
        this._moved = false;
        if (e.shiftKey || ((e.which !== 1) && (e.button !== 1) && !e.touches)) {
          return;
        }
        L.DomEvent.stopPropagation(e);
        if (L.Draggable._disabled) {
          return;
        }
        L.DomUtil.disableImageDrag();
        L.DomUtil.disableTextSelection();
        if (this._moving) {
          return;
        }
        var first = e.touches ? e.touches[0] : e;
        this._startPoint = new L.Point(first.clientX, first.clientY);
        this._startPos = this._newPos = L.DomUtil.getPosition(this._element);
        L.DomEvent.on(document, L.Draggable.MOVE[e.type], this._onMove, this).on(document, L.Draggable.END[e.type], this._onUp, this);
      },
      _onMove: function(e) {
        if (e.touches && e.touches.length > 1) {
          this._moved = true;
          return;
        }
        var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e),
            newPoint = new L.Point(first.clientX, first.clientY),
            offset = newPoint.subtract(this._startPoint);
        if (!offset.x && !offset.y) {
          return;
        }
        if (L.Browser.touch && Math.abs(offset.x) + Math.abs(offset.y) < 3) {
          return;
        }
        L.DomEvent.preventDefault(e);
        if (!this._moved) {
          this.fire('dragstart');
          this._moved = true;
          this._startPos = L.DomUtil.getPosition(this._element).subtract(offset);
          L.DomUtil.addClass(document.body, 'leaflet-dragging');
          this._lastTarget = e.target || e.srcElement;
          L.DomUtil.addClass(this._lastTarget, 'leaflet-drag-target');
        }
        this._newPos = this._startPos.add(offset);
        this._moving = true;
        L.Util.cancelAnimFrame(this._animRequest);
        this._animRequest = L.Util.requestAnimFrame(this._updatePosition, this, true, this._dragStartTarget);
      },
      _updatePosition: function() {
        this.fire('predrag');
        L.DomUtil.setPosition(this._element, this._newPos);
        this.fire('drag');
      },
      _onUp: function() {
        L.DomUtil.removeClass(document.body, 'leaflet-dragging');
        if (this._lastTarget) {
          L.DomUtil.removeClass(this._lastTarget, 'leaflet-drag-target');
          this._lastTarget = null;
        }
        for (var i in L.Draggable.MOVE) {
          L.DomEvent.off(document, L.Draggable.MOVE[i], this._onMove).off(document, L.Draggable.END[i], this._onUp);
        }
        L.DomUtil.enableImageDrag();
        L.DomUtil.enableTextSelection();
        if (this._moved && this._moving) {
          L.Util.cancelAnimFrame(this._animRequest);
          this.fire('dragend', {distance: this._newPos.distanceTo(this._startPos)});
        }
        this._moving = false;
      }
    });
    L.Handler = L.Class.extend({
      initialize: function(map) {
        this._map = map;
      },
      enable: function() {
        if (this._enabled) {
          return;
        }
        this._enabled = true;
        this.addHooks();
      },
      disable: function() {
        if (!this._enabled) {
          return;
        }
        this._enabled = false;
        this.removeHooks();
      },
      enabled: function() {
        return !!this._enabled;
      }
    });
    L.Map.mergeOptions({
      dragging: true,
      inertia: !L.Browser.android23,
      inertiaDeceleration: 3400,
      inertiaMaxSpeed: Infinity,
      inertiaThreshold: L.Browser.touch ? 32 : 18,
      easeLinearity: 0.25,
      worldCopyJump: false
    });
    L.Map.Drag = L.Handler.extend({
      addHooks: function() {
        if (!this._draggable) {
          var map = this._map;
          this._draggable = new L.Draggable(map._mapPane, map._container);
          this._draggable.on({
            'dragstart': this._onDragStart,
            'drag': this._onDrag,
            'dragend': this._onDragEnd
          }, this);
          if (map.options.worldCopyJump) {
            this._draggable.on('predrag', this._onPreDrag, this);
            map.on('viewreset', this._onViewReset, this);
            map.whenReady(this._onViewReset, this);
          }
        }
        this._draggable.enable();
      },
      removeHooks: function() {
        this._draggable.disable();
      },
      moved: function() {
        return this._draggable && this._draggable._moved;
      },
      _onDragStart: function() {
        var map = this._map;
        if (map._panAnim) {
          map._panAnim.stop();
        }
        map.fire('movestart').fire('dragstart');
        if (map.options.inertia) {
          this._positions = [];
          this._times = [];
        }
      },
      _onDrag: function() {
        if (this._map.options.inertia) {
          var time = this._lastTime = +new Date(),
              pos = this._lastPos = this._draggable._newPos;
          this._positions.push(pos);
          this._times.push(time);
          if (time - this._times[0] > 200) {
            this._positions.shift();
            this._times.shift();
          }
        }
        this._map.fire('move').fire('drag');
      },
      _onViewReset: function() {
        var pxCenter = this._map.getSize()._divideBy(2),
            pxWorldCenter = this._map.latLngToLayerPoint([0, 0]);
        this._initialWorldOffset = pxWorldCenter.subtract(pxCenter).x;
        this._worldWidth = this._map.project([0, 180]).x;
      },
      _onPreDrag: function() {
        var worldWidth = this._worldWidth,
            halfWidth = Math.round(worldWidth / 2),
            dx = this._initialWorldOffset,
            x = this._draggable._newPos.x,
            newX1 = (x - halfWidth + dx) % worldWidth + halfWidth - dx,
            newX2 = (x + halfWidth + dx) % worldWidth - halfWidth - dx,
            newX = Math.abs(newX1 + dx) < Math.abs(newX2 + dx) ? newX1 : newX2;
        this._draggable._newPos.x = newX;
      },
      _onDragEnd: function(e) {
        var map = this._map,
            options = map.options,
            delay = +new Date() - this._lastTime,
            noInertia = !options.inertia || delay > options.inertiaThreshold || !this._positions[0];
        map.fire('dragend', e);
        if (noInertia) {
          map.fire('moveend');
        } else {
          var direction = this._lastPos.subtract(this._positions[0]),
              duration = (this._lastTime + delay - this._times[0]) / 1000,
              ease = options.easeLinearity,
              speedVector = direction.multiplyBy(ease / duration),
              speed = speedVector.distanceTo([0, 0]),
              limitedSpeed = Math.min(options.inertiaMaxSpeed, speed),
              limitedSpeedVector = speedVector.multiplyBy(limitedSpeed / speed),
              decelerationDuration = limitedSpeed / (options.inertiaDeceleration * ease),
              offset = limitedSpeedVector.multiplyBy(-decelerationDuration / 2).round();
          if (!offset.x || !offset.y) {
            map.fire('moveend');
          } else {
            offset = map._limitOffset(offset, map.options.maxBounds);
            L.Util.requestAnimFrame(function() {
              map.panBy(offset, {
                duration: decelerationDuration,
                easeLinearity: ease,
                noMoveStart: true
              });
            });
          }
        }
      }
    });
    L.Map.addInitHook('addHandler', 'dragging', L.Map.Drag);
    L.Map.mergeOptions({doubleClickZoom: true});
    L.Map.DoubleClickZoom = L.Handler.extend({
      addHooks: function() {
        this._map.on('dblclick', this._onDoubleClick, this);
      },
      removeHooks: function() {
        this._map.off('dblclick', this._onDoubleClick, this);
      },
      _onDoubleClick: function(e) {
        var map = this._map,
            zoom = map.getZoom() + (e.originalEvent.shiftKey ? -1 : 1);
        if (map.options.doubleClickZoom === 'center') {
          map.setZoom(zoom);
        } else {
          map.setZoomAround(e.containerPoint, zoom);
        }
      }
    });
    L.Map.addInitHook('addHandler', 'doubleClickZoom', L.Map.DoubleClickZoom);
    L.Map.mergeOptions({scrollWheelZoom: true});
    L.Map.ScrollWheelZoom = L.Handler.extend({
      addHooks: function() {
        L.DomEvent.on(this._map._container, 'mousewheel', this._onWheelScroll, this);
        L.DomEvent.on(this._map._container, 'MozMousePixelScroll', L.DomEvent.preventDefault);
        this._delta = 0;
      },
      removeHooks: function() {
        L.DomEvent.off(this._map._container, 'mousewheel', this._onWheelScroll);
        L.DomEvent.off(this._map._container, 'MozMousePixelScroll', L.DomEvent.preventDefault);
      },
      _onWheelScroll: function(e) {
        var delta = L.DomEvent.getWheelDelta(e);
        this._delta += delta;
        this._lastMousePos = this._map.mouseEventToContainerPoint(e);
        if (!this._startTime) {
          this._startTime = +new Date();
        }
        var left = Math.max(40 - (+new Date() - this._startTime), 0);
        clearTimeout(this._timer);
        this._timer = setTimeout(L.bind(this._performZoom, this), left);
        L.DomEvent.preventDefault(e);
        L.DomEvent.stopPropagation(e);
      },
      _performZoom: function() {
        var map = this._map,
            delta = this._delta,
            zoom = map.getZoom();
        delta = delta > 0 ? Math.ceil(delta) : Math.floor(delta);
        delta = Math.max(Math.min(delta, 4), -4);
        delta = map._limitZoom(zoom + delta) - zoom;
        this._delta = 0;
        this._startTime = null;
        if (!delta) {
          return;
        }
        if (map.options.scrollWheelZoom === 'center') {
          map.setZoom(zoom + delta);
        } else {
          map.setZoomAround(this._lastMousePos, zoom + delta);
        }
      }
    });
    L.Map.addInitHook('addHandler', 'scrollWheelZoom', L.Map.ScrollWheelZoom);
    L.extend(L.DomEvent, {
      _touchstart: L.Browser.msPointer ? 'MSPointerDown' : L.Browser.pointer ? 'pointerdown' : 'touchstart',
      _touchend: L.Browser.msPointer ? 'MSPointerUp' : L.Browser.pointer ? 'pointerup' : 'touchend',
      addDoubleTapListener: function(obj, handler, id) {
        var last,
            doubleTap = false,
            delay = 250,
            touch,
            pre = '_leaflet_',
            touchstart = this._touchstart,
            touchend = this._touchend,
            trackedTouches = [];
        function onTouchStart(e) {
          var count;
          if (L.Browser.pointer) {
            trackedTouches.push(e.pointerId);
            count = trackedTouches.length;
          } else {
            count = e.touches.length;
          }
          if (count > 1) {
            return;
          }
          var now = Date.now(),
              delta = now - (last || now);
          touch = e.touches ? e.touches[0] : e;
          doubleTap = (delta > 0 && delta <= delay);
          last = now;
        }
        function onTouchEnd(e) {
          if (L.Browser.pointer) {
            var idx = trackedTouches.indexOf(e.pointerId);
            if (idx === -1) {
              return;
            }
            trackedTouches.splice(idx, 1);
          }
          if (doubleTap) {
            if (L.Browser.pointer) {
              var newTouch = {},
                  prop;
              for (var i in touch) {
                prop = touch[i];
                if (typeof prop === 'function') {
                  newTouch[i] = prop.bind(touch);
                } else {
                  newTouch[i] = prop;
                }
              }
              touch = newTouch;
            }
            touch.type = 'dblclick';
            handler(touch);
            last = null;
          }
        }
        obj[pre + touchstart + id] = onTouchStart;
        obj[pre + touchend + id] = onTouchEnd;
        var endElement = L.Browser.pointer ? document.documentElement : obj;
        obj.addEventListener(touchstart, onTouchStart, false);
        endElement.addEventListener(touchend, onTouchEnd, false);
        if (L.Browser.pointer) {
          endElement.addEventListener(L.DomEvent.POINTER_CANCEL, onTouchEnd, false);
        }
        return this;
      },
      removeDoubleTapListener: function(obj, id) {
        var pre = '_leaflet_';
        obj.removeEventListener(this._touchstart, obj[pre + this._touchstart + id], false);
        (L.Browser.pointer ? document.documentElement : obj).removeEventListener(this._touchend, obj[pre + this._touchend + id], false);
        if (L.Browser.pointer) {
          document.documentElement.removeEventListener(L.DomEvent.POINTER_CANCEL, obj[pre + this._touchend + id], false);
        }
        return this;
      }
    });
    L.extend(L.DomEvent, {
      POINTER_DOWN: L.Browser.msPointer ? 'MSPointerDown' : 'pointerdown',
      POINTER_MOVE: L.Browser.msPointer ? 'MSPointerMove' : 'pointermove',
      POINTER_UP: L.Browser.msPointer ? 'MSPointerUp' : 'pointerup',
      POINTER_CANCEL: L.Browser.msPointer ? 'MSPointerCancel' : 'pointercancel',
      _pointers: [],
      _pointerDocumentListener: false,
      addPointerListener: function(obj, type, handler, id) {
        switch (type) {
          case 'touchstart':
            return this.addPointerListenerStart(obj, type, handler, id);
          case 'touchend':
            return this.addPointerListenerEnd(obj, type, handler, id);
          case 'touchmove':
            return this.addPointerListenerMove(obj, type, handler, id);
          default:
            throw 'Unknown touch event type';
        }
      },
      addPointerListenerStart: function(obj, type, handler, id) {
        var pre = '_leaflet_',
            pointers = this._pointers;
        var cb = function(e) {
          if (e.pointerType !== 'mouse' && e.pointerType !== e.MSPOINTER_TYPE_MOUSE) {
            L.DomEvent.preventDefault(e);
          }
          var alreadyInArray = false;
          for (var i = 0; i < pointers.length; i++) {
            if (pointers[i].pointerId === e.pointerId) {
              alreadyInArray = true;
              break;
            }
          }
          if (!alreadyInArray) {
            pointers.push(e);
          }
          e.touches = pointers.slice();
          e.changedTouches = [e];
          handler(e);
        };
        obj[pre + 'touchstart' + id] = cb;
        obj.addEventListener(this.POINTER_DOWN, cb, false);
        if (!this._pointerDocumentListener) {
          var internalCb = function(e) {
            for (var i = 0; i < pointers.length; i++) {
              if (pointers[i].pointerId === e.pointerId) {
                pointers.splice(i, 1);
                break;
              }
            }
          };
          document.documentElement.addEventListener(this.POINTER_UP, internalCb, false);
          document.documentElement.addEventListener(this.POINTER_CANCEL, internalCb, false);
          this._pointerDocumentListener = true;
        }
        return this;
      },
      addPointerListenerMove: function(obj, type, handler, id) {
        var pre = '_leaflet_',
            touches = this._pointers;
        function cb(e) {
          if ((e.pointerType === e.MSPOINTER_TYPE_MOUSE || e.pointerType === 'mouse') && e.buttons === 0) {
            return;
          }
          for (var i = 0; i < touches.length; i++) {
            if (touches[i].pointerId === e.pointerId) {
              touches[i] = e;
              break;
            }
          }
          e.touches = touches.slice();
          e.changedTouches = [e];
          handler(e);
        }
        obj[pre + 'touchmove' + id] = cb;
        obj.addEventListener(this.POINTER_MOVE, cb, false);
        return this;
      },
      addPointerListenerEnd: function(obj, type, handler, id) {
        var pre = '_leaflet_',
            touches = this._pointers;
        var cb = function(e) {
          for (var i = 0; i < touches.length; i++) {
            if (touches[i].pointerId === e.pointerId) {
              touches.splice(i, 1);
              break;
            }
          }
          e.touches = touches.slice();
          e.changedTouches = [e];
          handler(e);
        };
        obj[pre + 'touchend' + id] = cb;
        obj.addEventListener(this.POINTER_UP, cb, false);
        obj.addEventListener(this.POINTER_CANCEL, cb, false);
        return this;
      },
      removePointerListener: function(obj, type, id) {
        var pre = '_leaflet_',
            cb = obj[pre + type + id];
        switch (type) {
          case 'touchstart':
            obj.removeEventListener(this.POINTER_DOWN, cb, false);
            break;
          case 'touchmove':
            obj.removeEventListener(this.POINTER_MOVE, cb, false);
            break;
          case 'touchend':
            obj.removeEventListener(this.POINTER_UP, cb, false);
            obj.removeEventListener(this.POINTER_CANCEL, cb, false);
            break;
        }
        return this;
      }
    });
    L.Map.mergeOptions({
      touchZoom: L.Browser.touch && !L.Browser.android23,
      bounceAtZoomLimits: true
    });
    L.Map.TouchZoom = L.Handler.extend({
      addHooks: function() {
        L.DomEvent.on(this._map._container, 'touchstart', this._onTouchStart, this);
      },
      removeHooks: function() {
        L.DomEvent.off(this._map._container, 'touchstart', this._onTouchStart, this);
      },
      _onTouchStart: function(e) {
        var map = this._map;
        if (!e.touches || e.touches.length !== 2 || map._animatingZoom || this._zooming) {
          return;
        }
        var p1 = map.mouseEventToLayerPoint(e.touches[0]),
            p2 = map.mouseEventToLayerPoint(e.touches[1]),
            viewCenter = map._getCenterLayerPoint();
        this._startCenter = p1.add(p2)._divideBy(2);
        this._startDist = p1.distanceTo(p2);
        this._moved = false;
        this._zooming = true;
        this._centerOffset = viewCenter.subtract(this._startCenter);
        if (map._panAnim) {
          map._panAnim.stop();
        }
        L.DomEvent.on(document, 'touchmove', this._onTouchMove, this).on(document, 'touchend', this._onTouchEnd, this);
        L.DomEvent.preventDefault(e);
      },
      _onTouchMove: function(e) {
        var map = this._map;
        if (!e.touches || e.touches.length !== 2 || !this._zooming) {
          return;
        }
        var p1 = map.mouseEventToLayerPoint(e.touches[0]),
            p2 = map.mouseEventToLayerPoint(e.touches[1]);
        this._scale = p1.distanceTo(p2) / this._startDist;
        this._delta = p1._add(p2)._divideBy(2)._subtract(this._startCenter);
        if (this._scale === 1) {
          return;
        }
        if (!map.options.bounceAtZoomLimits) {
          if ((map.getZoom() === map.getMinZoom() && this._scale < 1) || (map.getZoom() === map.getMaxZoom() && this._scale > 1)) {
            return;
          }
        }
        if (!this._moved) {
          L.DomUtil.addClass(map._mapPane, 'leaflet-touching');
          map.fire('movestart').fire('zoomstart');
          this._moved = true;
        }
        L.Util.cancelAnimFrame(this._animRequest);
        this._animRequest = L.Util.requestAnimFrame(this._updateOnMove, this, true, this._map._container);
        L.DomEvent.preventDefault(e);
      },
      _updateOnMove: function() {
        var map = this._map,
            origin = this._getScaleOrigin(),
            center = map.layerPointToLatLng(origin),
            zoom = map.getScaleZoom(this._scale);
        map._animateZoom(center, zoom, this._startCenter, this._scale, this._delta, false, true);
      },
      _onTouchEnd: function() {
        if (!this._moved || !this._zooming) {
          this._zooming = false;
          return;
        }
        var map = this._map;
        this._zooming = false;
        L.DomUtil.removeClass(map._mapPane, 'leaflet-touching');
        L.Util.cancelAnimFrame(this._animRequest);
        L.DomEvent.off(document, 'touchmove', this._onTouchMove).off(document, 'touchend', this._onTouchEnd);
        var origin = this._getScaleOrigin(),
            center = map.layerPointToLatLng(origin),
            oldZoom = map.getZoom(),
            floatZoomDelta = map.getScaleZoom(this._scale) - oldZoom,
            roundZoomDelta = (floatZoomDelta > 0 ? Math.ceil(floatZoomDelta) : Math.floor(floatZoomDelta)),
            zoom = map._limitZoom(oldZoom + roundZoomDelta),
            scale = map.getZoomScale(zoom) / this._scale;
        map._animateZoom(center, zoom, origin, scale);
      },
      _getScaleOrigin: function() {
        var centerOffset = this._centerOffset.subtract(this._delta).divideBy(this._scale);
        return this._startCenter.add(centerOffset);
      }
    });
    L.Map.addInitHook('addHandler', 'touchZoom', L.Map.TouchZoom);
    L.Map.mergeOptions({
      tap: true,
      tapTolerance: 15
    });
    L.Map.Tap = L.Handler.extend({
      addHooks: function() {
        L.DomEvent.on(this._map._container, 'touchstart', this._onDown, this);
      },
      removeHooks: function() {
        L.DomEvent.off(this._map._container, 'touchstart', this._onDown, this);
      },
      _onDown: function(e) {
        if (!e.touches) {
          return;
        }
        L.DomEvent.preventDefault(e);
        this._fireClick = true;
        if (e.touches.length > 1) {
          this._fireClick = false;
          clearTimeout(this._holdTimeout);
          return;
        }
        var first = e.touches[0],
            el = first.target;
        this._startPos = this._newPos = new L.Point(first.clientX, first.clientY);
        if (el.tagName && el.tagName.toLowerCase() === 'a') {
          L.DomUtil.addClass(el, 'leaflet-active');
        }
        this._holdTimeout = setTimeout(L.bind(function() {
          if (this._isTapValid()) {
            this._fireClick = false;
            this._onUp();
            this._simulateEvent('contextmenu', first);
          }
        }, this), 1000);
        L.DomEvent.on(document, 'touchmove', this._onMove, this).on(document, 'touchend', this._onUp, this);
      },
      _onUp: function(e) {
        clearTimeout(this._holdTimeout);
        L.DomEvent.off(document, 'touchmove', this._onMove, this).off(document, 'touchend', this._onUp, this);
        if (this._fireClick && e && e.changedTouches) {
          var first = e.changedTouches[0],
              el = first.target;
          if (el && el.tagName && el.tagName.toLowerCase() === 'a') {
            L.DomUtil.removeClass(el, 'leaflet-active');
          }
          if (this._isTapValid()) {
            this._simulateEvent('click', first);
          }
        }
      },
      _isTapValid: function() {
        return this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance;
      },
      _onMove: function(e) {
        var first = e.touches[0];
        this._newPos = new L.Point(first.clientX, first.clientY);
      },
      _simulateEvent: function(type, e) {
        var simulatedEvent = document.createEvent('MouseEvents');
        simulatedEvent._simulated = true;
        e.target._simulatedClick = true;
        simulatedEvent.initMouseEvent(type, true, true, window, 1, e.screenX, e.screenY, e.clientX, e.clientY, false, false, false, false, 0, null);
        e.target.dispatchEvent(simulatedEvent);
      }
    });
    if (L.Browser.touch && !L.Browser.pointer) {
      L.Map.addInitHook('addHandler', 'tap', L.Map.Tap);
    }
    L.Map.mergeOptions({boxZoom: true});
    L.Map.BoxZoom = L.Handler.extend({
      initialize: function(map) {
        this._map = map;
        this._container = map._container;
        this._pane = map._panes.overlayPane;
        this._moved = false;
      },
      addHooks: function() {
        L.DomEvent.on(this._container, 'mousedown', this._onMouseDown, this);
      },
      removeHooks: function() {
        L.DomEvent.off(this._container, 'mousedown', this._onMouseDown);
        this._moved = false;
      },
      moved: function() {
        return this._moved;
      },
      _onMouseDown: function(e) {
        this._moved = false;
        if (!e.shiftKey || ((e.which !== 1) && (e.button !== 1))) {
          return false;
        }
        L.DomUtil.disableTextSelection();
        L.DomUtil.disableImageDrag();
        this._startLayerPoint = this._map.mouseEventToLayerPoint(e);
        L.DomEvent.on(document, 'mousemove', this._onMouseMove, this).on(document, 'mouseup', this._onMouseUp, this).on(document, 'keydown', this._onKeyDown, this);
      },
      _onMouseMove: function(e) {
        if (!this._moved) {
          this._box = L.DomUtil.create('div', 'leaflet-zoom-box', this._pane);
          L.DomUtil.setPosition(this._box, this._startLayerPoint);
          this._container.style.cursor = 'crosshair';
          this._map.fire('boxzoomstart');
        }
        var startPoint = this._startLayerPoint,
            box = this._box,
            layerPoint = this._map.mouseEventToLayerPoint(e),
            offset = layerPoint.subtract(startPoint),
            newPos = new L.Point(Math.min(layerPoint.x, startPoint.x), Math.min(layerPoint.y, startPoint.y));
        L.DomUtil.setPosition(box, newPos);
        this._moved = true;
        box.style.width = (Math.max(0, Math.abs(offset.x) - 4)) + 'px';
        box.style.height = (Math.max(0, Math.abs(offset.y) - 4)) + 'px';
      },
      _finish: function() {
        if (this._moved) {
          this._pane.removeChild(this._box);
          this._container.style.cursor = '';
        }
        L.DomUtil.enableTextSelection();
        L.DomUtil.enableImageDrag();
        L.DomEvent.off(document, 'mousemove', this._onMouseMove).off(document, 'mouseup', this._onMouseUp).off(document, 'keydown', this._onKeyDown);
      },
      _onMouseUp: function(e) {
        this._finish();
        var map = this._map,
            layerPoint = map.mouseEventToLayerPoint(e);
        if (this._startLayerPoint.equals(layerPoint)) {
          return;
        }
        var bounds = new L.LatLngBounds(map.layerPointToLatLng(this._startLayerPoint), map.layerPointToLatLng(layerPoint));
        map.fitBounds(bounds);
        map.fire('boxzoomend', {boxZoomBounds: bounds});
      },
      _onKeyDown: function(e) {
        if (e.keyCode === 27) {
          this._finish();
        }
      }
    });
    L.Map.addInitHook('addHandler', 'boxZoom', L.Map.BoxZoom);
    L.Map.mergeOptions({
      keyboard: true,
      keyboardPanOffset: 80,
      keyboardZoomOffset: 1
    });
    L.Map.Keyboard = L.Handler.extend({
      keyCodes: {
        left: [37],
        right: [39],
        down: [40],
        up: [38],
        zoomIn: [187, 107, 61, 171],
        zoomOut: [189, 109, 173]
      },
      initialize: function(map) {
        this._map = map;
        this._setPanOffset(map.options.keyboardPanOffset);
        this._setZoomOffset(map.options.keyboardZoomOffset);
      },
      addHooks: function() {
        var container = this._map._container;
        if (container.tabIndex === -1) {
          container.tabIndex = '0';
        }
        L.DomEvent.on(container, 'focus', this._onFocus, this).on(container, 'blur', this._onBlur, this).on(container, 'mousedown', this._onMouseDown, this);
        this._map.on('focus', this._addHooks, this).on('blur', this._removeHooks, this);
      },
      removeHooks: function() {
        this._removeHooks();
        var container = this._map._container;
        L.DomEvent.off(container, 'focus', this._onFocus, this).off(container, 'blur', this._onBlur, this).off(container, 'mousedown', this._onMouseDown, this);
        this._map.off('focus', this._addHooks, this).off('blur', this._removeHooks, this);
      },
      _onMouseDown: function() {
        if (this._focused) {
          return;
        }
        var body = document.body,
            docEl = document.documentElement,
            top = body.scrollTop || docEl.scrollTop,
            left = body.scrollLeft || docEl.scrollLeft;
        this._map._container.focus();
        window.scrollTo(left, top);
      },
      _onFocus: function() {
        this._focused = true;
        this._map.fire('focus');
      },
      _onBlur: function() {
        this._focused = false;
        this._map.fire('blur');
      },
      _setPanOffset: function(pan) {
        var keys = this._panKeys = {},
            codes = this.keyCodes,
            i,
            len;
        for (i = 0, len = codes.left.length; i < len; i++) {
          keys[codes.left[i]] = [-1 * pan, 0];
        }
        for (i = 0, len = codes.right.length; i < len; i++) {
          keys[codes.right[i]] = [pan, 0];
        }
        for (i = 0, len = codes.down.length; i < len; i++) {
          keys[codes.down[i]] = [0, pan];
        }
        for (i = 0, len = codes.up.length; i < len; i++) {
          keys[codes.up[i]] = [0, -1 * pan];
        }
      },
      _setZoomOffset: function(zoom) {
        var keys = this._zoomKeys = {},
            codes = this.keyCodes,
            i,
            len;
        for (i = 0, len = codes.zoomIn.length; i < len; i++) {
          keys[codes.zoomIn[i]] = zoom;
        }
        for (i = 0, len = codes.zoomOut.length; i < len; i++) {
          keys[codes.zoomOut[i]] = -zoom;
        }
      },
      _addHooks: function() {
        L.DomEvent.on(document, 'keydown', this._onKeyDown, this);
      },
      _removeHooks: function() {
        L.DomEvent.off(document, 'keydown', this._onKeyDown, this);
      },
      _onKeyDown: function(e) {
        var key = e.keyCode,
            map = this._map;
        if (key in this._panKeys) {
          if (map._panAnim && map._panAnim._inProgress) {
            return;
          }
          map.panBy(this._panKeys[key]);
          if (map.options.maxBounds) {
            map.panInsideBounds(map.options.maxBounds);
          }
        } else if (key in this._zoomKeys) {
          map.setZoom(map.getZoom() + this._zoomKeys[key]);
        } else {
          return;
        }
        L.DomEvent.stop(e);
      }
    });
    L.Map.addInitHook('addHandler', 'keyboard', L.Map.Keyboard);
    L.Handler.MarkerDrag = L.Handler.extend({
      initialize: function(marker) {
        this._marker = marker;
      },
      addHooks: function() {
        var icon = this._marker._icon;
        if (!this._draggable) {
          this._draggable = new L.Draggable(icon, icon);
        }
        this._draggable.on('dragstart', this._onDragStart, this).on('drag', this._onDrag, this).on('dragend', this._onDragEnd, this);
        this._draggable.enable();
        L.DomUtil.addClass(this._marker._icon, 'leaflet-marker-draggable');
      },
      removeHooks: function() {
        this._draggable.off('dragstart', this._onDragStart, this).off('drag', this._onDrag, this).off('dragend', this._onDragEnd, this);
        this._draggable.disable();
        L.DomUtil.removeClass(this._marker._icon, 'leaflet-marker-draggable');
      },
      moved: function() {
        return this._draggable && this._draggable._moved;
      },
      _onDragStart: function() {
        this._marker.closePopup().fire('movestart').fire('dragstart');
      },
      _onDrag: function() {
        var marker = this._marker,
            shadow = marker._shadow,
            iconPos = L.DomUtil.getPosition(marker._icon),
            latlng = marker._map.layerPointToLatLng(iconPos);
        if (shadow) {
          L.DomUtil.setPosition(shadow, iconPos);
        }
        marker._latlng = latlng;
        marker.fire('move', {latlng: latlng}).fire('drag');
      },
      _onDragEnd: function(e) {
        this._marker.fire('moveend').fire('dragend', e);
      }
    });
    L.Control = L.Class.extend({
      options: {position: 'topright'},
      initialize: function(options) {
        L.setOptions(this, options);
      },
      getPosition: function() {
        return this.options.position;
      },
      setPosition: function(position) {
        var map = this._map;
        if (map) {
          map.removeControl(this);
        }
        this.options.position = position;
        if (map) {
          map.addControl(this);
        }
        return this;
      },
      getContainer: function() {
        return this._container;
      },
      addTo: function(map) {
        this._map = map;
        var container = this._container = this.onAdd(map),
            pos = this.getPosition(),
            corner = map._controlCorners[pos];
        L.DomUtil.addClass(container, 'leaflet-control');
        if (pos.indexOf('bottom') !== -1) {
          corner.insertBefore(container, corner.firstChild);
        } else {
          corner.appendChild(container);
        }
        return this;
      },
      removeFrom: function(map) {
        var pos = this.getPosition(),
            corner = map._controlCorners[pos];
        corner.removeChild(this._container);
        this._map = null;
        if (this.onRemove) {
          this.onRemove(map);
        }
        return this;
      },
      _refocusOnMap: function() {
        if (this._map) {
          this._map.getContainer().focus();
        }
      }
    });
    L.control = function(options) {
      return new L.Control(options);
    };
    L.Map.include({
      addControl: function(control) {
        control.addTo(this);
        return this;
      },
      removeControl: function(control) {
        control.removeFrom(this);
        return this;
      },
      _initControlPos: function() {
        var corners = this._controlCorners = {},
            l = 'leaflet-',
            container = this._controlContainer = L.DomUtil.create('div', l + 'control-container', this._container);
        function createCorner(vSide, hSide) {
          var className = l + vSide + ' ' + l + hSide;
          corners[vSide + hSide] = L.DomUtil.create('div', className, container);
        }
        createCorner('top', 'left');
        createCorner('top', 'right');
        createCorner('bottom', 'left');
        createCorner('bottom', 'right');
      },
      _clearControlPos: function() {
        this._container.removeChild(this._controlContainer);
      }
    });
    L.Control.Zoom = L.Control.extend({
      options: {
        position: 'topleft',
        zoomInText: '+',
        zoomInTitle: 'Zoom in',
        zoomOutText: '-',
        zoomOutTitle: 'Zoom out'
      },
      onAdd: function(map) {
        var zoomName = 'leaflet-control-zoom',
            container = L.DomUtil.create('div', zoomName + ' leaflet-bar');
        this._map = map;
        this._zoomInButton = this._createButton(this.options.zoomInText, this.options.zoomInTitle, zoomName + '-in', container, this._zoomIn, this);
        this._zoomOutButton = this._createButton(this.options.zoomOutText, this.options.zoomOutTitle, zoomName + '-out', container, this._zoomOut, this);
        this._updateDisabled();
        map.on('zoomend zoomlevelschange', this._updateDisabled, this);
        return container;
      },
      onRemove: function(map) {
        map.off('zoomend zoomlevelschange', this._updateDisabled, this);
      },
      _zoomIn: function(e) {
        this._map.zoomIn(e.shiftKey ? 3 : 1);
      },
      _zoomOut: function(e) {
        this._map.zoomOut(e.shiftKey ? 3 : 1);
      },
      _createButton: function(html, title, className, container, fn, context) {
        var link = L.DomUtil.create('a', className, container);
        link.innerHTML = html;
        link.href = '#';
        link.title = title;
        var stop = L.DomEvent.stopPropagation;
        L.DomEvent.on(link, 'click', stop).on(link, 'mousedown', stop).on(link, 'dblclick', stop).on(link, 'click', L.DomEvent.preventDefault).on(link, 'click', fn, context).on(link, 'click', this._refocusOnMap, context);
        return link;
      },
      _updateDisabled: function() {
        var map = this._map,
            className = 'leaflet-disabled';
        L.DomUtil.removeClass(this._zoomInButton, className);
        L.DomUtil.removeClass(this._zoomOutButton, className);
        if (map._zoom === map.getMinZoom()) {
          L.DomUtil.addClass(this._zoomOutButton, className);
        }
        if (map._zoom === map.getMaxZoom()) {
          L.DomUtil.addClass(this._zoomInButton, className);
        }
      }
    });
    L.Map.mergeOptions({zoomControl: true});
    L.Map.addInitHook(function() {
      if (this.options.zoomControl) {
        this.zoomControl = new L.Control.Zoom();
        this.addControl(this.zoomControl);
      }
    });
    L.control.zoom = function(options) {
      return new L.Control.Zoom(options);
    };
    L.Control.Attribution = L.Control.extend({
      options: {
        position: 'bottomright',
        prefix: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
      },
      initialize: function(options) {
        L.setOptions(this, options);
        this._attributions = {};
      },
      onAdd: function(map) {
        this._container = L.DomUtil.create('div', 'leaflet-control-attribution');
        L.DomEvent.disableClickPropagation(this._container);
        for (var i in map._layers) {
          if (map._layers[i].getAttribution) {
            this.addAttribution(map._layers[i].getAttribution());
          }
        }
        map.on('layeradd', this._onLayerAdd, this).on('layerremove', this._onLayerRemove, this);
        this._update();
        return this._container;
      },
      onRemove: function(map) {
        map.off('layeradd', this._onLayerAdd).off('layerremove', this._onLayerRemove);
      },
      setPrefix: function(prefix) {
        this.options.prefix = prefix;
        this._update();
        return this;
      },
      addAttribution: function(text) {
        if (!text) {
          return;
        }
        if (!this._attributions[text]) {
          this._attributions[text] = 0;
        }
        this._attributions[text]++;
        this._update();
        return this;
      },
      removeAttribution: function(text) {
        if (!text) {
          return;
        }
        if (this._attributions[text]) {
          this._attributions[text]--;
          this._update();
        }
        return this;
      },
      _update: function() {
        if (!this._map) {
          return;
        }
        var attribs = [];
        for (var i in this._attributions) {
          if (this._attributions[i]) {
            attribs.push(i);
          }
        }
        var prefixAndAttribs = [];
        if (this.options.prefix) {
          prefixAndAttribs.push(this.options.prefix);
        }
        if (attribs.length) {
          prefixAndAttribs.push(attribs.join(', '));
        }
        this._container.innerHTML = prefixAndAttribs.join(' | ');
      },
      _onLayerAdd: function(e) {
        if (e.layer.getAttribution) {
          this.addAttribution(e.layer.getAttribution());
        }
      },
      _onLayerRemove: function(e) {
        if (e.layer.getAttribution) {
          this.removeAttribution(e.layer.getAttribution());
        }
      }
    });
    L.Map.mergeOptions({attributionControl: true});
    L.Map.addInitHook(function() {
      if (this.options.attributionControl) {
        this.attributionControl = (new L.Control.Attribution()).addTo(this);
      }
    });
    L.control.attribution = function(options) {
      return new L.Control.Attribution(options);
    };
    L.Control.Scale = L.Control.extend({
      options: {
        position: 'bottomleft',
        maxWidth: 100,
        metric: true,
        imperial: true,
        updateWhenIdle: false
      },
      onAdd: function(map) {
        this._map = map;
        var className = 'leaflet-control-scale',
            container = L.DomUtil.create('div', className),
            options = this.options;
        this._addScales(options, className, container);
        map.on(options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
        map.whenReady(this._update, this);
        return container;
      },
      onRemove: function(map) {
        map.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
      },
      _addScales: function(options, className, container) {
        if (options.metric) {
          this._mScale = L.DomUtil.create('div', className + '-line', container);
        }
        if (options.imperial) {
          this._iScale = L.DomUtil.create('div', className + '-line', container);
        }
      },
      _update: function() {
        var bounds = this._map.getBounds(),
            centerLat = bounds.getCenter().lat,
            halfWorldMeters = 6378137 * Math.PI * Math.cos(centerLat * Math.PI / 180),
            dist = halfWorldMeters * (bounds.getNorthEast().lng - bounds.getSouthWest().lng) / 180,
            size = this._map.getSize(),
            options = this.options,
            maxMeters = 0;
        if (size.x > 0) {
          maxMeters = dist * (options.maxWidth / size.x);
        }
        this._updateScales(options, maxMeters);
      },
      _updateScales: function(options, maxMeters) {
        if (options.metric && maxMeters) {
          this._updateMetric(maxMeters);
        }
        if (options.imperial && maxMeters) {
          this._updateImperial(maxMeters);
        }
      },
      _updateMetric: function(maxMeters) {
        var meters = this._getRoundNum(maxMeters);
        this._mScale.style.width = this._getScaleWidth(meters / maxMeters) + 'px';
        this._mScale.innerHTML = meters < 1000 ? meters + ' m' : (meters / 1000) + ' km';
      },
      _updateImperial: function(maxMeters) {
        var maxFeet = maxMeters * 3.2808399,
            scale = this._iScale,
            maxMiles,
            miles,
            feet;
        if (maxFeet > 5280) {
          maxMiles = maxFeet / 5280;
          miles = this._getRoundNum(maxMiles);
          scale.style.width = this._getScaleWidth(miles / maxMiles) + 'px';
          scale.innerHTML = miles + ' mi';
        } else {
          feet = this._getRoundNum(maxFeet);
          scale.style.width = this._getScaleWidth(feet / maxFeet) + 'px';
          scale.innerHTML = feet + ' ft';
        }
      },
      _getScaleWidth: function(ratio) {
        return Math.round(this.options.maxWidth * ratio) - 10;
      },
      _getRoundNum: function(num) {
        var pow10 = Math.pow(10, (Math.floor(num) + '').length - 1),
            d = num / pow10;
        d = d >= 10 ? 10 : d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1;
        return pow10 * d;
      }
    });
    L.control.scale = function(options) {
      return new L.Control.Scale(options);
    };
    L.Control.Layers = L.Control.extend({
      options: {
        collapsed: true,
        position: 'topright',
        autoZIndex: true
      },
      initialize: function(baseLayers, overlays, options) {
        L.setOptions(this, options);
        this._layers = {};
        this._lastZIndex = 0;
        this._handlingClick = false;
        for (var i in baseLayers) {
          this._addLayer(baseLayers[i], i);
        }
        for (i in overlays) {
          this._addLayer(overlays[i], i, true);
        }
      },
      onAdd: function(map) {
        this._initLayout();
        this._update();
        map.on('layeradd', this._onLayerChange, this).on('layerremove', this._onLayerChange, this);
        return this._container;
      },
      onRemove: function(map) {
        map.off('layeradd', this._onLayerChange, this).off('layerremove', this._onLayerChange, this);
      },
      addBaseLayer: function(layer, name) {
        this._addLayer(layer, name);
        this._update();
        return this;
      },
      addOverlay: function(layer, name) {
        this._addLayer(layer, name, true);
        this._update();
        return this;
      },
      removeLayer: function(layer) {
        var id = L.stamp(layer);
        delete this._layers[id];
        this._update();
        return this;
      },
      _initLayout: function() {
        var className = 'leaflet-control-layers',
            container = this._container = L.DomUtil.create('div', className);
        container.setAttribute('aria-haspopup', true);
        if (!L.Browser.touch) {
          L.DomEvent.disableClickPropagation(container).disableScrollPropagation(container);
        } else {
          L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
        }
        var form = this._form = L.DomUtil.create('form', className + '-list');
        if (this.options.collapsed) {
          if (!L.Browser.android) {
            L.DomEvent.on(container, 'mouseover', this._expand, this).on(container, 'mouseout', this._collapse, this);
          }
          var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
          link.href = '#';
          link.title = 'Layers';
          if (L.Browser.touch) {
            L.DomEvent.on(link, 'click', L.DomEvent.stop).on(link, 'click', this._expand, this);
          } else {
            L.DomEvent.on(link, 'focus', this._expand, this);
          }
          L.DomEvent.on(form, 'click', function() {
            setTimeout(L.bind(this._onInputClick, this), 0);
          }, this);
          this._map.on('click', this._collapse, this);
        } else {
          this._expand();
        }
        this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
        this._separator = L.DomUtil.create('div', className + '-separator', form);
        this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);
        container.appendChild(form);
      },
      _addLayer: function(layer, name, overlay) {
        var id = L.stamp(layer);
        this._layers[id] = {
          layer: layer,
          name: name,
          overlay: overlay
        };
        if (this.options.autoZIndex && layer.setZIndex) {
          this._lastZIndex++;
          layer.setZIndex(this._lastZIndex);
        }
      },
      _update: function() {
        if (!this._container) {
          return;
        }
        this._baseLayersList.innerHTML = '';
        this._overlaysList.innerHTML = '';
        var baseLayersPresent = false,
            overlaysPresent = false,
            i,
            obj;
        for (i in this._layers) {
          obj = this._layers[i];
          this._addItem(obj);
          overlaysPresent = overlaysPresent || obj.overlay;
          baseLayersPresent = baseLayersPresent || !obj.overlay;
        }
        this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
      },
      _onLayerChange: function(e) {
        var obj = this._layers[L.stamp(e.layer)];
        if (!obj) {
          return;
        }
        if (!this._handlingClick) {
          this._update();
        }
        var type = obj.overlay ? (e.type === 'layeradd' ? 'overlayadd' : 'overlayremove') : (e.type === 'layeradd' ? 'baselayerchange' : null);
        if (type) {
          this._map.fire(type, obj);
        }
      },
      _createRadioElement: function(name, checked) {
        var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' + name + '"';
        if (checked) {
          radioHtml += ' checked="checked"';
        }
        radioHtml += '/>';
        var radioFragment = document.createElement('div');
        radioFragment.innerHTML = radioHtml;
        return radioFragment.firstChild;
      },
      _addItem: function(obj) {
        var label = document.createElement('label'),
            input,
            checked = this._map.hasLayer(obj.layer);
        if (obj.overlay) {
          input = document.createElement('input');
          input.type = 'checkbox';
          input.className = 'leaflet-control-layers-selector';
          input.defaultChecked = checked;
        } else {
          input = this._createRadioElement('leaflet-base-layers', checked);
        }
        input.layerId = L.stamp(obj.layer);
        L.DomEvent.on(input, 'click', this._onInputClick, this);
        var name = document.createElement('span');
        name.innerHTML = ' ' + obj.name;
        label.appendChild(input);
        label.appendChild(name);
        var container = obj.overlay ? this._overlaysList : this._baseLayersList;
        container.appendChild(label);
        return label;
      },
      _onInputClick: function() {
        var i,
            input,
            obj,
            inputs = this._form.getElementsByTagName('input'),
            inputsLen = inputs.length;
        this._handlingClick = true;
        for (i = 0; i < inputsLen; i++) {
          input = inputs[i];
          obj = this._layers[input.layerId];
          if (input.checked && !this._map.hasLayer(obj.layer)) {
            this._map.addLayer(obj.layer);
          } else if (!input.checked && this._map.hasLayer(obj.layer)) {
            this._map.removeLayer(obj.layer);
          }
        }
        this._handlingClick = false;
        this._refocusOnMap();
      },
      _expand: function() {
        L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
      },
      _collapse: function() {
        this._container.className = this._container.className.replace(' leaflet-control-layers-expanded', '');
      }
    });
    L.control.layers = function(baseLayers, overlays, options) {
      return new L.Control.Layers(baseLayers, overlays, options);
    };
    L.PosAnimation = L.Class.extend({
      includes: L.Mixin.Events,
      run: function(el, newPos, duration, easeLinearity) {
        this.stop();
        this._el = el;
        this._inProgress = true;
        this._newPos = newPos;
        this.fire('start');
        el.style[L.DomUtil.TRANSITION] = 'all ' + (duration || 0.25) + 's cubic-bezier(0,0,' + (easeLinearity || 0.5) + ',1)';
        L.DomEvent.on(el, L.DomUtil.TRANSITION_END, this._onTransitionEnd, this);
        L.DomUtil.setPosition(el, newPos);
        L.Util.falseFn(el.offsetWidth);
        this._stepTimer = setInterval(L.bind(this._onStep, this), 50);
      },
      stop: function() {
        if (!this._inProgress) {
          return;
        }
        L.DomUtil.setPosition(this._el, this._getPos());
        this._onTransitionEnd();
        L.Util.falseFn(this._el.offsetWidth);
      },
      _onStep: function() {
        var stepPos = this._getPos();
        if (!stepPos) {
          this._onTransitionEnd();
          return;
        }
        this._el._leaflet_pos = stepPos;
        this.fire('step');
      },
      _transformRe: /([-+]?(?:\d*\.)?\d+)\D*, ([-+]?(?:\d*\.)?\d+)\D*\)/,
      _getPos: function() {
        var left,
            top,
            matches,
            el = this._el,
            style = window.getComputedStyle(el);
        if (L.Browser.any3d) {
          matches = style[L.DomUtil.TRANSFORM].match(this._transformRe);
          if (!matches) {
            return;
          }
          left = parseFloat(matches[1]);
          top = parseFloat(matches[2]);
        } else {
          left = parseFloat(style.left);
          top = parseFloat(style.top);
        }
        return new L.Point(left, top, true);
      },
      _onTransitionEnd: function() {
        L.DomEvent.off(this._el, L.DomUtil.TRANSITION_END, this._onTransitionEnd, this);
        if (!this._inProgress) {
          return;
        }
        this._inProgress = false;
        this._el.style[L.DomUtil.TRANSITION] = '';
        this._el._leaflet_pos = this._newPos;
        clearInterval(this._stepTimer);
        this.fire('step').fire('end');
      }
    });
    L.Map.include({
      setView: function(center, zoom, options) {
        zoom = zoom === undefined ? this._zoom : this._limitZoom(zoom);
        center = this._limitCenter(L.latLng(center), zoom, this.options.maxBounds);
        options = options || {};
        if (this._panAnim) {
          this._panAnim.stop();
        }
        if (this._loaded && !options.reset && options !== true) {
          if (options.animate !== undefined) {
            options.zoom = L.extend({animate: options.animate}, options.zoom);
            options.pan = L.extend({animate: options.animate}, options.pan);
          }
          var animated = (this._zoom !== zoom) ? this._tryAnimatedZoom && this._tryAnimatedZoom(center, zoom, options.zoom) : this._tryAnimatedPan(center, options.pan);
          if (animated) {
            clearTimeout(this._sizeTimer);
            return this;
          }
        }
        this._resetView(center, zoom);
        return this;
      },
      panBy: function(offset, options) {
        offset = L.point(offset).round();
        options = options || {};
        if (!offset.x && !offset.y) {
          return this;
        }
        if (!this._panAnim) {
          this._panAnim = new L.PosAnimation();
          this._panAnim.on({
            'step': this._onPanTransitionStep,
            'end': this._onPanTransitionEnd
          }, this);
        }
        if (!options.noMoveStart) {
          this.fire('movestart');
        }
        if (options.animate !== false) {
          L.DomUtil.addClass(this._mapPane, 'leaflet-pan-anim');
          var newPos = this._getMapPanePos().subtract(offset);
          this._panAnim.run(this._mapPane, newPos, options.duration || 0.25, options.easeLinearity);
        } else {
          this._rawPanBy(offset);
          this.fire('move').fire('moveend');
        }
        return this;
      },
      _onPanTransitionStep: function() {
        this.fire('move');
      },
      _onPanTransitionEnd: function() {
        L.DomUtil.removeClass(this._mapPane, 'leaflet-pan-anim');
        this.fire('moveend');
      },
      _tryAnimatedPan: function(center, options) {
        var offset = this._getCenterOffset(center)._floor();
        if ((options && options.animate) !== true && !this.getSize().contains(offset)) {
          return false;
        }
        this.panBy(offset, options);
        return true;
      }
    });
    L.PosAnimation = L.DomUtil.TRANSITION ? L.PosAnimation : L.PosAnimation.extend({
      run: function(el, newPos, duration, easeLinearity) {
        this.stop();
        this._el = el;
        this._inProgress = true;
        this._duration = duration || 0.25;
        this._easeOutPower = 1 / Math.max(easeLinearity || 0.5, 0.2);
        this._startPos = L.DomUtil.getPosition(el);
        this._offset = newPos.subtract(this._startPos);
        this._startTime = +new Date();
        this.fire('start');
        this._animate();
      },
      stop: function() {
        if (!this._inProgress) {
          return;
        }
        this._step();
        this._complete();
      },
      _animate: function() {
        this._animId = L.Util.requestAnimFrame(this._animate, this);
        this._step();
      },
      _step: function() {
        var elapsed = (+new Date()) - this._startTime,
            duration = this._duration * 1000;
        if (elapsed < duration) {
          this._runFrame(this._easeOut(elapsed / duration));
        } else {
          this._runFrame(1);
          this._complete();
        }
      },
      _runFrame: function(progress) {
        var pos = this._startPos.add(this._offset.multiplyBy(progress));
        L.DomUtil.setPosition(this._el, pos);
        this.fire('step');
      },
      _complete: function() {
        L.Util.cancelAnimFrame(this._animId);
        this._inProgress = false;
        this.fire('end');
      },
      _easeOut: function(t) {
        return 1 - Math.pow(1 - t, this._easeOutPower);
      }
    });
    L.Map.mergeOptions({
      zoomAnimation: true,
      zoomAnimationThreshold: 4
    });
    if (L.DomUtil.TRANSITION) {
      L.Map.addInitHook(function() {
        this._zoomAnimated = this.options.zoomAnimation && L.DomUtil.TRANSITION && L.Browser.any3d && !L.Browser.android23 && !L.Browser.mobileOpera;
        if (this._zoomAnimated) {
          L.DomEvent.on(this._mapPane, L.DomUtil.TRANSITION_END, this._catchTransitionEnd, this);
        }
      });
    }
    L.Map.include(!L.DomUtil.TRANSITION ? {} : {
      _catchTransitionEnd: function(e) {
        if (this._animatingZoom && e.propertyName.indexOf('transform') >= 0) {
          this._onZoomTransitionEnd();
        }
      },
      _nothingToAnimate: function() {
        return !this._container.getElementsByClassName('leaflet-zoom-animated').length;
      },
      _tryAnimatedZoom: function(center, zoom, options) {
        if (this._animatingZoom) {
          return true;
        }
        options = options || {};
        if (!this._zoomAnimated || options.animate === false || this._nothingToAnimate() || Math.abs(zoom - this._zoom) > this.options.zoomAnimationThreshold) {
          return false;
        }
        var scale = this.getZoomScale(zoom),
            offset = this._getCenterOffset(center)._divideBy(1 - 1 / scale),
            origin = this._getCenterLayerPoint()._add(offset);
        if (options.animate !== true && !this.getSize().contains(offset)) {
          return false;
        }
        this.fire('movestart').fire('zoomstart');
        this._animateZoom(center, zoom, origin, scale, null, true);
        return true;
      },
      _animateZoom: function(center, zoom, origin, scale, delta, backwards, forTouchZoom) {
        if (!forTouchZoom) {
          this._animatingZoom = true;
        }
        L.DomUtil.addClass(this._mapPane, 'leaflet-zoom-anim');
        this._animateToCenter = center;
        this._animateToZoom = zoom;
        if (L.Draggable) {
          L.Draggable._disabled = true;
        }
        L.Util.requestAnimFrame(function() {
          this.fire('zoomanim', {
            center: center,
            zoom: zoom,
            origin: origin,
            scale: scale,
            delta: delta,
            backwards: backwards
          });
          setTimeout(L.bind(this._onZoomTransitionEnd, this), 250);
        }, this);
      },
      _onZoomTransitionEnd: function() {
        if (!this._animatingZoom) {
          return;
        }
        this._animatingZoom = false;
        L.DomUtil.removeClass(this._mapPane, 'leaflet-zoom-anim');
        L.Util.requestAnimFrame(function() {
          this._resetView(this._animateToCenter, this._animateToZoom, true, true);
          if (L.Draggable) {
            L.Draggable._disabled = false;
          }
        }, this);
      }
    });
    L.TileLayer.include({
      _animateZoom: function(e) {
        if (!this._animating) {
          this._animating = true;
          this._prepareBgBuffer();
        }
        var bg = this._bgBuffer,
            transform = L.DomUtil.TRANSFORM,
            initialTransform = e.delta ? L.DomUtil.getTranslateString(e.delta) : bg.style[transform],
            scaleStr = L.DomUtil.getScaleString(e.scale, e.origin);
        bg.style[transform] = e.backwards ? scaleStr + ' ' + initialTransform : initialTransform + ' ' + scaleStr;
      },
      _endZoomAnim: function() {
        var front = this._tileContainer,
            bg = this._bgBuffer;
        front.style.visibility = '';
        front.parentNode.appendChild(front);
        L.Util.falseFn(bg.offsetWidth);
        var zoom = this._map.getZoom();
        if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
          this._clearBgBuffer();
        }
        this._animating = false;
      },
      _clearBgBuffer: function() {
        var map = this._map;
        if (map && !map._animatingZoom && !map.touchZoom._zooming) {
          this._bgBuffer.innerHTML = '';
          this._bgBuffer.style[L.DomUtil.TRANSFORM] = '';
        }
      },
      _prepareBgBuffer: function() {
        var front = this._tileContainer,
            bg = this._bgBuffer;
        var bgLoaded = this._getLoadedTilesPercentage(bg),
            frontLoaded = this._getLoadedTilesPercentage(front);
        if (bg && bgLoaded > 0.5 && frontLoaded < 0.5) {
          front.style.visibility = 'hidden';
          this._stopLoadingImages(front);
          return;
        }
        bg.style.visibility = 'hidden';
        bg.style[L.DomUtil.TRANSFORM] = '';
        this._tileContainer = bg;
        bg = this._bgBuffer = front;
        this._stopLoadingImages(bg);
        clearTimeout(this._clearBgBufferTimer);
      },
      _getLoadedTilesPercentage: function(container) {
        var tiles = container.getElementsByTagName('img'),
            i,
            len,
            count = 0;
        for (i = 0, len = tiles.length; i < len; i++) {
          if (tiles[i].complete) {
            count++;
          }
        }
        return count / len;
      },
      _stopLoadingImages: function(container) {
        var tiles = Array.prototype.slice.call(container.getElementsByTagName('img')),
            i,
            len,
            tile;
        for (i = 0, len = tiles.length; i < len; i++) {
          tile = tiles[i];
          if (!tile.complete) {
            tile.onload = L.Util.falseFn;
            tile.onerror = L.Util.falseFn;
            tile.src = L.Util.emptyImageUrl;
            tile.parentNode.removeChild(tile);
          }
        }
      }
    });
    L.Map.include({
      _defaultLocateOptions: {
        watch: false,
        setView: false,
        maxZoom: Infinity,
        timeout: 10000,
        maximumAge: 0,
        enableHighAccuracy: false
      },
      locate: function(options) {
        options = this._locateOptions = L.extend(this._defaultLocateOptions, options);
        if (!navigator.geolocation) {
          this._handleGeolocationError({
            code: 0,
            message: 'Geolocation not supported.'
          });
          return this;
        }
        var onResponse = L.bind(this._handleGeolocationResponse, this),
            onError = L.bind(this._handleGeolocationError, this);
        if (options.watch) {
          this._locationWatchId = navigator.geolocation.watchPosition(onResponse, onError, options);
        } else {
          navigator.geolocation.getCurrentPosition(onResponse, onError, options);
        }
        return this;
      },
      stopLocate: function() {
        if (navigator.geolocation) {
          navigator.geolocation.clearWatch(this._locationWatchId);
        }
        if (this._locateOptions) {
          this._locateOptions.setView = false;
        }
        return this;
      },
      _handleGeolocationError: function(error) {
        var c = error.code,
            message = error.message || (c === 1 ? 'permission denied' : (c === 2 ? 'position unavailable' : 'timeout'));
        if (this._locateOptions.setView && !this._loaded) {
          this.fitWorld();
        }
        this.fire('locationerror', {
          code: c,
          message: 'Geolocation error: ' + message + '.'
        });
      },
      _handleGeolocationResponse: function(pos) {
        var lat = pos.coords.latitude,
            lng = pos.coords.longitude,
            latlng = new L.LatLng(lat, lng),
            latAccuracy = 180 * pos.coords.accuracy / 40075017,
            lngAccuracy = latAccuracy / Math.cos(L.LatLng.DEG_TO_RAD * lat),
            bounds = L.latLngBounds([lat - latAccuracy, lng - lngAccuracy], [lat + latAccuracy, lng + lngAccuracy]),
            options = this._locateOptions;
        if (options.setView) {
          var zoom = Math.min(this.getBoundsZoom(bounds), options.maxZoom);
          this.setView(latlng, zoom);
        }
        var data = {
          latlng: latlng,
          bounds: bounds,
          timestamp: pos.timestamp
        };
        for (var i in pos.coords) {
          if (typeof pos.coords[i] === 'number') {
            data[i] = pos.coords[i];
          }
        }
        this.fire('locationfound', data);
      }
    });
  }(window, document));
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:leaflet@0.7.7", ["npm:leaflet@0.7.7/dist/leaflet-src"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:leaflet@0.7.7/dist/leaflet-src');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("github:shramov/leaflet-plugins@1.4.2/control/Distance", [], false, function(__require, __exports, __module) {
  var _retrieveGlobal = System.get("@@global-helpers").prepareGlobal(__module.id, null, null);
  (function() {
    L.Control.Distance = L.Control.extend({
      options: {
        position: 'topleft',
        popups: true
      },
      initialize: function(options) {
        L.Util.setOptions(this, options);
        this._line = new L.Polyline([], {editable: true});
        this._line.on('edit', this._update, this);
        this._line.on('click', function(e) {});
        this._active = false;
      },
      getLine: function() {
        return this._line;
      },
      onAdd: function(map) {
        var className = 'leaflet-control-distance',
            container = this._container = L.DomUtil.create('div', className);
        function cb() {
          if (this._active)
            this._calc_disable();
          else
            this._calc_enable();
        }
        var link = this._link = this._createButton('Edit', 'leaflet-control-distance leaflet-control-distance-edit', container, cb, this);
        var del = this._link_delete = this._createButton('Delete', 'leaflet-control-distance leaflet-control-distance-delete', container, this._reset, this);
        var text = this._text = L.DomUtil.create('div', 'leaflet-control-distance-text', container);
        this._map.addLayer(this._line);
        this._calc_disable();
        return container;
      },
      _createButton: function(title, className, container, fn, context) {
        var link = L.DomUtil.create('a', className, container);
        link.href = '#';
        link.title = title;
        L.DomEvent.addListener(link, 'click', L.DomEvent.stopPropagation).addListener(link, 'click', L.DomEvent.preventDefault).addListener(link, 'click', fn, context);
        return link;
      },
      onRemove: function(map) {
        this._calc_disable();
      },
      _calc_enable: function() {
        this._map.on('click', this._add_point, this);
        this._map.getContainer().style.cursor = 'crosshair';
        L.DomUtil.addClass(this._link, 'leaflet-control-distance-active');
        this._container.appendChild(this._link_delete);
        this._container.appendChild(this._text);
        this._active = true;
        this._line.editing.enable();
        if (!this._map.hasLayer(this._line))
          this._map.addLayer(this._line);
        this._update();
      },
      _calc_disable: function() {
        this._map.off('click', this._add_point, this);
        this._map.getContainer().style.cursor = 'default';
        this._container.removeChild(this._link_delete);
        this._container.removeChild(this._text);
        L.DomUtil.removeClass(this._link, 'leaflet-control-distance-active');
        this._active = false;
        this._line.editing.disable();
      },
      _add_point: function(e) {
        var len = this._line.getLatLngs().length;
        this._line.addLatLng(e.latlng);
        this._line.editing.updateMarkers();
        this._line.fire('edit', {});
      },
      _reset: function(e) {
        this._line.setLatLngs([]);
        this._line.fire('edit', {});
        this._line.redraw();
        this._line.editing.updateMarkers();
      },
      _update: function(e) {
        this._text.textContent = this._d2txt(this._distance_calc());
      },
      _d2txt: function(d) {
        if (d < 2000)
          return d.toFixed(0) + ' m';
        else
          return (d / 1000).toFixed(1) + ' km';
      },
      _distance_calc: function(e) {
        var ll = this._line.getLatLngs();
        var d = 0,
            p = null;
        for (var i = 0; i < ll.length; i++) {
          if (i)
            d += p.distanceTo(ll[i]);
          if (this.options.popups) {
            var m = this._line.editing._markers[i];
            if (m) {
              m.bindPopup(this._d2txt(d));
              m.on('mouseover', m.openPopup, m);
              m.on('mouseout', m.closePopup, m);
            }
          }
          p = ll[i];
        }
        return d;
      }
    });
  })();
  return _retrieveGlobal();
});

System.registerDynamic("github:shramov/leaflet-plugins@1.4.2", ["github:shramov/leaflet-plugins@1.4.2/control/Distance"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('github:shramov/leaflet-plugins@1.4.2/control/Distance');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:process@0.11.2/browser", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var process = module.exports = {};
  var queue = [];
  var draining = false;
  var currentQueue;
  var queueIndex = -1;
  function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
      queue = currentQueue.concat(queue);
    } else {
      queueIndex = -1;
    }
    if (queue.length) {
      drainQueue();
    }
  }
  function drainQueue() {
    if (draining) {
      return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;
    var len = queue.length;
    while (len) {
      currentQueue = queue;
      queue = [];
      while (++queueIndex < len) {
        if (currentQueue) {
          currentQueue[queueIndex].run();
        }
      }
      queueIndex = -1;
      len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
  }
  process.nextTick = function(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i];
      }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
      setTimeout(drainQueue, 0);
    }
  };
  function Item(fun, array) {
    this.fun = fun;
    this.array = array;
  }
  Item.prototype.run = function() {
    this.fun.apply(null, this.array);
  };
  process.title = 'browser';
  process.browser = true;
  process.env = {};
  process.argv = [];
  process.version = '';
  process.versions = {};
  function noop() {}
  process.on = noop;
  process.addListener = noop;
  process.once = noop;
  process.off = noop;
  process.removeListener = noop;
  process.removeAllListeners = noop;
  process.emit = noop;
  process.binding = function(name) {
    throw new Error('process.binding is not supported');
  };
  process.cwd = function() {
    return '/';
  };
  process.chdir = function(dir) {
    throw new Error('process.chdir is not supported');
  };
  process.umask = function() {
    return 0;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:process@0.11.2", ["npm:process@0.11.2/browser"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:process@0.11.2/browser');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-process@0.1.2/index", ["npm:process@0.11.2"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = System._nodeRequire ? process : $__require('npm:process@0.11.2');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-process@0.1.2", ["github:jspm/nodelibs-process@0.1.2/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('github:jspm/nodelibs-process@0.1.2/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:togeojson@0.13.0/togeojson", ["@empty", "github:jspm/nodelibs-process@0.1.2"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    var toGeoJSON = (function() {
      'use strict';
      var removeSpace = (/\s*/g),
          trimSpace = (/^\s*|\s*$/g),
          splitSpace = (/\s+/);
      function okhash(x) {
        if (!x || !x.length)
          return 0;
        for (var i = 0,
            h = 0; i < x.length; i++) {
          h = ((h << 5) - h) + x.charCodeAt(i) | 0;
        }
        return h;
      }
      function get(x, y) {
        return x.getElementsByTagName(y);
      }
      function attr(x, y) {
        return x.getAttribute(y);
      }
      function attrf(x, y) {
        return parseFloat(attr(x, y));
      }
      function get1(x, y) {
        var n = get(x, y);
        return n.length ? n[0] : null;
      }
      function norm(el) {
        if (el.normalize) {
          el.normalize();
        }
        return el;
      }
      function numarray(x) {
        for (var j = 0,
            o = []; j < x.length; j++) {
          o[j] = parseFloat(x[j]);
        }
        return o;
      }
      function clean(x) {
        var o = {};
        for (var i in x) {
          if (x[i]) {
            o[i] = x[i];
          }
        }
        return o;
      }
      function nodeVal(x) {
        if (x) {
          norm(x);
        }
        return (x && x.textContent) || '';
      }
      function coord1(v) {
        return numarray(v.replace(removeSpace, '').split(','));
      }
      function coord(v) {
        var coords = v.replace(trimSpace, '').split(splitSpace),
            o = [];
        for (var i = 0; i < coords.length; i++) {
          o.push(coord1(coords[i]));
        }
        return o;
      }
      function coordPair(x) {
        var ll = [attrf(x, 'lon'), attrf(x, 'lat')],
            ele = get1(x, 'ele'),
            heartRate = get1(x, 'gpxtpx:hr') || get1(x, 'hr'),
            time = get1(x, 'time'),
            e;
        if (ele) {
          e = parseFloat(nodeVal(ele));
          if (!isNaN(e)) {
            ll.push(e);
          }
        }
        return {
          coordinates: ll,
          time: time ? nodeVal(time) : null,
          heartRate: heartRate ? parseFloat(nodeVal(heartRate)) : null
        };
      }
      function fc() {
        return {
          type: 'FeatureCollection',
          features: []
        };
      }
      var serializer;
      if (typeof XMLSerializer !== 'undefined') {
        serializer = new XMLSerializer();
      } else if (typeof exports === 'object' && typeof process === 'object' && !process.browser) {
        serializer = new ($__require('@empty').XMLSerializer)();
      }
      function xml2str(str) {
        if (str.xml !== undefined)
          return str.xml;
        return serializer.serializeToString(str);
      }
      var t = {
        kml: function(doc) {
          var gj = fc(),
              styleIndex = {},
              geotypes = ['Polygon', 'LineString', 'Point', 'Track', 'gx:Track'],
              placemarks = get(doc, 'Placemark'),
              styles = get(doc, 'Style'),
              styleMaps = get(doc, 'StyleMap');
          for (var k = 0; k < styles.length; k++) {
            styleIndex['#' + attr(styles[k], 'id')] = okhash(xml2str(styles[k])).toString(16);
          }
          for (var l = 0; l < styleMaps.length; l++) {
            styleIndex['#' + attr(styleMaps[l], 'id')] = okhash(xml2str(styleMaps[l])).toString(16);
          }
          for (var j = 0; j < placemarks.length; j++) {
            gj.features = gj.features.concat(getPlacemark(placemarks[j]));
          }
          function kmlColor(v) {
            var color,
                opacity;
            v = v || '';
            if (v.substr(0, 1) === '#') {
              v = v.substr(1);
            }
            if (v.length === 6 || v.length === 3) {
              color = v;
            }
            if (v.length === 8) {
              opacity = parseInt(v.substr(0, 2), 16) / 255;
              color = '#' + v.substr(2);
            }
            return [color, isNaN(opacity) ? undefined : opacity];
          }
          function gxCoord(v) {
            return numarray(v.split(' '));
          }
          function gxCoords(root) {
            var elems = get(root, 'coord', 'gx'),
                coords = [],
                times = [];
            if (elems.length === 0)
              elems = get(root, 'gx:coord');
            for (var i = 0; i < elems.length; i++)
              coords.push(gxCoord(nodeVal(elems[i])));
            var timeElems = get(root, 'when');
            for (var j = 0; j < timeElems.length; j++)
              times.push(nodeVal(timeElems[j]));
            return {
              coords: coords,
              times: times
            };
          }
          function getGeometry(root) {
            var geomNode,
                geomNodes,
                i,
                j,
                k,
                geoms = [],
                coordTimes = [];
            if (get1(root, 'MultiGeometry')) {
              return getGeometry(get1(root, 'MultiGeometry'));
            }
            if (get1(root, 'MultiTrack')) {
              return getGeometry(get1(root, 'MultiTrack'));
            }
            if (get1(root, 'gx:MultiTrack')) {
              return getGeometry(get1(root, 'gx:MultiTrack'));
            }
            for (i = 0; i < geotypes.length; i++) {
              geomNodes = get(root, geotypes[i]);
              if (geomNodes) {
                for (j = 0; j < geomNodes.length; j++) {
                  geomNode = geomNodes[j];
                  if (geotypes[i] === 'Point') {
                    geoms.push({
                      type: 'Point',
                      coordinates: coord1(nodeVal(get1(geomNode, 'coordinates')))
                    });
                  } else if (geotypes[i] === 'LineString') {
                    geoms.push({
                      type: 'LineString',
                      coordinates: coord(nodeVal(get1(geomNode, 'coordinates')))
                    });
                  } else if (geotypes[i] === 'Polygon') {
                    var rings = get(geomNode, 'LinearRing'),
                        coords = [];
                    for (k = 0; k < rings.length; k++) {
                      coords.push(coord(nodeVal(get1(rings[k], 'coordinates'))));
                    }
                    geoms.push({
                      type: 'Polygon',
                      coordinates: coords
                    });
                  } else if (geotypes[i] === 'Track' || geotypes[i] === 'gx:Track') {
                    var track = gxCoords(geomNode);
                    geoms.push({
                      type: 'LineString',
                      coordinates: track.coords
                    });
                    if (track.times.length)
                      coordTimes.push(track.times);
                  }
                }
              }
            }
            return {
              geoms: geoms,
              coordTimes: coordTimes
            };
          }
          function getPlacemark(root) {
            var geomsAndTimes = getGeometry(root),
                i,
                properties = {},
                name = nodeVal(get1(root, 'name')),
                styleUrl = nodeVal(get1(root, 'styleUrl')),
                description = nodeVal(get1(root, 'description')),
                timeSpan = get1(root, 'TimeSpan'),
                extendedData = get1(root, 'ExtendedData'),
                lineStyle = get1(root, 'LineStyle'),
                polyStyle = get1(root, 'PolyStyle');
            if (!geomsAndTimes.geoms.length)
              return [];
            if (name)
              properties.name = name;
            if (styleUrl[0] !== '#') {
              styleUrl = '#' + styleUrl;
            }
            if (styleUrl && styleIndex[styleUrl]) {
              properties.styleUrl = styleUrl;
              properties.styleHash = styleIndex[styleUrl];
            }
            if (description)
              properties.description = description;
            if (timeSpan) {
              var begin = nodeVal(get1(timeSpan, 'begin'));
              var end = nodeVal(get1(timeSpan, 'end'));
              properties.timespan = {
                begin: begin,
                end: end
              };
            }
            if (lineStyle) {
              var linestyles = kmlColor(nodeVal(get1(lineStyle, 'color'))),
                  color = linestyles[0],
                  opacity = linestyles[1],
                  width = parseFloat(nodeVal(get1(lineStyle, 'width')));
              if (color)
                properties.stroke = color;
              if (!isNaN(opacity))
                properties['stroke-opacity'] = opacity;
              if (!isNaN(width))
                properties['stroke-width'] = width;
            }
            if (polyStyle) {
              var polystyles = kmlColor(nodeVal(get1(polyStyle, 'color'))),
                  pcolor = polystyles[0],
                  popacity = polystyles[1],
                  fill = nodeVal(get1(polyStyle, 'fill')),
                  outline = nodeVal(get1(polyStyle, 'outline'));
              if (pcolor)
                properties.fill = pcolor;
              if (!isNaN(popacity))
                properties['fill-opacity'] = popacity;
              if (fill)
                properties['fill-opacity'] = fill === '1' ? 1 : 0;
              if (outline)
                properties['stroke-opacity'] = outline === '1' ? 1 : 0;
            }
            if (extendedData) {
              var datas = get(extendedData, 'Data'),
                  simpleDatas = get(extendedData, 'SimpleData');
              for (i = 0; i < datas.length; i++) {
                properties[datas[i].getAttribute('name')] = nodeVal(get1(datas[i], 'value'));
              }
              for (i = 0; i < simpleDatas.length; i++) {
                properties[simpleDatas[i].getAttribute('name')] = nodeVal(simpleDatas[i]);
              }
            }
            if (geomsAndTimes.coordTimes.length) {
              properties.coordTimes = (geomsAndTimes.coordTimes.length === 1) ? geomsAndTimes.coordTimes[0] : geomsAndTimes.coordTimes;
            }
            var feature = {
              type: 'Feature',
              geometry: (geomsAndTimes.geoms.length === 1) ? geomsAndTimes.geoms[0] : {
                type: 'GeometryCollection',
                geometries: geomsAndTimes.geoms
              },
              properties: properties
            };
            if (attr(root, 'id'))
              feature.id = attr(root, 'id');
            return [feature];
          }
          return gj;
        },
        gpx: function(doc) {
          var i,
              tracks = get(doc, 'trk'),
              routes = get(doc, 'rte'),
              waypoints = get(doc, 'wpt'),
              gj = fc(),
              feature;
          for (i = 0; i < tracks.length; i++) {
            feature = getTrack(tracks[i]);
            if (feature)
              gj.features.push(feature);
          }
          for (i = 0; i < routes.length; i++) {
            feature = getRoute(routes[i]);
            if (feature)
              gj.features.push(feature);
          }
          for (i = 0; i < waypoints.length; i++) {
            gj.features.push(getPoint(waypoints[i]));
          }
          function getPoints(node, pointname) {
            var pts = get(node, pointname),
                line = [],
                times = [],
                heartRates = [],
                l = pts.length;
            if (l < 2)
              return {};
            for (var i = 0; i < l; i++) {
              var c = coordPair(pts[i]);
              line.push(c.coordinates);
              if (c.time)
                times.push(c.time);
              if (c.heartRate)
                heartRates.push(c.heartRate);
            }
            return {
              line: line,
              times: times,
              heartRates: heartRates
            };
          }
          function getTrack(node) {
            var segments = get(node, 'trkseg'),
                track = [],
                times = [],
                heartRates = [],
                line;
            for (var i = 0; i < segments.length; i++) {
              line = getPoints(segments[i], 'trkpt');
              if (line.line)
                track.push(line.line);
              if (line.times && line.times.length)
                times.push(line.times);
              if (line.heartRates && line.heartRates.length)
                heartRates.push(line.heartRates);
            }
            if (track.length === 0)
              return;
            var properties = getProperties(node);
            if (times.length)
              properties.coordTimes = track.length === 1 ? times[0] : times;
            if (heartRates.length)
              properties.heartRates = track.length === 1 ? heartRates[0] : heartRates;
            return {
              type: 'Feature',
              properties: properties,
              geometry: {
                type: track.length === 1 ? 'LineString' : 'MultiLineString',
                coordinates: track.length === 1 ? track[0] : track
              }
            };
          }
          function getRoute(node) {
            var line = getPoints(node, 'rtept');
            if (!line.line)
              return;
            var routeObj = {
              type: 'Feature',
              properties: getProperties(node),
              geometry: {
                type: 'LineString',
                coordinates: line.line
              }
            };
            return routeObj;
          }
          function getPoint(node) {
            var prop = getProperties(node);
            prop.sym = nodeVal(get1(node, 'sym'));
            return {
              type: 'Feature',
              properties: prop,
              geometry: {
                type: 'Point',
                coordinates: coordPair(node).coordinates
              }
            };
          }
          function getProperties(node) {
            var meta = ['name', 'desc', 'author', 'copyright', 'link', 'time', 'keywords'],
                prop = {},
                k;
            for (k = 0; k < meta.length; k++) {
              prop[meta[k]] = nodeVal(get1(node, meta[k]));
            }
            return clean(prop);
          }
          return gj;
        }
      };
      return t;
    })();
    if (typeof module !== 'undefined')
      module.exports = toGeoJSON;
  })($__require('github:jspm/nodelibs-process@0.1.2'));
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:togeojson@0.13.0", ["npm:togeojson@0.13.0/togeojson"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:togeojson@0.13.0/togeojson');
  global.define = __define;
  return module.exports;
});

(function() {
var _removeDefine = System.get("@@amd-helpers").createDefine();
(function(global) {
  "use strict";
  var IS_WORKER = !global.document && !!global.postMessage,
      IS_PAPA_WORKER = IS_WORKER && /(\?|&)papaworker(=|&|$)/.test(global.location.search),
      LOADED_SYNC = false,
      AUTO_SCRIPT_PATH;
  var workers = {},
      workerIdCounter = 0;
  var Papa = {};
  Papa.parse = CsvToJson;
  Papa.unparse = JsonToCsv;
  Papa.RECORD_SEP = String.fromCharCode(30);
  Papa.UNIT_SEP = String.fromCharCode(31);
  Papa.BYTE_ORDER_MARK = "\ufeff";
  Papa.BAD_DELIMITERS = ["\r", "\n", "\"", Papa.BYTE_ORDER_MARK];
  Papa.WORKERS_SUPPORTED = !IS_WORKER && !!global.Worker;
  Papa.SCRIPT_PATH = null;
  Papa.LocalChunkSize = 1024 * 1024 * 10;
  Papa.RemoteChunkSize = 1024 * 1024 * 5;
  Papa.DefaultDelimiter = ",";
  Papa.Parser = Parser;
  Papa.ParserHandle = ParserHandle;
  Papa.NetworkStreamer = NetworkStreamer;
  Papa.FileStreamer = FileStreamer;
  Papa.StringStreamer = StringStreamer;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Papa;
  } else if (isFunction(global.define) && global.define.amd) {
    define("github:mholt/PapaParse@4.1.2/papaparse", [], function() {
      return Papa;
    });
  } else {
    global.Papa = Papa;
  }
  if (global.jQuery) {
    var $ = global.jQuery;
    $.fn.parse = function(options) {
      var config = options.config || {};
      var queue = [];
      this.each(function(idx) {
        var supported = $(this).prop('tagName').toUpperCase() == "INPUT" && $(this).attr('type').toLowerCase() == "file" && global.FileReader;
        if (!supported || !this.files || this.files.length == 0)
          return true;
        for (var i = 0; i < this.files.length; i++) {
          queue.push({
            file: this.files[i],
            inputElem: this,
            instanceConfig: $.extend({}, config)
          });
        }
      });
      parseNextFile();
      return this;
      function parseNextFile() {
        if (queue.length == 0) {
          if (isFunction(options.complete))
            options.complete();
          return;
        }
        var f = queue[0];
        if (isFunction(options.before)) {
          var returned = options.before(f.file, f.inputElem);
          if (typeof returned === 'object') {
            if (returned.action == "abort") {
              error("AbortError", f.file, f.inputElem, returned.reason);
              return;
            } else if (returned.action == "skip") {
              fileComplete();
              return;
            } else if (typeof returned.config === 'object')
              f.instanceConfig = $.extend(f.instanceConfig, returned.config);
          } else if (returned == "skip") {
            fileComplete();
            return;
          }
        }
        var userCompleteFunc = f.instanceConfig.complete;
        f.instanceConfig.complete = function(results) {
          if (isFunction(userCompleteFunc))
            userCompleteFunc(results, f.file, f.inputElem);
          fileComplete();
        };
        Papa.parse(f.file, f.instanceConfig);
      }
      function error(name, file, elem, reason) {
        if (isFunction(options.error))
          options.error({name: name}, file, elem, reason);
      }
      function fileComplete() {
        queue.splice(0, 1);
        parseNextFile();
      }
    };
  }
  if (IS_PAPA_WORKER) {
    global.onmessage = workerThreadReceivedMessage;
  } else if (Papa.WORKERS_SUPPORTED) {
    AUTO_SCRIPT_PATH = getScriptPath();
    if (!document.body) {
      LOADED_SYNC = true;
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        LOADED_SYNC = true;
      }, true);
    }
  }
  function CsvToJson(_input, _config) {
    _config = _config || {};
    if (_config.worker && Papa.WORKERS_SUPPORTED) {
      var w = newWorker();
      w.userStep = _config.step;
      w.userChunk = _config.chunk;
      w.userComplete = _config.complete;
      w.userError = _config.error;
      _config.step = isFunction(_config.step);
      _config.chunk = isFunction(_config.chunk);
      _config.complete = isFunction(_config.complete);
      _config.error = isFunction(_config.error);
      delete _config.worker;
      w.postMessage({
        input: _input,
        config: _config,
        workerId: w.id
      });
      return;
    }
    var streamer = null;
    if (typeof _input === 'string') {
      if (_config.download)
        streamer = new NetworkStreamer(_config);
      else
        streamer = new StringStreamer(_config);
    } else if ((global.File && _input instanceof File) || _input instanceof Object)
      streamer = new FileStreamer(_config);
    return streamer.stream(_input);
  }
  function JsonToCsv(_input, _config) {
    var _output = "";
    var _fields = [];
    var _quotes = false;
    var _delimiter = ",";
    var _newline = "\r\n";
    unpackConfig();
    if (typeof _input === 'string')
      _input = JSON.parse(_input);
    if (_input instanceof Array) {
      if (!_input.length || _input[0] instanceof Array)
        return serialize(null, _input);
      else if (typeof _input[0] === 'object')
        return serialize(objectKeys(_input[0]), _input);
    } else if (typeof _input === 'object') {
      if (typeof _input.data === 'string')
        _input.data = JSON.parse(_input.data);
      if (_input.data instanceof Array) {
        if (!_input.fields)
          _input.fields = _input.data[0] instanceof Array ? _input.fields : objectKeys(_input.data[0]);
        if (!(_input.data[0] instanceof Array) && typeof _input.data[0] !== 'object')
          _input.data = [_input.data];
      }
      return serialize(_input.fields || [], _input.data || []);
    }
    throw "exception: Unable to serialize unrecognized input";
    function unpackConfig() {
      if (typeof _config !== 'object')
        return;
      if (typeof _config.delimiter === 'string' && _config.delimiter.length == 1 && Papa.BAD_DELIMITERS.indexOf(_config.delimiter) == -1) {
        _delimiter = _config.delimiter;
      }
      if (typeof _config.quotes === 'boolean' || _config.quotes instanceof Array)
        _quotes = _config.quotes;
      if (typeof _config.newline === 'string')
        _newline = _config.newline;
    }
    function objectKeys(obj) {
      if (typeof obj !== 'object')
        return [];
      var keys = [];
      for (var key in obj)
        keys.push(key);
      return keys;
    }
    function serialize(fields, data) {
      var csv = "";
      if (typeof fields === 'string')
        fields = JSON.parse(fields);
      if (typeof data === 'string')
        data = JSON.parse(data);
      var hasHeader = fields instanceof Array && fields.length > 0;
      var dataKeyedByField = !(data[0] instanceof Array);
      if (hasHeader) {
        for (var i = 0; i < fields.length; i++) {
          if (i > 0)
            csv += _delimiter;
          csv += safe(fields[i], i);
        }
        if (data.length > 0)
          csv += _newline;
      }
      for (var row = 0; row < data.length; row++) {
        var maxCol = hasHeader ? fields.length : data[row].length;
        for (var col = 0; col < maxCol; col++) {
          if (col > 0)
            csv += _delimiter;
          var colIdx = hasHeader && dataKeyedByField ? fields[col] : col;
          csv += safe(data[row][colIdx], col);
        }
        if (row < data.length - 1)
          csv += _newline;
      }
      return csv;
    }
    function safe(str, col) {
      if (typeof str === "undefined" || str === null)
        return "";
      str = str.toString().replace(/"/g, '""');
      var needsQuotes = (typeof _quotes === 'boolean' && _quotes) || (_quotes instanceof Array && _quotes[col]) || hasAny(str, Papa.BAD_DELIMITERS) || str.indexOf(_delimiter) > -1 || str.charAt(0) == ' ' || str.charAt(str.length - 1) == ' ';
      return needsQuotes ? '"' + str + '"' : str;
    }
    function hasAny(str, substrings) {
      for (var i = 0; i < substrings.length; i++)
        if (str.indexOf(substrings[i]) > -1)
          return true;
      return false;
    }
  }
  function ChunkStreamer(config) {
    this._handle = null;
    this._paused = false;
    this._finished = false;
    this._input = null;
    this._baseIndex = 0;
    this._partialLine = "";
    this._rowCount = 0;
    this._start = 0;
    this._nextChunk = null;
    this.isFirstChunk = true;
    this._completeResults = {
      data: [],
      errors: [],
      meta: {}
    };
    replaceConfig.call(this, config);
    this.parseChunk = function(chunk) {
      if (this.isFirstChunk && isFunction(this._config.beforeFirstChunk)) {
        var modifiedChunk = this._config.beforeFirstChunk(chunk);
        if (modifiedChunk !== undefined)
          chunk = modifiedChunk;
      }
      this.isFirstChunk = false;
      var aggregate = this._partialLine + chunk;
      this._partialLine = "";
      var results = this._handle.parse(aggregate, this._baseIndex, !this._finished);
      if (this._handle.paused() || this._handle.aborted())
        return;
      var lastIndex = results.meta.cursor;
      if (!this._finished) {
        this._partialLine = aggregate.substring(lastIndex - this._baseIndex);
        this._baseIndex = lastIndex;
      }
      if (results && results.data)
        this._rowCount += results.data.length;
      var finishedIncludingPreview = this._finished || (this._config.preview && this._rowCount >= this._config.preview);
      if (IS_PAPA_WORKER) {
        global.postMessage({
          results: results,
          workerId: Papa.WORKER_ID,
          finished: finishedIncludingPreview
        });
      } else if (isFunction(this._config.chunk)) {
        this._config.chunk(results, this._handle);
        if (this._paused)
          return;
        results = undefined;
        this._completeResults = undefined;
      }
      if (!this._config.step && !this._config.chunk) {
        this._completeResults.data = this._completeResults.data.concat(results.data);
        this._completeResults.errors = this._completeResults.errors.concat(results.errors);
        this._completeResults.meta = results.meta;
      }
      if (finishedIncludingPreview && isFunction(this._config.complete) && (!results || !results.meta.aborted))
        this._config.complete(this._completeResults);
      if (!finishedIncludingPreview && (!results || !results.meta.paused))
        this._nextChunk();
      return results;
    };
    this._sendError = function(error) {
      if (isFunction(this._config.error))
        this._config.error(error);
      else if (IS_PAPA_WORKER && this._config.error) {
        global.postMessage({
          workerId: Papa.WORKER_ID,
          error: error,
          finished: false
        });
      }
    };
    function replaceConfig(config) {
      var configCopy = copy(config);
      configCopy.chunkSize = parseInt(configCopy.chunkSize);
      if (!config.step && !config.chunk)
        configCopy.chunkSize = null;
      this._handle = new ParserHandle(configCopy);
      this._handle.streamer = this;
      this._config = configCopy;
    }
  }
  function NetworkStreamer(config) {
    config = config || {};
    if (!config.chunkSize)
      config.chunkSize = Papa.RemoteChunkSize;
    ChunkStreamer.call(this, config);
    var xhr;
    if (IS_WORKER) {
      this._nextChunk = function() {
        this._readChunk();
        this._chunkLoaded();
      };
    } else {
      this._nextChunk = function() {
        this._readChunk();
      };
    }
    this.stream = function(url) {
      this._input = url;
      this._nextChunk();
    };
    this._readChunk = function() {
      if (this._finished) {
        this._chunkLoaded();
        return;
      }
      xhr = new XMLHttpRequest();
      if (!IS_WORKER) {
        xhr.onload = bindFunction(this._chunkLoaded, this);
        xhr.onerror = bindFunction(this._chunkError, this);
      }
      xhr.open("GET", this._input, !IS_WORKER);
      if (this._config.chunkSize) {
        var end = this._start + this._config.chunkSize - 1;
        xhr.setRequestHeader("Range", "bytes=" + this._start + "-" + end);
        xhr.setRequestHeader("If-None-Match", "webkit-no-cache");
      }
      try {
        xhr.send();
      } catch (err) {
        this._chunkError(err.message);
      }
      if (IS_WORKER && xhr.status == 0)
        this._chunkError();
      else
        this._start += this._config.chunkSize;
    };
    this._chunkLoaded = function() {
      if (xhr.readyState != 4)
        return;
      if (xhr.status < 200 || xhr.status >= 400) {
        this._chunkError();
        return;
      }
      this._finished = !this._config.chunkSize || this._start > getFileSize(xhr);
      this.parseChunk(xhr.responseText);
    };
    this._chunkError = function(errorMessage) {
      var errorText = xhr.statusText || errorMessage;
      this._sendError(errorText);
    };
    function getFileSize(xhr) {
      var contentRange = xhr.getResponseHeader("Content-Range");
      return parseInt(contentRange.substr(contentRange.lastIndexOf("/") + 1));
    }
  }
  NetworkStreamer.prototype = Object.create(ChunkStreamer.prototype);
  NetworkStreamer.prototype.constructor = NetworkStreamer;
  function FileStreamer(config) {
    config = config || {};
    if (!config.chunkSize)
      config.chunkSize = Papa.LocalChunkSize;
    ChunkStreamer.call(this, config);
    var reader,
        slice;
    var usingAsyncReader = typeof FileReader !== 'undefined';
    this.stream = function(file) {
      this._input = file;
      slice = file.slice || file.webkitSlice || file.mozSlice;
      if (usingAsyncReader) {
        reader = new FileReader();
        reader.onload = bindFunction(this._chunkLoaded, this);
        reader.onerror = bindFunction(this._chunkError, this);
      } else
        reader = new FileReaderSync();
      this._nextChunk();
    };
    this._nextChunk = function() {
      if (!this._finished && (!this._config.preview || this._rowCount < this._config.preview))
        this._readChunk();
    };
    this._readChunk = function() {
      var input = this._input;
      if (this._config.chunkSize) {
        var end = Math.min(this._start + this._config.chunkSize, this._input.size);
        input = slice.call(input, this._start, end);
      }
      var txt = reader.readAsText(input, this._config.encoding);
      if (!usingAsyncReader)
        this._chunkLoaded({target: {result: txt}});
    };
    this._chunkLoaded = function(event) {
      this._start += this._config.chunkSize;
      this._finished = !this._config.chunkSize || this._start >= this._input.size;
      this.parseChunk(event.target.result);
    };
    this._chunkError = function() {
      this._sendError(reader.error);
    };
  }
  FileStreamer.prototype = Object.create(ChunkStreamer.prototype);
  FileStreamer.prototype.constructor = FileStreamer;
  function StringStreamer(config) {
    config = config || {};
    ChunkStreamer.call(this, config);
    var string;
    var remaining;
    this.stream = function(s) {
      string = s;
      remaining = s;
      return this._nextChunk();
    };
    this._nextChunk = function() {
      if (this._finished)
        return;
      var size = this._config.chunkSize;
      var chunk = size ? remaining.substr(0, size) : remaining;
      remaining = size ? remaining.substr(size) : '';
      this._finished = !remaining;
      return this.parseChunk(chunk);
    };
  }
  StringStreamer.prototype = Object.create(StringStreamer.prototype);
  StringStreamer.prototype.constructor = StringStreamer;
  function ParserHandle(_config) {
    var FLOAT = /^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i;
    var self = this;
    var _stepCounter = 0;
    var _input;
    var _parser;
    var _paused = false;
    var _aborted = false;
    var _delimiterError;
    var _fields = [];
    var _results = {
      data: [],
      errors: [],
      meta: {}
    };
    if (isFunction(_config.step)) {
      var userStep = _config.step;
      _config.step = function(results) {
        _results = results;
        if (needsHeaderRow())
          processResults();
        else {
          processResults();
          if (_results.data.length == 0)
            return;
          _stepCounter += results.data.length;
          if (_config.preview && _stepCounter > _config.preview)
            _parser.abort();
          else
            userStep(_results, self);
        }
      };
    }
    this.parse = function(input, baseIndex, ignoreLastRow) {
      if (!_config.newline)
        _config.newline = guessLineEndings(input);
      _delimiterError = false;
      if (!_config.delimiter) {
        var delimGuess = guessDelimiter(input);
        if (delimGuess.successful)
          _config.delimiter = delimGuess.bestDelimiter;
        else {
          _delimiterError = true;
          _config.delimiter = Papa.DefaultDelimiter;
        }
        _results.meta.delimiter = _config.delimiter;
      }
      var parserConfig = copy(_config);
      if (_config.preview && _config.header)
        parserConfig.preview++;
      _input = input;
      _parser = new Parser(parserConfig);
      _results = _parser.parse(_input, baseIndex, ignoreLastRow);
      processResults();
      return _paused ? {meta: {paused: true}} : (_results || {meta: {paused: false}});
    };
    this.paused = function() {
      return _paused;
    };
    this.pause = function() {
      _paused = true;
      _parser.abort();
      _input = _input.substr(_parser.getCharIndex());
    };
    this.resume = function() {
      _paused = false;
      self.streamer.parseChunk(_input);
    };
    this.aborted = function() {
      return _aborted;
    };
    this.abort = function() {
      _aborted = true;
      _parser.abort();
      _results.meta.aborted = true;
      if (isFunction(_config.complete))
        _config.complete(_results);
      _input = "";
    };
    function processResults() {
      if (_results && _delimiterError) {
        addError("Delimiter", "UndetectableDelimiter", "Unable to auto-detect delimiting character; defaulted to '" + Papa.DefaultDelimiter + "'");
        _delimiterError = false;
      }
      if (_config.skipEmptyLines) {
        for (var i = 0; i < _results.data.length; i++)
          if (_results.data[i].length == 1 && _results.data[i][0] == "")
            _results.data.splice(i--, 1);
      }
      if (needsHeaderRow())
        fillHeaderFields();
      return applyHeaderAndDynamicTyping();
    }
    function needsHeaderRow() {
      return _config.header && _fields.length == 0;
    }
    function fillHeaderFields() {
      if (!_results)
        return;
      for (var i = 0; needsHeaderRow() && i < _results.data.length; i++)
        for (var j = 0; j < _results.data[i].length; j++)
          _fields.push(_results.data[i][j]);
      _results.data.splice(0, 1);
    }
    function applyHeaderAndDynamicTyping() {
      if (!_results || (!_config.header && !_config.dynamicTyping))
        return _results;
      for (var i = 0; i < _results.data.length; i++) {
        var row = {};
        for (var j = 0; j < _results.data[i].length; j++) {
          if (_config.dynamicTyping) {
            var value = _results.data[i][j];
            if (value == "true" || value == "TRUE")
              _results.data[i][j] = true;
            else if (value == "false" || value == "FALSE")
              _results.data[i][j] = false;
            else
              _results.data[i][j] = tryParseFloat(value);
          }
          if (_config.header) {
            if (j >= _fields.length) {
              if (!row["__parsed_extra"])
                row["__parsed_extra"] = [];
              row["__parsed_extra"].push(_results.data[i][j]);
            } else
              row[_fields[j]] = _results.data[i][j];
          }
        }
        if (_config.header) {
          _results.data[i] = row;
          if (j > _fields.length)
            addError("FieldMismatch", "TooManyFields", "Too many fields: expected " + _fields.length + " fields but parsed " + j, i);
          else if (j < _fields.length)
            addError("FieldMismatch", "TooFewFields", "Too few fields: expected " + _fields.length + " fields but parsed " + j, i);
        }
      }
      if (_config.header && _results.meta)
        _results.meta.fields = _fields;
      return _results;
    }
    function guessDelimiter(input) {
      var delimChoices = [",", "\t", "|", ";", Papa.RECORD_SEP, Papa.UNIT_SEP];
      var bestDelim,
          bestDelta,
          fieldCountPrevRow;
      for (var i = 0; i < delimChoices.length; i++) {
        var delim = delimChoices[i];
        var delta = 0,
            avgFieldCount = 0;
        fieldCountPrevRow = undefined;
        var preview = new Parser({
          delimiter: delim,
          preview: 10
        }).parse(input);
        for (var j = 0; j < preview.data.length; j++) {
          var fieldCount = preview.data[j].length;
          avgFieldCount += fieldCount;
          if (typeof fieldCountPrevRow === 'undefined') {
            fieldCountPrevRow = fieldCount;
            continue;
          } else if (fieldCount > 1) {
            delta += Math.abs(fieldCount - fieldCountPrevRow);
            fieldCountPrevRow = fieldCount;
          }
        }
        if (preview.data.length > 0)
          avgFieldCount /= preview.data.length;
        if ((typeof bestDelta === 'undefined' || delta < bestDelta) && avgFieldCount > 1.99) {
          bestDelta = delta;
          bestDelim = delim;
        }
      }
      _config.delimiter = bestDelim;
      return {
        successful: !!bestDelim,
        bestDelimiter: bestDelim
      };
    }
    function guessLineEndings(input) {
      input = input.substr(0, 1024 * 1024);
      var r = input.split('\r');
      if (r.length == 1)
        return '\n';
      var numWithN = 0;
      for (var i = 0; i < r.length; i++) {
        if (r[i][0] == '\n')
          numWithN++;
      }
      return numWithN >= r.length / 2 ? '\r\n' : '\r';
    }
    function tryParseFloat(val) {
      var isNumber = FLOAT.test(val);
      return isNumber ? parseFloat(val) : val;
    }
    function addError(type, code, msg, row) {
      _results.errors.push({
        type: type,
        code: code,
        message: msg,
        row: row
      });
    }
  }
  function Parser(config) {
    config = config || {};
    var delim = config.delimiter;
    var newline = config.newline;
    var comments = config.comments;
    var step = config.step;
    var preview = config.preview;
    var fastMode = config.fastMode;
    if (typeof delim !== 'string' || Papa.BAD_DELIMITERS.indexOf(delim) > -1)
      delim = ",";
    if (comments === delim)
      throw "Comment character same as delimiter";
    else if (comments === true)
      comments = "#";
    else if (typeof comments !== 'string' || Papa.BAD_DELIMITERS.indexOf(comments) > -1)
      comments = false;
    if (newline != '\n' && newline != '\r' && newline != '\r\n')
      newline = '\n';
    var cursor = 0;
    var aborted = false;
    this.parse = function(input, baseIndex, ignoreLastRow) {
      if (typeof input !== 'string')
        throw "Input must be a string";
      var inputLen = input.length,
          delimLen = delim.length,
          newlineLen = newline.length,
          commentsLen = comments.length;
      var stepIsFunction = typeof step === 'function';
      cursor = 0;
      var data = [],
          errors = [],
          row = [],
          lastCursor = 0;
      if (!input)
        return returnable();
      if (fastMode || (fastMode !== false && input.indexOf('"') === -1)) {
        var rows = input.split(newline);
        for (var i = 0; i < rows.length; i++) {
          var row = rows[i];
          cursor += row.length;
          if (i !== rows.length - 1)
            cursor += newline.length;
          else if (ignoreLastRow)
            return returnable();
          if (comments && row.substr(0, commentsLen) == comments)
            continue;
          if (stepIsFunction) {
            data = [];
            pushRow(row.split(delim));
            doStep();
            if (aborted)
              return returnable();
          } else
            pushRow(row.split(delim));
          if (preview && i >= preview) {
            data = data.slice(0, preview);
            return returnable(true);
          }
        }
        return returnable();
      }
      var nextDelim = input.indexOf(delim, cursor);
      var nextNewline = input.indexOf(newline, cursor);
      for (; ; ) {
        if (input[cursor] == '"') {
          var quoteSearch = cursor;
          cursor++;
          for (; ; ) {
            var quoteSearch = input.indexOf('"', quoteSearch + 1);
            if (quoteSearch === -1) {
              if (!ignoreLastRow) {
                errors.push({
                  type: "Quotes",
                  code: "MissingQuotes",
                  message: "Quoted field unterminated",
                  row: data.length,
                  index: cursor
                });
              }
              return finish();
            }
            if (quoteSearch === inputLen - 1) {
              var value = input.substring(cursor, quoteSearch).replace(/""/g, '"');
              return finish(value);
            }
            if (input[quoteSearch + 1] == '"') {
              quoteSearch++;
              continue;
            }
            if (input[quoteSearch + 1] == delim) {
              row.push(input.substring(cursor, quoteSearch).replace(/""/g, '"'));
              cursor = quoteSearch + 1 + delimLen;
              nextDelim = input.indexOf(delim, cursor);
              nextNewline = input.indexOf(newline, cursor);
              break;
            }
            if (input.substr(quoteSearch + 1, newlineLen) === newline) {
              row.push(input.substring(cursor, quoteSearch).replace(/""/g, '"'));
              saveRow(quoteSearch + 1 + newlineLen);
              nextDelim = input.indexOf(delim, cursor);
              if (stepIsFunction) {
                doStep();
                if (aborted)
                  return returnable();
              }
              if (preview && data.length >= preview)
                return returnable(true);
              break;
            }
          }
          continue;
        }
        if (comments && row.length === 0 && input.substr(cursor, commentsLen) === comments) {
          if (nextNewline == -1)
            return returnable();
          cursor = nextNewline + newlineLen;
          nextNewline = input.indexOf(newline, cursor);
          nextDelim = input.indexOf(delim, cursor);
          continue;
        }
        if (nextDelim !== -1 && (nextDelim < nextNewline || nextNewline === -1)) {
          row.push(input.substring(cursor, nextDelim));
          cursor = nextDelim + delimLen;
          nextDelim = input.indexOf(delim, cursor);
          continue;
        }
        if (nextNewline !== -1) {
          row.push(input.substring(cursor, nextNewline));
          saveRow(nextNewline + newlineLen);
          if (stepIsFunction) {
            doStep();
            if (aborted)
              return returnable();
          }
          if (preview && data.length >= preview)
            return returnable(true);
          continue;
        }
        break;
      }
      return finish();
      function pushRow(row) {
        data.push(row);
        lastCursor = cursor;
      }
      function finish(value) {
        if (ignoreLastRow)
          return returnable();
        if (typeof value === 'undefined')
          value = input.substr(cursor);
        row.push(value);
        cursor = inputLen;
        pushRow(row);
        if (stepIsFunction)
          doStep();
        return returnable();
      }
      function saveRow(newCursor) {
        cursor = newCursor;
        pushRow(row);
        row = [];
        nextNewline = input.indexOf(newline, cursor);
      }
      function returnable(stopped) {
        return {
          data: data,
          errors: errors,
          meta: {
            delimiter: delim,
            linebreak: newline,
            aborted: aborted,
            truncated: !!stopped,
            cursor: lastCursor + (baseIndex || 0)
          }
        };
      }
      function doStep() {
        step(returnable());
        data = [], errors = [];
      }
    };
    this.abort = function() {
      aborted = true;
    };
    this.getCharIndex = function() {
      return cursor;
    };
  }
  function getScriptPath() {
    var scripts = document.getElementsByTagName('script');
    return scripts.length ? scripts[scripts.length - 1].src : '';
  }
  function newWorker() {
    if (!Papa.WORKERS_SUPPORTED)
      return false;
    if (!LOADED_SYNC && Papa.SCRIPT_PATH === null)
      throw new Error('Script path cannot be determined automatically when Papa Parse is loaded asynchronously. ' + 'You need to set Papa.SCRIPT_PATH manually.');
    var workerUrl = Papa.SCRIPT_PATH || AUTO_SCRIPT_PATH;
    workerUrl += (workerUrl.indexOf('?') !== -1 ? '&' : '?') + 'papaworker';
    var w = new global.Worker(workerUrl);
    w.onmessage = mainThreadReceivedMessage;
    w.id = workerIdCounter++;
    workers[w.id] = w;
    return w;
  }
  function mainThreadReceivedMessage(e) {
    var msg = e.data;
    var worker = workers[msg.workerId];
    var aborted = false;
    if (msg.error)
      worker.userError(msg.error, msg.file);
    else if (msg.results && msg.results.data) {
      var abort = function() {
        aborted = true;
        completeWorker(msg.workerId, {
          data: [],
          errors: [],
          meta: {aborted: true}
        });
      };
      var handle = {
        abort: abort,
        pause: notImplemented,
        resume: notImplemented
      };
      if (isFunction(worker.userStep)) {
        for (var i = 0; i < msg.results.data.length; i++) {
          worker.userStep({
            data: [msg.results.data[i]],
            errors: msg.results.errors,
            meta: msg.results.meta
          }, handle);
          if (aborted)
            break;
        }
        delete msg.results;
      } else if (isFunction(worker.userChunk)) {
        worker.userChunk(msg.results, handle, msg.file);
        delete msg.results;
      }
    }
    if (msg.finished && !aborted)
      completeWorker(msg.workerId, msg.results);
  }
  function completeWorker(workerId, results) {
    var worker = workers[workerId];
    if (isFunction(worker.userComplete))
      worker.userComplete(results);
    worker.terminate();
    delete workers[workerId];
  }
  function notImplemented() {
    throw "Not implemented.";
  }
  function workerThreadReceivedMessage(e) {
    var msg = e.data;
    if (typeof Papa.WORKER_ID === 'undefined' && msg)
      Papa.WORKER_ID = msg.workerId;
    if (typeof msg.input === 'string') {
      global.postMessage({
        workerId: Papa.WORKER_ID,
        results: Papa.parse(msg.input, msg.config),
        finished: true
      });
    } else if ((global.File && msg.input instanceof File) || msg.input instanceof Object) {
      var results = Papa.parse(msg.input, msg.config);
      if (results)
        global.postMessage({
          workerId: Papa.WORKER_ID,
          results: results,
          finished: true
        });
    }
  }
  function copy(obj) {
    if (typeof obj !== 'object')
      return obj;
    var cpy = obj instanceof Array ? [] : {};
    for (var key in obj)
      cpy[key] = copy(obj[key]);
    return cpy;
  }
  function bindFunction(f, self) {
    return function() {
      f.apply(self, arguments);
    };
  }
  function isFunction(func) {
    return typeof func === 'function';
  }
})(typeof window !== 'undefined' ? window : this);

_removeDefine();
})();
(function() {
var _removeDefine = System.get("@@amd-helpers").createDefine();
define("github:mholt/PapaParse@4.1.2", ["github:mholt/PapaParse@4.1.2/papaparse"], function(main) {
  return main;
});

_removeDefine();
})();
System.register("npm:font-awesome@4.5.0/css/font-awesome.min.css!github:systemjs/plugin-css@0.1.20", [], function() { return { setters: [], execute: function() {} } });

System.registerDynamic("lib/filelayer/ajaxUtil.js", [], false, function(__require, __exports, __module) {
  var _retrieveGlobal = System.get("@@global-helpers").prepareGlobal(__module.id, null, null);
  (function() {
    this["delay"] = delay;
    this["getFive"] = getFive;
    this["GETWithJQuery"] = GETWithJQuery;
    var ajax = this["ajax"];
    var ajax = {};
    ajax.result = {
      response: {},
      isCorrect: false
    };
    ajax.x = function() {
      if (typeof XMLHttpRequest !== 'undefined') {
        return new XMLHttpRequest();
      }
      var versions = ["MSXML2.XmlHttp.6.0", "MSXML2.XmlHttp.5.0", "MSXML2.XmlHttp.4.0", "MSXML2.XmlHttp.3.0", "MSXML2.XmlHttp.2.0", "Microsoft.XmlHttp"];
      var xhr;
      for (var i = 0; i < versions.length; i++) {
        try {
          xhr = new ActiveXObject(versions[i]);
          return xhr;
        } catch (e) {}
      }
      if (window.XMLHttpRequest)
        return new XMLHttpRequest();
      else
        return false;
    };
    ajax.send = function(url, callback, method, data, sync, dataType) {
      return new Promise(function(resolve, reject) {
        var x = ajax.x();
        x.open(method, url, sync);
        if (method == 'POST') {
          if (dataType.toLowerCase() == 'json') {
            x.setRequestHeader('Content-type', 'application/json; charset=utf-8;');
          }
        }
        x.onreadystatechange = function() {
          if (x.readyState == XMLHttpRequest.DONE) {
            if (x.status == 200 || window.location.href.indexOf("http") == -1) {
              callback(JSON.parse(this.responseText));
            } else if (x.status == 400) {
              console.error('There was an error 400');
              callback(false);
            } else {
              console.error('something else other than 200 was returned');
              callback(false);
            }
          }
        };
        x.send();
      });
    };
    ajax.get = function(url, data, callback, sync) {
      var query = [];
      for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
      }
      ajax.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, sync);
    };
    ajax.post = function(url, data, callback, sync, dataType) {
      if (ajax.checkJQuery) {
        $.ajax({
          url: url,
          type: 'POST',
          data: data,
          dataType: dataType.toLowerCase(),
          success: ajax.processSuccess,
          error: ajax.processError
        });
      } else {
        var query = [];
        for (var key in data) {
          query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        ajax.send(url, function(result) {
          console.info("Response send:" + result.toString());
          callback(result);
        }, 'POST', query.join('&'), sync, dataType).then(function(result) {
          console.info("Response send:" + result.toString());
          callback(result);
        }).catch(function() {});
      }
    };
    ajax.processSuccess = function(data) {
      ajax.result.response = data;
      if (data.status === 'ok') {
        console.info('You just posted some valid GeoJSON!');
        ajax.result.isCorrect = true;
      } else if (data.status === 'error') {
        if (data.message == 'Data was not JSON serializeable.') {
          ajax.result.isCorrect = true;
        } else {
          console.info('There was a problem with your GeoJSON: ' + data.message);
          ajax.result.isCorrect = false;
        }
      }
    };
    ajax.processError = function() {
      console.info('There was a problem with your ajax.');
      ajax.result.isCorrect = false;
    };
    ajax.checkJQuery = window.jQuery || typeof jQuery != 'undefined';
    ajax.wait = function(result) {
      if (result === 'undefined') {
        window.setTimeout(ajax.wait, 500);
      } else {
        return result;
      }
    };
    ajax._validateGeoJson = function(json, callback) {
      try {
        if (typeof json == 'string') {
          json = JSON.stringify(json, undefined, 2);
          json = JSON.parse(json);
        }
        ajax.post('http://geojsonlint.com/validate', json, function(data) {
          callback(data);
        }, false, 'json');
      } catch (e) {
        console.error(e.message);
      }
    };
    function delay(ms) {
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve();
        }, ms);
      });
    }
    function getFive() {
      return delay(100).then(function() {
        return 5;
      });
    }
    function GETWithJQuery(URL) {
      var javaMarker;
      if (arrayMarkerVar.length > 0) {
        removeClusterMarker();
      }
      $.getJSON(URL, function(jsonData) {
        alert("Data Loaded 2: " + jsonData);
      }).done(function(data) {
        try {
          var jsonString = JSON.stringify(data);
          alert("JSON STRING: " + jsonString);
          if ($.isEmptyObject(data.results)) {
            alert("Json array is empty: " + data.results[0]);
          } else if (data.results == undefined || data.results == null || data.results.length == 0 || (data.results.length == 1 && data.results[0] == "")) {
            alert("Json array is empty 2: " + data.results[0]);
          } else {}
          var name = data.results[0].address_components[0].long_name;
          var lat = data.results[0].geometry.location.lat;
          var lng = data.results[0].geometry.location.lng;
          javaMarker = addSingleMarker(name, URL, lat, lng);
          alert("getJSON request succeeded!");
          return javaMarker;
        } catch (e) {
          alert(e.message);
          alert("getJSON request failed!");
        }
        return javaMarker = {
          name: null,
          url: null,
          latitudine: null,
          longitudine: null
        };
      }).fail(function() {
        alert("getJSON request failed!");
        return javaMarker = {
          name: null,
          url: null,
          latitudine: null,
          longitudine: null
        };
      }).always(function() {
        alert("getJSON request ended!");
      });
    }
    this["ajax"] = ajax;
  })();
  return _retrieveGlobal();
});

System.registerDynamic("lib/filelayer/corslite.js", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  function corslite2(url, callback, cors) {
    return corslite2(url, callback, cors, null, null, null, null);
  }
  function corslite2(url, callback) {
    return corslite2(url, callback, true, null, null, null, null);
  }
  function corslite2(url, callback, method, data) {
    return corslite2(url, callback, true, method, data, false, null);
  }
  function corslite2(url, callback, method, data, dataType) {
    return corslite2(url, callback, true, method, data, false, dataType);
  }
  function corslite2(url, callback, cors, method, data, sync, dataType) {
    "use strict";
    var sent = false;
    if (typeof window.XMLHttpRequest === 'undefined') {
      return callback(Error('Browser not supported'));
    }
    if (typeof cors === 'undefined') {
      var m = url.match(/^\s*https?:\/\/[^\/]*/);
      cors = m && (m[0] !== location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : ''));
    }
    var x = function() {
      if (typeof window.XMLHttpRequest !== 'undefined')
        return new XMLHttpRequest();
      else if (window.XMLHttpRequest)
        return new XMLHttpRequest();
      else {
        var versions = ["MSXML2.XmlHttp.6.0", "MSXML2.XmlHttp.5.0", "MSXML2.XmlHttp.4.0", "MSXML2.XmlHttp.3.0", "MSXML2.XmlHttp.2.0", "Microsoft.XmlHttp"];
        var xhr;
        for (var i = 0; i < versions.length; i++) {
          try {
            xhr = new ActiveXObject(versions[i]);
            return xhr;
          } catch (e) {}
        }
        return callback(Error('Browser not supported'));
      }
    };
    function isSuccessful(status) {
      return status >= 200 && status < 300 || status === 304;
    }
    if (cors && !('withCredentials' in x)) {
      x = new window.XDomainRequest();
      var original = callback;
      callback = function() {
        if (sent) {
          original.apply(this, arguments);
        } else {
          var that = this,
              args = arguments;
          setTimeout(function() {
            original.apply(that, args);
          }, 0);
        }
      };
    }
    x.post = function(url, data, callback, sync, dataType) {
      var query = [];
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
      }
      send(url, function(result) {
        callback(result);
      }, 'POST', query.join('&'), sync, dataType).then(function(result) {
        callback(result);
      }).catch(function(reject) {
        callback(reject);
      });
    };
    x.get = function(url, data, callback, sync) {
      var query = [];
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
      }
      send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, sync).then(function(result) {
        callback(result);
      }).catch(function(reject) {
        callback(reject);
      });
    };
    x.send = function(url, callback, method, data, sync, dataType) {
      return new Promise(function(resolve, reject) {
        x.open(method, url, sync);
        if (method == 'POST') {
          if (dataType.toLowerCase() == 'json') {
            x.setRequestHeader('Content-type', 'application/json; charset=utf-8;');
          }
        }
        if ('onload' in x) {
          x.onload = function loadState() {
            if (x.status === undefined || isSuccessful(x.status) || window.location.href.indexOf("http") == -1) {
              resolve(x.response);
              callback.call(x, null, x);
            } else {
              reject(Error(x.statusText));
              callback.call(x, x, null);
            }
          };
        } else {
          x.onreadystatechange = function readystate() {
            if (x.readyState == XMLHttpRequest.DONE) {
              if (x.status === undefined || isSuccessful(x.status) || window.location.href.indexOf("http") == -1) {
                resolve(x.response);
                callback.call(x, null, x);
              } else {
                reject(Error(x.statusText));
                callback.call(x, x, null);
              }
            }
          };
        }
        x.onerror = function() {
          reject(Error("Network Error"));
          callback.call(x, x, null);
        };
        x.send(null);
      });
    };
    if (method == null) {
      x.get(url, null, callback, true);
    } else if (method == 'GET') {
      x.get(url, data, callback, sync);
    } else if (method == 'POST') {
      x.post(url, data, callback, sync, dataType);
    }
    x.onerror = function error(evt) {
      callback.call(this, evt || true, null);
      callback = function() {};
    };
    x.onprogress = function() {};
    x.ontimeout = function(evt) {
      callback.call(this, evt, null);
      callback = function() {};
    };
    x.onabort = function(evt) {
      callback.call(this, evt, null);
      callback = function() {};
    };
    sent = true;
    return x;
  }
  if (typeof module !== 'undefined')
    module.exports = corslite2;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("lib/filelayer/leaflet.filelayer.js", [], false, function(__require, __exports, __module) {
  var _retrieveGlobal = System.get("@@global-helpers").prepareGlobal(__module.id, null, null);
  (function() {
    var FileLoader = this["FileLoader"];
    var newBounds = this["newBounds"];
    var FileLoader = L.Class.extend({
      includes: L.Mixin.Events,
      options: {
        layerOptions: {},
        fileSizeLimit: 1024,
        headers: true,
        latitudeColumn: 'lat',
        longitudeColumn: 'lng',
        titleForSearch: 'title',
        titlesToInspect: [],
        rootTag: {
          root: "Root",
          subRoot: "Row"
        },
        rdfLink: [],
        rdfAbout: 'rdf:about',
        rdfAboutLink: 'rdf:about',
        layer: new L.geoJson(),
        popupTable: false,
        validateGeoJson: false
      },
      initialize: function(map, options) {
        this._map = map;
        L.Util.setOptions(this, options);
        this._parsers = {
          'json': this._loadGeoJSON,
          'geojson': this._loadGeoJSON,
          'gpx': this._convertToGeoJSON,
          'kml': this._convertToGeoJSON,
          'csv': this._csvToGeoJSON,
          'xml': this._XMLToGeoJSON,
          'rdf': this._RDFToGeoJSON,
          'input': this._gtfsToGeoJSON
        };
      },
      load: function(file) {
        var fileSize;
        if (typeof file == 'undefined')
          fileSize = 1024;
        else
          fileSize = (file.size / 1024).toFixed(4);
        if (fileSize > this.options.fileSizeLimit) {
          this.fire('data:error', {error: new Error('File size exceeds limit (' + fileSize + ' > ' + this.options.fileSizeLimit + 'kb)')});
          return;
        }
        if (typeof file === 'undefined') {} else {
          var ext = file.name.split('.').pop();
          if (ext == "zip") {
            try {
              this.fire('data:loading', {
                filename: file.name,
                format: ext
              });
              this.fire('data:loaded', {
                filename: file.name,
                format: ext
              });
            } catch (err) {
              this.fire('data:error', {error: err});
            }
            return this._gtfsZipToGEOJSON1(file);
          } else {
            var parser = this._parsers[ext];
            if (!parser) {
              console.error('Unsupported file type ' + file.type + '(' + ext + ')');
              return;
            }
            var reader = new FileReader();
            reader.onload = L.Util.bind(function(e) {
              try {
                this.fire('data:loading', {
                  filename: file.name,
                  format: ext
                });
                var layer = parser.call(this, e.target.result, ext);
                this.fire('data:loaded', {
                  layer: layer,
                  filename: file.name,
                  format: ext
                });
              } catch (err) {
                console.error(err.message);
              }
            }, this);
            reader.readAsText(file);
            return reader;
          }
        }
      },
      _loadGeoJSON: function(content) {
        if (typeof content == 'string') {
          content = JSON.parse(content);
        }
        var layer = this.options.layer;
        if (layer.getLayers().length > 0) {
          layer.addLayer(new L.geoJson(content, this.options.layerOptions));
        } else {
          try {
            layer = L.geoJson(content, this.options.layerOptions);
          } catch (e) {
            console.error(e.message);
          }
        }
        if (layer.getLayers().length === 0) {
          console.error('GeoJSON has no valid layers.\n' + 'if you try to load a CSV/RDF/XML file make sure to have setted the corrected name of the columns');
        }
        if (this.options.addToMap) {
          layer.addTo(this._map);
        }
        return layer;
      },
      _convertToGeoJSON: function(content, format) {
        if (typeof content == 'string') {
          content = (new window.DOMParser()).parseFromString(content, "text/xml");
        }
        var geojson = toGeoJSON[format](content);
        return this._loadGeoJSON(geojson);
      },
      _csvToGeoJSON: function(content) {
        try {
          if (!this.options.headers) {
            this.fire('data:error', {error: new Error('The file CSV must have the Headers')});
          }
          var json;
          json = Papa.parse(content, {header: this.options.headers});
          this._depth = json.data.length - 1;
          if (this.options.titlesToInspect.length == 0)
            this._titles = json.meta.fields;
          else
            this._titles = this.options.titlesToInspect;
          delete json.errors;
          delete json.meta;
          json = this._addFeatureToJson(json.data);
          return this._loadGeoJSON(json);
        } catch (e) {
          console.error(e.message);
          this.fire('data:error', {error: e});
        }
      },
      _addFeatureToJson: function(json) {
        if (json === null || typeof json === 'undefined' || Object.keys(json).length == 0) {
          console.error("Be sure to add the feature geojson to a Array or a Object of objects.");
          return;
        }
        var titles = this._titles;
        var columnLat = this.options.latitudeColumn;
        var columnLng = this.options.longitudeColumn;
        var popupTable = this.options.popupTable;
        var arrayLatLng = [];
        json = {
          type: "FeatureCollection",
          features: Object.keys(json).map(function(id) {
            var obj = json[id];
            if (obj === null || typeof obj === 'undefined' || id >= Object.keys(json).length - 1) {
              console.warn("Ignore line ", id, " invalid data");
              return;
            } else {
              if (!titles.length > 0)
                titles = Object.keys(obj);
              return {
                type: 'Feature',
                properties: {
                  id: id,
                  title: (function() {
                    for (var search,
                        i = 0; search = titles[i++]; ) {
                      if (titles[i] == search)
                        return obj[search];
                    }
                    return id;
                  })(),
                  popupContent: (function() {
                    var content = '';
                    if (popupTable) {
                      content = '<div class="popup-content">' + '<table class="table table-striped table-bordered table-condensed">';
                    }
                    for (var title,
                        i = 0; title = titles[i++]; ) {
                      try {
                        if (obj.hasOwnProperty(title)) {
                          if (popupTable) {
                            var href = '';
                            if (obj[title].indexOf('http') === 0) {
                              href = '<a target="_blank" href="' + obj[title] + '">' + obj[title] + '</a>';
                            }
                            if (href.length > 0)
                              content += '<tr><th>' + title + '</th><td>' + href + '</td></tr>';
                            else
                              content += '<tr><th>' + title + '</th><td>' + obj[title] + '</td></tr>';
                          } else {
                            content[title] = obj[title];
                          }
                        }
                      } catch (e) {
                        console.warn("Undefined field for the json:" + JSON.stringify(obj) + ",Title:" + title + "->" + e.message);
                      }
                    }
                    if (popupTable)
                      content += "</table></div>";
                    return content;
                  })()
                },
                geometry: {
                  type: "Point",
                  coordinates: (function() {
                    var lng = obj[columnLng].toString();
                    var lat = obj[columnLat].toString();
                    try {
                      if (/[a-z]/.test(lng.toLowerCase()) || /[a-z]/.test(lat.toLowerCase()) || isNaN(lng) || isNaN(lat) || !isFinite(lng) || !isFinite(lat)) {
                        console.warn("Coords lnglat:[" + lng + "," + lat + "] ,id:" + id);
                        return;
                      } else {
                        lng = parseFloat(obj[columnLng]);
                        lat = parseFloat(obj[columnLat]);
                        if (!(lng < 180 && lng > -180 && lat < 90 && lat > -90)) {
                          console.warn("Something wrong with the coordinates, ignore line", id, " invalid data");
                          return;
                        }
                      }
                    } catch (e) {
                      console.warn("Not valid coordinates avoid this line ->" + "Coords:" + lng + "," + lat + ",id:" + id);
                      return;
                    }
                    arrayLatLng.push(new L.LatLng(lat, lng));
                    return [lng, lat];
                  })()
                }
              };
            }
          })
        };
        this._cleanJson(json);
        this._bounds(arrayLatLng);
        if (this.options.validateGeoJson) {
          ajax._validateGeoJson(json, function(message) {
            ajax.processSuccess(message);
          });
          var message = corslite2('http://geojsonlint.com/validate', function(message) {
            console.warn(JSON.stringify(message));
          }, 'POST', json);
          if (ajax.result.isCorrect)
            return json;
          else {
            console.error("The geo json generated is wrong:" + JSON.stringify(ajax.result.response, undefined, 2));
          }
        } else
          return json;
      },
      _RDFToGeoJSON: function(content) {
        try {
          var xml = this._toXML(content);
          var json = this._XMLToJSON(xml);
          for (var i = 0; i < Object.keys(this.options.rootTag).length; i++) {
            json = json[this.options.rootTag[Object.keys(this.options.rootTag)[i]]];
          }
          this._simplifyJson(json);
          this._mergeRdfJson(this._root.data);
          for (i = 0; i < this._root.data.length; i++) {
            if (!(this._root.data[i].hasOwnProperty(this.options.latitudeColumn) && this._root.data[i].hasOwnProperty(this.options.longitudeColumn))) {
              delete this._root.data[i];
            }
          }
          this._depth = this._root.data.length;
          json = this._addFeatureToJson(this._root.data);
          return this._loadGeoJSON(json);
        } catch (e) {
          console.error(e.message);
        }
      },
      _toXML: function(content) {
        var xml;
        try {
          if (window.DOMParser) {
            xml = new DOMParser().parseFromString(content, "text/xml");
          } else {
            try {
              xml = new ActiveXObject("Microsoft.XMLDOM");
              xml.async = false;
              xml.validateOnParse = false;
              xml.resolveExternals = false;
              xml.loadXML(content);
            } catch (e) {
              try {
                Document.prototype.loadXML = function(s) {
                  var doc2 = (new DOMParser()).parseFromString(s, "text/xml");
                  while (this.hasChildNodes()) {
                    this.removeChild(this.lastChild);
                  }
                  for (var i = 0; i < doc2.childNodes.length; i++) {
                    this.appendChild(this.importNode(doc2.childNodes[i], true));
                  }
                };
                xml = document.implementation.createDocument('', '', null);
                xml.loadXML(content);
              } catch (e) {
                this.fire('data:error', {error: new Error(e.message)});
              }
            }
          }
        } catch (e) {
          throw new Error(e.message);
        }
        return xml;
      },
      _XMLToJSON: function(content) {
        var attr,
            child,
            attrs = content.attributes,
            children = content.childNodes,
            key = content.nodeType,
            json = {},
            i = -1;
        if (key == 1 && attrs.length) {
          json[key = '@attributes'] = {};
          while (attr = attrs.item(++i)) {
            json[key][attr.nodeName] = attr.nodeValue;
          }
          i = -1;
        } else if (key == 3) {
          json = content.nodeValue;
        }
        while (child = children.item(++i)) {
          key = child.nodeName;
          if (json.hasOwnProperty(key.toString())) {
            if (json.toString.call(json[key]) != '[object Array]') {
              json[key] = [json[key]];
            }
            json[key].push(this._XMLToJSON(child));
          } else {
            json[key] = this._XMLToJSON(child);
          }
        }
        return json;
      },
      _XMLToGeoJSON: function(content) {
        var xml = this._toXML(content);
        var json = this._XMLToJSON(xml);
        for (var i = 0; i < Object.keys(this.options.rootTag).length; i++) {
          json = json[this.options.rootTag[Object.keys(this.options.rootTag)[i]]];
        }
        this._simplifyJson(json);
        for (i = 0; i < this._root.data.length; i++) {
          if (!(this._root.data[i].hasOwnProperty(this.options.latitudeColumn) && this._root.data[i].hasOwnProperty(this.options.longitudeColumn))) {
            delete this._root.data[i];
          }
        }
        this._depth = this._root.data.length;
        json = this._addFeatureToJson(this._root.data);
        return this._loadGeoJSON(json);
      },
      _simplifyJson: function(json) {
        if (!(Object.prototype.toString.call(json) === '[object Array]')) {
          this.fire('data:error', {error: new Error('Try to simplify a not json array, please re-set your root tag path, ' + 'e.g. xmlRootTag:["some","pathTo","Array"], we need a json array')});
          return;
        }
        var root = {data: []};
        for (var i = 0; i < Object.keys(json).length; i++) {
          var obj;
          if (typeof json[i] === 'undefined')
            break;
          else
            obj = json[i];
          var info = {};
          try {
            var elements;
            if (Object.keys(obj).length > 1)
              elements = Object.keys(obj).toString().split(",");
            else
              elements = Object.keys(obj).toString();
            for (var element,
                k = 0; element = elements[k++]; ) {
              var key,
                  value;
              if (element.toString() == "#text") {
                if (Object.prototype.toString.call(obj[element]) === '[object Array]') {
                  continue;
                } else {
                  key = element;
                  value = obj[element]["#text"];
                }
              } else if (element.toString() == "@attributes") {
                key = Object.keys(obj[element]);
                value = obj[element][key].toString();
              } else {
                key = element;
                value = Object.keys(obj[element]).toString();
                if (value == "@attributes") {
                  value = obj[element]["@attributes"][Object.keys(obj[element]["@attributes"])];
                } else if (value == "#text") {
                  value = obj[element]["#text"];
                } else if (value == "@attributes,#text") {
                  value = obj[element]["#text"];
                  info[key] = value;
                  key = Object.keys(obj[element]["@attributes"]);
                  value = obj[element]["@attributes"][Object.keys(obj[element]["@attributes"])];
                } else {
                  this.fire('data:error', {error: new Error('this stage can\'t be reach from the simplification of the json \n' + 'maybe the function need a update')});
                  return;
                }
              }
              info[key] = value;
            }
            root.data.push(info);
          } catch (e) {
            console.error(e.message);
            this.fire('data:error', {error: new Error('Some error occurred during the simplification of the Json:' + e.message + '1\n')});
            return;
          }
          this._root = root;
        }
      },
      _mergeRdfJson: function(json) {
        try {
          var link = '';
          var mJson = [];
          var xJson;
          for (var i = 0; i < Object.keys(json).length; i++) {
            for (var k = 0; k < Object.keys(this.options.rdfLink).length; k++) {
              if (json[i].hasOwnProperty(this.options.rdfLink[Object.keys(this.options.rdfLink)[k]])) {
                link = json[i][this.options.rdfLink[k]];
                mJson.push(this._searchJsonByKeyAndValue(json, this.options.rdfAboutLink, link));
              }
            }
          }
          for (i = 0; i < Object.keys(json).length; i++) {
            if (mJson[i] != null && json[i] != null) {
              xJson = this._mergeJson(json[i], mJson[i]);
              json.push(xJson);
              delete json[json[i]];
              delete json[mJson[i]];
            }
          }
        } catch (e) {
          this.fire('data:error', {error: new Error('Some error occurred during the simplification of the Json:' + e.message)});
        }
        this._root.data = json;
      },
      _searchJsonByKeyAndValue: function(json, key, value) {
        for (var i = 0; i < json.length; i++) {
          try {
            if (json[i].hasOwnProperty(key)) {
              if (json[i][key] == value) {
                return json[i];
              }
            }
          } catch (e) {
            console.warn(e.message);
          }
        }
      },
      _mergeJson: function(json1, json2) {
        for (var key in json2)
          if (json2.hasOwnProperty(key))
            json1[key] = json2[key];
        return json1;
      },
      _removeNullJson: function(json) {
        var isArray = json instanceof Array;
        for (var k in json) {
          if ((json[k] == null || typeof json[k] === 'undefined') && json.hasOwnProperty(k)) {
            isArray ? json.splice(k, 1) : delete json[k];
          } else if (typeof json[k] == "object" && json.hasOwnProperty(k))
            this._removeNullJson(json[k]);
        }
      },
      _cleanJson: function(json) {
        this._removeNullJson(json);
        var i = json.features.length;
        while (i--) {
          if (typeof json.features[i] === 'undefined' || !json.features[i].geometry.hasOwnProperty("coordinates")) {
            json.features.splice(i, 1);
          }
        }
      },
      _gtfsToGeoJSON: function(content) {
        var shapes = Papa.parse(content, {header: this.options.headers});
        shapes = shapes.data;
        var lookup = {};
        var dintintShape = [];
        for (var item,
            i = 0; item = shapes[i++]; ) {
          var name = item.shape_id;
          if (!(name in lookup)) {
            lookup[name] = 1;
            if (name.length > 0)
              dintintShape.push(name);
          }
        }
        var json = {};
        for (item, i = 0; item = dintintShape[i++]; ) {
          if (item.length > 0 && item != '') {
            json[item] = [];
            for (var k = 0; k < Object.keys(shapes).length; k++) {
              if (shapes[k].shape_id == item)
                json[item].push(shapes[k]);
            }
          }
        }
        json = {
          type: 'FeatureCollection',
          features: Object.keys(json).map(function(id) {
            return {
              type: 'Feature',
              id: id,
              properties: {shape_id: id},
              geometry: {
                type: "GeometryCollection",
                geometries: [{
                  type: "MultiPoint",
                  coordinates: (function() {
                    var coords = [];
                    for (var s = 0; s < Object.keys(json[id]).length; s++) {
                      coords.push([parseFloat(json[id][s].shape_pt_lon), parseFloat(json[id][s].shape_pt_lat)]);
                    }
                    return coords;
                  })()
                }, {
                  type: "LineString",
                  coordinates: json[id].sort(function(a, b) {
                    return +a.shape_pt_sequence - b.shape_pt_sequence;
                  }).map(function(coord) {
                    return [parseFloat(coord.shape_pt_lon), parseFloat(coord.shape_pt_lat)];
                  })
                }]
              }
            };
          })
        };
        return this._loadGeoJSON(json);
      },
      _gtfsZipToGEOJSON1: function(file) {
        parseGtfs(file, {'shapes.txt': load_shapes});
      },
      _gtfsZipToGEOJSON2: function(file) {
        var requestFileSystem = window.webkitRequestFileSystem || window.mozRequestFileSystem || window.requestFileSystem;
        var unzipProgress = document.createElement("progress");
        function createTempFile(callback) {
          var tmpFilename = "tmp.dat";
          requestFileSystem(TEMPORARY, 4 * 1024 * 1024 * 1024, function(filesystem) {
            function create() {
              filesystem.root.getFile(tmpFilename, {create: true}, function(zipFile) {
                callback(zipFile);
              });
            }
            filesystem.root.getFile(tmpFilename, null, function(entry) {
              entry.remove(create, create);
            }, create);
          });
        }
        function download(entry) {
          return getEntryFile(entry, 'RAM', function(blobURL) {
            if (unzipProgress.parentNode)
              unzipProgress.parentNode.removeChild(unzipProgress);
            unzipProgress.value = 0;
            unzipProgress.max = 0;
          }, function(current, total) {
            unzipProgress.value = current;
            unzipProgress.max = total;
          });
        }
        function getEntryFile(entry, creationMethod, onend, onprogress) {
          var URL = entry.webkitURL || entry.mozURL || entry.URL;
          var writer,
              zipFileEntry;
          function getData() {
            entry.getData(writer, function(blob) {
              var blobURL = creationMethod == "Blob" ? URL.createObjectURL(blob) : zipFileEntry.toURL();
              onend(blobURL);
            }, onprogress);
          }
          if (creationMethod == "Blob") {
            writer = new zip.BlobWriter();
            getData();
          } else {
            createTempFile(function(fileEntry) {
              zipFileEntry = fileEntry;
              writer = new zip.FileWriter(zipFileEntry);
              getData();
            });
          }
        }
        var readEntry = function(entry, onend, onprogress) {
          console.log('15:' + JSON.stringify(onend));
          return entry.getData(new zip.TextWriter(), onend, onprogress);
        };
        var getEntries = function(file, callback) {
          try {
            zip.createReader(new zip.BlobReader(file), function(zipReader) {
              return zipReader.getEntries(callback);
            }, onerror);
          } catch (e) {
            console.error(e.message);
          }
        };
        var mapEntries = function(entries, callbackMap) {
          var feedFiles = d3.map();
          var cbMap = d3.map(callbackMap);
          entries.forEach(function(entry) {
            feedFiles.set(entry.filename, entry);
          });
          var markers = cbMap;
          cbMap = [];
          cbMap.push(markers);
          cbMap.forEach(function(fileName, callback) {
            for (var single in fileName) {
              var keys = Object.keys(feedFiles);
              if (fileName.hasOwnProperty(single) && keys.indexOf(single) != -1) {
                console.log('14:' + JSON.stringify(feedFiles[single]));
                var actions = {'shapes.txt': load_shapes};
                return readEntry(feedFiles[single], actions);
              } else {
                console.warn(single + 'does not exist');
              }
            }
          });
        };
        getEntries(file, function(entries) {
          console.log(JSON.stringify(entries));
          mapEntries(entries, {'shapes.txt': file});
        });
        var feature,
            stopMarker,
            shapeHusk,
            stopHusk,
            minLat,
            maxLat,
            minLng,
            maxLng;
        var strokeWidth = 3;
        try {
          var svg = d3.select(map.getPanes().overlayPane).append("svg"),
              stopHuskGroup = svg.append("g").attr("class", "stop-husk-group leaflet-zoom-hide"),
              shapeHuskGroup = svg.append("g").attr("class", "shape-husk-group leaflet-zoom-hide"),
              stopGroup = svg.append("g").attr("class", "stop-group leaflet-zoom-hide"),
              shapeGroup = svg.append("g").attr("class", "shape-group leaflet-zoom-hide");
        } catch (e) {
          console.warn(e.message);
        }
        var pointCache = {};
        var projectPoint = function(point) {
          var key = point[0] + ',' + point[1];
          if (pointCache[key] === undefined) {
            pointCache[key] = map.latLngToLayerPoint(new L.LatLng(point[0], point[1]));
          }
          return pointCache[key];
        };
        try {
          var color = d3.scale.category20();
        } catch (e) {
          console.warn(e.message);
        }
        try {
          var line = d3.svg.line().x(function(d) {
            return projectPoint([d.lat, d.lon]).x;
          }).y(function(d) {
            return projectPoint([d.lat, d.lon]).y;
          });
        } catch (e) {
          console.warn(e.message);
        }
        try {
          var drawShapes = function(shapeRows) {
            pointCache = {};
            var shapes = shapeRows.reduce(combineShapeRows);
            var lats = shapeRows.map(function(shape) {
              return shape.lat;
            });
            var lngs = shapeRows.map(function(shape) {
              return shape.lon;
            });
            minLat = d3.min(lats);
            minLng = d3.min(lngs);
            maxLat = d3.max(lats);
            maxLng = d3.max(lngs);
            var topLeft = projectPoint([maxLat, minLng]);
            var bottomRight = projectPoint([minLat, maxLng]);
            var southWest = L.latLng(minLat, minLng);
            var northEast = L.latLng(maxLat, maxLng);
            var bounds = L.latLngBounds(southWest, northEast);
            topLeft.x = topLeft.x - strokeWidth;
            topLeft.y = topLeft.y - strokeWidth;
            bottomRight.x = bottomRight.x + strokeWidth;
            bottomRight.y = bottomRight.y + strokeWidth;
            svg.attr("width", bottomRight.x - topLeft.x).attr("height", bottomRight.y - topLeft.y).style("left", topLeft.x + "px").style("top", topLeft.y + "px");
            shapeHuskGroup.attr("transform", "translate(" + -topLeft.x + "," + -topLeft.y + ")");
            shapeGroup.attr("transform", "translate(" + -topLeft.x + "," + -topLeft.y + ")");
            shapeHusk = shapeHuskGroup.selectAll('.husk').data(d3.entries(shapes), function(d) {
              return d.key;
            });
            shapeHusk.enter().append('path').attr('class', 'husk').attr("d", function(d) {
              return line(d.value);
            }).style({
              fill: 'none',
              'stroke': '#fff',
              'stroke-width': strokeWidth * 2,
              'stroke-opacity': 1
            });
            shapeHusk.exit().remove();
            feature = shapeGroup.selectAll('.feature').data(d3.entries(shapes), function(d) {
              return d.key;
            });
            feature.enter().append('path').attr('class', 'feature').attr('d', function(d) {
              return line(d.value);
            }).style('stroke', function(d, i) {
              return color(i);
            }).style({
              fill: 'none',
              'stroke-width': strokeWidth,
              'stroke-opacity': 0.5
            });
            feature.exit().remove();
            map.fitBounds(bounds);
          };
        } catch (e) {
          console.warn(e.message);
        }
        try {
          var resetShapes = function() {
            pointCache = {};
            strokeWidth = map.getZoom() < 9 ? 1 : (map.getZoom() - 8);
            var topLeft = projectPoint([maxLat, minLng]);
            var bottomRight = projectPoint([minLat, maxLng]);
            topLeft.x = topLeft.x - strokeWidth;
            topLeft.y = topLeft.y - strokeWidth;
            bottomRight.x = bottomRight.x + strokeWidth;
            bottomRight.y = bottomRight.y + strokeWidth;
            svg.attr("width", bottomRight.x - topLeft.x).attr("height", bottomRight.y - topLeft.y).style("left", topLeft.x + "px").style("top", topLeft.y + "px");
            shapeHuskGroup.attr("transform", "translate(" + -topLeft.x + "," + -topLeft.y + ")");
            shapeGroup.attr("transform", "translate(" + -topLeft.x + "," + -topLeft.y + ")");
            shapeHusk.attr("d", function(d) {
              return line(d.value);
            }).style({'stroke-width': strokeWidth * 2});
            feature.attr("d", function(d) {
              return line(d.value);
            }).style({'stroke-width': strokeWidth});
          };
        } catch (e) {
          console.warn(e.message);
        }
        try {
          var drawStops = function(data) {
            pointCache = {};
            var lats = data.map(function(stop) {
              return stop.lat;
            });
            var lngs = data.map(function(stop) {
              return stop.lon;
            });
            var topLeft = projectPoint([d3.max(lats), d3.min(lngs)]);
            var bottomRight = projectPoint([d3.min(lats), d3.max(lngs)]);
            topLeft.x = topLeft.x - strokeWidth;
            topLeft.y = topLeft.y - strokeWidth;
            bottomRight.x = bottomRight.x + strokeWidth;
            bottomRight.y = bottomRight.y + strokeWidth;
            stopHuskGroup.attr("transform", "translate(" + -topLeft.x + "," + -topLeft.y + ")");
            stopGroup.attr("transform", "translate(" + -topLeft.x + "," + -topLeft.y + ")");
            stopHusk = stopHuskGroup.selectAll('.stop-husk').data(data, function(d) {
              return d.id;
            });
            stopHusk.enter().append('circle').attr('class', 'stop-husk').attr('r', strokeWidth * 2).attr('cx', function(d) {
              return projectPoint([d.lat, d.lon]).x;
            }).attr('cy', function(d) {
              return projectPoint([d.lat, d.lon]).y;
            }).style('fill', '#fff');
            stopHusk.exit().remove();
            stopMarker = stopGroup.selectAll('.stop').data(data, function(d) {
              return d.id;
            });
            stopMarker.enter().append('circle').attr('class', 'stop').attr('r', strokeWidth).attr('cx', function(d) {
              return projectPoint([d.lat, d.lon]).x;
            }).attr('cy', function(d) {
              return projectPoint([d.lat, d.lon]).y;
            }).style('fill', '#35A9FC');
            stopMarker.exit().remove();
          };
        } catch (e) {
          console.warn(e.message);
        }
        try {
          var resetStops = function() {
            pointCache = {};
            strokeWidth = map.getZoom() < 9 ? 1 : (map.getZoom() - 8);
            var topLeft = projectPoint([maxLat, minLng]);
            var bottomRight = projectPoint([minLat, maxLng]);
            topLeft.x = topLeft.x - strokeWidth;
            topLeft.y = topLeft.y - strokeWidth;
            bottomRight.x = bottomRight.x + strokeWidth;
            bottomRight.y = bottomRight.y + strokeWidth;
            stopHuskGroup.attr("transform", "translate(" + -topLeft.x + "," + -topLeft.y + ")");
            stopGroup.attr("transform", "translate(" + -topLeft.x + "," + -topLeft.y + ")");
            stopHusk.attr('r', strokeWidth * 2).attr('cx', function(d) {
              return projectPoint([d.lat, d.lon]).x;
            }).attr('cy', function(d) {
              return projectPoint([d.lat, d.lon]).y;
            });
            stopMarker.attr('r', strokeWidth).attr('cx', function(d) {
              return projectPoint([d.lat, d.lon]).x;
            }).attr('cy', function(d) {
              return projectPoint([d.lat, d.lon]).y;
            });
          };
        } catch (e) {
          console.warn(e.message);
        }
        try {
          var cleanShapeRow = function(row) {
            return {
              id: row.shape_id,
              lat: parseFloat(row.shape_pt_lat),
              lon: parseFloat(row.shape_pt_lon),
              sequence: row.shape_pt_sequence
            };
          };
        } catch (e) {
          console.warn(e.message);
        }
        try {
          var cleanStopRow = function(row) {
            return {
              id: row.stop_id,
              code: row.stop_code,
              lat: parseFloat(row.stop_lat),
              lon: parseFloat(row.stop_lon),
              name: row.stop_name
            };
          };
        } catch (e) {
          console.warn(e.message);
        }
        try {
          var combineShapeRows = function(previous, current, index) {
            if (index === 1) {
              var tmp = {};
              tmp[previous.id] = [previous];
              previous = tmp;
            }
            if (!previous.hasOwnProperty(current.id)) {
              previous[current.id] = [];
            }
            previous[current.id].push(current);
            return previous;
          };
        } catch (e) {
          console.warn(e.message);
        }
        try {
          var load_shapes = function(csv) {
            var data = d3.csv.parse(csv, cleanShapeRow);
            drawShapes(data);
          };
        } catch (e) {
          console.warn(e.message);
        }
        try {
          var load_stops = function(csv) {
            console.warn(JSON.stringify(csv));
            var data = d3.csv.parse(csv, cleanStopRow);
            drawStops(data);
          };
        } catch (e) {
          console.warn(e.message);
        }
      },
      _depth: 0,
      _titles: [],
      _root: {},
      _bounds: function(arrayLatLng) {
        newBounds = new L.LatLngBounds(arrayLatLng);
      }
    });
    var newBounds = {};
    L.Control.FileLayerLoad = L.Control.extend({
      statics: {
        TITLE: 'Load local file (GPX, KML, GeoJSON, CSV, RDF, XML)',
        LABEL: '&#8965;'
      },
      options: {
        position: 'topleft',
        fitBounds: true,
        layerOptions: {},
        addToMap: true,
        fileSizeLimit: 1024
      },
      initialize: function(options) {
        L.Util.setOptions(this, options);
        this.loader = null;
      },
      onAdd: function(map) {
        this.loader = new FileLoader(map, this.options);
        this.loader.on('data:loaded', function(e) {
          if (e.layer == undefined) {
            var layerDefault = L.layerGroup([new L.Marker([0.0])]);
            map.addLayer(layerDefault);
          }
          if (this.options.fitBounds) {
            window.setTimeout(function() {
              try {
                map.fitBounds(e.layer.getBounds());
              } catch (e) {
                try {
                  map.fitBounds(newBounds);
                } catch (e) {
                  console.error(e.message);
                  map.fitBounds(new L.LatLngBounds(L.LatLng([11, 34])));
                }
              }
            }, 500);
          }
        }, this);
        this._initDragAndDrop(map);
        return this._initContainer();
      },
      _initDragAndDrop: function(map) {
        var fileLoader = this.loader,
            dropbox = map._container;
        var callbacks = {
          dragenter: function() {
            map.scrollWheelZoom.disable();
          },
          dragleave: function() {
            map.scrollWheelZoom.enable();
          },
          dragover: function(e) {
            e.stopPropagation();
            e.preventDefault();
          },
          drop: function(e) {
            e.stopPropagation();
            e.preventDefault();
            var files = Array.prototype.slice.apply(e.dataTransfer.files),
                i = files.length;
            setTimeout(function() {
              fileLoader.load(files.shift());
              if (files.length > 0) {
                setTimeout(arguments.callee, 25);
              }
            }, 25);
            map.scrollWheelZoom.enable();
          }
        };
        for (var name in callbacks) {
          dropbox.addEventListener(name, callbacks[name], false);
        }
      },
      _initContainer: function() {
        var zoomName = 'leaflet-control-filelayer leaflet-control-zoom',
            barName = 'leaflet-bar',
            partName = barName + '-part',
            container = L.DomUtil.create('div', zoomName + ' ' + barName);
        var link = L.DomUtil.create('a', zoomName + '-in ' + partName, container);
        link.innerHTML = L.Control.FileLayerLoad.LABEL;
        link.href = '#';
        link.title = L.Control.FileLayerLoad.TITLE;
        var fileInput = L.DomUtil.create('input', 'hidden', container);
        fileInput.type = 'file';
        if (!this.options.formats) {
          fileInput.accept = '.gpx,.kml,.json,.geojson,.csv,.rdf,.xml,.input,.zip';
        } else {
          fileInput.accept = this.options.formats.join(',');
        }
        fileInput.style.display = 'none';
        var fileLoader = this.loader;
        fileInput.addEventListener("change", function(e) {
          fileLoader.load(this.files[0]);
          this.value = '';
        }, false);
        L.DomEvent.disableClickPropagation(link);
        L.DomEvent.on(link, 'click', function(e) {
          fileInput.click();
          e.preventDefault();
        });
        return container;
      }
    });
    L.Control.fileLayerLoad = function(options) {
      return new L.Control.FileLayerLoad(options);
    };
    (function() {
      var readEntry = function(entry, onend, onprogress) {
        entry.getData(new zip.TextWriter(), onend, onprogress);
      };
      var getEntries = function(file, callback) {
        zip.createReader(new zip.BlobReader(file), function(zipReader) {
          zipReader.getEntries(callback);
        }, onerror);
      };
      var mapEntries = function(entries, callbackMap) {
        var feedFiles = d3.map();
        var cbMap = d3.map(callbackMap);
        entries.forEach(function(entry) {
          feedFiles.set(entry.filename, entry);
        });
        cbMap.forEach(function(filename, callback) {
          if (feedFiles.has(filename))
            readEntry(feedFiles.get(filename), callback);
          else
            console.error(filename + ' does not exist');
        });
      };
      window.parseGtfs = function(file, actions) {
        getEntries(file, function(entries) {
          mapEntries(entries, actions);
        });
      };
    })();
    this["FileLoader"] = FileLoader;
    this["newBounds"] = newBounds;
  })();
  return _retrieveGlobal();
});

System.register('lib/main.js', ['npm:leaflet@0.7.7', 'github:shramov/leaflet-plugins@1.4.2', 'npm:togeojson@0.13.0', 'github:mholt/PapaParse@4.1.2', 'npm:font-awesome@4.5.0/css/font-awesome.min.css!github:systemjs/plugin-css@0.1.20', 'lib/filelayer/ajaxUtil.js', 'lib/filelayer/corslite.js', 'lib/filelayer/leaflet.filelayer.js'], function (_export) {
    'use strict';

    /*
    import '../jspm_packages/github/gildas-lormeau/zip.js@master/WebContent/pako/codecs.js';
    import '../jspm_packages/github/gildas-lormeau/zip.js@master/WebContent/zlib-asm/codecs.js'
    import '../jspm_packages/github/gildas-lormeau/zip.js@master/WebContent/deflate.js';
    import '../jspm_packages/github/gildas-lormeau/zip.js@master/WebContent/inflate.js';
    import '../jspm_packages/github/gildas-lormeau/zip.js@master/WebContent/mime-types.js';
    import '../jspm_packages/github/gildas-lormeau/zip.js@master/WebContent/z-worker.js';
    import '../jspm_packages/github/gildas-lormeau/zip.js@master/WebContent/zip.js';
    import '../jspm_packages/github/gildas-lormeau/zip.js@master/WebContent/zip-ext.js'
    import '../jspm_packages/github/gildas-lormeau/zip.js@master/WebContent/zip-fs.js';
    import zip from '../jspm_packages/github/gildas-lormeau/zip.js@master/WebContent/zip.js';
    zip.workerScriptsPath ="../jspm_packages/github/gildas-lormeau/zip.js@master/WebContent/";*/

    var leaflet, osm, map;
    return {
        setters: [function (_npmLeaflet077) {
            leaflet = _npmLeaflet077['default'];
        }, function (_githubShramovLeafletPlugins142) {}, function (_npmTogeojson0130) {}, function (_githubMholtPapaParse412) {}, function (_npmFontAwesome450CssFontAwesomeMinCssGithubSystemjsPluginCss0120) {}, function (_libFilelayerAjaxUtilJs) {}, function (_libFilelayerCorsliteJs) {}, function (_libFilelayerLeafletFilelayerJs) {}],
        execute: function () {
            console.log('is this thing on?');
            console.log('L:' + L);
            console.log('leaflet' + leaflet);
            //use css with jspm
            //import '../jspm_packages/github/Leaflet/Leaflet@0.7.7/dist/leaflet.css!';

            //local import
            // creating archives

            /*var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; 2013 OpenStreetMap contributors'
            });
            
            var map = new L.Map("map", {center: [35.78, -78.68], zoom: 13});
            map.addLayer(osm);*/

            L.Icon.Default.imagePath = 'jspm_packages/npm/leaflet@0.7.7/dist/images';

            osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; 2013 OpenStreetMap contributors'
            });
            map = L.map('map').fitWorld().addLayer(osm);

            map.on('viewreset', function () {
                resetShapes();
                //resetStops();
            });

            /* var map = new L.Map("map", {center: [35.78, -78.68], zoom: 13});
             map.addLayer(osm);*/
            L.Control.FileLayerLoad.LABEL = '<i class="fa fa-folder-open"></i>';
            L.Control.fileLayerLoad({
                fileSizeLimit: 6144,
                //TRY OUT CSV //test file: http://adf.ly/1RnWZd
                /* latitudeColumn: 'lat',
                 longitudeColumn: 'lng',*/

                //TRY OUT XML   //test file: http://adf.ly/1Rqxub
                latitudeColumn: 'Latitude',
                longitudeColumn: 'Longitude',
                rootTag: ["Root", "Row"],

                //TRY OUT RDF/XML  //test file: http://adf.ly/1RnWFd
                /* latitudeColumn: 'geo:lat',
                 longitudeColumn: 'geo:long',
                 rdfLink: ['gr:hasPOS'],
                 rdfAboutLink: 'rdf:about',
                 rootTag: {root:"rdf:RDF",subRoot:"rdf:Description"},*/

                validateGeoJson: false,
                popupTable: true,
                layerOptions: {
                    pointToLayer: function pointToLayer(feature, latlng) {
                        return new L.marker(latlng);
                    },
                    onEachFeature: function onEachFeature(feature, layer) {
                        try {
                            var popupContent = '';
                            if (feature.properties && feature.properties.popupContent) {
                                popupContent = feature.properties.popupContent;
                            }
                            layer.bindPopup(popupContent);
                        } catch (e) {
                            alert(e.message);
                        }
                    }
                }
            }).addTo(map);

            console.log('done all');
        }
    };
});

//import '../lib/filelayer/gtfsExtractor.js';//WORK
System.register('npm:font-awesome@4.5.0/css/font-awesome.min.css!github:systemjs/plugin-css@0.1.20', [], false, function() {});
(function(c){if (typeof document == 'undefined') return; var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})
("/*!\n *  Font Awesome 4.5.0 by @davegandy - http://fontawesome.io - @fontawesome\n *  License - http://fontawesome.io/license (Font: SIL OFL 1.1, CSS: MIT License)\n */@font-face{font-family:FontAwesome;src:url(jspm_packages/npm/font-awesome@4.5.0/fonts/fontawesome-webfont.eot?v=4.5.0);src:url(jspm_packages/npm/font-awesome@4.5.0/fonts/fontawesome-webfont.eot?#iefix&v=4.5.0) format('embedded-opentype'),url(jspm_packages/npm/font-awesome@4.5.0/fonts/fontawesome-webfont.woff2?v=4.5.0) format('woff2'),url(jspm_packages/npm/font-awesome@4.5.0/fonts/fontawesome-webfont.woff?v=4.5.0) format('woff'),url(jspm_packages/npm/font-awesome@4.5.0/fonts/fontawesome-webfont.ttf?v=4.5.0) format('truetype'),url(jspm_packages/npm/font-awesome@4.5.0/fonts/fontawesome-webfont.svg?v=4.5.0#fontawesomeregular) format('svg');font-weight:400;font-style:normal}.fa{display:inline-block;font:normal normal normal 14px/1 FontAwesome;font-size:inherit;text-rendering:auto;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.fa-lg{font-size:1.33333333em;line-height:.75em;vertical-align:-15%}.fa-2x{font-size:2em}.fa-3x{font-size:3em}.fa-4x{font-size:4em}.fa-5x{font-size:5em}.fa-fw{width:1.28571429em;text-align:center}.fa-ul{padding-left:0;margin-left:2.14285714em;list-style-type:none}.fa-ul>li{position:relative}.fa-li{position:absolute;left:-2.14285714em;width:2.14285714em;top:.14285714em;text-align:center}.fa-li.fa-lg{left:-1.85714286em}.fa-border{padding:.2em .25em .15em;border:solid .08em #eee;border-radius:.1em}.fa-pull-left{float:left}.fa-pull-right{float:right}.fa.fa-pull-left{margin-right:.3em}.fa.fa-pull-right{margin-left:.3em}.pull-right{float:right}.pull-left{float:left}.fa.pull-left{margin-right:.3em}.fa.pull-right{margin-left:.3em}.fa-spin{-webkit-animation:fa-spin 2s infinite linear;animation:fa-spin 2s infinite linear}.fa-pulse{-webkit-animation:fa-spin 1s infinite steps(8);animation:fa-spin 1s infinite steps(8)}@-webkit-keyframes fa-spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@keyframes fa-spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}.fa-rotate-90{filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=1);-webkit-transform:rotate(90deg);-ms-transform:rotate(90deg);transform:rotate(90deg)}.fa-rotate-180{filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=2);-webkit-transform:rotate(180deg);-ms-transform:rotate(180deg);transform:rotate(180deg)}.fa-rotate-270{filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=3);-webkit-transform:rotate(270deg);-ms-transform:rotate(270deg);transform:rotate(270deg)}.fa-flip-horizontal{filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1);-webkit-transform:scale(-1,1);-ms-transform:scale(-1,1);transform:scale(-1,1)}.fa-flip-vertical{filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1);-webkit-transform:scale(1,-1);-ms-transform:scale(1,-1);transform:scale(1,-1)}:root .fa-flip-horizontal,:root .fa-flip-vertical,:root .fa-rotate-180,:root .fa-rotate-270,:root .fa-rotate-90{filter:none}.fa-stack{position:relative;display:inline-block;width:2em;height:2em;line-height:2em;vertical-align:middle}.fa-stack-1x,.fa-stack-2x{position:absolute;left:0;width:100%;text-align:center}.fa-stack-1x{line-height:inherit}.fa-stack-2x{font-size:2em}.fa-inverse{color:#fff}.fa-glass:before{content:\"\\f000\"}.fa-music:before{content:\"\\f001\"}.fa-search:before{content:\"\\f002\"}.fa-envelope-o:before{content:\"\\f003\"}.fa-heart:before{content:\"\\f004\"}.fa-star:before{content:\"\\f005\"}.fa-star-o:before{content:\"\\f006\"}.fa-user:before{content:\"\\f007\"}.fa-film:before{content:\"\\f008\"}.fa-th-large:before{content:\"\\f009\"}.fa-th:before{content:\"\\f00a\"}.fa-th-list:before{content:\"\\f00b\"}.fa-check:before{content:\"\\f00c\"}.fa-close:before,.fa-remove:before,.fa-times:before{content:\"\\f00d\"}.fa-search-plus:before{content:\"\\f00e\"}.fa-search-minus:before{content:\"\\f010\"}.fa-power-off:before{content:\"\\f011\"}.fa-signal:before{content:\"\\f012\"}.fa-cog:before,.fa-gear:before{content:\"\\f013\"}.fa-trash-o:before{content:\"\\f014\"}.fa-home:before{content:\"\\f015\"}.fa-file-o:before{content:\"\\f016\"}.fa-clock-o:before{content:\"\\f017\"}.fa-road:before{content:\"\\f018\"}.fa-download:before{content:\"\\f019\"}.fa-arrow-circle-o-down:before{content:\"\\f01a\"}.fa-arrow-circle-o-up:before{content:\"\\f01b\"}.fa-inbox:before{content:\"\\f01c\"}.fa-play-circle-o:before{content:\"\\f01d\"}.fa-repeat:before,.fa-rotate-right:before{content:\"\\f01e\"}.fa-refresh:before{content:\"\\f021\"}.fa-list-alt:before{content:\"\\f022\"}.fa-lock:before{content:\"\\f023\"}.fa-flag:before{content:\"\\f024\"}.fa-headphones:before{content:\"\\f025\"}.fa-volume-off:before{content:\"\\f026\"}.fa-volume-down:before{content:\"\\f027\"}.fa-volume-up:before{content:\"\\f028\"}.fa-qrcode:before{content:\"\\f029\"}.fa-barcode:before{content:\"\\f02a\"}.fa-tag:before{content:\"\\f02b\"}.fa-tags:before{content:\"\\f02c\"}.fa-book:before{content:\"\\f02d\"}.fa-bookmark:before{content:\"\\f02e\"}.fa-print:before{content:\"\\f02f\"}.fa-camera:before{content:\"\\f030\"}.fa-font:before{content:\"\\f031\"}.fa-bold:before{content:\"\\f032\"}.fa-italic:before{content:\"\\f033\"}.fa-text-height:before{content:\"\\f034\"}.fa-text-width:before{content:\"\\f035\"}.fa-align-left:before{content:\"\\f036\"}.fa-align-center:before{content:\"\\f037\"}.fa-align-right:before{content:\"\\f038\"}.fa-align-justify:before{content:\"\\f039\"}.fa-list:before{content:\"\\f03a\"}.fa-dedent:before,.fa-outdent:before{content:\"\\f03b\"}.fa-indent:before{content:\"\\f03c\"}.fa-video-camera:before{content:\"\\f03d\"}.fa-image:before,.fa-photo:before,.fa-picture-o:before{content:\"\\f03e\"}.fa-pencil:before{content:\"\\f040\"}.fa-map-marker:before{content:\"\\f041\"}.fa-adjust:before{content:\"\\f042\"}.fa-tint:before{content:\"\\f043\"}.fa-edit:before,.fa-pencil-square-o:before{content:\"\\f044\"}.fa-share-square-o:before{content:\"\\f045\"}.fa-check-square-o:before{content:\"\\f046\"}.fa-arrows:before{content:\"\\f047\"}.fa-step-backward:before{content:\"\\f048\"}.fa-fast-backward:before{content:\"\\f049\"}.fa-backward:before{content:\"\\f04a\"}.fa-play:before{content:\"\\f04b\"}.fa-pause:before{content:\"\\f04c\"}.fa-stop:before{content:\"\\f04d\"}.fa-forward:before{content:\"\\f04e\"}.fa-fast-forward:before{content:\"\\f050\"}.fa-step-forward:before{content:\"\\f051\"}.fa-eject:before{content:\"\\f052\"}.fa-chevron-left:before{content:\"\\f053\"}.fa-chevron-right:before{content:\"\\f054\"}.fa-plus-circle:before{content:\"\\f055\"}.fa-minus-circle:before{content:\"\\f056\"}.fa-times-circle:before{content:\"\\f057\"}.fa-check-circle:before{content:\"\\f058\"}.fa-question-circle:before{content:\"\\f059\"}.fa-info-circle:before{content:\"\\f05a\"}.fa-crosshairs:before{content:\"\\f05b\"}.fa-times-circle-o:before{content:\"\\f05c\"}.fa-check-circle-o:before{content:\"\\f05d\"}.fa-ban:before{content:\"\\f05e\"}.fa-arrow-left:before{content:\"\\f060\"}.fa-arrow-right:before{content:\"\\f061\"}.fa-arrow-up:before{content:\"\\f062\"}.fa-arrow-down:before{content:\"\\f063\"}.fa-mail-forward:before,.fa-share:before{content:\"\\f064\"}.fa-expand:before{content:\"\\f065\"}.fa-compress:before{content:\"\\f066\"}.fa-plus:before{content:\"\\f067\"}.fa-minus:before{content:\"\\f068\"}.fa-asterisk:before{content:\"\\f069\"}.fa-exclamation-circle:before{content:\"\\f06a\"}.fa-gift:before{content:\"\\f06b\"}.fa-leaf:before{content:\"\\f06c\"}.fa-fire:before{content:\"\\f06d\"}.fa-eye:before{content:\"\\f06e\"}.fa-eye-slash:before{content:\"\\f070\"}.fa-exclamation-triangle:before,.fa-warning:before{content:\"\\f071\"}.fa-plane:before{content:\"\\f072\"}.fa-calendar:before{content:\"\\f073\"}.fa-random:before{content:\"\\f074\"}.fa-comment:before{content:\"\\f075\"}.fa-magnet:before{content:\"\\f076\"}.fa-chevron-up:before{content:\"\\f077\"}.fa-chevron-down:before{content:\"\\f078\"}.fa-retweet:before{content:\"\\f079\"}.fa-shopping-cart:before{content:\"\\f07a\"}.fa-folder:before{content:\"\\f07b\"}.fa-folder-open:before{content:\"\\f07c\"}.fa-arrows-v:before{content:\"\\f07d\"}.fa-arrows-h:before{content:\"\\f07e\"}.fa-bar-chart-o:before,.fa-bar-chart:before{content:\"\\f080\"}.fa-twitter-square:before{content:\"\\f081\"}.fa-facebook-square:before{content:\"\\f082\"}.fa-camera-retro:before{content:\"\\f083\"}.fa-key:before{content:\"\\f084\"}.fa-cogs:before,.fa-gears:before{content:\"\\f085\"}.fa-comments:before{content:\"\\f086\"}.fa-thumbs-o-up:before{content:\"\\f087\"}.fa-thumbs-o-down:before{content:\"\\f088\"}.fa-star-half:before{content:\"\\f089\"}.fa-heart-o:before{content:\"\\f08a\"}.fa-sign-out:before{content:\"\\f08b\"}.fa-linkedin-square:before{content:\"\\f08c\"}.fa-thumb-tack:before{content:\"\\f08d\"}.fa-external-link:before{content:\"\\f08e\"}.fa-sign-in:before{content:\"\\f090\"}.fa-trophy:before{content:\"\\f091\"}.fa-github-square:before{content:\"\\f092\"}.fa-upload:before{content:\"\\f093\"}.fa-lemon-o:before{content:\"\\f094\"}.fa-phone:before{content:\"\\f095\"}.fa-square-o:before{content:\"\\f096\"}.fa-bookmark-o:before{content:\"\\f097\"}.fa-phone-square:before{content:\"\\f098\"}.fa-twitter:before{content:\"\\f099\"}.fa-facebook-f:before,.fa-facebook:before{content:\"\\f09a\"}.fa-github:before{content:\"\\f09b\"}.fa-unlock:before{content:\"\\f09c\"}.fa-credit-card:before{content:\"\\f09d\"}.fa-feed:before,.fa-rss:before{content:\"\\f09e\"}.fa-hdd-o:before{content:\"\\f0a0\"}.fa-bullhorn:before{content:\"\\f0a1\"}.fa-bell:before{content:\"\\f0f3\"}.fa-certificate:before{content:\"\\f0a3\"}.fa-hand-o-right:before{content:\"\\f0a4\"}.fa-hand-o-left:before{content:\"\\f0a5\"}.fa-hand-o-up:before{content:\"\\f0a6\"}.fa-hand-o-down:before{content:\"\\f0a7\"}.fa-arrow-circle-left:before{content:\"\\f0a8\"}.fa-arrow-circle-right:before{content:\"\\f0a9\"}.fa-arrow-circle-up:before{content:\"\\f0aa\"}.fa-arrow-circle-down:before{content:\"\\f0ab\"}.fa-globe:before{content:\"\\f0ac\"}.fa-wrench:before{content:\"\\f0ad\"}.fa-tasks:before{content:\"\\f0ae\"}.fa-filter:before{content:\"\\f0b0\"}.fa-briefcase:before{content:\"\\f0b1\"}.fa-arrows-alt:before{content:\"\\f0b2\"}.fa-group:before,.fa-users:before{content:\"\\f0c0\"}.fa-chain:before,.fa-link:before{content:\"\\f0c1\"}.fa-cloud:before{content:\"\\f0c2\"}.fa-flask:before{content:\"\\f0c3\"}.fa-cut:before,.fa-scissors:before{content:\"\\f0c4\"}.fa-copy:before,.fa-files-o:before{content:\"\\f0c5\"}.fa-paperclip:before{content:\"\\f0c6\"}.fa-floppy-o:before,.fa-save:before{content:\"\\f0c7\"}.fa-square:before{content:\"\\f0c8\"}.fa-bars:before,.fa-navicon:before,.fa-reorder:before{content:\"\\f0c9\"}.fa-list-ul:before{content:\"\\f0ca\"}.fa-list-ol:before{content:\"\\f0cb\"}.fa-strikethrough:before{content:\"\\f0cc\"}.fa-underline:before{content:\"\\f0cd\"}.fa-table:before{content:\"\\f0ce\"}.fa-magic:before{content:\"\\f0d0\"}.fa-truck:before{content:\"\\f0d1\"}.fa-pinterest:before{content:\"\\f0d2\"}.fa-pinterest-square:before{content:\"\\f0d3\"}.fa-google-plus-square:before{content:\"\\f0d4\"}.fa-google-plus:before{content:\"\\f0d5\"}.fa-money:before{content:\"\\f0d6\"}.fa-caret-down:before{content:\"\\f0d7\"}.fa-caret-up:before{content:\"\\f0d8\"}.fa-caret-left:before{content:\"\\f0d9\"}.fa-caret-right:before{content:\"\\f0da\"}.fa-columns:before{content:\"\\f0db\"}.fa-sort:before,.fa-unsorted:before{content:\"\\f0dc\"}.fa-sort-desc:before,.fa-sort-down:before{content:\"\\f0dd\"}.fa-sort-asc:before,.fa-sort-up:before{content:\"\\f0de\"}.fa-envelope:before{content:\"\\f0e0\"}.fa-linkedin:before{content:\"\\f0e1\"}.fa-rotate-left:before,.fa-undo:before{content:\"\\f0e2\"}.fa-gavel:before,.fa-legal:before{content:\"\\f0e3\"}.fa-dashboard:before,.fa-tachometer:before{content:\"\\f0e4\"}.fa-comment-o:before{content:\"\\f0e5\"}.fa-comments-o:before{content:\"\\f0e6\"}.fa-bolt:before,.fa-flash:before{content:\"\\f0e7\"}.fa-sitemap:before{content:\"\\f0e8\"}.fa-umbrella:before{content:\"\\f0e9\"}.fa-clipboard:before,.fa-paste:before{content:\"\\f0ea\"}.fa-lightbulb-o:before{content:\"\\f0eb\"}.fa-exchange:before{content:\"\\f0ec\"}.fa-cloud-download:before{content:\"\\f0ed\"}.fa-cloud-upload:before{content:\"\\f0ee\"}.fa-user-md:before{content:\"\\f0f0\"}.fa-stethoscope:before{content:\"\\f0f1\"}.fa-suitcase:before{content:\"\\f0f2\"}.fa-bell-o:before{content:\"\\f0a2\"}.fa-coffee:before{content:\"\\f0f4\"}.fa-cutlery:before{content:\"\\f0f5\"}.fa-file-text-o:before{content:\"\\f0f6\"}.fa-building-o:before{content:\"\\f0f7\"}.fa-hospital-o:before{content:\"\\f0f8\"}.fa-ambulance:before{content:\"\\f0f9\"}.fa-medkit:before{content:\"\\f0fa\"}.fa-fighter-jet:before{content:\"\\f0fb\"}.fa-beer:before{content:\"\\f0fc\"}.fa-h-square:before{content:\"\\f0fd\"}.fa-plus-square:before{content:\"\\f0fe\"}.fa-angle-double-left:before{content:\"\\f100\"}.fa-angle-double-right:before{content:\"\\f101\"}.fa-angle-double-up:before{content:\"\\f102\"}.fa-angle-double-down:before{content:\"\\f103\"}.fa-angle-left:before{content:\"\\f104\"}.fa-angle-right:before{content:\"\\f105\"}.fa-angle-up:before{content:\"\\f106\"}.fa-angle-down:before{content:\"\\f107\"}.fa-desktop:before{content:\"\\f108\"}.fa-laptop:before{content:\"\\f109\"}.fa-tablet:before{content:\"\\f10a\"}.fa-mobile-phone:before,.fa-mobile:before{content:\"\\f10b\"}.fa-circle-o:before{content:\"\\f10c\"}.fa-quote-left:before{content:\"\\f10d\"}.fa-quote-right:before{content:\"\\f10e\"}.fa-spinner:before{content:\"\\f110\"}.fa-circle:before{content:\"\\f111\"}.fa-mail-reply:before,.fa-reply:before{content:\"\\f112\"}.fa-github-alt:before{content:\"\\f113\"}.fa-folder-o:before{content:\"\\f114\"}.fa-folder-open-o:before{content:\"\\f115\"}.fa-smile-o:before{content:\"\\f118\"}.fa-frown-o:before{content:\"\\f119\"}.fa-meh-o:before{content:\"\\f11a\"}.fa-gamepad:before{content:\"\\f11b\"}.fa-keyboard-o:before{content:\"\\f11c\"}.fa-flag-o:before{content:\"\\f11d\"}.fa-flag-checkered:before{content:\"\\f11e\"}.fa-terminal:before{content:\"\\f120\"}.fa-code:before{content:\"\\f121\"}.fa-mail-reply-all:before,.fa-reply-all:before{content:\"\\f122\"}.fa-star-half-empty:before,.fa-star-half-full:before,.fa-star-half-o:before{content:\"\\f123\"}.fa-location-arrow:before{content:\"\\f124\"}.fa-crop:before{content:\"\\f125\"}.fa-code-fork:before{content:\"\\f126\"}.fa-chain-broken:before,.fa-unlink:before{content:\"\\f127\"}.fa-question:before{content:\"\\f128\"}.fa-info:before{content:\"\\f129\"}.fa-exclamation:before{content:\"\\f12a\"}.fa-superscript:before{content:\"\\f12b\"}.fa-subscript:before{content:\"\\f12c\"}.fa-eraser:before{content:\"\\f12d\"}.fa-puzzle-piece:before{content:\"\\f12e\"}.fa-microphone:before{content:\"\\f130\"}.fa-microphone-slash:before{content:\"\\f131\"}.fa-shield:before{content:\"\\f132\"}.fa-calendar-o:before{content:\"\\f133\"}.fa-fire-extinguisher:before{content:\"\\f134\"}.fa-rocket:before{content:\"\\f135\"}.fa-maxcdn:before{content:\"\\f136\"}.fa-chevron-circle-left:before{content:\"\\f137\"}.fa-chevron-circle-right:before{content:\"\\f138\"}.fa-chevron-circle-up:before{content:\"\\f139\"}.fa-chevron-circle-down:before{content:\"\\f13a\"}.fa-html5:before{content:\"\\f13b\"}.fa-css3:before{content:\"\\f13c\"}.fa-anchor:before{content:\"\\f13d\"}.fa-unlock-alt:before{content:\"\\f13e\"}.fa-bullseye:before{content:\"\\f140\"}.fa-ellipsis-h:before{content:\"\\f141\"}.fa-ellipsis-v:before{content:\"\\f142\"}.fa-rss-square:before{content:\"\\f143\"}.fa-play-circle:before{content:\"\\f144\"}.fa-ticket:before{content:\"\\f145\"}.fa-minus-square:before{content:\"\\f146\"}.fa-minus-square-o:before{content:\"\\f147\"}.fa-level-up:before{content:\"\\f148\"}.fa-level-down:before{content:\"\\f149\"}.fa-check-square:before{content:\"\\f14a\"}.fa-pencil-square:before{content:\"\\f14b\"}.fa-external-link-square:before{content:\"\\f14c\"}.fa-share-square:before{content:\"\\f14d\"}.fa-compass:before{content:\"\\f14e\"}.fa-caret-square-o-down:before,.fa-toggle-down:before{content:\"\\f150\"}.fa-caret-square-o-up:before,.fa-toggle-up:before{content:\"\\f151\"}.fa-caret-square-o-right:before,.fa-toggle-right:before{content:\"\\f152\"}.fa-eur:before,.fa-euro:before{content:\"\\f153\"}.fa-gbp:before{content:\"\\f154\"}.fa-dollar:before,.fa-usd:before{content:\"\\f155\"}.fa-inr:before,.fa-rupee:before{content:\"\\f156\"}.fa-cny:before,.fa-jpy:before,.fa-rmb:before,.fa-yen:before{content:\"\\f157\"}.fa-rouble:before,.fa-rub:before,.fa-ruble:before{content:\"\\f158\"}.fa-krw:before,.fa-won:before{content:\"\\f159\"}.fa-bitcoin:before,.fa-btc:before{content:\"\\f15a\"}.fa-file:before{content:\"\\f15b\"}.fa-file-text:before{content:\"\\f15c\"}.fa-sort-alpha-asc:before{content:\"\\f15d\"}.fa-sort-alpha-desc:before{content:\"\\f15e\"}.fa-sort-amount-asc:before{content:\"\\f160\"}.fa-sort-amount-desc:before{content:\"\\f161\"}.fa-sort-numeric-asc:before{content:\"\\f162\"}.fa-sort-numeric-desc:before{content:\"\\f163\"}.fa-thumbs-up:before{content:\"\\f164\"}.fa-thumbs-down:before{content:\"\\f165\"}.fa-youtube-square:before{content:\"\\f166\"}.fa-youtube:before{content:\"\\f167\"}.fa-xing:before{content:\"\\f168\"}.fa-xing-square:before{content:\"\\f169\"}.fa-youtube-play:before{content:\"\\f16a\"}.fa-dropbox:before{content:\"\\f16b\"}.fa-stack-overflow:before{content:\"\\f16c\"}.fa-instagram:before{content:\"\\f16d\"}.fa-flickr:before{content:\"\\f16e\"}.fa-adn:before{content:\"\\f170\"}.fa-bitbucket:before{content:\"\\f171\"}.fa-bitbucket-square:before{content:\"\\f172\"}.fa-tumblr:before{content:\"\\f173\"}.fa-tumblr-square:before{content:\"\\f174\"}.fa-long-arrow-down:before{content:\"\\f175\"}.fa-long-arrow-up:before{content:\"\\f176\"}.fa-long-arrow-left:before{content:\"\\f177\"}.fa-long-arrow-right:before{content:\"\\f178\"}.fa-apple:before{content:\"\\f179\"}.fa-windows:before{content:\"\\f17a\"}.fa-android:before{content:\"\\f17b\"}.fa-linux:before{content:\"\\f17c\"}.fa-dribbble:before{content:\"\\f17d\"}.fa-skype:before{content:\"\\f17e\"}.fa-foursquare:before{content:\"\\f180\"}.fa-trello:before{content:\"\\f181\"}.fa-female:before{content:\"\\f182\"}.fa-male:before{content:\"\\f183\"}.fa-gittip:before,.fa-gratipay:before{content:\"\\f184\"}.fa-sun-o:before{content:\"\\f185\"}.fa-moon-o:before{content:\"\\f186\"}.fa-archive:before{content:\"\\f187\"}.fa-bug:before{content:\"\\f188\"}.fa-vk:before{content:\"\\f189\"}.fa-weibo:before{content:\"\\f18a\"}.fa-renren:before{content:\"\\f18b\"}.fa-pagelines:before{content:\"\\f18c\"}.fa-stack-exchange:before{content:\"\\f18d\"}.fa-arrow-circle-o-right:before{content:\"\\f18e\"}.fa-arrow-circle-o-left:before{content:\"\\f190\"}.fa-caret-square-o-left:before,.fa-toggle-left:before{content:\"\\f191\"}.fa-dot-circle-o:before{content:\"\\f192\"}.fa-wheelchair:before{content:\"\\f193\"}.fa-vimeo-square:before{content:\"\\f194\"}.fa-try:before,.fa-turkish-lira:before{content:\"\\f195\"}.fa-plus-square-o:before{content:\"\\f196\"}.fa-space-shuttle:before{content:\"\\f197\"}.fa-slack:before{content:\"\\f198\"}.fa-envelope-square:before{content:\"\\f199\"}.fa-wordpress:before{content:\"\\f19a\"}.fa-openid:before{content:\"\\f19b\"}.fa-bank:before,.fa-institution:before,.fa-university:before{content:\"\\f19c\"}.fa-graduation-cap:before,.fa-mortar-board:before{content:\"\\f19d\"}.fa-yahoo:before{content:\"\\f19e\"}.fa-google:before{content:\"\\f1a0\"}.fa-reddit:before{content:\"\\f1a1\"}.fa-reddit-square:before{content:\"\\f1a2\"}.fa-stumbleupon-circle:before{content:\"\\f1a3\"}.fa-stumbleupon:before{content:\"\\f1a4\"}.fa-delicious:before{content:\"\\f1a5\"}.fa-digg:before{content:\"\\f1a6\"}.fa-pied-piper:before{content:\"\\f1a7\"}.fa-pied-piper-alt:before{content:\"\\f1a8\"}.fa-drupal:before{content:\"\\f1a9\"}.fa-joomla:before{content:\"\\f1aa\"}.fa-language:before{content:\"\\f1ab\"}.fa-fax:before{content:\"\\f1ac\"}.fa-building:before{content:\"\\f1ad\"}.fa-child:before{content:\"\\f1ae\"}.fa-paw:before{content:\"\\f1b0\"}.fa-spoon:before{content:\"\\f1b1\"}.fa-cube:before{content:\"\\f1b2\"}.fa-cubes:before{content:\"\\f1b3\"}.fa-behance:before{content:\"\\f1b4\"}.fa-behance-square:before{content:\"\\f1b5\"}.fa-steam:before{content:\"\\f1b6\"}.fa-steam-square:before{content:\"\\f1b7\"}.fa-recycle:before{content:\"\\f1b8\"}.fa-automobile:before,.fa-car:before{content:\"\\f1b9\"}.fa-cab:before,.fa-taxi:before{content:\"\\f1ba\"}.fa-tree:before{content:\"\\f1bb\"}.fa-spotify:before{content:\"\\f1bc\"}.fa-deviantart:before{content:\"\\f1bd\"}.fa-soundcloud:before{content:\"\\f1be\"}.fa-database:before{content:\"\\f1c0\"}.fa-file-pdf-o:before{content:\"\\f1c1\"}.fa-file-word-o:before{content:\"\\f1c2\"}.fa-file-excel-o:before{content:\"\\f1c3\"}.fa-file-powerpoint-o:before{content:\"\\f1c4\"}.fa-file-image-o:before,.fa-file-photo-o:before,.fa-file-picture-o:before{content:\"\\f1c5\"}.fa-file-archive-o:before,.fa-file-zip-o:before{content:\"\\f1c6\"}.fa-file-audio-o:before,.fa-file-sound-o:before{content:\"\\f1c7\"}.fa-file-movie-o:before,.fa-file-video-o:before{content:\"\\f1c8\"}.fa-file-code-o:before{content:\"\\f1c9\"}.fa-vine:before{content:\"\\f1ca\"}.fa-codepen:before{content:\"\\f1cb\"}.fa-jsfiddle:before{content:\"\\f1cc\"}.fa-life-bouy:before,.fa-life-buoy:before,.fa-life-ring:before,.fa-life-saver:before,.fa-support:before{content:\"\\f1cd\"}.fa-circle-o-notch:before{content:\"\\f1ce\"}.fa-ra:before,.fa-rebel:before{content:\"\\f1d0\"}.fa-empire:before,.fa-ge:before{content:\"\\f1d1\"}.fa-git-square:before{content:\"\\f1d2\"}.fa-git:before{content:\"\\f1d3\"}.fa-hacker-news:before,.fa-y-combinator-square:before,.fa-yc-square:before{content:\"\\f1d4\"}.fa-tencent-weibo:before{content:\"\\f1d5\"}.fa-qq:before{content:\"\\f1d6\"}.fa-wechat:before,.fa-weixin:before{content:\"\\f1d7\"}.fa-paper-plane:before,.fa-send:before{content:\"\\f1d8\"}.fa-paper-plane-o:before,.fa-send-o:before{content:\"\\f1d9\"}.fa-history:before{content:\"\\f1da\"}.fa-circle-thin:before{content:\"\\f1db\"}.fa-header:before{content:\"\\f1dc\"}.fa-paragraph:before{content:\"\\f1dd\"}.fa-sliders:before{content:\"\\f1de\"}.fa-share-alt:before{content:\"\\f1e0\"}.fa-share-alt-square:before{content:\"\\f1e1\"}.fa-bomb:before{content:\"\\f1e2\"}.fa-futbol-o:before,.fa-soccer-ball-o:before{content:\"\\f1e3\"}.fa-tty:before{content:\"\\f1e4\"}.fa-binoculars:before{content:\"\\f1e5\"}.fa-plug:before{content:\"\\f1e6\"}.fa-slideshare:before{content:\"\\f1e7\"}.fa-twitch:before{content:\"\\f1e8\"}.fa-yelp:before{content:\"\\f1e9\"}.fa-newspaper-o:before{content:\"\\f1ea\"}.fa-wifi:before{content:\"\\f1eb\"}.fa-calculator:before{content:\"\\f1ec\"}.fa-paypal:before{content:\"\\f1ed\"}.fa-google-wallet:before{content:\"\\f1ee\"}.fa-cc-visa:before{content:\"\\f1f0\"}.fa-cc-mastercard:before{content:\"\\f1f1\"}.fa-cc-discover:before{content:\"\\f1f2\"}.fa-cc-amex:before{content:\"\\f1f3\"}.fa-cc-paypal:before{content:\"\\f1f4\"}.fa-cc-stripe:before{content:\"\\f1f5\"}.fa-bell-slash:before{content:\"\\f1f6\"}.fa-bell-slash-o:before{content:\"\\f1f7\"}.fa-trash:before{content:\"\\f1f8\"}.fa-copyright:before{content:\"\\f1f9\"}.fa-at:before{content:\"\\f1fa\"}.fa-eyedropper:before{content:\"\\f1fb\"}.fa-paint-brush:before{content:\"\\f1fc\"}.fa-birthday-cake:before{content:\"\\f1fd\"}.fa-area-chart:before{content:\"\\f1fe\"}.fa-pie-chart:before{content:\"\\f200\"}.fa-line-chart:before{content:\"\\f201\"}.fa-lastfm:before{content:\"\\f202\"}.fa-lastfm-square:before{content:\"\\f203\"}.fa-toggle-off:before{content:\"\\f204\"}.fa-toggle-on:before{content:\"\\f205\"}.fa-bicycle:before{content:\"\\f206\"}.fa-bus:before{content:\"\\f207\"}.fa-ioxhost:before{content:\"\\f208\"}.fa-angellist:before{content:\"\\f209\"}.fa-cc:before{content:\"\\f20a\"}.fa-ils:before,.fa-shekel:before,.fa-sheqel:before{content:\"\\f20b\"}.fa-meanpath:before{content:\"\\f20c\"}.fa-buysellads:before{content:\"\\f20d\"}.fa-connectdevelop:before{content:\"\\f20e\"}.fa-dashcube:before{content:\"\\f210\"}.fa-forumbee:before{content:\"\\f211\"}.fa-leanpub:before{content:\"\\f212\"}.fa-sellsy:before{content:\"\\f213\"}.fa-shirtsinbulk:before{content:\"\\f214\"}.fa-simplybuilt:before{content:\"\\f215\"}.fa-skyatlas:before{content:\"\\f216\"}.fa-cart-plus:before{content:\"\\f217\"}.fa-cart-arrow-down:before{content:\"\\f218\"}.fa-diamond:before{content:\"\\f219\"}.fa-ship:before{content:\"\\f21a\"}.fa-user-secret:before{content:\"\\f21b\"}.fa-motorcycle:before{content:\"\\f21c\"}.fa-street-view:before{content:\"\\f21d\"}.fa-heartbeat:before{content:\"\\f21e\"}.fa-venus:before{content:\"\\f221\"}.fa-mars:before{content:\"\\f222\"}.fa-mercury:before{content:\"\\f223\"}.fa-intersex:before,.fa-transgender:before{content:\"\\f224\"}.fa-transgender-alt:before{content:\"\\f225\"}.fa-venus-double:before{content:\"\\f226\"}.fa-mars-double:before{content:\"\\f227\"}.fa-venus-mars:before{content:\"\\f228\"}.fa-mars-stroke:before{content:\"\\f229\"}.fa-mars-stroke-v:before{content:\"\\f22a\"}.fa-mars-stroke-h:before{content:\"\\f22b\"}.fa-neuter:before{content:\"\\f22c\"}.fa-genderless:before{content:\"\\f22d\"}.fa-facebook-official:before{content:\"\\f230\"}.fa-pinterest-p:before{content:\"\\f231\"}.fa-whatsapp:before{content:\"\\f232\"}.fa-server:before{content:\"\\f233\"}.fa-user-plus:before{content:\"\\f234\"}.fa-user-times:before{content:\"\\f235\"}.fa-bed:before,.fa-hotel:before{content:\"\\f236\"}.fa-viacoin:before{content:\"\\f237\"}.fa-train:before{content:\"\\f238\"}.fa-subway:before{content:\"\\f239\"}.fa-medium:before{content:\"\\f23a\"}.fa-y-combinator:before,.fa-yc:before{content:\"\\f23b\"}.fa-optin-monster:before{content:\"\\f23c\"}.fa-opencart:before{content:\"\\f23d\"}.fa-expeditedssl:before{content:\"\\f23e\"}.fa-battery-4:before,.fa-battery-full:before{content:\"\\f240\"}.fa-battery-3:before,.fa-battery-three-quarters:before{content:\"\\f241\"}.fa-battery-2:before,.fa-battery-half:before{content:\"\\f242\"}.fa-battery-1:before,.fa-battery-quarter:before{content:\"\\f243\"}.fa-battery-0:before,.fa-battery-empty:before{content:\"\\f244\"}.fa-mouse-pointer:before{content:\"\\f245\"}.fa-i-cursor:before{content:\"\\f246\"}.fa-object-group:before{content:\"\\f247\"}.fa-object-ungroup:before{content:\"\\f248\"}.fa-sticky-note:before{content:\"\\f249\"}.fa-sticky-note-o:before{content:\"\\f24a\"}.fa-cc-jcb:before{content:\"\\f24b\"}.fa-cc-diners-club:before{content:\"\\f24c\"}.fa-clone:before{content:\"\\f24d\"}.fa-balance-scale:before{content:\"\\f24e\"}.fa-hourglass-o:before{content:\"\\f250\"}.fa-hourglass-1:before,.fa-hourglass-start:before{content:\"\\f251\"}.fa-hourglass-2:before,.fa-hourglass-half:before{content:\"\\f252\"}.fa-hourglass-3:before,.fa-hourglass-end:before{content:\"\\f253\"}.fa-hourglass:before{content:\"\\f254\"}.fa-hand-grab-o:before,.fa-hand-rock-o:before{content:\"\\f255\"}.fa-hand-paper-o:before,.fa-hand-stop-o:before{content:\"\\f256\"}.fa-hand-scissors-o:before{content:\"\\f257\"}.fa-hand-lizard-o:before{content:\"\\f258\"}.fa-hand-spock-o:before{content:\"\\f259\"}.fa-hand-pointer-o:before{content:\"\\f25a\"}.fa-hand-peace-o:before{content:\"\\f25b\"}.fa-trademark:before{content:\"\\f25c\"}.fa-registered:before{content:\"\\f25d\"}.fa-creative-commons:before{content:\"\\f25e\"}.fa-gg:before{content:\"\\f260\"}.fa-gg-circle:before{content:\"\\f261\"}.fa-tripadvisor:before{content:\"\\f262\"}.fa-odnoklassniki:before{content:\"\\f263\"}.fa-odnoklassniki-square:before{content:\"\\f264\"}.fa-get-pocket:before{content:\"\\f265\"}.fa-wikipedia-w:before{content:\"\\f266\"}.fa-safari:before{content:\"\\f267\"}.fa-chrome:before{content:\"\\f268\"}.fa-firefox:before{content:\"\\f269\"}.fa-opera:before{content:\"\\f26a\"}.fa-internet-explorer:before{content:\"\\f26b\"}.fa-television:before,.fa-tv:before{content:\"\\f26c\"}.fa-contao:before{content:\"\\f26d\"}.fa-500px:before{content:\"\\f26e\"}.fa-amazon:before{content:\"\\f270\"}.fa-calendar-plus-o:before{content:\"\\f271\"}.fa-calendar-minus-o:before{content:\"\\f272\"}.fa-calendar-times-o:before{content:\"\\f273\"}.fa-calendar-check-o:before{content:\"\\f274\"}.fa-industry:before{content:\"\\f275\"}.fa-map-pin:before{content:\"\\f276\"}.fa-map-signs:before{content:\"\\f277\"}.fa-map-o:before{content:\"\\f278\"}.fa-map:before{content:\"\\f279\"}.fa-commenting:before{content:\"\\f27a\"}.fa-commenting-o:before{content:\"\\f27b\"}.fa-houzz:before{content:\"\\f27c\"}.fa-vimeo:before{content:\"\\f27d\"}.fa-black-tie:before{content:\"\\f27e\"}.fa-fonticons:before{content:\"\\f280\"}.fa-reddit-alien:before{content:\"\\f281\"}.fa-edge:before{content:\"\\f282\"}.fa-credit-card-alt:before{content:\"\\f283\"}.fa-codiepie:before{content:\"\\f284\"}.fa-modx:before{content:\"\\f285\"}.fa-fort-awesome:before{content:\"\\f286\"}.fa-usb:before{content:\"\\f287\"}.fa-product-hunt:before{content:\"\\f288\"}.fa-mixcloud:before{content:\"\\f289\"}.fa-scribd:before{content:\"\\f28a\"}.fa-pause-circle:before{content:\"\\f28b\"}.fa-pause-circle-o:before{content:\"\\f28c\"}.fa-stop-circle:before{content:\"\\f28d\"}.fa-stop-circle-o:before{content:\"\\f28e\"}.fa-shopping-bag:before{content:\"\\f290\"}.fa-shopping-basket:before{content:\"\\f291\"}.fa-hashtag:before{content:\"\\f292\"}.fa-bluetooth:before{content:\"\\f293\"}.fa-bluetooth-b:before{content:\"\\f294\"}.fa-percent:before{content:\"\\f295\"}");
//# sourceMappingURL=build.js.map
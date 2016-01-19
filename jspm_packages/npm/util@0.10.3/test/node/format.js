/* */ 
var assert = require('assert');
var util = require('../../../util@0.10.3');
assert.equal(util.format(), '');
assert.equal(util.format(''), '');
assert.equal(util.format([]), '[]');
assert.equal(util.format({}), '{}');
assert.equal(util.format(null), 'null');
assert.equal(util.format(true), 'true');
assert.equal(util.format(false), 'false');
assert.equal(util.format('test'), 'test');
assert.equal(util.format('foo', 'bar', 'baz'), 'foo bar baz');
assert.equal(util.format('%d', 42.0), '42');
assert.equal(util.format('%d', 42), '42');
assert.equal(util.format('%s', 42), '42');
assert.equal(util.format('%j', 42), '42');
assert.equal(util.format('%d', '42.0'), '42');
assert.equal(util.format('%d', '42'), '42');
assert.equal(util.format('%s', '42'), '42');
assert.equal(util.format('%j', '42'), '"42"');
assert.equal(util.format('%%s%s', 'foo'), '%sfoo');
assert.equal(util.format('%s'), '%s');
assert.equal(util.format('%s', undefined), 'undefined');
assert.equal(util.format('%s', 'foo'), 'foo');
assert.equal(util.format('%s:%s'), '%s:%s');
assert.equal(util.format('%s:%s', undefined), 'undefined:%s');
assert.equal(util.format('%s:%s', 'foo'), 'foo:%s');
assert.equal(util.format('%s:%s', 'foo', 'bar'), 'foo:bar');
assert.equal(util.format('%s:%s', 'foo', 'bar', 'baz'), 'foo:bar baz');
assert.equal(util.format('%%%s%%', 'hi'), '%hi%');
assert.equal(util.format('%%%s%%%%', 'hi'), '%hi%%');
(function() {
  var o = {};
  o.o = o;
  assert.equal(util.format('%j', o), '[Circular]');
})();
assert.equal(util.format(new Error('foo')), '[Error: foo]');
function CustomError(msg) {
  Error.call(this);
  Object.defineProperty(this, 'message', {
    value: msg,
    enumerable: false
  });
  Object.defineProperty(this, 'name', {
    value: 'CustomError',
    enumerable: false
  });
}
util.inherits(CustomError, Error);
assert.equal(util.format(new CustomError('bar')), '[CustomError: bar]');

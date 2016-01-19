/* */ 
var assert = require('assert');
var context = require('vm').runInNewContext;
var util = require('../../../util@0.10.3');
assert.equal(true, util.isArray([]));
assert.equal(true, util.isArray(Array()));
assert.equal(true, util.isArray(new Array()));
assert.equal(true, util.isArray(new Array(5)));
assert.equal(true, util.isArray(new Array('with', 'some', 'entries')));
assert.equal(true, util.isArray(context('Array')()));
assert.equal(false, util.isArray({}));
assert.equal(false, util.isArray({push: function() {}}));
assert.equal(false, util.isArray(/regexp/));
assert.equal(false, util.isArray(new Error));
assert.equal(false, util.isArray(Object.create(Array.prototype)));
assert.equal(true, util.isRegExp(/regexp/));
assert.equal(true, util.isRegExp(RegExp()));
assert.equal(true, util.isRegExp(new RegExp()));
assert.equal(true, util.isRegExp(context('RegExp')()));
assert.equal(false, util.isRegExp({}));
assert.equal(false, util.isRegExp([]));
assert.equal(false, util.isRegExp(new Date()));
assert.equal(false, util.isRegExp(Object.create(RegExp.prototype)));
assert.equal(true, util.isDate(new Date()));
assert.equal(true, util.isDate(new Date(0)));
assert.equal(true, util.isDate(new (context('Date'))));
assert.equal(false, util.isDate(Date()));
assert.equal(false, util.isDate({}));
assert.equal(false, util.isDate([]));
assert.equal(false, util.isDate(new Error));
assert.equal(false, util.isDate(Object.create(Date.prototype)));
assert.equal(true, util.isError(new Error));
assert.equal(true, util.isError(new TypeError));
assert.equal(true, util.isError(new SyntaxError));
assert.equal(true, util.isError(new (context('Error'))));
assert.equal(true, util.isError(new (context('TypeError'))));
assert.equal(true, util.isError(new (context('SyntaxError'))));
assert.equal(false, util.isError({}));
assert.equal(false, util.isError({
  name: 'Error',
  message: ''
}));
assert.equal(false, util.isError([]));
assert.equal(true, util.isError(Object.create(Error.prototype)));
assert.ok(util.isObject({}) === true);
assert.deepEqual(util._extend({a: 1}), {a: 1});
assert.deepEqual(util._extend({a: 1}, []), {a: 1});
assert.deepEqual(util._extend({a: 1}, null), {a: 1});
assert.deepEqual(util._extend({a: 1}, true), {a: 1});
assert.deepEqual(util._extend({a: 1}, false), {a: 1});
assert.deepEqual(util._extend({a: 1}, {b: 2}), {
  a: 1,
  b: 2
});
assert.deepEqual(util._extend({
  a: 1,
  b: 2
}, {b: 3}), {
  a: 1,
  b: 3
});

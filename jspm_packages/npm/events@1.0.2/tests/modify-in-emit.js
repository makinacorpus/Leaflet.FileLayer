/* */ 
var assert = require('assert');
var events = require('../events');
var callbacks_called = [];
var e = new events.EventEmitter();
function callback1() {
  callbacks_called.push('callback1');
  e.on('foo', callback2);
  e.on('foo', callback3);
  e.removeListener('foo', callback1);
}
function callback2() {
  callbacks_called.push('callback2');
  e.removeListener('foo', callback2);
}
function callback3() {
  callbacks_called.push('callback3');
  e.removeListener('foo', callback3);
}
e.on('foo', callback1);
assert.equal(1, e.listeners('foo').length);
e.emit('foo');
assert.equal(2, e.listeners('foo').length);
assert.deepEqual(['callback1'], callbacks_called);
e.emit('foo');
assert.equal(0, e.listeners('foo').length);
assert.deepEqual(['callback1', 'callback2', 'callback3'], callbacks_called);
e.emit('foo');
assert.equal(0, e.listeners('foo').length);
assert.deepEqual(['callback1', 'callback2', 'callback3'], callbacks_called);
e.on('foo', callback1);
e.on('foo', callback2);
assert.equal(2, e.listeners('foo').length);
e.removeAllListeners('foo');
assert.equal(0, e.listeners('foo').length);
callbacks_called = [];
e.on('foo', callback2);
e.on('foo', callback3);
assert.equal(2, e.listeners('foo').length);
e.emit('foo');
assert.deepEqual(['callback2', 'callback3'], callbacks_called);
assert.equal(0, e.listeners('foo').length);

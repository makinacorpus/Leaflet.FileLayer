/* */ 
var assert = require('assert');
var events = require('../events');
var e = new events.EventEmitter(),
    num_args_emited = [];
e.on('numArgs', function() {
  var numArgs = arguments.length;
  console.log('numArgs: ' + numArgs);
  num_args_emited.push(numArgs);
});
console.log('start');
e.emit('numArgs');
e.emit('numArgs', null);
e.emit('numArgs', null, null);
e.emit('numArgs', null, null, null);
e.emit('numArgs', null, null, null, null);
e.emit('numArgs', null, null, null, null, null);
assert.deepEqual([0, 1, 2, 3, 4, 5], num_args_emited);

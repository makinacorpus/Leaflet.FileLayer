/* */ 
(function(process) {
  var assert = require('assert');
  var util = require('../../../util@0.10.3');
  assert.ok(process.stdout.writable);
  assert.ok(process.stderr.writable);
  var stdout_write = global.process.stdout.write;
  var strings = [];
  global.process.stdout.write = function(string) {
    strings.push(string);
  };
  console._stderr = process.stdout;
  var tests = [{
    input: 'foo',
    output: 'foo'
  }, {
    input: undefined,
    output: 'undefined'
  }, {
    input: null,
    output: 'null'
  }, {
    input: false,
    output: 'false'
  }, {
    input: 42,
    output: '42'
  }, {
    input: function() {},
    output: '[Function]'
  }, {
    input: parseInt('not a number', 10),
    output: 'NaN'
  }, {
    input: {answer: 42},
    output: '{ answer: 42 }'
  }, {
    input: [1, 2, 3],
    output: '[ 1, 2, 3 ]'
  }];
  tests.forEach(function(test) {
    util.log(test.input);
    var result = strings.shift().trim(),
        re = (/[0-9]{1,2} [A-Z][a-z]{2} [0-9]{2}:[0-9]{2}:[0-9]{2} - (.+)$/),
        match = re.exec(result);
    assert.ok(match);
    assert.equal(match[1], test.output);
  });
  global.process.stdout.write = stdout_write;
})(require('process'));

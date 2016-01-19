/* */ 
(function(process) {
  var assert = require('assert');
  var util = require('../../../util@0.10.3');
  if (process.argv[2] === 'child')
    child();
  else
    parent();
  function parent() {
    test('foo,tud,bar', true);
    test('foo,tud', true);
    test('tud,bar', true);
    test('tud', true);
    test('foo,bar', false);
    test('', false);
  }
  function test(environ, shouldWrite) {
    var expectErr = '';
    if (shouldWrite) {
      expectErr = 'TUD %PID%: this { is: \'a\' } /debugging/\n' + 'TUD %PID%: number=1234 string=asdf obj={"foo":"bar"}\n';
    }
    var expectOut = 'ok\n';
    var didTest = false;
    var spawn = require('child_process').spawn;
    var child = spawn(process.execPath, [__filename, 'child'], {env: {NODE_DEBUG: environ}});
    expectErr = expectErr.split('%PID%').join(child.pid);
    var err = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function(c) {
      err += c;
    });
    var out = '';
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(c) {
      out += c;
    });
    child.on('close', function(c) {
      assert(!c);
      assert.equal(err, expectErr);
      assert.equal(out, expectOut);
      didTest = true;
      console.log('ok %j %j', environ, shouldWrite);
    });
    process.on('exit', function() {
      assert(didTest);
    });
  }
  function child() {
    var debug = util.debuglog('tud');
    debug('this', {is: 'a'}, /debugging/);
    debug('number=%d string=%s obj=%j', 1234, 'asdf', {foo: 'bar'});
    console.log('ok');
  }
})(require('process'));

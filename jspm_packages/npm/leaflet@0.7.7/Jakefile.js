/* */ 
(function(process) {
  var build = require('./build/build');
  function hint(msg, paths) {
    return function() {
      console.log(msg);
      jake.exec('node node_modules/jshint/bin/jshint -c ' + paths, {printStdout: true}, function() {
        console.log('\tCheck passed.\n');
        complete();
      });
    };
  }
  desc('Check Leaflet source for errors with JSHint');
  task('lint', {async: true}, hint('Checking for JS errors...', 'build/hintrc.js src'));
  desc('Check Leaflet specs source for errors with JSHint');
  task('lintspec', {async: true}, hint('Checking for specs JS errors...', 'spec/spec.hintrc.js spec/suites'));
  desc('Combine and compress Leaflet source files');
  task('build', {async: true}, function() {
    build.build(complete);
  });
  desc('Run PhantomJS tests');
  task('test', ['lint', 'lintspec'], {async: true}, function() {
    build.test(complete);
  });
  task('default', ['test', 'build']);
  jake.addListener('complete', function() {
    process.exit();
  });
})(require('process'));

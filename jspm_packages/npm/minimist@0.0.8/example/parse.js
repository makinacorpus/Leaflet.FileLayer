/* */ 
(function(process) {
  var argv = require('../index')(process.argv.slice(2));
  console.dir(argv);
})(require('process'));

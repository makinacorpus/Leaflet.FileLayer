/* */ 
(function(Buffer) {
  var tape = require('tape');
  var zlib = require('../src/index');
  var inputString = '\u03A9\u03A9Lorem ipsum dolor sit amet, consectetur adipiscing el' + 'it. Morbi faucibus, purus at gravida dictum, libero arcu convallis la' + 'cus, in commodo libero metus eu nisi. Nullam commodo, neque nec porta' + ' placerat, nisi est fermentum augue, vitae gravida tellus sapien sit ' + 'amet tellus. Aenean non diam orci. Proin quis elit turpis. Suspendiss' + 'e non diam ipsum. Suspendisse nec ullamcorper odio. Vestibulum arcu m' + 'i, sodales non suscipit id, ultrices ut massa. Sed ac sem sit amet ar' + 'cu malesuada fermentum. Nunc sed. ';
  var expectedBase64Deflate = 'eJxdUUtOQzEMvMoc4OndgT0gJCT2buJWlpI4jePeqZfpm' + 'XAKLRKbLOzx/HK73q6vOrhCunlF1qIDJhNUeW5I2ozT5OkDlKWLJWkncJG5403HQXAkT3' + 'Jw29B9uIEmToMukglZ0vS6ociBh4JG8sV4oVLEUCitK2kxq1WzPnChHDzsaGKy491Lofo' + 'AbWh8do43oeuYhB5EPCjcLjzYJo48KrfQBvnJecNFJvHT1+RSQsGoC7dn2t/xjhduTA1N' + 'WyQIZR0pbHwMDatnD+crPqKSqGPHp1vnlsWM/07ubf7bheF7kqSj84Bm0R1fYTfaK8vqq' + 'qfKBtNMhe3OZh6N95CTvMX5HJJi4xOVzCgUOIMSLH7wmeOHaFE4RdpnGavKtrB5xzfO/Ll9';
  var expectedBase64Gzip = 'H4sIAAAAAAAAA11RS05DMQy8yhzg6d2BPSAkJPZu4laWkjiN' + '496pl+mZcAotEpss7PH8crverq86uEK6eUXWogMmE1R5bkjajNPk6QOUpYslaSdwkbnjT' + 'cdBcCRPcnDb0H24gSZOgy6SCVnS9LqhyIGHgkbyxXihUsRQKK0raTGrVbM+cKEcPOxoYr' + 'Lj3Uuh+gBtaHx2jjeh65iEHkQ8KNwuPNgmjjwqt9AG+cl5w0Um8dPX5FJCwagLt2fa3/G' + 'OF25MDU1bJAhlHSlsfAwNq2cP5ys+opKoY8enW+eWxYz/Tu5t/tuF4XuSpKPzgGbRHV9h' + 'N9ory+qqp8oG00yF7c5mHo33kJO8xfkckmLjE5XMKBQ4gxIsfvCZ44doUThF2mcZq8q2s' + 'HnHNzRtagj5AQAA';
  tape('deflate', function(t) {
    t.plan(1);
    zlib.deflate(inputString, function(err, buffer) {
      t.equal(buffer.toString('base64'), expectedBase64Deflate, 'deflate encoded string should match');
    });
  });
  tape('gzip', function(t) {
    t.plan(1);
    zlib.gzip(inputString, function(err, buffer) {
      zlib.gunzip(buffer, function(err, gunzipped) {
        t.equal(gunzipped.toString(), inputString, 'Should get original string after gzip/gunzip');
      });
    });
  });
  tape('unzip deflate', function(t) {
    t.plan(1);
    var buffer = new Buffer(expectedBase64Deflate, 'base64');
    zlib.unzip(buffer, function(err, buffer) {
      t.equal(buffer.toString(), inputString, 'decoded inflated string should match');
    });
  });
  tape('unzip gzip', function(t) {
    t.plan(1);
    buffer = new Buffer(expectedBase64Gzip, 'base64');
    zlib.unzip(buffer, function(err, buffer) {
      t.equal(buffer.toString(), inputString, 'decoded gunzipped string should match');
    });
  });
})(require('buffer').Buffer);

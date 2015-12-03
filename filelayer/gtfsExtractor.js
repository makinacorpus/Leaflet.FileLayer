var feature;
var stopMarker;
var shapeHusk;
var stopHusk;
var minLat;
var maxLat;
var minLng;
var maxLng;

var strokeWidth = 3;

var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    stopHuskGroup = svg.append("g").attr("class", "stop-husk-group leaflet-zoom-hide"),
    shapeHuskGroup = svg.append("g").attr("class", "shape-husk-group leaflet-zoom-hide"),
    stopGroup = svg.append("g").attr("class", "stop-group leaflet-zoom-hide"),
    shapeGroup = svg.append("g").attr("class", "shape-group leaflet-zoom-hide");

var pointCache = {};
var projectPoint = function(point) {
    var key = point[0] + ',' + point[1];
    if (pointCache[key] === undefined) {
        pointCache[key] = map.latLngToLayerPoint(new L.LatLng(point[0], point[1]));
    }
    return pointCache[key];
};

var color = d3.scale.category20();

var line = d3.svg.line()
    .x(function(d) { return projectPoint([d.lat, d.lon]).x; })
    .y(function(d) { return projectPoint([d.lat, d.lon]).y; });

var drawShapes = function(shapeRows) {
  pointCache = {};

  var shapes = shapeRows.reduce(combineShapeRows);

  var lats = shapeRows.map(function(shape) { return shape.lat });
  var lngs = shapeRows.map(function(shape) { return shape.lon });
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

  svg.attr("width", bottomRight.x - topLeft.x)
  .attr("height", bottomRight.y - topLeft.y)
  .style("left", topLeft.x + "px")
  .style("top", topLeft.y + "px");

  shapeHuskGroup.attr("transform", "translate(" + -topLeft.x + "," + -topLeft.y + ")");
  shapeGroup.attr("transform", "translate(" + -topLeft.x + "," + -topLeft.y + ")");

  shapeHusk = shapeHuskGroup.selectAll('.husk')
  .data(d3.entries(shapes), function(d) { return d.key; });

  shapeHusk.enter().append('path')
  .attr('class', 'husk')
  .attr("d", function(d) { return line(d.value); })
  .style({
    fill: 'none',
    'stroke': '#fff',
    'stroke-width': strokeWidth * 2,
    'stroke-opacity': 1
  });

  shapeHusk.exit().remove();

  feature = shapeGroup.selectAll('.feature')
  .data(d3.entries(shapes), function(d) { return d.key; });

  feature.enter().append('path')
  .attr('class', 'feature')
  .attr('d', function(d) { return line(d.value); })
  .style('stroke', function(d, i) { return color(i); })
  .style({
    fill: 'none',
    'stroke-width': strokeWidth,
    'stroke-opacity': 0.5
  });

  feature.exit().remove();

  map.fitBounds(bounds);
};

var resetShapes = function() {
  pointCache = {};

  strokeWidth = map.getZoom() < 9 ? 1 : (map.getZoom() - 8);

  var topLeft = projectPoint([maxLat, minLng]);
  var bottomRight = projectPoint([minLat, maxLng]);

  topLeft.x = topLeft.x - strokeWidth;
  topLeft.y = topLeft.y - strokeWidth;
  bottomRight.x = bottomRight.x + strokeWidth;
  bottomRight.y = bottomRight.y + strokeWidth;

  svg.attr("width", bottomRight.x - topLeft.x)
  .attr("height", bottomRight.y - topLeft.y)
  .style("left", topLeft.x + "px")
  .style("top", topLeft.y + "px");

  shapeHuskGroup.attr("transform", "translate(" + -topLeft.x + "," + -topLeft.y + ")");
  shapeGroup.attr("transform", "translate(" + -topLeft.x + "," + -topLeft.y + ")");

  shapeHusk.attr("d", function(d) { return line(d.value); })
  .style({'stroke-width': strokeWidth * 2});

  feature.attr("d", function(d) { return line(d.value); })
  .style({'stroke-width': strokeWidth});
};

var drawStops = function(data) {
  pointCache = {};

  var lats = data.map(function(stop) { return stop.lat });
  var lngs = data.map(function(stop) { return stop.lon });

  var topLeft = projectPoint([d3.max(lats), d3.min(lngs)]);
  var bottomRight = projectPoint([d3.min(lats), d3.max(lngs)]);

  topLeft.x = topLeft.x - strokeWidth;
  topLeft.y = topLeft.y - strokeWidth;
  bottomRight.x = bottomRight.x + strokeWidth;
  bottomRight.y = bottomRight.y + strokeWidth;

  stopHuskGroup.attr("transform", "translate(" + -topLeft.x + "," + -topLeft.y + ")");
  stopGroup.attr("transform", "translate(" + -topLeft.x + "," + -topLeft.y + ")");

  stopHusk = stopHuskGroup.selectAll('.stop-husk')
  .data(data, function(d) { return d.id; });

  stopHusk.enter().append('circle')
  .attr('class', 'stop-husk')
  .attr('r', strokeWidth * 2)
  .attr('cx', function(d) { return projectPoint([d.lat, d.lon]).x; })
  .attr('cy', function(d) { return projectPoint([d.lat, d.lon]).y; })
  .style('fill', '#fff');

  stopHusk.exit().remove();

  stopMarker = stopGroup.selectAll('.stop')
  .data(data, function(d) { return d.id; });

  stopMarker.enter().append('circle')
  .attr('class', 'stop')
  .attr('r', strokeWidth)
  .attr('cx', function(d) { return projectPoint([d.lat, d.lon]).x; })
  .attr('cy', function(d) { return projectPoint([d.lat, d.lon]).y; })
  .style('fill', '#35A9FC');

  stopMarker.exit().remove();
};

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

  stopHusk.attr('r', strokeWidth * 2)
  .attr('cx', function(d) { return projectPoint([d.lat, d.lon]).x; })
  .attr('cy', function(d) { return projectPoint([d.lat, d.lon]).y; });

  stopMarker.attr('r', strokeWidth)
  .attr('cx', function(d) { return projectPoint([d.lat, d.lon]).x; })
  .attr('cy', function(d) { return projectPoint([d.lat, d.lon]).y; })
};

var cleanShapeRow = function(row) {
    return {
        id: row.shape_id,
        lat: parseFloat(row.shape_pt_lat),
        lon: parseFloat(row.shape_pt_lon),
        sequence: row.shape_pt_sequence
    };
};

var cleanStopRow = function(row) {
    return {
        id: row.stop_id,
        code: row.stop_code,
        lat: parseFloat(row.stop_lat),
        lon: parseFloat(row.stop_lon),
        name: row.stop_name
    };
};

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

var load_shapes = function(csv) {
    var data = d3.csv.parse(csv, cleanShapeRow);
    drawShapes(data);
};

var load_stops = function(csv) {
    var data = d3.csv.parse(csv, cleanStopRow);
    drawStops(data);
};

map.on('viewreset', function() {
    resetShapes();
    //resetStops();
});

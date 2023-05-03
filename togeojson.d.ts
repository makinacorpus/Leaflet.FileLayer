declare module 'togeojson' {
  function toGeoJSON(gpx: Document): GeoJSON.FeatureCollection;
  function toGeoJSON(kml: Document): GeoJSON.FeatureCollection;
  function toGeoJSON(osm: Element): GeoJSON.FeatureCollection;
  function toGeoJSON(tcx: Document): GeoJSON.FeatureCollection;

  const togeojson: {
    toGeoJSON: typeof toGeoJSON;
  };

  export default togeojson;
}


//npx dts-gen -m togeojson
///npx dts-gen -i leaflet.filelayer.js 
declare var toGeoJSON: {
  kml: (doc: any) => {
      type: string;
      features: never[];
  };
  gpx: (doc: any) => {
      type: string;
      features: never[];
  };
};


import L from 'leaflet';
import * as toGeoJSON from 'togeojson';
import { Geometry } from 'geojson';
import { fileLoader, LayerOptions, Parsers } from './interfaces';
/* type Parsers = {
  geojson: (content: string | GeoJSON.GeoJsonObject) => void;
  json: (content: string | GeoJSON.GeoJsonObject) => void;
  gpx: (content: string | GeoJSON.GeoJsonObject, format: keyof typeof toGeoJSON) => L.Layer;
  kml: (content: string | GeoJSON.GeoJsonObject, format: keyof typeof toGeoJSON) => L.Layer;
}; */

class FileLoader extends L.Layer implements fileLoader {
  options: LayerOptions = {
    layer: L.geoJSON,
    layerOptions: {},
    fileSizeLimit: 1024,
    addToMap: true,
  };
  _parsers: Parsers;
  constructor(map: L.Map, options?: L.LayerOptions) {
    super(options);
    this._map = map;
    L.Util.setOptions(this, options);
    /* this._parsers = {
      geojson: this._loadGeoJSON,
      json: this._loadGeoJSON,
      gpx: this._convertToGeoJSON,
      kml: this._convertToGeoJSON,
    }; */
    this._parsers = {
      geojson: this._loadGeoJSON.bind(this),
      json: this._loadGeoJSON.bind(this),
      gpx: (content: string | GeoJSON.GeoJsonObject, format: 'gpx' | 'kml') => this._convertToGeoJSON(content as string, format),
      kml: (content: string | GeoJSON.GeoJsonObject, format: 'gpx' | 'kml') => this._convertToGeoJSON(content as string, format),
    };
  }

  getFileExtension(file: File | string): string {
    let fileName = '';

    if (typeof file === 'string') {
      fileName = file;
    } else {
      fileName = file.name;
    }

    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex !== -1 && dotIndex < fileName.length - 1) {
      return fileName.substring(dotIndex + 1).toLowerCase();
    }
    return '';
  }

  load(file: File, ext?: string):FileReader|boolean {
    // Check file is defined
    if (this._isParameterMissing(file, 'file')) {
      return false;
    }
    // Check file size
    if (!this._isFileSizeOk(file.size)) {
      return false;
    }
    // Get parser for this data type
    const parser = this._getParser(file.name, ext);
    if (!parser) {
      return false;
    }
    // Read selected file using HTML5 File API
    const reader: FileReader = new FileReader();
    reader.onload = L.Util.bind((e) => {
      try {
        this.fire('data:loading', { filename: file.name, format: parser.ext });
        const layer = parser.processor.call(this, e.target.result, parser.ext);
        this.fire('data:loaded', {
          layer: layer,
          filename: file.name,
          format: parser.ext,
        });
      } catch (err) {
        this.fire('data:error', { error: err });
      }
    }, this);
    // Testing trick: tests don't pass a real file,
    // but an object with file.testing set to true.
    // This object cannot be read by reader, just skip it.
     if (typeof file === 'object' && (file as any).testing) {
      return reader;
    } else {
      reader.readAsText(file);
    }
    // We return this to ease testing
    return reader;
    
  }

  loadMultiple(files: File[] | FileList, ext?: string): FileReader[] {
    let readers: FileReader[] = [];
    if (files[0]) {
      //转换为真正的数组。
      files = Array.prototype.slice.apply(files) as File[];
      while (files.length > 0) {
        //移除数组的第一个元素并返回该元素的值。
        const file = files.shift();
        if (file) {       
          readers.push(this.load(file, ext) as FileReader);
        }
      }
    }
    // return first reader (or false if no file),
    // which is also used for subsequent loadings
    return readers;
  }

  loadData(data: string, name: string, ext: string) {
    // Check required parameters
    if (this._isParameterMissing(data, 'data') || this._isParameterMissing(name, 'name')) {
      return;
    }
    // Check file size
    if (!this._isFileSizeOk(data.length)) {
      return;
    }

    // Get parser for this data type
    const parser = this._getParser(name, ext);
    if (!parser) {
      return;
    }
    // Process data
    try {
      this.fire('data:loading', { filename: name, format: parser.ext });
      const layer = parser.processor.call(this, data, parser.ext);
      this.fire('data:loaded', {
        layer: layer,
        filename: name,
        format: parser.ext,
      });
    } catch (err) {
      this.fire('data:error', { error: err });
    }
  }

  _isParameterMissing(v: any, vname: string) {
    if (typeof v === 'undefined') {
      this.fire('data:error', {
        error: new Error(`Missing parameter:${vname}`),
      });
      return true;
    }
    return false;
  }

  _getParser(name: string, ext?: string): { processor: Function; ext: string } | undefined {
    ext = ext || (name.split('.').pop() as string); //使用断言否则会返回undefined
    const parser = this._parsers[ext];
    if (!parser) {
      this.fire('data:error', {
        error: new Error(`Unsupported file type (${ext})`),
      });
      //throw new Error(`Unsupported file type (${ext})`);
      return undefined;
    }
    return {
      processor: parser,
      ext: ext,
    };
  }

  _isFileSizeOk(size: number) {
    let fileSize = parseFloat((size / 1024).toFixed(4)); // 将字符串转换为浮点数
    if (fileSize > this.options.fileSizeLimit) {
      this.fire('data:error', {
        error: new Error(`File size exceeds limit (${fileSize} > ${this.options.fileSizeLimit} 'kb)`),
      });
      return false;
    }
    return true;
  }
  _loadGeoJSON(content: string | GeoJSON.GeoJsonObject | GeoJSON.GeoJsonObject[]): L.Layer {
    //_loadGeoJSON(content: any) {
    if (typeof content === 'string') {
      content = JSON.parse(content) as GeoJSON.GeoJsonObject;
    }
    const layer = this.options.layer(content, this.options.layerOptions);

    if (layer.getLayers().length === 0) {
      throw new Error('GeoJSON has no valid layers.');
    }

    if (this.options.addToMap) {
      layer.addTo(this._map);
    }
    return layer;
  }
  //_convertToGeoJSON(content: any, format: keyof typeof toGeoJSON) {
  _convertToGeoJSON(content: string | Document, format: 'gpx' | 'kml'): L.Layer {
    // Format is either 'gpx' or 'togeojson'
    if (typeof content === 'string') {
      content = new window.DOMParser().parseFromString(content, 'text/xml');
    }
    const geojson = toGeoJSON[format](content);
    return this._loadGeoJSON(geojson);
  }
}
const FileLayer = {
  //FileLoader: FileLoader,
  fileLoader: function (map: L.Map, options: object) {
    return new FileLoader(map, options);
  },
};
export { FileLoader, FileLayer };

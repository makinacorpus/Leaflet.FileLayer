import L from 'leaflet';
import * as toGeoJSON from 'togeojson';
namespace filelayer {
  //var L = window.L;
  interface LayerOptions extends L.LayerOptions {
    layer: typeof L.geoJSON;
    layerOptions: object;
    fileSizeLimit: number;
    addToMap: boolean;
  }

  interface ControlOptions extends L.ControlOptions {
    title?: string;
    position?: L.ControlPosition;
    fitBounds?: boolean;
    layerOptions?: any;
    addToMap?: boolean;
    fileSizeLimit?: number;
    formats?: string[];
  }
  interface Parsers {
    [key: string]: (content: string | GeoJSON.GeoJsonObject, format: 'gpx' | 'kml') => L.Layer;
  }
  export class FileLoader extends L.Layer {
    options: LayerOptions = {
      layer: L.geoJSON,
      layerOptions: {},
      fileSizeLimit: 1024,
      addToMap: true,
    };
    private _parsers: Parsers;
    constructor(map: L.Map, options?: L.LayerOptions) {
      super(options);
      this._map = map;
      L.Util.setOptions(this, options);
      this._parsers = {
        geojson: this._loadGeoJSON,
        json: this._loadGeoJSON,
        gpx: this._convertToGeoJSON,
        kml: this._convertToGeoJSON,
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

    load(file: File, ext?: string): FileReader | boolean {
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

    private _isParameterMissing(v: any, vname: string) {
      if (typeof v === 'undefined') {
        this.fire('data:error', {
          error: new Error(`Missing parameter:${vname}`),
        });
        return true;
      }
      return false;
    }

    private _getParser(name: string, ext?: string): { processor: Function; ext: string } | undefined {
      ext = ext || (name.split('.').pop() as string); //使用断言否则会返回undefined
      const parser = this._parsers[ext as keyof typeof this._parsers];
      if (!parser) {
        this.fire('data:error', {
          error: new Error(`Unsupported file type (${ext})`),
        });
        return undefined;
      }
      return {
        processor: parser,
        ext: ext,
      };
    }

    private _isFileSizeOk(size: number) {
      let fileSize = parseFloat((size / 1024).toFixed(4)); // 将字符串转换为浮点数
      if (fileSize > this.options.fileSizeLimit) {
        this.fire('data:error', {
          error: new Error(`File size exceeds limit (${fileSize} > ${this.options.fileSizeLimit} 'kb)`),
        });
        return false;
      }
      return true;
    }

    private _loadGeoJSON(content: any) {
      if (typeof content === 'string') {
        content = JSON.parse(content);
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
    private _convertToGeoJSON(content: any, format: keyof typeof toGeoJSON) {
      // Format is either 'gpx' or 'togeojson'
      if (typeof content === 'string') {
        content = new window.DOMParser().parseFromString(content, 'text/xml');
      }
      const geojson = toGeoJSON[format](content);
      return this._loadGeoJSON(geojson);
    }
  }

  export class FileLayerLoad extends L.Control {
    options: ControlOptions = {
      title: 'Load local file (GPX, KML, GeoJSON)',
      position: 'topleft',
      fitBounds: true,
      layerOptions: {},
      addToMap: true,
      fileSizeLimit: 1024,
      formats: ['gpx', 'kml', 'json', 'geojson'],
    };
    //loader: Loader | null = null;
    private loader?: FileLoader; // 将属性声明为可选属性
    constructor(options: Partial<ControlOptions>) {
      super(options);
      L.Util.setOptions(this, options);
      //this.loader = null;
    }

    onAdd(map: L.Map): HTMLElement {
      const control = this;
      this.loader = FileLayer.fileLoader(map, this.options);
      if (this.loader) {
        this.loader.on(
          'data:loaded',
          function (e: any) {
            // Fit bounds after loading
            if (control.options.fitBounds) {
              window.setTimeout(function () {
                map.fitBounds(e.layer.getBounds());
              }, 500);
            }
          },
          this
        );
      }
      // Initialize Drag-and-drop
      this._initDragAndDrop(map);
      // Create the control icon
      const controlIcon = this._createIcon();
      // Add control to the map container
      const container = map.getContainer();
      container.appendChild(controlIcon);
      // Return the control icon element
      return controlIcon;
    }
    //新增ICON
    private _createIcon() {
      const thisLoader = this.loader;
      // Create a button, and bind click on hidden file input
      const zoomName = 'leaflet-control-filelayer leaflet-control-zoom';
      const barName = 'leaflet-bar';
      const partName = `${barName}-part` + '';
      const container: HTMLDivElement = L.DomUtil.create('div', `${zoomName}  ${barName}`);
      const link: HTMLAnchorElement = L.DomUtil.create('a', `${zoomName} -in ${partName}`, container);
      if (this.options.title) {
        link.title = this.options.title;
      }

      if (!document.getElementById('browser-file-css')) {
        this._appendControlStyles(container);
      }
      link.href = '#';
      // Create an invisible file input
      const fileInput: HTMLInputElement = L.DomUtil.create('input', 'hidden', container);
      fileInput.type = 'file';
      fileInput.multiple = true;
      if (!this.options.formats) {
        fileInput.accept = '.gpx,.kml,.json,.geojson';
      } else {
        fileInput.accept = this.options.formats.join(',');
      }
      fileInput.style.display = 'none';
      // Load on file change
      if (fileInput) {
        fileInput.addEventListener(
          'change',
          function () {
            if (thisLoader) {
              if (this.files) {
                thisLoader.loadMultiple(this.files);
              }
            }
            // reset so that the user can upload the same file again if they want to
            this.value = '';
          },
          false
        );
      }

      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.on(link, 'click', function (e) {
        fileInput.click();
        e.preventDefault();
      });
      return container;
    }

    private _initDragAndDrop(map: L.Map) {
      let callbackName;
      let thisLoader = this.loader;
      let dropbox = map.getContainer(); // 使用 getContainer() 替代 _container
      let callbacks: {
        [key: string]: (() => void) | ((e: any) => void);
      } = {
        dragenter: function dragenter() {
          map.scrollWheelZoom.disable();
        },
        dragleave: function dragleave() {
          map.scrollWheelZoom.enable();
        },
        dragover: function dragover(e: any) {
          e.stopPropagation();
          e.preventDefault();
        },
        drop: function drop(e: any) {
          e.stopPropagation();
          e.preventDefault();
          if (thisLoader) {
            const files = e.dataTransfer.files;
            const ext = '.gpx,.kml,.json,.geojson'; // 设置默认的 ext 值
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              const fileName = file.name;
              const fileNameParts = fileName.split('.');
              const fileExt = fileNameParts[fileNameParts.length - 1];
              // 检查文件扩展名是否符合要求
              if (ext.includes(fileExt.toLowerCase())) {
                thisLoader.loadMultiple(files);
              } else {
                throw new Error(`Unsupported file type (${ext})`);
              }
            }

            map.scrollWheelZoom.enable();
          }
          //thisLoader.loadMultiple(e.dataTransfer.files);
          map.scrollWheelZoom.enable();
        },
      };

      for (callbackName in callbacks) {
        if (callbacks.hasOwnProperty(callbackName)) {
          dropbox.addEventListener(callbackName, callbacks[callbackName], false);
        }
      }
    }

    //更改原_initContainer
    private _appendControlStyles(container: any) {
      let fileControlStyleSheet = document.createElement('style');
      fileControlStyleSheet.setAttribute('type', 'text/css');
      fileControlStyleSheet.id = 'browser-file-css';
      fileControlStyleSheet.innerHTML +=
        " .leaflet-control-filelayer { display: flex; } .leaflet-control-filelayer a { background: #fff url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAoklEQVQ4T2NkoBAwUqifAWyAhoq523/Gf5UohjEyvr5561QYIQvABqirmf38z/Df5tat06dhGtTVzUIZ/jOEEjIEYoCq6f6bt087otsGNWQVDlf8vnnrFBteA/A5X13N7P/NW6cYRw0YPGGgZvb7P8N/K+SERCgFqquZgdIBKzga1dTMAhj//89nYGR0IKQRJs/475/jjTtnDlAnMxFrKzZ1ALrzaRGE3tGmAAAAAElFTkSuQmCC') no-repeat 5px; background-size: 16px 16px; display: block; border-radius: 2px; }";
      fileControlStyleSheet.innerHTML += ' .leaflet-control-filelayer a.leaflet-control-filelayer { background-position: center; }';
      container.appendChild(fileControlStyleSheet);
    }
  }

  export const FileLayer = {
    //FileLoader: FileLoader,
    fileLoader: function (map: L.Map, options: object) {
      return new FileLoader(map, options);
    },
  };

  export const Control = {
    //FileLayerLoad: FileLayerLoad,
    fileLayerLoad: function (options: object) {
      return new FileLayerLoad(options);
    },
  };
}
// @ts-ignore
L.FileLayer = {};
// @ts-ignore
L.FileLayer.FileLoader = filelayer.FileLoader;
// @ts-ignore
L.FileLayer.fileLoader = filelayer.FileLayer.fileLoader;
// @ts-ignore
L.Control.FileLayerLoad = filelayer.FileLayerLoad;
// @ts-ignore
L.Control.fileLayerLoad = filelayer.Control.fileLayerLoad;
/* // @ts-ignore
L.FileLayer = filelayer.FileLayer;
// @ts-ignore
L.Control.FileLayerLoad = filelayer.Control.FileLayerLoad;
// @ts-ignore
L.Control.fileLayerLoad = filelayer.Control.fileLayerLoad; */

//export { filelayer }; // 导出命名空间

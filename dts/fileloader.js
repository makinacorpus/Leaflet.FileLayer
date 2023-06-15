import L from 'leaflet';
import * as toGeoJSON from 'togeojson';
class FileLoader extends L.Layer {
    constructor(map, options) {
        super(options);
        this.options = {
            layer: L.geoJSON,
            layerOptions: {},
            fileSizeLimit: 1024,
            addToMap: true,
        };
        this._map = map;
        L.Util.setOptions(this, options);
        this._parsers = {
            geojson: this._loadGeoJSON.bind(this),
            json: this._loadGeoJSON.bind(this),
            gpx: (content, format) => this._convertToGeoJSON(content, format),
            kml: (content, format) => this._convertToGeoJSON(content, format),
        };
    }
    getFileExtension(file) {
        let fileName = '';
        if (typeof file === 'string') {
            fileName = file;
        }
        else {
            fileName = file.name;
        }
        const dotIndex = fileName.lastIndexOf('.');
        if (dotIndex !== -1 && dotIndex < fileName.length - 1) {
            return fileName.substring(dotIndex + 1).toLowerCase();
        }
        return '';
    }
    load(file, ext) {
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
        const reader = new FileReader();
        reader.onload = L.Util.bind((e) => {
            try {
                this.fire('data:loading', { filename: file.name, format: parser.ext });
                const layer = parser.processor.call(this, e.target.result, parser.ext);
                this.fire('data:loaded', {
                    layer: layer,
                    filename: file.name,
                    format: parser.ext,
                });
            }
            catch (err) {
                this.fire('data:error', { error: err });
            }
        }, this);
        // Testing trick: tests don't pass a real file,
        // but an object with file.testing set to true.
        // This object cannot be read by reader, just skip it.
        if (typeof file === 'object' && file.testing) {
            return reader;
        }
        else {
            reader.readAsText(file);
        }
        // We return this to ease testing
        return reader;
    }
    loadMultiple(files, ext) {
        let readers = [];
        if (files[0]) {
            //Convert to a real array。
            files = Array.prototype.slice.apply(files);
            while (files.length > 0) {
                //Removes the first element of the array and returns its value
                const file = files.shift();
                if (file) {
                    readers.push(this.load(file, ext));
                }
            }
        }
        // return first reader (or false if no file),
        // which is also used for subsequent loadings
        return readers;
    }
    loadData(data, name, ext) {
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
        }
        catch (err) {
            this.fire('data:error', { error: err });
        }
    }
    _isParameterMissing(v, vname) {
        if (typeof v === 'undefined') {
            this.fire('data:error', {
                error: new Error(`Missing parameter:${vname}`),
            });
            return true;
        }
        return false;
    }
    _getParser(name, ext) {
        ext = ext || name.split('.').pop();
        const parser = this._parsers[ext];
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
    _isFileSizeOk(size) {
        //Converts a string to a floating point number
        let fileSize = parseFloat((size / 1024).toFixed(4));
        if (fileSize > this.options.fileSizeLimit) {
            this.fire('data:error', {
                error: new Error(`File size exceeds limit (${fileSize} > ${this.options.fileSizeLimit} 'kb)`),
            });
            return false;
        }
        return true;
    }
    _loadGeoJSON(content) {
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
    _convertToGeoJSON(content, format) {
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
    fileLoader: function (map, options) {
        return new FileLoader(map, options);
    },
};
export { FileLoader, FileLayer };

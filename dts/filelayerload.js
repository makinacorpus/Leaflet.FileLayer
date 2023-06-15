import L from 'leaflet';
import { FileLayer } from './fileloader';
class FileLayerLoad extends L.Control {
    constructor(options) {
        super(options);
        this.options = {
            title: 'Load local file (GPX, KML, GeoJSON)',
            position: 'topleft',
            fitBounds: true,
            layerOptions: {},
            addToMap: true,
            fileSizeLimit: 1024,
            formats: ['gpx', 'kml', 'json', 'geojson'],
        };
        L.Util.setOptions(this, options);
        this.loader = null;
    }
    onAdd(map) {
        const control = this;
        this.loader = FileLayer.fileLoader(map, this.options);
        if (this.loader) {
            this.loader.on('data:loaded', function (e) {
                // Fit bounds after loading
                if (control.options.fitBounds) {
                    window.setTimeout(function () {
                        map.fitBounds(e.layer.getBounds());
                    }, 500);
                }
            }, this);
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
    //Add ICON
    _createIcon() {
        const thisLoader = this.loader;
        // Create a button, and bind click on hidden file input
        const zoomName = 'leaflet-control-filelayer leaflet-control-zoom';
        const barName = 'leaflet-bar';
        const partName = `${barName}-part` + '';
        const container = L.DomUtil.create('div', `${zoomName}  ${barName}`);
        const link = L.DomUtil.create('a', `${zoomName} -in ${partName}`, container);
        if (this.options.title) {
            link.title = this.options.title;
        }
        if (!document.getElementById('browser-file-css')) {
            this._appendControlStyles(container);
        }
        link.href = '#';
        // Create an invisible file input
        const fileInput = L.DomUtil.create('input', 'hidden', container);
        fileInput.type = 'file';
        fileInput.multiple = true;
        if (!this.options.formats) {
            fileInput.accept = '.gpx,.kml,.json,.geojson';
        }
        else {
            fileInput.accept = this.options.formats.join(',');
        }
        fileInput.style.display = 'none';
        // Load on file change
        if (fileInput) {
            fileInput.addEventListener('change', function () {
                if (thisLoader) {
                    if (this.files) {
                        thisLoader.loadMultiple(this.files);
                    }
                }
                // reset so that the user can upload the same file again if they want to
                this.value = '';
            }, false);
        }
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(link, 'click', function (e) {
            fileInput.click();
            e.preventDefault();
        });
        return container;
    }
    _initDragAndDrop(map) {
        let callbackName;
        let thisLoader = this.loader;
        let ext = this.options.formats;
        //Use getContainer() instead of the old _container method
        let dropbox = map.getContainer();
        let callbacks = {
            dragenter: function dragenter() {
                map.scrollWheelZoom.disable();
            },
            dragleave: function dragleave() {
                map.scrollWheelZoom.enable();
            },
            dragover: function dragover(e) {
                e.stopPropagation();
                e.preventDefault();
            },
            drop: function drop(e) {
                e.stopPropagation();
                e.preventDefault();
                if (thisLoader) {
                    const files = e.dataTransfer.files;
                    //Set the default ext value
                    //const ext = '.gpx,.kml,.json,.geojson'; 
                    //const ext = this.options.formats 
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const fileName = file.name;
                        const fileNameParts = fileName.split('.');
                        const fileExt = fileNameParts[fileNameParts.length - 1];
                        // 检查文件扩展名是否符合要求
                        if (ext.includes(fileExt.toLowerCase())) {
                            thisLoader.loadMultiple(files);
                        }
                        else {
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
    _appendControlStyles(container) {
        let fileControlStyleSheet = document.createElement('style');
        fileControlStyleSheet.setAttribute('type', 'text/css');
        fileControlStyleSheet.id = 'browser-file-css';
        fileControlStyleSheet.innerHTML +=
            " .leaflet-control-filelayer { display: flex; } .leaflet-control-filelayer a { background: #fff url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAoklEQVQ4T2NkoBAwUqifAWyAhoq523/Gf5UohjEyvr5561QYIQvABqirmf38z/Df5tat06dhGtTVzUIZ/jOEEjIEYoCq6f6bt087otsGNWQVDlf8vnnrFBteA/A5X13N7P/NW6cYRw0YPGGgZvb7P8N/K+SERCgFqquZgdIBKzga1dTMAhj//89nYGR0IKQRJs/475/jjTtnDlAnMxFrKzZ1ALrzaRGE3tGmAAAAAElFTkSuQmCC') no-repeat 5px; background-size: 16px 16px; display: block; border-radius: 2px; }";
        fileControlStyleSheet.innerHTML += ' .leaflet-control-filelayer a.leaflet-control-filelayer { background-position: center; }';
        container.appendChild(fileControlStyleSheet);
    }
}
const Control = {
    //FileLayerLoad: FileLayerLoad,
    fileLayerLoad: function (options) {
        return new FileLayerLoad(options);
    },
};
export { FileLayerLoad, Control };

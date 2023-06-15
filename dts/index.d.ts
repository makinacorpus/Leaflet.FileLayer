import { FileLayerLoad, Control } from './filelayerload';
import { FileLoader, FileLayer } from './fileloader';
declare global {
    interface Window {
        L: typeof import('leaflet');
        toGeoJSON: typeof import('togeojson');
    }
}
export { FileLayerLoad, Control, FileLoader, FileLayer };

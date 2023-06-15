import L from 'leaflet';
import { fileLoader, LayerOptions, Parsers } from './interfaces';
declare class FileLoader extends L.Layer implements fileLoader {
    options: LayerOptions;
    _parsers: Parsers;
    constructor(map: L.Map, options?: L.LayerOptions);
    getFileExtension(file: File | string): string;
    load(file: File, ext?: string): FileReader | boolean;
    loadMultiple(files: File[] | FileList, ext?: string): FileReader[];
    loadData(data: string, name: string, ext: string): void;
    _isParameterMissing(v: any, vname: string): boolean;
    _getParser(name: string, ext?: string): {
        processor: Function;
        ext: string;
    } | undefined;
    _isFileSizeOk(size: number): boolean;
    _loadGeoJSON(content: string | GeoJSON.GeoJsonObject | GeoJSON.GeoJsonObject[]): L.Layer;
    _convertToGeoJSON(content: string | Document, format: 'gpx' | 'kml'): L.Layer;
}
declare const FileLayer: {
    fileLoader: (map: L.Map, options: object) => FileLoader;
};
export { FileLoader, FileLayer };

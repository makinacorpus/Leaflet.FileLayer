import L from 'leaflet';
import * as toGeoJSON from 'togeojson';

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
  formats: string[];
}
interface fileLoader extends L.Layer {
  options: LayerOptions;
  getFileExtension(file: File | string): string;
  load(file: File, ext: string): FileReader | boolean;
  loadMultiple(files: File[] | FileList): FileReader[];
  loadData(data: string, name: string, ext: string): boolean | void;
  _isParameterMissing(v: any, vname: string): boolean;
  _getParser(name: string, ext?: string): { processor: Function; ext: string } | undefined;
  _isFileSizeOk(size: number): boolean;
  _loadGeoJSON(content: any): any;
  _convertToGeoJSON(content: any, format: keyof typeof toGeoJSON): any;
}
interface Parsers {
  [key: string]: (content: string | GeoJSON.GeoJsonObject, format: 'gpx' | 'kml') => L.Layer;
}
interface fileLayerLoad extends L.Control {
  options: ControlOptions;
  onAdd(map: L.Map): HTMLElement;
  _createIcon(): void;
  _initDragAndDrop(map: L.Map): void;
  _appendControlStyles(container: any): void;
}

export { fileLoader, LayerOptions, ControlOptions, fileLayerLoad, Parsers };

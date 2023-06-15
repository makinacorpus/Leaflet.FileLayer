import L from 'leaflet';
import { ControlOptions, fileLayerLoad } from './interfaces';
declare class FileLayerLoad extends L.Control implements fileLayerLoad {
    options: ControlOptions;
    private loader?;
    constructor(options: Partial<ControlOptions>);
    onAdd(map: L.Map): HTMLElement;
    _createIcon(): HTMLDivElement;
    _initDragAndDrop(map: L.Map): void;
    _appendControlStyles(container: any): void;
}
declare const Control: {
    fileLayerLoad: (options: object) => FileLayerLoad;
};
export { FileLayerLoad, Control };

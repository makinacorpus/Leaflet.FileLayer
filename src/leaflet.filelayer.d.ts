import L from 'leaflet';
export declare const FileLoader: (new (...args: any[]) => any) & typeof L.Class;
export declare const FileLayerLoad: (new (...args: any[]) => {
    options: {
        title: string;
        position: string;
        fitBounds: boolean;
        layerOptions: {};
        addToMap: boolean;
        fileSizeLimit: number;
    };
    initialize: (options: any) => void;
    onAdd: (map: any) => HTMLDivElement;
    _createIcon: () => HTMLDivElement;
    _initDragAndDrop: (map: any) => void;
    _appendControlStyles: (container: any) => void;
}) & typeof L.Control;
export declare const FileLayer: {
    FileLoader: (new (...args: any[]) => any) & typeof L.Class;
    fileLoader: (map: any, options: any) => any;
};
export declare const Control: {
    fileLayerLoad: (options: any) => {
        options: {
            title: string;
            position: string;
            fitBounds: boolean;
            layerOptions: {};
            addToMap: boolean;
            fileSizeLimit: number;
        };
        initialize: (options: any) => void;
        onAdd: (map: any) => HTMLDivElement;
        _createIcon: () => HTMLDivElement;
        _initDragAndDrop: (map: any) => void;
        _appendControlStyles: (container: any) => void;
    } & L.Control;
};
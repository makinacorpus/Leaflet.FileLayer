import L from 'leaflet';
import { FileLayerLoad, Control } from './filelayerload';
import { FileLoader, FileLayer } from './fileloader'
//import './filelayerload';
//import './fileloader';
//import { fileLoader, LayerOptions, ControlOptions, fileLayerLoad } from './interfaces'
//import './interfaces'
// @ts-ignore
L.FileLayer = {};
// @ts-ignore
L.FileLayer.FileLoader = FileLoader;
// @ts-ignore
L.FileLayer.fileLoader = FileLayer.fileLoader;
// @ts-ignore
L.Control.FileLayerLoad = FileLayerLoad;
// @ts-ignore
L.Control.fileLayerLoad = Control.fileLayerLoad;

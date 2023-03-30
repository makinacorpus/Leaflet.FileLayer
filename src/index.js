
import '../node_modules/leaflet/dist/leaflet.css'

import $ from "jquery";
window.$ =$;
window.$ ='jquery'
import L from '../node_modules/leaflet/dist/leaflet.js';
window.L =L;
//This code is needed to properly load the images in the Leaflet CSS 
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

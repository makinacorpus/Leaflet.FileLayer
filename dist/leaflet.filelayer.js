/*! For license information please see leaflet.filelayer.js.LICENSE.txt */
!function(){var e={271:function(e,t,o){var r,i;!function(){"use strict";var e={"./ts/filelayerload.ts":function(e,t,o){o.r(t),o.d(t,{Control:function(){return s},FileLayerLoad:function(){return a}});var r=o("leaflet"),i=o.n(r),n=o("./ts/fileloader.ts");class a extends i().Control{constructor(e){super(e),this.options={title:"Load local file (GPX, KML, GeoJSON)",position:"topleft",fitBounds:!0,layerOptions:{},addToMap:!0,fileSizeLimit:1024,formats:["gpx","kml","json","geojson"]},i().Util.setOptions(this,e),this.loader=null}onAdd(e){const t=this;this.loader=n.FileLayer.fileLoader(e,this.options),this.loader&&this.loader.on("data:loaded",(function(o){t.options.fitBounds&&window.setTimeout((function(){e.fitBounds(o.layer.getBounds())}),500)}),this),this._initDragAndDrop(e);const o=this._createIcon();return e.getContainer().appendChild(o),o}_createIcon(){const e=this.loader,t="leaflet-control-filelayer leaflet-control-zoom",o="leaflet-bar",r=`${o}-part`,n=i().DomUtil.create("div",`${t}  ${o}`),a=i().DomUtil.create("a",`${t} -in ${r}`,n);this.options.title&&(a.title=this.options.title),document.getElementById("browser-file-css")||this._appendControlStyles(n),a.href="#";const s=i().DomUtil.create("input","hidden",n);return s.type="file",s.multiple=!0,this.options.formats?s.accept=this.options.formats.join(","):s.accept=".gpx,.kml,.json,.geojson",s.style.display="none",s&&s.addEventListener("change",(function(){e&&this.files&&e.loadMultiple(this.files),this.value=""}),!1),i().DomEvent.disableClickPropagation(n),i().DomEvent.on(a,"click",(function(e){s.click(),e.preventDefault()})),n}_initDragAndDrop(e){let t,o=this.loader,r=this.options.formats,i=e.getContainer(),n={dragenter:function(){e.scrollWheelZoom.disable()},dragleave:function(){e.scrollWheelZoom.enable()},dragover:function(e){e.stopPropagation(),e.preventDefault()},drop:function(t){if(t.stopPropagation(),t.preventDefault(),o){const i=t.dataTransfer.files;for(let e=0;e<i.length;e++){const t=i[e].name.split("."),n=t[t.length-1];if(!r.includes(n.toLowerCase()))throw new Error(`Unsupported file type (${r})`);o.loadMultiple(i)}e.scrollWheelZoom.enable()}e.scrollWheelZoom.enable()}};for(t in n)n.hasOwnProperty(t)&&i.addEventListener(t,n[t],!1)}_appendControlStyles(e){let t=document.createElement("style");t.setAttribute("type","text/css"),t.id="browser-file-css",t.innerHTML+=" .leaflet-control-filelayer { display: flex; } .leaflet-control-filelayer a { background: #fff url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAoklEQVQ4T2NkoBAwUqifAWyAhoq523/Gf5UohjEyvr5561QYIQvABqirmf38z/Df5tat06dhGtTVzUIZ/jOEEjIEYoCq6f6bt087otsGNWQVDlf8vnnrFBteA/A5X13N7P/NW6cYRw0YPGGgZvb7P8N/K+SERCgFqquZgdIBKzga1dTMAhj//89nYGR0IKQRJs/475/jjTtnDlAnMxFrKzZ1ALrzaRGE3tGmAAAAAElFTkSuQmCC') no-repeat 5px; background-size: 16px 16px; display: block; border-radius: 2px; }",t.innerHTML+=" .leaflet-control-filelayer a.leaflet-control-filelayer { background-position: center; }",e.appendChild(t)}}const s={fileLayerLoad:function(e){return new a(e)}}},"./ts/fileloader.ts":function(e,t,o){o.r(t),o.d(t,{FileLayer:function(){return s},FileLoader:function(){return a}});var r=o("leaflet"),i=o.n(r),n=o("togeojson");class a extends i().Layer{constructor(e,t){super(t),this.options={layer:i().geoJSON,layerOptions:{},fileSizeLimit:1024,addToMap:!0},this._map=e,i().Util.setOptions(this,t),this._parsers={geojson:this._loadGeoJSON.bind(this),json:this._loadGeoJSON.bind(this),gpx:(e,t)=>this._convertToGeoJSON(e,t),kml:(e,t)=>this._convertToGeoJSON(e,t)}}getFileExtension(e){let t="";t="string"==typeof e?e:e.name;const o=t.lastIndexOf(".");return-1!==o&&o<t.length-1?t.substring(o+1).toLowerCase():""}load(e,t){if(this._isParameterMissing(e,"file"))return!1;if(!this._isFileSizeOk(e.size))return!1;const o=this._getParser(e.name,t);if(!o)return!1;const r=new FileReader;return r.onload=i().Util.bind((t=>{try{this.fire("data:loading",{filename:e.name,format:o.ext});const r=o.processor.call(this,t.target.result,o.ext);this.fire("data:loaded",{layer:r,filename:e.name,format:o.ext})}catch(e){this.fire("data:error",{error:e})}}),this),"object"==typeof e&&e.testing||r.readAsText(e),r}loadMultiple(e,t){let o=[];if(e[0])for(e=Array.prototype.slice.apply(e);e.length>0;){const r=e.shift();r&&o.push(this.load(r,t))}return o}loadData(e,t,o){if(this._isParameterMissing(e,"data")||this._isParameterMissing(t,"name"))return;if(!this._isFileSizeOk(e.length))return;const r=this._getParser(t,o);if(r)try{this.fire("data:loading",{filename:t,format:r.ext});const o=r.processor.call(this,e,r.ext);this.fire("data:loaded",{layer:o,filename:t,format:r.ext})}catch(e){this.fire("data:error",{error:e})}}_isParameterMissing(e,t){return void 0===e&&(this.fire("data:error",{error:new Error(`Missing parameter:${t}`)}),!0)}_getParser(e,t){t=t||e.split(".").pop();const o=this._parsers[t];if(o)return{processor:o,ext:t};this.fire("data:error",{error:new Error(`Unsupported file type (${t})`)})}_isFileSizeOk(e){let t=parseFloat((e/1024).toFixed(4));return!(t>this.options.fileSizeLimit&&(this.fire("data:error",{error:new Error(`File size exceeds limit (${t} > ${this.options.fileSizeLimit} 'kb)`)}),1))}_loadGeoJSON(e){"string"==typeof e&&(e=JSON.parse(e));const t=this.options.layer(e,this.options.layerOptions);if(0===t.getLayers().length)throw new Error("GeoJSON has no valid layers.");return this.options.addToMap&&t.addTo(this._map),t}_convertToGeoJSON(e,t){"string"==typeof e&&(e=(new window.DOMParser).parseFromString(e,"text/xml"));const o=n[t](e);return this._loadGeoJSON(o)}}const s={fileLoader:function(e,t){return new a(e,t)}}},"./ts/index.ts":function(e,n,a){a.r(n),a.d(n,{Control:function(){return s.Control},FileLayer:function(){return l.FileLayer},FileLayerLoad:function(){return s.FileLayerLoad},FileLoader:function(){return l.FileLoader}});var s=a("./ts/filelayerload.ts"),l=a("./ts/fileloader.ts");e=a.hmd(e),function(n,s){a.amdO&&s.toGeoJSON?(r=[o(31)],void 0===(i=function(e){n(e,s.toGeoJSON)}.apply(t,r))||(e.exports=i)):e.exports?e.exports=function(e,t,o){return void 0===t&&(t=void 0!==s?a("leaflet"):a("leaflet")(e)),void 0===o&&(o=void 0!==s?a("togeojson"):a("togeojson")(e)),n(t,o),t}:void 0!==s&&s.L&&s.toGeoJSON&&n(s.L,s.toGeoJSON)}((function(e,t){e&&t&&(e.FileLayer={},e.FileLayer.FileLoader=l.FileLoader,e.FileLayer.fileLoader=l.FileLayer.fileLoader,e.Control.FileLayerLoad=s.FileLayerLoad,e.Control.fileLayerLoad=s.Control.fileLayerLoad)}),window)},leaflet:function(e){e.exports=L},togeojson:function(e){e.exports=toGeoJSON}},n={};function a(t){var o=n[t];if(void 0!==o)return o.exports;var r=n[t]={id:t,loaded:!1,exports:{}};return e[t](r,r.exports,a),r.loaded=!0,r.exports}a.amdO={},a.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(t,{a:t}),t},a.d=function(e,t){for(var o in t)a.o(t,o)&&!a.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},a.hmd=function(e){return(e=Object.create(e)).children||(e.children=[]),Object.defineProperty(e,"exports",{enumerable:!0,set:function(){throw new Error("ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: "+e.id)}}),e},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a("./ts/index.ts")}()},31:function(e){"use strict";e.exports=L}},t={};function o(r){var i=t[r];if(void 0!==i)return i.exports;var n=t[r]={exports:{}};return e[r](n,n.exports,o),n.exports}o.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(t,{a:t}),t},o.d=function(e,t){for(var r in t)o.o(t,r)&&!o.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},function(){"use strict";o(271)}()}();
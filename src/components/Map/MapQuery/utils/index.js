import { DrawRectangleMapTool } from '../../common/maptool/DrawRectangleMapTool';
import { DrawPolygonMapTool } from '../../common/maptool/DrawPolygonMapTool';

const colors = ['#FFFF00', '#B4EEB4', '#9F79EE', '#F0FFFF', '#FFC0CB'];

const bestScale = 500; // 新奥最佳显示比例 ，定图定位设备按照此比例尺来显示

export default class MapApi {
  constructor(target) {
    this.map = target;
    this.display = target.getMapDisplay();
    this.mapTool = {destroy: () => {}};
  }
  startRectange(layer) {
    this.mapTool.destroy();
    const showLayer = typeof layer === 'string' && layer.length > 0;
    if (showLayer) this.clearLayer(layer);
    return new Promise((resolve) => {
      this.mapTool = new DrawRectangleMapTool(this.map.getMapObj(), this.map.getApiUrl(), (geo) => {
        const {type, xmin, ymin, xmax, ymax, spatialReference} = geo;
        if (showLayer) this.polygon({gid: 1, dots: [{x: xmin, y: ymin}, {x: xmin, y: ymax}, {x: xmax, y: ymax}, {x: xmax, y: ymin}]}, layer);
        this.mapTool.destroy();
        resolve({type, xmin, ymin, xmax, ymax, spatialReference});
      });
      this.mapTool.init();
    });
  }
  startPolygon(layer) {
    this.mapTool.destroy();
    const showLayer = typeof layer === 'string' && layer.length > 0;
    if (showLayer) this.clearLayer(layer);
    return new Promise((resolve) => {
      this.mapTool = new DrawPolygonMapTool(this.map.getMapObj(), this.map.getApiUrl(), (geo) => {
        const {type, rings, spatialReference} = geo;
        if (showLayer) this.polygon({gid: 1, dots: rings[0].map(x => ({x: x[0], y: x[1]}))}, layer);
        this.mapTool.destroy();
        resolve({type, rings, spatialReference});
      });
      this.mapTool.init();
    });
  }
  stopEditer() {
    this.mapTool.destroy();
    return this;
  }
  point(datas, layer, prop = {}) {
    if (Array.isArray(datas)) {
      datas.forEach(x => this.point(x, layer, x.prop || prop));
    } else {
      this.display.point({ id: datas.gid, attr: datas, layerId: layer, x: datas.x, y: datas.y, markersize: 8, linecolor: [255, 0, 0], fillcolor: [135, 206, 235], ...prop});
    }
    return this;
  }
  polyline(datas, layer, prop = {}) {
    if (Array.isArray(datas)) {
      datas.forEach(x => this.polyline(x, layer, x.prop || prop));
    } else {
      this.display.polyline({ id: datas.gid, attr: datas, layerId: layer, width: 2, dots: datas.lines, ...prop});
    }
    return this;
  }
  polygon(datas, layer, prop = {}) {
    if (Array.isArray(datas)) {
      datas.forEach(x => this.polygon(x, layer, x.prop || prop));
    } else {
      this.display.polygon({id: datas.gid, attr: datas, layerId: layer, dots: datas.dots, ...prop});
    }
    return this;
  }
  sharkLine(line, prop = {}) {
    let i = 0;
    const layer = 'shark_0000000000000001';
    const {geometry: {paths}} = line;
    const val = setInterval(() => {
      if (i++ < colors.length) {
        paths.map(path => this.display.polyline({...prop, id: layer, layerId: layer, color: colors[i - 1], dots: path.map(o => ({x: o[0], y: o[1]})), layerIndex: 1000}));
      } else {
        clearInterval(val);
        this.display.removeLayer(layer);
      }
    }, 200);
    return this;
  }
  sharkPonit(point, prop = {}) {
    let i = 0;
    const layer = 'shark_0000000000000002';
    const {geometry: {x, y}} = point;
    const val = setInterval(() => {
      if (i++ < colors.length) {
        this.display.point({...prop, id: layer, layerId: layer, x, y, linecolor: colors[i - 1], fillcolor: colors[i - 1], layerIndex: 1000});
      } else {
        clearInterval(val);
        this.display.removeLayer(layer);
      }
    }, 200);
    return this;
  }
  drawFeaturesPoint(features, layer, prop = {}) {
    features.forEach(feature => {
      const {attributes, geometry} = feature;
      this.display.point({ id: attributes.gid, attr: attributes, layerId: layer, x: geometry.x, y: geometry.y, markersize: 8, linecolor: [255, 0, 0], fillcolor: [135, 206, 235], ...prop});
    });
    return this;
  }
  drawFeaturesLine(features, layer, prop = {}) {
    features.forEach(feature => {
      const {attributes, geometry} = feature;
      geometry.paths.forEach((path, i) => {
        this.display.polyline({ id: `${attributes.gid}_${i}`, attr: attributes, layerId: layer, width: 2, dots: path.map(o => ({x: o[0], y: o[1]})), ...prop});
      });
    });
    return this;
  }
  getMapExtent() {
    const {type, xmin, ymin, xmax, ymax, spatialReference} = this.map.getMapObj().extent;
    return {type, xmin, ymin, xmax, ymax, spatialReference};
  }
  getMap() {
    return this.map.getMapObj();
  }
  getSpatialReference() {
    return this.map.getMapObj().spatialReference;
  }
  showTip(x, y, title, content) {
    this.centerZoom(x, y, bestScale);
    this.map.popup({x, y, info: {title, content}});
    return this;
  }
  closeTip() {
    const {infoWindow} = this.map.getMapObj();
    infoWindow.hide();
    return this;
  }
  clear() {
    this.display.clear();
    return this;
  }
  clearLayer(layers) {
    if (Array.isArray(layers)) {
      layers.forEach(x => this.clearLayer(x));
    } else if (typeof layers === 'string') {
      this.display.removeLayer(layers);
    }
    return this;
  }
  centerAtPolygon(area) {
    const pts = area.rings.reduce((a, b) => a.concat(b), []);
    const xs = pts.map(x => x[0]);
    const ys = pts.map(x => x[1]);
    this.map.centerAt({ x: (Math.max(...xs) + Math.min(...xs)) / 2, y: (Math.max(...ys) + Math.min(...ys)) / 2});
    return this;
  }
  centerAtPath(paths) {
    const pts = paths.reduce((a, b) => a.concat(b), []);
    const xs = pts.map(x => x[0]);
    const ys = pts.map(x => x[1]);
    this.map.centerAt({ x: (Math.max(...xs) + Math.min(...xs)) / 2, y: (Math.max(...ys) + Math.min(...ys)) / 2});
    return this;
  }
  centerAt(center) {
    if (Array.isArray(center)) {
      const [x, y] = center;
      this.map.centerAt({x, y});
    } else {
      const {x, y} = center;
      this.map.centerAt({x, y});
    }
    return this;
  }
  centerZoom(x, y, scale) {
    const map = this.map.getMapObj();
    const {__tileInfo: {lods}} = map;
    let level = 18;
    for (let i = 0; i < lods.length; i++) {
      if (Math.abs(scale - lods[i].scale) < 5) {
        level = i;
        break;
      }
    }
    map.centerAndZoom({ x, y, spatialReference: map.spatialReference }, level);
    return this;
  }
}

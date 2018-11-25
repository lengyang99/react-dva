import { loadModules } from 'esri-loader';
import _ from 'lodash';
import {guid} from '../../../components/Map/MapQuery/controls';

const dpi = 0.0254000508 / 96; // 像素dpi
const ppx = 14 * dpi; // 点的捕捉大小14px
const lpx = 14 * dpi; // 线的吸附大小14px

const showMapColor = [ // 区域显示颜色
  { polygon: [247, 198, 198, 0.6], polyline: [238, 140, 141, 0.8] },
  { polygon: [255, 252, 186, 0.6], polyline: [255, 249, 117, 0.8] },
  { polygon: [198, 229, 204, 0.6], polyline: [140, 202, 153, 0.8] },
  { polygon: [252, 230, 209, 0.6], polyline: [248, 205, 162, 0.8] },
  { polygon: [249, 210, 226, 0.6], polyline: [242, 165, 197, 0.8] },
];

const layers = [ // 图层名称
  {layerId: guid(), layerIndex: 1, desc: '底图'},
  {layerId: guid(), layerIndex: 2, desc: '线'},
  {layerId: guid(), layerIndex: 3, desc: '点'},
  {layerId: guid(), layerIndex: 1000, desc: 'tips'},
];

export default (target) => { // 编辑工具扩展类
  const geometrys = [];
  const {map, mapDisplay: display, apiUrl} = target;

  const evtMng = () => { // 事件管理器
    const events = [];
    return {
      addEvent(element, name, callback) {
        const headle = element.on(name, callback);
        events.push({name, remove: () => headle.remove()});
      },
      clear() {
        events.forEach(x => x.remove());
        events.length = 0;
      },
    };
  };

  const geometric = () => { // 几何关系
    const getVector = (start, end) => ({x: start.x - end.x, y: start.y - end.y}); // 获取向量

    const getLength = (point) => Math.sqrt(point.x * point.x + point.y * point.y); // 获取向量模

    const getDistance = (start, end) => getLength(getVector(start, end)); // 获取两点间距离

    const isValid = (point, start, end) => (point.x >= start.x && point.x <= end.x) || (point.x <= start.x && point.x >= end.x); // 验证中心点在有效范围

    const getPowerPoint = (point, start, end) => { // 获取垂直投影点
      const {x: x1, y: y1} = point;
      const {x: x2, y: y2} = start;
      const {x: x3, y: y3} = getVector(start, end);
      const lg = x3 * x3 + y3 * y3;
      if (lg === 0) return {x: x2, y: y2}; // 当start为 end 为同一个点时
      const v1 = x1 * x3 + y1 * y3;
      const v2 = y2 * x3 - x2 * y3;
      const center = {x: (v1 * x3 - v2 * y3) / lg, y: (v1 * y3 + v2 * x3) / lg};
      if (isValid(center, start, end)) return center;
      return null;
    };

    const getMinPoint = (point, points, distance) => { // 获取最小点
      const items = points.map(x => ({point: x, distance: getDistance(x, point)})).filter(x => x.distance < distance);
      const min = _.minBy(items, 'distance');
      return min && min.point;
    };

    return {
      getLinePoints(start, end, length) {
        const {x: x1, y: y1} = getVector(start, end);
        const {x: x2, y: y2} = start;
        const v1 = Math.sqrt(x1 * x1 + y1 * y1);
        const x3 = length * y1 / v1;
        const y3 = length * x1 / v1;
        return [{x: x2 - x3, y: y2 + y3}, {x: x2 + x3, y: y2 - y3}];
      },
      track: ({points, lines}) => (point, scale) => { // 获取最近的点
        let value = getMinPoint(point, points, ppx * scale);
        if (value) return {lx: 1, point: value};
        value = getMinPoint(point, lines.map(x => getPowerPoint(point, x[0], x[1])).filter(x => x), lpx * scale);
        if (value) return {lx: 2, point: value};
        return {lx: 0};
      },
    };
  };

  const layer = { // 图层管理
    clear() { layers.forEach(x => display.removeLayer(x.layerId)); },
    clearCapture() { layer.remove(layers[1]); layer.remove(layers[2]); },
    remove(obj) { display.removeLayer(obj && obj.layerId || obj); },
  };

  const draw = { // 绘制对象
    point(data, prop = {}) {
      const {gid, x, y} = data;
      return display.point({ id: `${gid}`, attr: data, ...layers[2], x, y, markersize: 8, linecolor: [255, 0, 0], fillcolor: [135, 206, 235], ...prop});
    },
    polyline(data, prop = {}) {
      const {gid, dots} = data;
      return display.polyline({ id: `${gid}`, attr: data, ...layers[1], width: 2, dots, ...prop});
    },
    polygon(data, prop = {}) {
      const {gid, dots} = data;
      const idx = gid % showMapColor.length;
      return display.polygon({ id: `${gid}`, attr: data, ...layers[0], dots, fillcolor: showMapColor[idx].polygon, linecolor: showMapColor[idx].polyline, ...prop});
    },
    text(data, prop = {}) {
      const {gid, x, y, text} = data;
      return display.text({ id: `${gid}`, attr: data, x, y, text, ...layers[3], ...prop});
    },
  };

  const extend = {
    getCapture(gid) {
      const getLines = (dots) => { // 获取线
        const lines = [];
        for (let i = 0, j = dots.length - 1; i < j; i++) {
          lines.push([dots[i], dots[i + 1]]);
        }
        return lines;
      };
      const dots = geometrys.filter(x => x.gid !== gid).map(x => x.dots);
      return {
        points: dots.reduce((a, b) => a.concat(b), []),
        lines: dots.map(getLines).reduce((a, b) => a.concat(b), []),
      };
    },
    getGraphic(gid) {
      const [{polygon}] = geometrys.filter(x => x.gid === gid);
      return polygon;
    },
    setGraphic(gid, polygon) {
      const [graphic] = geometrys.filter(x => x.gid === gid);
      graphic.polygon = polygon;
    },
  };

  const self = (obj) => Object.keys(obj).reduce((a, b) => Object.assign(a, {[b]: (...c) => { return obj[b](...c) || a; }}), {}); // 转化成链式写法

  return loadModules(['esri/toolbars/edit', 'esri/geometry/Point'], { url: apiUrl }).then(([Edit, Point]) => {
    const activateVal = Edit.EDIT_VERTICES | /* Edit.MOVE | */ Edit.ROTATE | Edit.SCALE;
    const editTool = new Edit(map, { allowAddVertices: true, allowDeleteVertices: true});
    const getPoint = (point) => new Point(point.x, point.y, map.spatialReference);

    const events = evtMng();
    const {getLinePoints, track} = geometric();

    const capture = (tracker) => { // 捕获对象
      let value = null;
      let rings = null;
      const showCapture = (obj, pt, scale) => {
        const {lx, point} = obj;
        if (lx > 0) {
          draw.point({gid: 1, ...point}, {fillcolor: 'white', markersize: 14});
          if (lx === 2) draw.polyline({gid: 1, dots: getLinePoints(point, pt, scale * 150 * dpi)}, {width: 1, style: 'STYLE_DASH'});
          else layer.remove(layers[1]);
          return point;
        } else layer.clearCapture();
      };

      return {
        move(evt) {
          const {transform: {dx, dy}, vertexinfo: {graphic}} = evt;
          const scale = map.getScale();
          const point = map.toMap(map.toScreen(graphic.geometry).offset(dx, dy));
          value = showCapture(tracker(point, scale), point, scale);
        },
        stop(evt) {
          if (value) {
            const {vertexinfo: {graphic, segmentIndex, pointIndex}} = evt;
            const point = getPoint(value);
            graphic.setGeometry(point);
            const {geometry} = evt.graphic;
            geometry.setPoint(segmentIndex, pointIndex, point);
            if (pointIndex === 0) geometry.setPoint(segmentIndex, geometry.rings.length, point);
            evt.graphic.setGeometry(geometry);
            layer.clearCapture();
            rings = geometry.rings;
          }
          const {geometry, attributes: {gid, name, usernames}} = evt.graphic;
          drawTip(gid, geometry.getExtent(), name, usernames);
          value = null;
        },
        getGraphic() {
          return rings;
        },
      };
    };

    const keyDown = (attr) => {
      const deactivate = (func) => {
        editTool.deactivate();
        layer.clearCapture();
        func();
      };

      return new Promise((resolve, reject) => {
        events.addEvent(map, 'key-down', (evt) => {
          if (evt.keyCode === 27) { // Esc
            const polygon = draw.polygon(attr);
            const {gid, name, usernames} = attr;
            extend.setGraphic(gid, polygon);
            drawTip(gid, polygon.geometry.getExtent(), name, usernames);
            deactivate(reject);
          } else if (evt.keyCode === 13) deactivate(resolve);
        });
      });
    };

    const drawTip = (gid, extent, name, usernames) => {
      const [x, y] = [(extent.xmax + extent.xmin) / 2, (extent.ymax + extent.ymin) / 2];
      draw.text({gid: `area_${gid}`, x, y, text: { text: `区域:${name}`, font: '14px'}}, { layerIndex: 1000, offsetX: 0, offsetY: 10 });
      draw.text({gid: `user_${gid}`, x, y, text: { text: `责任人:${usernames}`, font: '14px'}}, { layerIndex: 1000, offsetX: 0, offsetY: -10 });
    };

    return self({
      start(obj) {
        const {gid} = obj;
        events.clear();
        layer.clearCapture();
        const graphic = extend.getGraphic(gid);
        const {attributes, geometry} = graphic;
        const {move, stop, getGraphic} = capture(track(extend.getCapture(gid)));
        events.addEvent(editTool, 'vertex-move', move);
        events.addEvent(editTool, 'vertex-move-stop', stop);
        editTool.activate(activateVal, graphic);
        return keyDown(attributes).then(() => getGraphic() || geometry.rings);
      },
      stop() {
        events.clear();
        layer.clearCapture();
        editTool.deactivate();
      },
      clear() {
        layer.clear();
      },
      showArea(datas) {
        geometrys.length = 0;
        layer.clear();
        datas.forEach(x => {
          const {gid, usernames, name, dots } = x;
          const polygon = draw.polygon(x);
          drawTip(gid, polygon.geometry.getExtent(), name, usernames);
          geometrys.push({gid, polygon, usernames, name, dots});
        });
      },
      centerAtPolygon(area) {
        const pts = area.rings.reduce((a, b) => a.concat(b), []);
        const xs = pts.map(o => o.x);
        const ys = pts.map(o => o.y);
        target.centerAt({ x: (Math.max(...xs) + Math.min(...xs)) / 2, y: (Math.max(...ys) + Math.min(...ys)) / 2});
      },
    });
  });
};

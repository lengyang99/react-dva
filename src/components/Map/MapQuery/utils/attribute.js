import { message } from 'antd';
import { netQuery } from '../../../../services/thematicStatistics';

export default (api) => {
  const dpi = 8 * 0.0254000508 / 96;
  const map = api.getMap();
  let bind = {};
  let headle;
  let val = -1;

  const getGeometry = (x, y, spatialReference, scale) => { // 获取地图范围
    const px = dpi * scale;
    const [xmin, ymin, xmax, ymax] = [x - px, y - px, x + px, y + px];
    const dots = [{x: xmin, y: ymin}, {x: xmin, y: ymax}, {x: xmax, y: ymax}, {x: xmax, y: ymin}, {x: xmin, y: ymin}];
    return {type: 'polygon', rings: [dots.map(o => [o.x, o.y])], spatialReference};
  };

  const getParams = (x, y) => { // 获取参数
    return {
      returnGeometry: true,
      geometryType: 'esriGeometryPolygon',
      f: 'json',
      geometry: JSON.stringify(getGeometry(x, y, map.spatialReference, map.getScale())),
      where: '1=1',
      pageno: 1,
      pagesize: 1,
      withCount: true,
    };
  };

  const getPoint = (geometry) => { // 获取geo中的中心点，目前支持点线；
    const {paths: [paths] = []} = geometry;
    if (Array.isArray(paths)) {
      const length = paths.length - 1;
      const [x1, y1] = paths[Math.floor(length / 2)];
      const [x2, y2] = paths[Math.ceil(length / 2)];
      return {x: (x1 + x2) / 2, y: (y1 + y2) / 2};
    }
    return geometry;
  };

  const onClick = (event) => { // 点击查询核心内容
    const {x, y} = event.mapPoint;
    const {ecode, layerid, name} = bind;
    api.closeTip();
    netQuery(ecode, layerid, getParams(x, y)).then(res => {
      const {count, features, fieldAliases} = res;
      if (count > 0) {
        const [{attributes, geometry}] = features;
        const {x: px, y: py} = getPoint(geometry);
        if (Array.isArray(geometry.paths)) api.sharkLine({geometry}, {width: 5}).centerAt({x, y});
        else api.sharkPonit({geometry}, {markersize: 8}).centerAt({x, y});
        clearTimeout(val);
        val = setTimeout(() => {
          api.showTip(px, py, `${name}-属性`, Object.keys(fieldAliases).filter(key => /[\u4e00-\u9fa5]/.test(fieldAliases[key])).map(key => ({name: fieldAliases[key], value: attributes[key]})));
        }, 800);
      } else message.info(`没有找到${name}`);
    });
  };

  return {
    start() { // 启动点击显示属性信息
      if (headle) headle.remove();
      const {ecode, layerid} = bind;
      if (isNaN(ecode) || isNaN(layerid)) return this;
      headle = map.on('click', onClick);
      map.setMapCursor('url(images/map/cursor/identify.cur),auto');
      return this;
    },
    stop() { // 停止地图点击交互
      if (headle) headle.remove();
      map.setMapCursor('default');
      headle = undefined;
      return this;
    },
    bind(ecode, layerid, name) { // 重置查询信息
      bind = {ecode, layerid, name};
      return this;
    },
  };
};


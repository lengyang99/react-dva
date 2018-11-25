import { loadModules } from 'esri-loader';
import { message } from 'antd';
import request from '../../../utils/request';

export default class CarMonitor {
  constructor(mapCfg, map, popup, layer, apiUrl) {
    this.map = map;
    this.mapCfg = mapCfg;
    this.popup = popup;
    this.layer = layer;
    this.apiUrl = apiUrl;

    // this.interval = null;
    this.getCarInfo();
    this.interval = setInterval(() => {
      this.getCarInfo(false);
    }, 10000);
  }

  clearInterval = () => {
    clearInterval(this.interval);
  }

  /*
   ** 调用服务获取当前车辆信息
   * params loading -- 是否显示加载界面
   */
  getCarInfo(loading) {
    request(`${this.mapCfg.url}?objtype=2`, {method: 'get'}, false, false, false, true, loading).then((res) => {
      if (!res.success) {
        // message.info(res.msg);
        return;
      }
      const result = [];
      const carData = res.data;
      this.showCarInfo(carData);
    });
  }

  showCarInfo = (result) => {
    // this.layer.graphics;
    this.layer.graphics.forEach((item) => {
      this.layer.remove(item.graphics);
    });
    if (!this.map) {
      return;
    }

    if (result.length === 0) {
      return;
    }

    let that = this;
    loadModules(['esri/graphic',
      'esri/geometry/Point',
      'esri/symbols/SimpleFillSymbol',
      'esri/symbols/SimpleLineSymbol',
      'esri/symbols/SimpleMarkerSymbol',
      'esri/symbols/TextSymbol',
      'esri/symbols/PictureMarkerSymbol'], { url: this.apiUrl })
      .then(([Graphic, Point, SimpleMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol, TextSymbol, PictureMarkerSymbol]) => {
        result.forEach((point) => {
          const picUrl = this.mapCfg.pictureUrl;
          const width = this.mapCfg.pictureWidth;
          const height = this.mapCfg.pictureHeight;
          const symbol = new PictureMarkerSymbol(picUrl, width, height);
          const geometry = new Point({
            x: point.merX,
            y: point.merY,
            spatialReference: this.map.spatialReference,
          });
          const graphic = new Graphic(geometry, symbol, point);
          this.layer.add(graphic);

          const textSymbol = new TextSymbol({text: `${point.vehicleId}`, font: '14px'});
          textSymbol.setOffset(5, 15);
          const graphic2 = new Graphic(geometry, textSymbol);
          this.layer.add(graphic2);

          this.layer.on('click', (attr) => {
            const attrInfo = attr.graphic.attributes;
            that.popup({
              x: attrInfo.merX,
              y: attrInfo.merY,
              info: {
                title: '属性',
                content: [
                  {name: '网格', value: attrInfo.grid},
                  {name: '车牌号', value: attrInfo.vehicleId},
                  {name: '司机', value: attrInfo.driver},
                  {name: '电话', value: attrInfo.driverTel},
                ],
              },
            });
          });
        });
      });
  }
}

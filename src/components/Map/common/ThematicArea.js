import { loadModules } from 'esri-loader';
import { message } from 'antd';
import request from '../../../utils/request';

const showMapColor = [{polygon: [247, 198, 198, 0.6], polyline: [238, 140, 141, 0.8]},
  {polygon: [255, 252, 186, 0.6], polyline: [255, 249, 117, 0.8]},
  {polygon: [198, 229, 204, 0.6], polyline: [140, 202, 153, 0.8]},
  {polygon: [252, 230, 209, 0.6], polyline: [248, 205, 162, 0.8]},
  {polygon: [249, 210, 226, 0.6], polyline: [242, 165, 197, 0.8]}];

export default class RegionalManage {
  constructor(url, map, layer, apiUrl) {
    this.map = map;
    this.url = url;
    this.layer = layer;
    this.apiUrl = apiUrl;
    this.getAreaData();
  }

  getAreaData() {
    request(this.url, {method: 'get'}).then((res) => {
      this.showAreaInfo(res);
    });
  }

  showAreaInfo = (data) => {
    if (data.data) {
      data.data.forEach((areainfo) => {
        areainfo.children.forEach((areaChild) => {
          this.showAreaMap(areaChild);
          this.showPathMap(areaChild);
          this.showPointMap(areaChild);
        });
      });
    }
  }

  showAreaMap = (result) => {
    if (!this.map) {
      return;
    }

    let areainfo = result.areaPolygon;
    if (typeof areainfo === 'string') {
      areainfo = JSON.parse(areainfo);
    }
    if (areainfo === '' || areainfo === null) {
      return;
    }

    loadModules(['esri/graphic',
      'esri/geometry/Point',
      'esri/geometry/Polygon',
      'esri/symbols/SimpleFillSymbol',
      'esri/symbols/SimpleLineSymbol',
      'esri/symbols/TextSymbol'], { url: this.apiUrl })
      .then(([Graphic, Point, Polygon, SimpleFillSymbol, SimpleLineSymbol, TextSymbol]) => {
        const lineDots = [];
        for (let i = 0; i < areainfo.length; i++) {
          lineDots.push([areainfo[i].x, areainfo[i].y]);
        }
        let polygon = new Polygon({rings: [lineDots], spatialReference: this.map.spatialReference});

        let index = result.gid % 5;
        let fillstyle = SimpleFillSymbol.STYLE_SOLID;
        let c2 = showMapColor[index].polygon;
        let linestyle = SimpleLineSymbol.STYLE_SOLID;
        let c1 = showMapColor[index].polyline;

        let symbol = new SimpleFillSymbol(
          fillstyle,
          new SimpleLineSymbol(linestyle, c1, 2),
          c2
        );
        let graphic = new Graphic(polygon, symbol);
        this.layer.add(graphic);

        const extent = graphic.geometry.getExtent();

        let textSymbol2 = new TextSymbol({text: `区域:${result.name}`, font: '14px'});
        textSymbol2.setOffset(0, 10);
        let geometry2 = new Point({
          x: (extent.xmax + extent.xmin) / 2,
          y: (extent.ymax + extent.ymin) / 2,
          spatialReference: this.map.spatialReference,
        });
        let graphic2 = new Graphic(geometry2, textSymbol2);
        this.layer.add(graphic2);

        let textSymbol3 = new TextSymbol({text: `责任人:${result.usernames}`, font: '14px'});
        textSymbol3.setOffset(0, -10);
        let graphic3 = new Graphic(geometry2, textSymbol3);
        this.layer.add(graphic3);
      });
  }

  showPathMap = (result) => {
    if (!this.map) {
      return;
    }

    let pathinfo = result.pathPolygon;
    if (pathinfo === '' || pathinfo === null) {
      return;
    }

    if (typeof pathinfo === 'string') {
      pathinfo = JSON.parse(pathinfo);
    }

    loadModules(['esri/graphic',
      'esri/geometry/Point',
      'esri/geometry/Polyline',
      'esri/symbols/SimpleFillSymbol',
      'esri/symbols/SimpleLineSymbol',
      'esri/symbols/CartographicLineSymbol',
      'esri/symbols/TextSymbol'], { url: this.apiUrl })
      .then(([Graphic, Point, Polyline, CartographicLineSymbol, SimpleFillSymbol, SimpleLineSymbol, TextSymbol]) => {
        pathinfo.forEach((path) => {
          let lineDots = [];
          for (let i = 0; i < path.length; i++) {
            lineDots.push([path[i].x, path[i].y]);
          }
          let lineSymbol = {};
          lineSymbol.geometry = {
            paths: [lineDots],
            spatialReference: {wkid: this.map.spatialReference},
          };

          lineSymbol.symbol = {
            color: [255, 0, 0],
            width: 2,
            type: 'esriSLS',
            style: 'esriSLSSolid',
          };
          let graphic = new Graphic(lineSymbol);
          this.layer.add(graphic);
        });
      });
  }

  showPointMap = (result) => {
    if (!this.map) {
      return;
    }

    let pointinfo = result.keypoints;
    if (pointinfo === '' || pointinfo === null) {
      return;
    }
    if (typeof pointinfo === 'string') {
      pointinfo = JSON.parse(pointinfo);
    }

    loadModules(['esri/graphic',
      'esri/geometry/Point',
      'esri/symbols/SimpleFillSymbol',
      'esri/symbols/SimpleLineSymbol',
      'esri/symbols/SimpleMarkerSymbol',
      'esri/symbols/TextSymbol'], { url: this.apiUrl })
      .then(([Graphic, Point, SimpleMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol, TextSymbol]) => {
        pointinfo.forEach((point) => {
          let geometry = JSON.parse(point.geometry);

          let pointSymbol = {};
          pointSymbol.geometry = {
            points: [[geometry.x, geometry.y]],
            spatialReference: this.map.spatialReference,
          };

          pointSymbol.symbol = {
            type: 'esriSMS',
            style: 'esriSMSCircle',
            size: 6,
            width: 6,
            color: [255, 255, 255, 0.4],
            outline: { // autocasts as new SimpleLineSymbol()
              color: [226, 130, 34],
              width: 2,
              type: 'esriSLS',
              style: 'esriSLSSolid',
            },
          };
          // let symbol = new SimpleMarkerSymbol('STYLE_SQUARE', 8, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, [226, 130, 34], 2), [255, 255, 255, 0.4]);
          let graphic = new Graphic(pointSymbol);
          this.layer.add(graphic);
        });
      });
  }
}

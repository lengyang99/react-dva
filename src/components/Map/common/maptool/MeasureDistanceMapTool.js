import { loadModules } from 'esri-loader';
import { MapTool } from './MapTool';

/**
 * 测量距离工具
 */
class MeasureDistanceMapTool extends MapTool {
  constructor(map, apiUrl) {
    super(map, apiUrl);

    this.drawTool = null;
    this.markerSymbol = null;
    this.lineSymbol = null;
    this.textSymbol = null;

    this.startPoint = null;
    this.endPoint = null;
    this.totalDistance = 0;

    this.init = this.init.bind(this);
    this.destroy = this.destroy.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  init() {
    this.map.graphics.clear();
    loadModules(['esri/Color',
      'esri/toolbars/draw',
      'esri/symbols/SimpleMarkerSymbol',
      'esri/symbols/SimpleLineSymbol',
      'esri/symbols/TextSymbol',
      'esri/symbols/Font'], { url: this.apiUrl })
      .then(([Color, Draw, SimpleMarkerSymbol, SimpleLineSymbol, TextSymbol, Font]) => {
        this.drawTool = new Draw(this.map, { showTooltips: true });
        this.drawTool.activate(Draw.POLYLINE);

        this.markerSymbol = new SimpleMarkerSymbol(
          SimpleMarkerSymbol.STYLE_CIRCLE,
          10,
          new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color('#DC143C'), 2),
          new Color('#FFA500')
        );

        this.lineSymbol = new SimpleLineSymbol(
          SimpleLineSymbol.STYLE_SOLID,
          new Color('#FFA500'),
          2
        );

        const font = new Font('10pt', Font.STYLE_ITALIC, Font.VARIANT_NORMAL, Font.WEIGHT_BOLD, 'Courier');
        this.textSymbol = new TextSymbol('km', font, new Color('#696969'));
        this.textSymbol.setOffset(10, 10).setHaloColor(new Color('#fff')).setHaloSize(2);
        this.textSymbol.setAlign(TextSymbol.ALIGN_MIDDLE);
        this.textSymbol.setOffset(30, 10);

        this.map.setMapCursor('url(images/map/cursor/distance.cur),auto');
      });
  }

  destroy() {
    if (this.drawTool) {
      this.drawTool.deactivate();
      this.drawTool = null;
    }
    this.map.setMapCursor('default');
  }

  formatDistance = (distance) =>{
    let result;
    if (distance > 0 && distance >= 1000) {
      result = (distance / 1000).toFixed(2);
      result = `${result}km`;
    } else if (distance > 0 && distance < 1000) {
      result = `${distance.toFixed()}m`;
    }

    return result;
  };

  onClick(event) {
    if (!this.drawTool) {
      return;
    }
    if (this.startPoint === null) {
      this.startPoint = event.mapPoint;
    } else if (this.endPoint === null) {
      this.endPoint = event.mapPoint;
      //
      // this.drawTool.finishDrawing();
      // this.drawTool.deactivate();
      // this.drawTool = null;
    } else {
      this.startPoint = this.endPoint;
      this.endPoint = event.mapPoint;
    }

    loadModules(['esri/graphic',
      'esri/geometry/Polyline',
      'esri/geometry/geometryEngine'], { url: this.apiUrl })
      .then(([Graphic, Polyline, GeometryEngine]) => {
        this.map.graphics.add(new Graphic(event.mapPoint, this.markerSymbol));

        if (this.endPoint) {
          const line = new Polyline(this.map.spatialReference);
          line.addPath([this.startPoint, this.endPoint]);

          this.map.graphics.add(new Graphic(line, this.lineSymbol));

          let distance;
          if (this.map.spatialReference.isWebMercator() ||
            this.map.spatialReference.wkid === '3857') {
            distance = GeometryEngine.geodesicLength(line, 'meters');
          } else {
            distance = GeometryEngine.planarLength(line, 'meters');
          }

          this.totalDistance += distance;
          distance = this.formatDistance(distance);

          this.textSymbol.setText(distance);
          this.map.graphics.add(new Graphic(this.endPoint, this.textSymbol));

          // this.mapToolManager.resetToDefaultMapTool();
        }
      });
  }

  onDblClick(event) {
    if (!this.drawTool) {
      return;
    }

    if (this.endPoint === null) {
      this.endPoint = event.mapPoint;
    } else {
      this.startPoint = this.endPoint;
      this.endPoint = event.mapPoint;

      this.drawTool.finishDrawing();
      this.drawTool.deactivate();
      this.drawTool = null;
    }

    loadModules(['esri/graphic',
      'esri/Color',
      'esri/geometry/Polyline',
      'esri/symbols/SimpleLineSymbol',
      'esri/symbols/SimpleMarkerSymbol',
      'esri/symbols/PictureMarkerSymbol',
      'esri/layers/GraphicsLayer',
      'esri/geometry/geometryEngine'], { url: this.apiUrl })
      .then(([
        Graphic,
        Color,
        Polyline,
        SimpleLineSymbol,
        SimpleMarkerSymbol,
        PictureMarkerSymbol,
        GraphicsLayer,
        GeometryEngine]) => {
        this.map.graphics.add(new Graphic(event.mapPoint, this.markerSymbol));
        const layer = new GraphicsLayer({ id: 'close-image' });
        if (this.endPoint) {
          const line = new Polyline(this.map.spatialReference);
          line.addPath([this.startPoint, this.endPoint]);

          this.map.graphics.add(new Graphic(line, this.lineSymbol));

          let distance;
          if (this.map.spatialReference.isWebMercator() ||
            this.map.spatialReference.wkid === '3857') {
            distance = GeometryEngine.geodesicLength(line, 'meters');
          } else {
            distance = GeometryEngine.planarLength(line, 'meters');
          }
          this.totalDistance += distance;
          distance = this.formatDistance(this.totalDistance);
          const text = '总距离为:' + distance;
          this.textSymbol.setText(text);
          const pictureSymbol = new PictureMarkerSymbol('./images/map/cursor/closeruler.gif', 16, 16);
          pictureSymbol.setOffset(10, -20);
          layer.add(new Graphic(this.endPoint, pictureSymbol));
          // 关闭图片点击事件，点击之后清楚已绘制的图层
          layer.on('click', () => {
            this.map.graphics.clear();
            const closeLayer = this.map.getLayer('close-image');
            this.map.removeLayer(closeLayer);
          });

          // 画边框
          const len = this.getMaxLen(text);
          const iconPath = 'M 0 0L 0 20 L ' + len + ' 20  L' + len + ' 0L 0 0';
          const outLine = new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color('#696969'),
            1);
          const tipSymbol = new SimpleMarkerSymbol();
          tipSymbol.setPath(iconPath);
          tipSymbol.setSize('auto');
          tipSymbol.setColor(new Color([255, 255, 255, 1]));
          tipSymbol.setOutline(outLine);
          tipSymbol.setOffset(30, 15);
          this.map.graphics.add(new Graphic(this.endPoint, tipSymbol));
          this.map.graphics.add(new Graphic(this.endPoint, this.textSymbol));
          this.map.addLayer(layer);
          this.mapToolManager.resetToDefaultMapTool();
        }
      });
  }
  // 获取text的值作为边框的宽度
  getMaxLen = (texArr) => {
    const len = texArr.replace(/[\u0391-\uFFE5]/g, 'aa').length;
    return len * 10;
  };
}

export { MeasureDistanceMapTool };

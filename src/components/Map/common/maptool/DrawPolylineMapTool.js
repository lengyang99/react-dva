import { loadModules } from 'esri-loader';
import { MapTool } from './MapTool';

/**
 * 绘制Polyline工具
 */
class DrawPolylineMapTool extends MapTool {
  constructor(map, apiUrl, callback) {
    super(map, apiUrl);

    this.callback = callback;
    this.drawTool = null;

    this.drawCompleteHandler = null;
    this.onDrawComplete = this.onDrawComplete.bind(this);
  }

  init() {
    loadModules(['esri/toolbars/draw'], { url: this.apiUrl })
      .then(([Draw]) => {
        this.drawTool = new Draw(this.map, { showTooltips: true });
        this.drawTool.activate(Draw.POLYLINE);
        this.drawCompleteHandler = this.drawTool.on('draw-complete', this.onDrawComplete);
      });
  }

  destroy() {
    if (this.drawCompleteHandler) {
      this.drawCompleteHandler.remove();
      this.drawCompleteHandler = null;
    }

    if (this.drawTool) {
      this.drawTool.deactivate();
      this.drawTool = null;
    }
  }

  onDrawComplete(event) {
    if (this.callback) {
      Promise.resolve().then(() => {
        this.callback(event.geometry);
      });
    }
  }
}

export { DrawPolylineMapTool };

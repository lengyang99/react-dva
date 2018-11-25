import { loadModules } from 'esri-loader';
import { MapTool } from './MapTool';

/**
 * 绘制Point工具
 */
class DrawPointMapTool extends MapTool {
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
        this.drawTool.activate(Draw.POINT);
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
    Promise.resolve().then(() => {
      this.callback(event.geometry);
    });
  }
}

export { DrawPointMapTool };

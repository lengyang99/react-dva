import { loadModules } from 'esri-loader';
import { MapTool } from './MapTool';

/**
 * 拉框放大地图工具
 */
class EnlargeMapTool extends MapTool {
  constructor(map, apiUrl) {
    super(map, apiUrl);

    this.drawTool = null;

    this.drawCompleteHandler = null;

    this.init = this.init.bind(this);
    this.destroy = this.destroy.bind(this);
    this.onDrawComplete = this.onDrawComplete.bind(this);
  }

  init() {
    loadModules(['esri/toolbars/draw'], { url: this.apiUrl })
      .then(([Draw]) => {
        this.drawTool = new Draw(this.map, { showTooltips: false });
        this.drawTool.activate(Draw.EXTENT);
        this.drawCompleteHandler = this.drawTool.on('draw-complete', this.onDrawComplete);
      });
    this.map.setMapCursor('url(images/map/cursor/enlarge.cur),auto');
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

    this.map.setMapCursor('default');
  }

  onDrawComplete(event) {
    this.map.setExtent(event.geometry);
  }
}

export { EnlargeMapTool };

import { loadModules } from 'esri-loader';
import { AbstractEditGraphicMapTool } from './AbstractEditGraphicMapTool';

/**
 * 编辑Point工具
 */
class EditPointMapTool extends AbstractEditGraphicMapTool {
  constructor(map, apiUrl, layerId, editingCallback, deletingCallback = null) {
    super(map, apiUrl, layerId, editingCallback, deletingCallback);
  }

  saveGraphic(graphic) {
    return new Promise((resolve, reject) => {
      loadModules(['esri/graphic', 'esri/geometry/Point'], { url: this.apiUrl })
        .then(([Graphic, Point]) => {
          // 记下最开始的图形
          const oldPoint = new Point(graphic.geometry.x, graphic.geometry.y, this.map.spatialReference);
          this.oldGraphic = new Graphic(oldPoint, graphic.symbol);
          resolve();
        }, (error) => {
          reject(error);
        });
    });
  }
}

export { EditPointMapTool };

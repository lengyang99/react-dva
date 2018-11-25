import { loadModules } from 'esri-loader';
import { AbstractEditGraphicMapTool } from './AbstractEditGraphicMapTool';

/**
 * 编辑Polygon工具
 */
class EditPolygonMapTool extends AbstractEditGraphicMapTool {
  constructor(map, apiUrl, layerId, editingCallback, deletingCallback = null) {
    super(map, apiUrl, layerId, editingCallback, deletingCallback);
  }

  saveGraphic(graphic) {
    return new Promise((resolve, reject) => {
      loadModules(['esri/graphic', 'esri/geometry/Polygon'], { url: this.apiUrl })
        .then(([Graphic, Polygon]) => {
          // 记下最开始的图形
          const oldPolygon = new Polygon(this.map.spatialReference);
          const rings = graphic.geometry.rings;
          for (let i = 0; i < rings.length; ++i) {
            const oldRing = [];
            for (let j = 0; j < rings[i].length; ++j) {
              const xy = [];
              xy[0] = rings[i][j][0];
              xy[1] = rings[i][j][1];
              oldRing.push(xy);
            }
            oldPolygon.addRing(oldRing);
          }
          this.oldGraphic = new Graphic(oldPolygon, graphic.symbol);
          resolve();
        }, (error) => {
          reject(error);
        });
    });
  }
}

export { EditPolygonMapTool };

import { loadModules } from 'esri-loader';
import { AbstractEditGraphicMapTool } from './AbstractEditGraphicMapTool';

/**
 * 编辑Polyline工具
 */
class EditPolylineMapTool extends AbstractEditGraphicMapTool {
  constructor(map, apiUrl, layerId, editingCallback, deletingCallback = null) {
    super(map, apiUrl, layerId, editingCallback, deletingCallback);
  }

  saveGraphic(graphic) {
    return new Promise((resolve, reject) => {
      loadModules(['esri/graphic', 'esri/geometry/Polyline'], { url: this.apiUrl })
        .then(([Graphic, Polyline]) => {
          // 记下最开始的图形
          const oldPolyline = new Polyline(this.map.spatialReference);
          const paths = graphic.geometry.paths;
          for (let i = 0; i < paths.length; ++i) {
            const oldPath = [];
            for (let j = 0; j < paths[i].length; ++j) {
              const xy = [];
              xy[0] = paths[i][j][0];
              xy[1] = paths[i][j][1];
              oldPath.push(xy);
            }
            oldPolyline.addPath(oldPath);
          }
          this.oldGraphic = new Graphic(oldPolyline, graphic.symbol);
          resolve();
        }, (error) => {
          reject(error);
        });
    });
  }
}

export { EditPolylineMapTool };

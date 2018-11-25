import { loadModules } from 'esri-loader';
import { message } from 'antd';
import { MapTool } from './MapTool';

message.config({
  top: 300,
  duration: 2,
});

/**
 * 点击查询工具 arcgis identify
 */
class IdentifyMapTool extends MapTool {
  constructor(map, apiUrl, mapCfg, callback) {
    super(map, apiUrl);

    // 地图配置(对应mapcfg.json文件)
    this.mapCfg = mapCfg;

    // 显示查询结果的回调方法
    this.setQueryResults = callback;

    this.destroy = this.destroy.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  init() {
    this.map.setMapCursor('url(images/map/cursor/identify.cur),auto');
  }

  destroy() {
    this.setQueryResults(null);
    if (this.drawTool) {
      this.drawTool.deactivate();
      this.drawTool = null;
    }
    this.map.setMapCursor('default');
  }

  /**
   * 获取当前比例尺下可见的业务图层信息
   * @returns {Array}
   */
  getVisibleLayerInfo() {
    const visibleLayers = this.map.getLayersVisibleAtScale();
    const allBusinessLayerCfgs = this.mapCfg.map_service[0].maps.slice(0);
    allBusinessLayerCfgs.reverse();

    const layers = [];
    for (let i = 0; i < allBusinessLayerCfgs.length; ++i) {
      for (let j = 0; j < visibleLayers.length; ++j) {
        if (visibleLayers[j].visible && visibleLayers[j].id === allBusinessLayerCfgs[i].id) {
          layers.push({ layerId: visibleLayers[j].id,
            layerName: allBusinessLayerCfgs[i].name,
            layerObj: visibleLayers[j],
            subLayerInfos: allBusinessLayerCfgs[i].layerInfos,
            elements: [],
          });
        }
      }
    }

    return layers;
  }

  onClick(event) {
    const visibleLayerInfo = this.getVisibleLayerInfo();
    if (visibleLayerInfo.length === 0) {
      return;
    }

    loadModules([
      'esri/geometry/Point',
      'esri/layers/GraphicsLayer',
      'esri/graphic',
      'esri/symbols/PictureMarkerSymbol',
      'esri/tasks/IdentifyTask',
      'esri/tasks/IdentifyParameters'], { url: this.apiUrl })
      .then(([
        Point,
        GraphicsLayer,
        Graphic,
        PictureMarkerSymbol,
        IdentifyTask,
        IdentifyParameters]) => {
        const identifyParameters = new IdentifyParameters();
        identifyParameters.tolerance = 5;
        identifyParameters.returnGeometry = true;
        identifyParameters.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;
        identifyParameters.width = this.map.width;
        identifyParameters.height = this.map.height;
        identifyParameters.mapExtent = this.map.extent;
        identifyParameters.geometry = event.mapPoint;

        const promiseArray = [];
        for (let i = 0; i < visibleLayerInfo.length; ++i) {
          identifyParameters.layerIds =
            visibleLayerInfo[i].subLayerInfos.map(item => item.id);

          const identifyTask = new IdentifyTask(visibleLayerInfo[i].layerObj.url);
          promiseArray.push(identifyTask.execute(identifyParameters).promise);
        }
        Promise.all(promiseArray)
          .then((results) => {
            if (results.length !== visibleLayerInfo.length) {
              return;
            }

            const queryResults = [];
            for (let index = 0; index < visibleLayerInfo.length; ++index) {
              if (results[index].length > 0) {
                const result = results[index];
                result.forEach((item) => {
                  for (let n = 0; n < visibleLayerInfo[index].subLayerInfos.length; ++n) {
                    if (item.layerId == visibleLayerInfo[index].subLayerInfos[n].id) {
                      const fields = visibleLayerInfo[index].subLayerInfos[n].fields;
                      const element = {
                        attributes: {},
                        geometry: {},
                      };
                      let lastMatch = null;
                      for (let p = 0; p < fields.length; ++p) {
                        if (item.feature.attributes[fields[p].first]
                          && item.feature.attributes[fields[p].first] != '空') {
                          element.attributes[fields[p].firstDesc] = item.feature.attributes[fields[p].first];
                          lastMatch = 'first';
                        } else if (fields[p].second
                          && item.feature.attributes[fields[p].second]
                          && item.feature.attributes[fields[p].second] != '空') {
                          element.attributes[fields[p].secondDesc] = item.feature.attributes[fields[p].second];
                          lastMatch = 'second';
                        } else if (fields[p].third
                          && item.feature.attributes[fields[p].third]
                          && item.feature.attributes[fields[p].third] != '空') {
                          element.attributes[fields[p].thirdDesc] = item.feature.attributes[fields[p].third];
                          lastMatch = 'third';
                        } else if (!lastMatch || lastMatch == 'first') {
                          element.attributes[fields[p].firstDesc] = item.feature.attributes[fields[p].first];
                        } else if (lastMatch == 'second') {
                          if (fields[p].second) {
                            element.attributes[fields[p].secondDesc] = item.feature.attributes[fields[p].second];
                          } else {
                            element.attributes[fields[p].firstDesc] = item.feature.attributes[fields[p].first];
                          }
                        } else if (lastMatch == 'third' && fields[p].third) {
                          element.attributes[fields[p].thirdDesc] = item.feature.attributes[fields[p].third];
                        }
                      }
                      element.geometry = item.feature.geometry;
                      visibleLayerInfo[index].elements.push(element);
                      break;
                    }
                  }
                });
                delete visibleLayerInfo[index].layerObj;
                delete visibleLayerInfo[index].subLayerInfos;
                queryResults.push(visibleLayerInfo[index]);
              }
            }

            // 绘制高亮显示的点线,数据最多显示20条
            const len = queryResults[0].elements.length > 20 ? 20 : queryResults[0].elements.length;
            const pointLayer = new GraphicsLayer({ id: 'query-point-image' });
            const lineLayer = new GraphicsLayer({ id: 'query-line-image' });
            for (let num = 1; num <= len; num++) {
              const geom = queryResults[0].elements[num - 1].geometry;
              // 新建ArcGIS 符号对象
              const markerSymbol = new PictureMarkerSymbol('images/map/location/' + num + '.png', 25, 45);
              markerSymbol.setOffset(0, 20);
              // 点类型直接画图片
              if (geom.type === 'point') {
                pointLayer.add(new Graphic(geom, markerSymbol));
              } else if (geom.type === 'polyline') {
                const middlePoint = new Point((geom.paths[0][0][0] + geom.paths[0][1][0]) / 2,
                  (geom.paths[0][0][1] + geom.paths[0][1][1]) / 2, geom.spatialReference);
                lineLayer.add(new Graphic(middlePoint, markerSymbol));
              }
            }
            this.map.addLayer(pointLayer);
            this.map.addLayer(lineLayer);

            if (queryResults.length === 0) {
              message.info('查询结果为空！');
            } else {
              Promise.resolve().then(() => {
                this.setQueryResults(queryResults);
              });
            }
          }).catch((reason) => {
            message.info('查询结果为空！');
          });
      });
  }
}

export { IdentifyMapTool };

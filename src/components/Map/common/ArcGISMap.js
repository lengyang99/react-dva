import { loadModules } from 'esri-loader';
import { routerRedux } from 'dva/router';
import { MathUtil } from './MathUtil';
import { MapToolManager } from './maptool/MapToolManager';
import ThematicDataParser from './ThematicDataParser';
import MapCfgParser from './MapCfgParser';
import ThematicArea from './ThematicArea';
import CarMonitor from './ThematicCar';

/**
 * arcgis地图操作类
 * 封装了常用操作，如需特殊操作，调用getMapObj方法获取arcgis地图对象去处理
 */
class ArcGISMap {
  constructor() {
    // 地图配置
    this.mapCfg = null;

    // window._API_Path在此代码执行前，必须设置好
    this.apiUrl = window._API_Path ? `${window._API_Path}/frame/arcgis_js_api/library/3.20/3.20/init.js` : null;

    // arcgis map对象
    this.map = null;

    // 当前地图在mapCfg中对应的id
    this.baseMapId = null;

    // 挂载arcgis地图的div id
    this.divId = null;

    // 图层信息
    this.layers = null;

    // custom/mapDisplay
    this.mapDisplay = null;

    // 地图初始范围
    this.initialExtent = null;

    // 地图工具管理器
    this.mapToolManager = null;

    // 地图默认工具的回调方法
    this.setXy = null;

    // 图层控制中图层的实例化值
    this.newThematic = {};
  }

  /**
   * 设置地图默认工具的回调方法
   * @param setXy
   */
  setCallbackForDefaultMapTool(setXy) {
    this.setXy = setXy;
  }

  /**
   * 获取新地图实例的extent
   * @returns {*}
   */
  getMapExtentForNewMap() {
    let extent = null;
    const RATE = 0.865365;
    if (this.map) {
      if (this.baseMapId == 'lf_base_map') {
        extent = MathUtil.lessenExtent({
          xmin: this.map.extent.xmin,
          ymin: this.map.extent.ymin,
          xmax: this.map.extent.xmax,
          ymax: this.map.extent.ymax,
        }, RATE);
      } else if (this.baseMapId == 'lf_dxt_map') {
        extent = MathUtil.enlargeExtent({
          xmin: this.map.extent.xmin,
          ymin: this.map.extent.ymin,
          xmax: this.map.extent.xmax,
          ymax: this.map.extent.ymax,
        }, RATE);
      } else {
        extent = {
          xmin: this.map.extent.xmin,
          ymin: this.map.extent.ymin,
          xmax: this.map.extent.xmax,
          ymax: this.map.extent.ymax,
        };
      }
    } else {
      extent = {
        xmin: this.mapCfg.extent.xmin,
        ymin: this.mapCfg.extent.ymin,
        xmax: this.mapCfg.extent.xmax,
        ymax: this.mapCfg.extent.ymax,
      };
    }

    return extent;
  }

  /**
   * 加载arcgis地图
   * @param mapCfg 地图配置(对应mapcfg.json文件)
   * @param divId 挂载arcgis地图的div id
   * @param baseMapId  【可选参数】mapcfg.json文件中map_base节点中的底图id
   * @param onMapLoad 【可选参数】地图加载时的回调方法(本类实例this会作为参数传递进去)
   */
  loadMap(mapCfg, divId, baseMapId, onMapLoad) {
    if (!mapCfg) {
      throw new Error('mapCfg对象为空');
    }

    if (!divId || !(typeof divId === 'string')) {
      throw new Error('divId为空或不是字符串');
    }

    if (!this.apiUrl) {
      throw new Error('window._API_Path未设置');
    }

    this.mapCfg = mapCfg;
    this.divId = divId;

    loadModules(['esri/map',
      'esri/geometry/Extent',
      'esri/layers/ArcGISTiledMapServiceLayer',
      'esri/layers/ArcGISDynamicMapServiceLayer',
      'esri/layers/GraphicsLayer',
      'esri/dijit/Scalebar',
      'custom/mapDisplay'], { url: this.apiUrl }).then(
        ([Map,
          Extent,
          ArcGISTiledMapServiceLayer,
          ArcGISDynamicMapServiceLayer,
          GraphicsLayer,
          Scalebar,
          MapDisplay]) => {
          // 记录下即将要被替换的地图的范围，将其作为新地图的范围
          const extent = this.getMapExtentForNewMap();

          if (this.map) {
            this.destroy();
          }

          // 加载底图
          const mapCfgParser = new MapCfgParser(this.mapCfg);
          let matchedService = null;
          if (baseMapId) {
            matchedService = mapCfgParser.getBaseMapLayerCfg(baseMapId);
          } else {
            matchedService = mapCfgParser.getDefaultVisibleBaseMapLayerCfg();
          }

          this.map = new Map(divId, {
            logo: false,
            slider: false,
            // 设置地图最小缩放比例
            minScale: matchedService.minscale && matchedService.minscale > 0 ? matchedService.minscale : -1,
            extent: new Extent({
              xmin: extent.xmin,
              ymin: extent.ymin,
              xmax: extent.xmax,
              ymax: extent.ymax,
              spatialReference: { wkid: this.mapCfg.wkid },
            }),
          });

          // 新建比例尺对象
          this.scalebar = new Scalebar({
            map: this.map, // 必须的
            scalebarStyle: 'line',
            scalebarUnit: 'metric', // 指定比例尺单位,有效值是"english(英制)" or "metric（公制）".默认"english"
            attachTo: 'bottom-left',
          });

          this.mapDisplay = new MapDisplay(this.map);

          // 新增判断是否选择代理访问地图服务
          const baseLayer = new ArcGISTiledMapServiceLayer(mapCfgParser.isProxy ? (window.origin + '/' + matchedService.url) : matchedService.url);
          baseLayer.id = matchedService.id;
          // 设置底图的最大显示比例
          if (matchedService.maxscale && matchedService.maxscale > 0) {
            baseLayer.setMaxScale(matchedService.maxscale);
          }

          // 将矢量地形图加载进来
          const params = matchedService.params;
          if (params.legendurl && params.legendurl !== '') {
            const baseDynamicLayer = new ArcGISDynamicMapServiceLayer(params.legendurl);
            baseDynamicLayer.id = params.id;
            baseDynamicLayer.setMaxScale(params.maxscale);
            baseDynamicLayer.setMinScale(params.minscale);
            baseDynamicLayer.show();
            this.map.addLayers([baseLayer, baseDynamicLayer]);
          } else {
            this.map.addLayer(baseLayer);
          }

          // 记录相关信息
          this.baseMapId = matchedService.id;
          this.initialExtent = new Extent({
            xmin: matchedService.extent.xmin,
            ymin: matchedService.extent.ymin,
            xmax: matchedService.extent.xmax,
            ymax: matchedService.extent.ymax,
            spatialReference: { wkid: this.mapCfg.wkid },
          });

          // 加载arcgis服务图层
          const initServiceLayer = (item) => {
            const serviceLayer = new ArcGISDynamicMapServiceLayer(item.url);
            serviceLayer.id = item.id;
            serviceLayer.visible = (item.visible == 1);
            this.map.addLayer(serviceLayer);
          };
          if (this.layers && this.layers.mapService) {
            for (let i = 0; i < this.layers.mapService.length; ++i) {
              initServiceLayer(this.layers.mapService[i]);
            }
          } else {
            this.layers = {};
            this.layers.mapService = [];
            for (let i = 0; i < mapCfg.map_service[0].maps.length; ++i) {
              initServiceLayer(mapCfg.map_service[0].maps[i]);
              this.layers.mapService.push({
                id: mapCfg.map_service[0].maps[i].id,
                name: mapCfg.map_service[0].maps[i].name,
                visible: mapCfg.map_service[0].maps[i].visible,
                url: mapCfg.map_service[0].maps[i].url,
              });
            }
          }

          // 加载前端专题图层
          const initThematicLayer = (item) => {
            const thematicLayer = new GraphicsLayer();
            thematicLayer.id = item.id;
            thematicLayer.visible = (item.visible == 1);
            this.map.addLayer(thematicLayer);
            if (thematicLayer.visible) {
              this.populateThematicLayer(item.id);
            }
            if (item.id !== 'areas' && item.id !== 'personTrack' && item.id !== 'carMonitor') {
              thematicLayer.on('click', (event) => {
                const graphic = event.graphic;

                const content = [];
                const link = [];
                let eventid = graphic.attributes.dataInfo.eventid;
                let processInstancedId = graphic.attributes.dataInfo.processInstanceId;
                let formid = graphic.attributes.dataInfo.formid;

                graphic.attributes.attr.forEach((item, index) => {
                  if (item.type === 'ATT' || item.type === 'ADO' || item.type === 'IMG') {
                    let tmpLink = {
                      param: JSON.stringify({ attach: item.value }),
                      linkText: item.name,
                    };

                    if (window.seeMedia) {
                      tmpLink.click = (attach) => { window.seeMedia(attach); };
                    }
                    link.push(tmpLink);
                  } else {
                    content.push(item);
                  }
                });
                if (item.showWoDetail == 1) {
                  let tmpLink = {
                    param: JSON.stringify({ eventid, processInstancedId, formid }),
                    linkText: '工单详情',
                  };
                  if (window.LinkOrderList) {
                    tmpLink.click = (params1) => {
                      window.LinkOrderList(params1);
                    };
                  }
                  link.push(tmpLink);
                }

                this.popup({
                  x: graphic.geometry.x,
                  y: graphic.geometry.y,
                  info: {
                    title: `${item.name}属性`,
                    content: content,
                    link: link,
                  },
                });
              });
            }
          };
          if (this.layers && this.layers.mapThematic) {
            for (let i = 0; i < this.layers.mapThematic.length; ++i) {
              initThematicLayer(this.layers.mapThematic[i]);
            }
          } else {
            this.layers.mapThematic = [];
            for (let i = 0; i < mapCfg.map_thematic[0].maps.length; ++i) {
              initThematicLayer(mapCfg.map_thematic[0].maps[i]);
              this.layers.mapThematic.push({
                id: mapCfg.map_thematic[0].maps[i].id,
                name: mapCfg.map_thematic[0].maps[i].name,
                visible: mapCfg.map_thematic[0].maps[i].visible,
                showWoDetail: mapCfg.map_thematic[0].maps[i].showWoDetail ?
                  mapCfg.map_thematic[0].maps[i].showWoDetail : 0,
              });
            }
          }

          // map的load事件
          this.map.on('load', () => {
            this.mapToolManager = new MapToolManager(this.map);
            this.mapToolManager.initDefaultMapTool(this.apiUrl, this.setXy);

            if (onMapLoad) {
              onMapLoad(this);
            }
          });
        })
      .catch((error) => {
        throw error;
      });
  }

  /**
   * 销毁当前地图
   */
  destroy() {
    if (this.mapToolManager) {
      this.mapToolManager.destroyCurrentMapTool();
      this.mapToolManager.destroyDefaultMapTool();
      this.mapToolManager = null;
    }

    if (this.map) {
      this.map.destroy();
      this.map = null;
    }
  }

  /**
   * 返回arcgis js api url
   */
  getApiUrl() {
    return this.apiUrl;
  }

  /**
   * 返回arcgis map对象
   * @returns {null|*}
   */
  getMapObj() {
    return this.map;
  }

  /**
   * 返回mapCfg
   * @returns {*|null}
   */
  getMapCfg() {
    return this.mapCfg;
  }

  /**
   * 返回上一次挂载地图的div id
   * @returns {null|*}
   */
  getDivId() {
    return this.divId;
  }

  /**
   * 通过服务接口返回的数据填充专题图层
   * @param layerId
   */
  populateThematicLayer(layerId) {
    const layer = this.map.getLayer(layerId);
    if (!layer) {
      return;
    }

    layer.clear();

    const thematicDataParser = new ThematicDataParser();
    const mapCfgParser = new MapCfgParser(this.mapCfg);
    const url = mapCfgParser.getRequestUrlForThematicLayer(layerId);
    if (layerId !== 'areas' && layerId !== 'personTrack' && layerId !== 'carMonitor') {
      thematicDataParser.getRequestData(url, (result) => {
        this.addThematicLayer(mapCfgParser, layer, layerId, result);
      });
    } else if (layerId === 'areas') {
      new ThematicArea(url, this.map, layer, this.apiUrl);
    } else if (layerId === 'carMonitor') {
      // this.newThematic[layerId] = new CarMonitor(mapCfgParser.getThematicLayerCfg(layerId), this.map, this.popup, layer, this.apiUrl);
    }
  }

  /*
   * 去除专题图中的定时器
   */
  clearLayerInterval = () => {
    for (let key in this.newThematic) {
      this.newThematic[key].clearInterval && this.newThematic[key].clearInterval();
    }
  }

  /**
   * 地图添加专题图（默认方法）
   * @param mapCfgParser……地图配置信息
   * @param layer………………添加图例的图层
   * @param layerId……………专题图配置中的id
   * @param result……………返回的查询结果
   **/
  addThematicLayer(mapCfgParser, layer, layerId, result) {
    loadModules(['esri/graphic',
      'esri/geometry/Point',
      'esri/symbols/PictureMarkerSymbol'], { url: this.apiUrl })
      .then(([Graphic, Point, PictureMarkerSymbol]) => {
        for (let i = 0; i < result.length; ++i) {
          if (result[i].x && result[i].y) {
            const thematicCfg = mapCfgParser.getThematicLayerCfg(layerId);

            // 当pictureInfo存在时，按照pictureInfo的设置显示当前图例的图片url
            let pictureUrl = thematicCfg.pictureUrl || '';
            if (thematicCfg.pictureInfo) {
              const fieldName = thematicCfg.pictureInfo.fieldName;
              for (let j = 0; j < thematicCfg.pictureInfo.picCfg.length; j++) {
                if (result[i].dataInfo[fieldName] == thematicCfg.pictureInfo.picCfg[j].value) {
                  pictureUrl = thematicCfg.pictureInfo.picCfg[j].url;
                  break;
                }
              }
            }
            const symbol = new PictureMarkerSymbol(pictureUrl,
              mapCfgParser.getThematicLayerCfg(layerId).pictureWidth,
              mapCfgParser.getThematicLayerCfg(layerId).pictureHeight);
            const geometry = new Point({
              x: result[i].x,
              y: result[i].y,
              spatialReference: this.map.spatialReference,
            });
            const graphic = new Graphic(geometry, symbol, result[i]);
            layer.add(graphic);
          }
        }
      });
  }

  /**
   * 设置图层的可见性
   * @param layerId
   * @param flag
   */
  setLayerVisibility(layerId, flag, val) {

    if (!this.map) {
      throw new Error('map对象为空');
    }

    const mapCfgParser = new MapCfgParser(this.mapCfg);

    // 显示或隐藏图层
    const showLayer = (id, visible) => {
      const layer = this.map.getLayer(id);
      if (!layer) {
        return;
      }

      if (visible) {
        layer.show();
        if (mapCfgParser.isThematicLayer(id)) {
          this.populateThematicLayer(id);
        }
      } else {
        layer.hide();
      }
    };

    // 处理图层可见性
    if (!mapCfgParser.isThematicLayer(layerId)) {
      for (let i = 0; i < this.layers.mapService.length; ++i) {
        if (this.layers.mapService[i].id == layerId) {
          showLayer(layerId, flag);
          this.layers.mapService[i].visible = (flag ? 1 : 0);
          if (!flag) {
            return;
          }
        } else if (flag && mapCfgParser.isMutexLayer(this.layers.mapService[i].id, layerId)) {
          showLayer(this.layers.mapService[i].id, false);
          this.layers.mapService[i].visible = 0;
        }
      }
    } else {
      for (let i = 0; i < this.layers.mapThematic.length; ++i) {
        if (this.layers.mapThematic[i].id == layerId) {
          showLayer(layerId, flag);
          this.layers.mapThematic[i].visible = (flag ? 1 : 0);
          return;
        }
      }
    }
  }

  /**
   * 返回图层信息
   */
  getLayers() {
    return this.layers;
  }

  /**
   * 返回mapDisplay
   * @returns {null|*}
   */
  getMapDisplay() {
    return this.mapDisplay;
  }

  /**
   * 切换当前的地图工具
   * @param mapTool
   */
  switchMapTool(mapTool) {
    if (!mapTool) {
      throw new Error('mapTool对象为空');
    }

    if (!this.mapToolManager) {
      return;
    }

    this.mapToolManager.setMapTool(mapTool);
  }

  /**
   * 重置到默认地图工具
   */
  resetToDefaultMapTool() {
    if (!this.mapToolManager) {
      return;
    }

    this.mapToolManager.resetToDefaultMapTool();
  }

  /*
   * 放大地图
   * */
  zoomIn() {
    if (!this.map) {
      throw new Error('map对象为空');
    }

    const currenZoom = this.map.getZoom();
    if (this.map.getMaxZoom() === currenZoom) {
      return;
    }

    this.map.setZoom(currenZoom + 1);
  }

  getScale = () => {
    console.log('test');
    const result = this.map.getScale();
    console.log(result);
  }

  /*
   * 缩小地图
   * */
  zoomOut() {
    if (!this.map) {
      throw new Error('map对象为空');
    }

    const currenZoom = this.map.getZoom();
    if (this.map.getMinZoom() === currenZoom) {
      return;
    }

    this.map.setZoom(currenZoom - 1);
  }

  /*
   * 复位地图
   * */
  resetMap() {
    if (!this.map) {
      throw new Error('map对象为空');
    }

    this.map.setExtent(this.initialExtent);
  }

  /**
   * 清除地图上的标记
   */
  clear() {
    if (!this.map) {
      throw new Error('map对象为空');
    }

    this.map.graphics.clear();
  }

  /**
   * 定位
   * @param point
   */
  centerAt(point) {
    if (!point) {
      throw new Error('point对象为空');
    }

    if (!this.map) {
      throw new Error('map对象为空');
    }

    loadModules(['esri/geometry/Point'], { url: this.apiUrl })
      .then(([Point]) => {
        const mapPoint = new Point(point.x, point.y, this.map.spatialReference);
        return this.map.centerAt(mapPoint).promise;
      });
  }

  /**
   * 弹出infoWindow窗口
   * 代码来源：custom/mapOper
   * @param options
   */
  popup(options) {
    const getStringLength = function (str) {
      const re = /[\u4E00-\u9FA5]/g;
      const tmpArr = str.split('<br>');
      if (tmpArr.length == 1) {
        if (re.test(str)) {
          return (str.length - str.match(re).length) / 2 + str.match(re).length;
        } else {
          return str.length / 2;
        }
      } else {
        let maxLength = 0;
        tmpArr.forEach((tmpItem) => {
          let tmpItemLength = 0;
          if (re.test(tmpItem)) {
            tmpItemLength = (tmpItem.length - str.match(tmpItem).length) / 2 + str.match(tmpItem).length;
          } else {
            tmpItemLength = tmpItem.length / 2;
          }
          maxLength = Math.max(maxLength, tmpItemLength);
        });
        return maxLength;
      }
    };

    this.map.infoWindow.hide();
    if (options.onCloseHandler) {
      const onCloseEvent = this.map.infoWindow.on('hide', () => {
        options.onCloseHandler();
        onCloseEvent.remove();
      });
    }

    const info = options.info;
    let content = '';
    if (info && Array.isArray(info.content)) {
      content = '<table>';
      let maxFieldLength = 4;
      let maxValueLength = 4;
      info.content.forEach((row) => {
        if (typeof row.name === 'string' && !(/^[a-zA-Z]+$/.test(row.name))) {
          if (typeof row.value === 'string') {
            maxValueLength = Math.max(getStringLength(row.value), maxValueLength);
          }
          maxFieldLength = Math.max(getStringLength(row.name), maxFieldLength);
        }
      });
      const widthF = maxFieldLength * 20 + 3;
      // const widthV = maxValueLength * 13 + 40;
      const widthV = 270;
      for (let i = 0; i < info.content.length; i++) {
        const row = info.content[i];
        const name = row.name;
        const val = row.value == '' ? '--' : row.value;

        if (/^[a-zA-Z]+$/.test(name)) {
          continue;
        }
        content += '<tr>' +
          '<td style="vertical-align:top;text-align:right;width:' + widthF + 'px;">' +
          name +
          ':&nbsp;</td>' +
          '<td width="' + widthV + 'px" style="word-wrap:break-word;">' +
          '<div>' + val + '</div>' +
          '</td>' +
          '</tr>';
      }
      content += '</table>';

      // 添加链接
      // info.link = [{
      //   linkText: '详情1',
      //   linkUrl: '/#/event-list',
      // },{
      //   linkText: '详情2',
      //   linkUrl: '/#/event-list',
      // }];

      if (info.link) {
        console.log(info);
        let spans = '';
        for (let i = info.link.length - 1; i >= 0; i--) {
          if (info.link[i].linkUrl) {
            spans += `<div style="height: 15px;"><span style="float: right;color: #1890ff"><a href="${info.link[i].linkUrl}">${info.link[i].linkText}</a></span></div>`;
          } else {
            spans += `<span style="float: right;color: #1890ff;margin-right: 10px">
                      <span style="cursor: pointer" onClick='(${info.link[i].click})(${info.link[i].param})'>
                        ${info.link[i].linkText}
                      </span>
                   </span>`;
          }
        }
        content += `<div style="height: 15px;">${spans}</div>`;
      }
    }

    let size = options.size;
    if (!size || !size.width || !size.height) {
      size = { width: 310, height: 270 };
    }

    loadModules(['esri/geometry/Point'], { url: this.apiUrl })
      .then(([Point]) => {
        const popupPoint = new Point(options.x, options.y, this.map.spatialReference);
        this.map.centerAt(popupPoint).then(() => {
          if (info && info.title) {
            this.map.infoWindow.setTitle(info.title);
          } else {
            this.map.infoWindow.setTitle('属性');
          }
          this.map.infoWindow.setContent(content);
          this.map.infoWindow.resize(size.width, size.height);
          this.map.infoWindow.show(popupPoint);
        });
      });
  }

  /**
   * 仅做暂时的测试使用
   */
  getPolylineLen = (line, callback, person) => {
    if (!line || line.length === 0) {
      throw new Error('line对象为空');
    }
    loadModules(['esri/geometry/Polyline', 'esri/geometry/geodesicUtils', 'esri/units'])
      .then(([Polyline, geodesicUtils, Units]) => {
        const paths = [];
        line.forEach((item, index) => {
          paths.push([]);
          item.forEach((item2, index2) => {
            paths[index][index2] = [];
            paths[index][index2].push(item2.x);
            paths[index][index2].push(item2.y);
          });
        });
        let polyline = new Polyline({ paths: paths, spatialReference: { wkid: 4326 } });
        const lengths = geodesicUtils.geodesicLengths([polyline], Units.METERS);
        if (callback) {
          callback(lengths[0], person);
        }
      });
  }
}

export { ArcGISMap };

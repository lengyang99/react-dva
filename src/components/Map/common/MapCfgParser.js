/**
 * mapCfg解析器
 */
export default class MapCfgParser {
  constructor(mapCfg) {
    this.mapCfg = mapCfg;
  }

  /**
   * 获取默认可见的地图配置（应该只有一个是默认可见的）
   */
  getDefaultVisibleBaseMapLayerCfg() {
    const matchedService = this.mapCfg.map_base[0].maps.filter((element) => {
      return element.visible == 1;
    });
    if (!matchedService || matchedService.length != 1) {
      throw new Error('mapcfg.json文件中map_base节点中visible字段配置有错误');
    }

    return matchedService[0];
  }

  /**
   * 获取指定id的地图服务配置
   * @param baseMapId
   */
  getBaseMapLayerCfg(baseMapId) {
    const matchedService = this.mapCfg.map_base[0].maps.filter((element) => {
      return element.id == baseMapId;
    });
    if (!matchedService || matchedService.length == 0) {
      throw new Error(`mapcfg.json文件中没有id为${baseMapId}的地图服务`);
    }
    if (matchedService.length > 1) {
      throw new Error(`mapcfg.json文件中map_base节点下存在多个id为${baseMapId}的地图服务`);
    }

    return matchedService[0];
  }

  /**
   * 判断两个图层是否为互斥图层
   * @param layerAId
   * @param layerBId
   * @returns {boolean}
   */
  isMutexLayer(layerAId, layerBId) {
    let [findA, findB] = [false, false];
    for (let i = 0; i < this.mapCfg.map_service[0].mutexMapIds.length; ++i) {
      [findA, findB] = [false, false];
      for (let j = 0; j < this.mapCfg.map_service[0].mutexMapIds[i].length; ++j) {
        if (this.mapCfg.map_service[0].mutexMapIds[i][j] == layerAId) {
          findA = true;
        } else if (this.mapCfg.map_service[0].mutexMapIds[i][j] == layerBId) {
          findB = true;
        }
        if (findA && findB) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 获取arcgis服务图层配置
   * @param id
   */
  getServiceLayerCfg(id) {
    const serviceLayers = this.mapCfg.map_service[0].maps;
    for (let i = 0; i < serviceLayers.length; ++i) {
      if (serviceLayers[i].id == id) {
        return serviceLayers[i];
      }
    }
  }

  /**
   * 获取前端专题图层配置
   * @param id
   * @returns {*}
   */
  getThematicLayerCfg(id) {
    const thematicLayers = this.mapCfg.map_thematic[0].maps;
    for (let i = 0; i < thematicLayers.length; ++i) {
      if (thematicLayers[i].id == id) {
        return thematicLayers[i];
      }
    }
  }

  /**
   * 判断图层是否是专题图层
   * @param layerId
   * @returns {boolean}
   */
  isThematicLayer(layerId) {
    const results = this.mapCfg.map_thematic[0].maps.filter((item) => {
      return item.id == layerId;
    });
    if (results && results.length > 0) {
      return true;
    }
    return false;
  }

  /**
   * 获取专题图层服务请求的完整url(这里默认请求都是GET方式)
   * @param layerId
   */
  getRequestUrlForThematicLayer(layerId) {
    const thematicLayers = this.mapCfg.map_thematic[0].maps;
    for (let i = 0; i < thematicLayers.length; ++i) {
      if (thematicLayers[i].id == layerId) {
        let url = `${thematicLayers[i].url}?`;
        if (thematicLayers[i].params) {
          for (const key in thematicLayers[i].params) {
            if (thematicLayers[i].params[key] != undefined) {
              url = `${url}${key}=${thematicLayers[i].params[key]}&`;
            }
          }
          url = url.slice(0, url.lastIndexOf('&'));
        }
        return url;
      }
    }

    return null;
  }
}

import React, { PureComponent } from 'react';
import { getCfgByKey, getMapCggByTypeAndEcode } from '../../../utils/conf';
import { getUserInfo } from '../../../utils/utils';
import { ArcGISMap } from '../common/ArcGISMap';

export default class EsriMap extends PureComponent {
  constructor(props) {
    super(props);

    this.map = null;

    this.loadMap = this.loadMap.bind(this);
  }

  /**
   * 这里为了兼容之前的代码没有去掉写死的判断代码
   * by KZC on 2018/3/3
   */
  componentDidMount() {
    const { mapType, ecode } = this.props;
    let userCode = ecode;
    if (!userCode) {
      let userInfo = getUserInfo();
      userCode = userInfo.user.ecode;
    }
    if (mapType === 'lfBaiduMap') {
      getCfgByKey('lfBaiduMap').then(this.loadMap);
    } else if (mapType === 'dgBaiduMap') {
      getCfgByKey('dgBaiduMap').then(this.loadMap);
    } else {
      if (mapType && userCode) {
        getMapCggByTypeAndEcode(mapType, userCode).then(this.loadMap);
      } else {
        getCfgByKey('mapcfg').then(this.loadMap);
      }
    }
  }

  /**
   * 增加获取新的属性触发
   * @param mapType
   * @param ecode
   */
  componentWillReceiveProps({ mapType, ecode }) {
    if (this.props.mapType === mapType
      && this.props.ecode === ecode) {
      return;
    }
    this.map.destroy();
    getMapCggByTypeAndEcode(mapType).then(this.loadMap());
  }

  componentWillUnmount() {
    this.map.destroy();
  }


  /**
   * 加载ArcGIS地图
   * @param mapCfg 地图配置(对应mapcfg.json文件)
   */
  loadMap(mapCfg) {
    let mapCfgClone = null;
    if (this.props.mapId === 'workOrderOverviewShow') {
      try {
        mapCfgClone = JSON.parse(JSON.stringify(mapCfg));
        // mapId = workOrderOverviewShow 的地图 第三方施工 默认勾选
        for (const elem of mapCfgClone.map_thematic[0].maps.values()) {
          if (elem.id === 'construction') {
            elem.visible = 1;
          }
        }
      } catch (e) {
        console.log(mapCfgClone);
      }
    }
    const map = new ArcGISMap();
    map.setCallbackForDefaultMapTool(this.props.onSetXy);
    map.loadMap(mapCfgClone || mapCfg, this.props.mapId, null, (arcGISMap) => {
      if (this.props.onMapLoad) {
        this.props.onMapLoad(arcGISMap);
      }
    });
    this.props.onMapCreated(map);
    this.map = map;
  }

  render() {
    return (
      <div
        id={this.props.mapId}
        className="tundra"
        style={{ boxSizing: 'border-box', width: '100%', height: '100%' }}
      />
    );
  }
}


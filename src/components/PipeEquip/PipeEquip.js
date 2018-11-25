/**
 * 地址搜索组件
 */

import React, { Component } from 'react';
import { Input, message, Checkbox } from 'antd';
import PropTypes from 'prop-types';
import { loadModules } from 'esri-loader';
import EquipmentModal from '../EquipmentModal/EquipmentModal.js';
import { DrawPointMapTool } from '../Map/common/maptool/DrawPointMapTool';

import { getUserInfo } from '../../utils/utils';
import styles from './index.css';

class PipeEquip extends Component {
  constructor(props) {
    super(props);
    this.map = null;
    let selected = props.defaultValue;
    let data = {
      pipe: [],
      equip: [],
    };
    try {
      data = JSON.parse(selected);
    } catch (e) {
      console.error(e);
    }
    this.state = {
      selectType: {
        pipe: false,
        equip: false,
      },
      data: data,
      showEquip: false,
    };
  }

  onChangeChk = (type, e) => {
    let check = e.target.checked;
    let params = this.state.selectType;
    if (type == 1) {
      params.pipe = check;
    } else if (type == 2) {
      params.equip = check;
    }
    this.setState({
      selectType: {...params},
    });
  }

  /**
   * 点击查询
   */
  clickPipe() {
    this.props.geomHandleClick();
    this.map = this.props.getMap();
    if (!this.map) {
      return;
    }
    let mapTool = new DrawPointMapTool(this.map.getMapObj(), this.map.getApiUrl(), (event) => {
      this.onClick(event, (queryResults) => {
        mapTool.destroy();
        this.queryPointResults(queryResults);
      });
    });
    if (mapTool) {
      this.map.switchMapTool(mapTool);
    }
  }

  /**
   * 获取当前比例尺下可见的业务图层信息
   * @returns {Array}
   */
  getVisibleLayerInfo() {
    const visibleLayers = this.map.getMapObj().getLayersVisibleAtScale();
    const allBusinessLayerCfgs = this.map.mapCfg.map_service[0].maps.slice(0);
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

  onClick(event, callback) {
    const that = this;
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
      'esri/tasks/IdentifyParameters'], {url: this.map.getApiUrl()})
      .then(([Point, GraphicsLayer, Graphic, PictureMarkerSymbol, IdentifyTask, IdentifyParameters]) => {
        const identifyParameters = new IdentifyParameters();
        identifyParameters.tolerance = 5;
        identifyParameters.returnGeometry = true;
        identifyParameters.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;
        identifyParameters.width = that.map.getMapObj().width;
        identifyParameters.height = that.map.getMapObj().height;
        identifyParameters.mapExtent = that.map.getMapObj().extent;
        identifyParameters.geometry = event;

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
                if (results[index][0].geometryType === 'esriGeometryPolyline') { // 查询管段
                  const result = results[index];
                  result.forEach((item) => {
                    const element = {
                      attributes: {},
                      geometry: {},
                    };
                    let lastMatch = null;
                    element.attributes = item.feature.attributes;
                    element.geometry = item.feature.geometry;
                    visibleLayerInfo[index].elements.push(element);
                    // for (let n = 0; n < visibleLayerInfo[index].subLayerInfos.length; ++n) {
                    //   if (item.layerId == visibleLayerInfo[index].subLayerInfos[n].id) {
                    //     const element = {
                    //       attributes: {},
                    //       geometry: {},
                    //     };
                    //     let lastMatch = null;
                    //     element.geometry = item.feature.geometry;
                    //     visibleLayerInfo[index].elements.push(element);
                    //     break;
                    //   }
                    // }
                  });
                }
                delete visibleLayerInfo[index].layerObj;
                delete visibleLayerInfo[index].subLayerInfos;
                queryResults.push(visibleLayerInfo[index]);
              }
            }

            // 绘制高亮显示的点线,数据最多显示20条
            const len = queryResults[0].elements.length > 20 ? 20 : queryResults[0].elements.length;
            const lineLayer = new GraphicsLayer({id: 'query-line-image'});
            for (let num = 1; num <= len; num++) {
              const geom = queryResults[0].elements[num - 1].geometry;
              // 新建ArcGIS 符号对象
              const markerSymbol = new PictureMarkerSymbol('images/map/location/' + num + '.png', 25, 45);
              markerSymbol.setOffset(0, 20);
              // 点类型直接画图片
              if (geom.type === 'polyline') {
                const middlePoint = new Point((geom.paths[0][0][0] + geom.paths[0][1][0]) / 2,
                  (geom.paths[0][0][1] + geom.paths[0][1][1]) / 2, geom.spatialReference);
                lineLayer.add(new Graphic(middlePoint, markerSymbol));
              }
            }
            that.map.getMapObj().addLayer(lineLayer);

            if (queryResults.length === 0) {
              message.info('查询结果为空！');
            } else {
              Promise.resolve().then(() => {
                callback && callback(queryResults);
              });
            }
          }).catch((reason) => {
            message.info('查询结果为空！');
          });
      });
  }

  queryPointResults = (res) => {
    const result = [];
    for (let i = 0; i < res.length; i++) {
      for (let j = 0; j < res[i].elements.length; j++) {
        result.push({
          objectid: res[i].elements[j].attributes.gid,
          num: res[i].elements[j].attributes.gid,
        });
      }
    }
    let data = this.state.data;
    this.setState({
      data: {
        ...data,
        pipe: result,
      },
    }, () => {
      let callData = {
        equip: [],
        pipe: this.state.data.pipe,
      };
      if (this.state.selectType.equip) {
        callData.equip = this.state.data.equip;
      }
      this.props.backToForm();
      this.props.clickPipeDev(callData);
    });
    this.props.backToForm();
  }

  clickEquip = () => {
    this.setState({
      showEquip: true,
    });
  }

  onCloseEquipmentModal = () => {
    this.setState({
      showEquip: false,
    });
  }

  onSelectedEquipment = (equipValue) => {
    let data = this.state.data;
    this.setState({
      data: {
        ...data,
        equip: equipValue,
      },
      showEquip: false,
    }, () => {
      let callData = {
        equip: this.state.data.equip,
        pipe: [],
      };
      if (this.state.selectType.pipe) {
        callData.pipe = this.state.data.pipe;
      }
      this.props.clickPipeDev(callData);
    });
  }

  getPipeDevData = () => {
    let data = this.state.data;
    let pipes = [];
    let equips = [];
    data.pipe.forEach((item) => {
      pipes.push(item.num);
    });
    data.equip.forEach((item) => {
      equips.push(item.eqcode);
    });
    pipes = pipes.join('、');
    equips = equips.join('、');
    return { pipe: pipes, equip: equips };
  }

  render() {
    const { pipe, equip } = this.getPipeDevData();
    return (
      <div style={this.props.styles || {}}>
        <Checkbox onChange={this.onChangeChk.bind(this, 1)}>管段</Checkbox>
        <Input type="text" size="normal" placeholder="请选择管段" disabled={!this.state.selectType.pipe} style={{ width: '180px' }} value={pipe} onClick={this.clickPipe.bind(this)} />
        <Checkbox onChange={this.onChangeChk.bind(this, 2)} style={{ marginLeft: '60px' }}>设备</Checkbox>
        <Input type="text" size="normal" placeholder="请选择设备" disabled={!this.state.selectType.equip} style={{ width: '180px' }} value={equip} onClick={this.clickEquip.bind(this)} />
        {this.state.showEquip ?
          <EquipmentModal
            onSelectClick={this.onSelectedEquipment}
            onCloseModal={this.onCloseEquipmentModal}
          /> : null}
      </div>
    );
  }
}

PipeEquip.defaultProps = {
  fieldname: '', // 记录当前字段名
  styles: {},
  defaultValue: '',
  getMap: () => {
    return null;
  },
  geomHandleClick: () => {
  },
  clickPipeDev: () => {
  },
  backToForm: () => {
  },
};

PipeEquip.propTypes = {
  fieldname: PropTypes.string,
  styles: PropTypes.obj,
  defaultValue:  PropTypes.string,
  getMap:  PropTypes.func,
  geomHandleClick: PropTypes.func,
  clickPipeDev: PropTypes.func,
  backToForm: PropTypes.func,
};

export default PipeEquip;

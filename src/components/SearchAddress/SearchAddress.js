/**
 * 地址搜索组件
 */

import React, { Component } from 'react';
import { Select, message, Icon } from 'antd';
import PropTypes from 'prop-types';
import { DrawPointMapTool } from '../Map/common/maptool/DrawPointMapTool';
import { baiDuAddrSearch, transData, translateMtoB } from '../../services/api';
import { v2 } from '../../services/emerLfMap';
import { getUserInfo } from '../../utils/utils';
import styles from './index.css';

const Option = Select.Option;

class SearchAddress extends Component {
  constructor(props) {
    super(props);

    let point = {x: 0, y: 0};
    let points = props.defaultValue.point.split(',');
    if (points.length > 1) {
      point = {
        x: points[0],
        y: points[1],
      };
    }

    this.queryIndex = null; // 记录当前的定时器
    this.geom = point; // 记录当前选择的坐标点
    this.state = {
      addrDescrip: props.defaultValue.addr, // 查询字段的描述
      addrList: [],
      addrTitle: props.defaultValue.point,
      tmpGeom: point,
    };
  }

  setQueryTime = () => {

  }

  setAddrTitle = (geom) => {
    this.geom = geom;
    let title = `x:${geom.x},y:${geom.y}`;
    this.setState({
      addrTitle: title,
    });
  }

  dealAddress = (addrDescrip) => {
    // 设置定时器在输入结果之后500毫秒再次查询
    clearTimeout(this.queryIndex);
    this.queryIndex = setTimeout(() => {
      if (!addrDescrip) {
        return;
      }
      this.searchAddress({ c: 191, wd: addrDescrip });
    }, 500);
  }

  //墨卡托坐标转百度坐标
  translateCoordinate = (val) => {
    const that = this;
    const params = {
      coors: val
    }
    translateMtoB(params).then(data => {
      console.log(data, 'translateMtoB')
      that.geomToName(data)
    })
  }
  // 根据查询服务查询地址
  searchAddress = (params) => {
    baiDuAddrSearch(params).then((data) => {
      if (data.content && data.content.length > 0) {
        let tmpData = [];
        data.content.forEach((ele) => {
          // 筛选查询结果中的重复地址
          let flag = true;
          tmpData.forEach((eleData) => {
            if (eleData.name === ele.name && eleData.addr === ele.addr) {
              flag = false;
            }
          });
          if (flag) {
            tmpData.push({
              name: ele.name,
              addr: ele.addr,
              geom: { x: parseFloat(ele.x / 100), y: parseFloat(ele.y / 100) },
            });
          }
        });
        tmpData = tmpData.slice(0, 5); // 选取查询结果的前五个显示
        this.transGeom(tmpData);
      } else {
        // message.error('未查询到相关地址！');
        this.setState({
          addrList: [],
        });
      }
    });
  };

  //坐标转地址
  geomToName = (geom) => {
    const that = this;
    let baiduCoor = ''
    if (geom && geom.length > 0) {
      baiduCoor = geom[0]
    } else {
      message.error('未查询到相关地址！')
      return
    }
    const params = {
      location: `${baiduCoor.y},${baiduCoor.x}`,
      output: 'json',
      pois: 1,
      ak: 'YNHIyHSShx4Q4MBwQLfh2Lb8HUBo9chm',
    };
    v2(params).then(data => {
      console.log(data, 'dataaaa')
      if (data.result.formatted_address) {
        this.setState({
          addrDescrip: data.result.formatted_address
        });
        that.props.geomSelectedPoint(this.props.fieldname, this.state.tmpGeom, data.result.formatted_address);
      } else {
        message.error('未查询到相关地址！')
        return
      }
    })
  }
  // 将百度坐标转换为地图坐标
  transGeom = (address) => {
    let geomStr = '';
    address.forEach((ele) => {
      let geom = ele.geom;
      geomStr += `${geom.x},${geom.y},`;
    });
    geomStr = geomStr.substring(0, geomStr.length - 1);

    let userInfo = getUserInfo();
    let params = {
      coors: geomStr, // 需转换的坐标字符串，x1,y1,x2,y2,x3,y3,x4,y4...
      ecode: userInfo.ecode, // 需转换的燃气公司ecode(目前仅支持东莞、廊坊、洛阳)
      fromSRID: 'BDMecator', // 转换前的坐标系
      toSRID: 'Mercator', // 转换后的坐标系
    };
    transData(params).then((data) => {
      let resultAddr = [];
      data.forEach((ele, index) => {
        resultAddr.push({ name: address[index].name, addr: address[index].addr, geom: ele });
      });
      this.setState({
        addrList: resultAddr,
      });
    });
  }

  // 画出地图中的查询坐标点
  drawMapPoint = (pointInfo) => {
    let map = this.props.getMap();
    if (!map) {
      return;
    }
    // let drawPoints = this.state.addrList;
    // drawPoints.forEach((data, index) => {
    let param = {
      id: 'address_point',
      layerId: 'query_address_point_layer',
      src: '../../images/woPoint.png',
      width: 19,
      height: 27,
      angle: 0,
      x: pointInfo.geom.x,
      y: pointInfo.geom.y,
      attr: pointInfo,
    }
    map.getMapDisplay().image(param);
    // });
  }

  onChangeGeomValue = (value) => {
    this.props.geomSelectedPoint(this.props.fieldname, this.geom, value);
    this.setState({
      addrDescrip: value,
    });
  }

  onSelectAddr = (value, option) => {
    let geomStr = option.props['data-geom'].split(',');
    let params = {
      addr: value,
      geom: {
        x: geomStr[0],
        y: geomStr[1],
      },
    };
    this.setState({
      addrTitle: `x:${geomStr[0]},y:${geomStr[1]}`,
    });
    this.geom = params.geom;
    this.props.geomSelectedPoint(this.props.fieldname, params.geom, value);
    this.drawMapPoint(params);
  }

  onClickPointBtn = () => {
    let that = this;
    let map = this.props.getMap();
    if (!map) { // 地图若为空则直接返回
      this.props.geomHandleClick((geom) => {
        this.setAddrTitle(geom);
      });
      return;
    }
    this.props.geomHandleClick();
    const mapTool = new DrawPointMapTool(map.getMapObj(), map.getApiUrl(), (geom) => {
      let pointParams = {
        id: 'address_point',
        layerId: 'query_address_point_layer',
        src: '../../images/woPoint.png',
        width: 19,
        height: 27,
        angle: 0,
        x: geom.x,
        y: geom.y,
      };
      map.getMapDisplay().image(pointParams);

      let title = `x:${geom.x},y:${geom.y}`;
      let coortrans = `${geom.x},${geom.y}`;
      this.setState({
        addrTitle: title,
        tmpGeom: geom,
      });
      this.geom = geom;
      this.translateCoordinate(coortrans)
      // that.props.geomSelectedPoint(that.props.fieldname, geom, that.state.addrDescrip);
    });
    map.switchMapTool(mapTool);
  };


  render() {
    let selectAddr = [];
    this.state.addrList.forEach((d, index) => {
      selectAddr.push(<Option key={`${d.geom.x}_${d.geom.y}`} value={`${d.name}(${d.addr})`}
        data-geom={`${d.geom.x},${d.geom.y}`}>{`${d.name}(${d.addr})`}</Option>);
    });
    return (
      <div className={styles.span}>
        <Select
          className={styles.geom}
          mode="combobox"
          value={this.state.addrDescrip || this.props.defaultValue.addr}
          notFoundContent="数据为空"
          // disabled={true}
          onSearch={(inputValue) => {
            this.onChangeGeomValue(inputValue);
            this.dealAddress(inputValue);
          }}
          filterOption={(inputValue, option) => {
            return true;
          }}
          onSelect={(value, option) => {
            this.onChangeGeomValue(value);
            this.onSelectAddr(value, option);
          }}
        >
          {selectAddr}
        </Select>
        <Icon
          type="environment"
          className={styles.icon}
          onClick={() => {
            this.onClickPointBtn();
          }}
          title={this.state.addrTitle || '点击绘制'}
        />
      </div>
    );
  }
}

SearchAddress.defaultProps = {
  fieldname: '', // 记录当前字段名
  defaultValue: {
    addr: '',
    point: '',
  },
  getMap: () => {
    return null;
  },
  geomHandleClick: () => {
  },
  geomSelectedPoint: () => {
  }
};

SearchAddress.propTypes = {
  fieldname: PropTypes.string,
  defaultValue: PropTypes.object, // 默认值
  getMap: PropTypes.func,
  geomHandleClick: PropTypes.func,
  geomSelectedPoint: PropTypes.func,
};

export default SearchAddress;

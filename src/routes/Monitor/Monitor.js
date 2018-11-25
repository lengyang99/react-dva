import React, {Component} from 'react';
import {connect} from 'dva';
import {loadModules} from 'esri-loader';
import {Table} from 'antd';
import Dialog from '../../components/yd-gis/Dialog/Dialog';
import EcityMap from '../../components/Map/EcityMap';
import SwitchBar from './SwitchBar';
import styles from './Monitor.less';

const SWITCH_DATA = [
  {id: '门站', name: '门站', imgPath: '/images/monitor/燃气接收门站.png'},
  {id: '加气站', name: '加气站', imgPath: '/images/monitor/燃气加气站.png'},
  {id: '管网', name: '管网', imgPath: '/images/monitor/管网-title.png'},
];

// 地图图标引用
const imgs = {
  '门站': './images/monitor/门站.png',
  '加气站': './images/monitor/加气站.png',
  '管网': './images/monitor/管网.png',
};

const typeName = {
  '门站': 'mzOpa', // 门站
  '加气站': 'jqzOpa', //
  '管网': 'gwOpa', // 管网
};

@connect(state => ({
  points: state.monitor.results,
  user: state.login.user,
}))

export default class Monitor extends Component {
  constructor(props) {
    super(props);
    this.map = null;
    this.apiUrl = null;
    this.state = {
      isDialog: false,
      cloumns: null,
      dataSource: null,
      showLeftDiv: true,
      selectedLayer: '',
      d_datas: [], // 已绘制的tip框矩形数据 {x: 屏幕x坐标, y: 屏幕坐标, h: 矩形宽度, y: 矩形高度}
    };

    this.showLayer = {
      mzOpa: true,
      jqzOpa: true,
      gwOpa: true,
    };
  }

  onMapLoad = (ArcGISMap) => {
    this.map = ArcGISMap;
    this.apiUrl = ArcGISMap.getApiUrl();
    this.props.dispatch({
      type: 'monitor/fetchTags',
      payload: {
        fetchParams: {
          // ecode: '0011' //this.props.user.ecode,
          // eventId: '69729fa9eeaf466d9e2c3de512e95a35',
        },
        fun: this.drawPoint,
      },
    });
    this.map.getMapObj().on('zoom', () => {
      this.drawPoint(this.props.points);
    });
  };

  drawPoint = (points) => {
    points = points.data;

    this.clearLayer();
    this.state.d_datas = []; // 将tip框缓存清空
    if (points.length === 0) {
      return;
    }
    const data = this.formatData(points);
    this.initTable(points);
    loadModules(['esri/geometry/Point',
      'esri/SpatialReference',
      'esri/graphic',
      'esri/Color',
      'esri/symbols/TextSymbol',
      'esri/symbols/SimpleLineSymbol',
      'esri/symbols/SimpleMarkerSymbol',
      'esri/layers/GraphicsLayer',
      'esri/symbols/PictureMarkerSymbol',
      'esri/symbols/Font'], {url: this.apiUrl})
      .then(([Point, SpatialReference, Graphic, Color,
               TextSymbol, SimpleLineSymbol, SimpleMarkerSymbol, GraphicsLayer, PictureMarkerSymbol, Font]) => {
        const font = new Font('10pt', Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLD, 'Courier');

        const layer1 = new GraphicsLayer({id: 'monitor_tip'});
        const layer2 = new GraphicsLayer({id: 'monitor_img'});

        const layer3 = new GraphicsLayer({id: 'monitor_mztext'});
        const layer4 = new GraphicsLayer({id: 'monitor_jqztext'});
        const layer5 = new GraphicsLayer({id: 'monitor_grzext'});
        for (let i = 0; i < data.length; i++) {
          // 新建ArcGIS Point对象
          const point = new Point(data[i].x, data[i].y, new SpatialReference({wkid: 3857}));
          // 新建图片符号对象
          const markerSymbol = new PictureMarkerSymbol(imgs[data[i].devtype], 25, 25);
          layer2.add(new Graphic(point, markerSymbol));

          // 画边框
          const len = this.getMaxLen(data[i].text);
          // const height = data[i].text.length * 24 > 55 ? data[i].text.length * 24 : 55;
          // const height = 150;
          // svg Path路径，以左上角为原点逆时针画线
          // const iconPath = 'M 0 0L 0 25 L-15 45 L0 40 L0 105 L ' + len + ' 105  L' + len + ' 0L 0 0'
          const lp = 20; // 尖角的长度
          const wp = 20; // 尖角的宽度
          const params = {
            mapPoint: point,
            w: len,
            h: 70,
            l_p: lp,
            w_p: wp,
          };
          const iconData = this.getIconPath(params);
          if (!iconData) {
            continue;
          }
          let iconPath = '';
          for (let h = 0; h < iconData.path.length; h++) {
            const path = iconData.path[h];
            iconPath += path.type + path.p[0] + ',' + path.p[1];
          }
          const symbolColor = new Color([255, 255, 255, 1]);

          const outLine = new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color('#696969'),
            1);
          const tipSymbol = new SimpleMarkerSymbol();
          tipSymbol.setPath(iconPath);
          tipSymbol.setSize('auto');
          tipSymbol.setColor(symbolColor);
          tipSymbol.setOutline(outLine);
          tipSymbol.setOffset(iconData.offsetx, iconData.offsety);
          layer1.add(new Graphic(point, tipSymbol));

          // 将站点名称设置到text中
          const nameSymbol = new TextSymbol(data[i].name, font.setSize(12), new Color([80, 120, 237]));
          nameSymbol.setAlign(TextSymbol.ALIGN_START);
          nameSymbol.setOffset(iconData.textOffsetx, iconData.textOffsety);
          layer1.add(new Graphic(point, nameSymbol));

          // 将站点前两个监测指标设置到text符号中
          for (let j = 0; j < 2; j++) {
            const textSymbol = new TextSymbol(data[i].text[j].text, font, new Color('#696969'));
            textSymbol.setAlign(TextSymbol.ALIGN_START);
            textSymbol.setOffset(iconData.textOffsetx, iconData.textOffsety - (20 * (j + 1)));
            layer1.add(new Graphic(point, textSymbol));
          }
        }
        this.map.getMapObj().addLayer(layer1);
        this.map.getMapObj().addLayer(layer2, 2);
        // layer2.on('click', () => this.handleDialogOpen());

        this.map.getMapObj().addLayer(layer3);
        this.map.getMapObj().addLayer(layer4);
        this.map.getMapObj().addLayer(layer5);
      });
  }

  initTable = (data) => {
    const tableData = [];
    for (let i = 0; i < data.length; i++) {
      tableData.push({
        key: data[i].gid,
        itemText: data[i].itemText,
        itemValue: data[i].itemValue,
        time: data[i].time.split('.')[0],
        x: data[i].x,
        y: data[i].y,
      });
    }
    const clo = [
      {
        title: '指标',
        dataIndex: 'itemText',
        width: 100,
      },
      {
        title: 'PV',
        dataIndex: 'itemValue',
        width: 100,
      },
      {
        title: '时间',
        dataIndex: 'time',
        width: 200,
      },
    ];
    this.setState({
      dataSource: tableData,
      cloumns: clo,
    });
  };

  // 获取最长的text的值作为边框的宽度
  getMaxLen = (texArr) => {
    let len = texArr[0].text.replace(/[\u0391-\uFFE5]/g, 'aa').length;
    for (let i = 0; i < 2; i++) {
      const temp = texArr[i].text.replace(/[\u0391-\uFFE5]/g, 'aa').length;
      if (temp > len) {
        len = temp;
      }
    }
    return len * 8;
  };

  // 对查询到的数据进行拼装
  formatData = (points) => {
    if (points.length === 0) {
      return points;
    }

    const datas = this.fitterData(points);
    if (datas.length === 0) {
      return;
    }
    const gids = this.removeDuplicateGid(datas); // 把gid去重
    for (let j = 0; j < gids.length; j++) {
      const data = [];
      for (let i = 0; i < datas.length; i++) {
        datas[i].x = datas[i].xmer;
        datas[i].y = datas[i].ymer;
        if (`${datas[i].gid}${datas[i].name}` === gids[j]) {
          datas[i].indicators && datas[i].indicators.forEach((item, index) => {
            data.push({
              text: item.itemText + ':' + item.itemValue + ' ' + item.unit,
            });
          });
        }
      }
      for (let h = 0; h < datas.length; h++) {
        if (`${datas[h].gid}${datas[h].name}` === gids[j]) {
          datas[h].text = data;
        }
      }
    }
    return this.removeDuplicateData(datas);
  };

  // 过滤数据
  fitterData = (data) => {
    const result = [];
    data.forEach((item) => {
      const devtype = item.devtype;
      const opacity = this.showLayer[typeName[devtype]];
      // 只显示被选中的图层数据
      if (opacity === true) {
        result.push(item);
      }
    });
    return result;
  }

  // 去重,获取gid列表
  removeDuplicateGid = (arr) => {
    const temp = [`${arr[0].gid}${arr[0].name}`];
    let target = true;
    for (let i = 1; i < arr.length; i++) {
      for (let j = 0; j < temp.length; j++) {
        if (`${arr[i].gid}${arr[i].name}` === temp[j]) {
          target = false;
          break;
        } else target = true;
      }
      if (target) {
        temp.push(`${arr[i].gid}${arr[i].name}`);
      }
    }
    return temp;
  };

  // 去重,获取数据列表
  removeDuplicateData = (arr) => {
    const temp = [arr[0]];
    let target = true;
    for (let i = 1; i < arr.length; i++) {
      for (let j = 0; j < temp.length; j++) {
        if (`${arr[i].gid}${arr[i].name}` === `${temp[j].gid}${temp[j].name}`) {
          target = false;
          break;
        } else target = true;
      }
      if (target) {
        temp.push(arr[i]);
      }
    }
    return temp;
  };

  // tip框八个方向的路径选择，暂时只支持上下左右四种，tip框高度写死为110
  getIconPath = (params) => {
    // 将地图坐标转换为屏幕坐标
    const srcPoint = this.map.getMapObj().toScreen(params.mapPoint);
    // 右侧tip框
    const pright = {
      dir: 'right',
      x: srcPoint.x + params.l_p,
      y: srcPoint.y - (params.h / 2), // 矩形起始点坐标向下平移高度的二分之一
      h: params.h,
      w: params.w,
      lp: params.l_p,
      wp: params.w_p,
      offsetx: (params.w + params.l_p + 5) / 2,
      offsety: 0,
      textOffsetx: params.l_p + 15,
      textOffsety: 16,
    };
    // 左侧tip框
    const pleft = {
      dir: 'left',
      x: srcPoint.x - params.w - params.l_p,
      y: srcPoint.y - (params.h / 2),
      h: params.h,
      w: params.w,
      lp: params.l_p,
      wp: params.w_p,
      offsetx: -(params.w + params.l_p + 5) / 2,
      offsety: 0,
      textOffsetx: -(params.w + params.l_p - 15),
      textOffsety: 16,
    };
    // 上侧tip框
    const ptop = {
      dir: 'top',
      x: srcPoint.x - (params.w / 2),
      y: srcPoint.y - params.h - params.l_p,
      h: params.h,
      w: params.w,
      lp: params.l_p,
      wp: params.w_p,
      offsetx: 0,
      offsety: (params.h + params.l_p + 5) / 2,
      textOffsetx: -params.w / 2 + 15,
      textOffsety: 30 + ((params.h + params.l_p + 5) / 2),
    };
    // 下侧tip框
    const pboom = {
      dir: 'boom',
      x: srcPoint.x - (params.w / 2),
      y: srcPoint.y + params.l_p,
      h: params.h,
      w: params.w,
      lp: params.l_p,
      wp: params.w_p,
      offsetx: 0,
      offsety: -(params.h + params.l_p + 5) / 2,
      textOffsetx: -params.w / 2 + 15,
      textOffsety: -30 - ((params.l_p + 5) / 2),
    };
    // 左上方tip框
    const plefttop = {
      dir: 4,
      x: srcPoint.x - params.w - params.l_p,
      y: srcPoint.y - params.h - params.l_p,
      h: params.h,
      w: params.w,
      lp: params.l_p,
      wp: params.w_p,
    };
    // 右上方tip框
    const prighttop = {
      dir: 5,
      x: srcPoint.x + params.l_p,
      y: srcPoint.y - params.h - params.l_p,
      h: params.h,
      w: params.w,
      lp: params.l_p,
      wp: params.w_p,
    };
    // 右下方tip框
    const prightbottom = {
      dir: 6,
      x: srcPoint.x + params.l_p,
      y: srcPoint.y + params.l_p,
      h: params.h,
      w: params.w,
      lp: params.l_p,
      wp: params.w_p,
    };
    // 左下方tip框
    const pleftbottom = {
      dir: 7,
      x: srcPoint.x - params.w - params.l_p,
      y: srcPoint.y + params.l_p,
      h: params.h,
      w: params.w,
      lp: params.l_p,
      wp: params.w_p,
    };

    let data = null;
    if (!this.isCross(pright)) {
      data = pright;
      data.path = [
        {type: 'M', p: [0, data.h / 2]}, // 尖角为起点
        {type: 'L', p: [data.lp, (data.h - data.wp) / 2]},
        {type: 'L', p: [data.lp, 0]}, // 左下角
        {type: 'L', p: [data.lp + data.w, 0]}, // 右下角
        {type: 'L', p: [data.lp + data.w, data.h]}, // 右上角
        {type: 'L', p: [data.lp, data.h]}, // 左上角
        {type: 'L', p: [data.lp, (data.h + data.wp) / 2]},
        {type: 'L', p: [0, data.h / 2]},
      ];
    } else if (!this.isCross(pleft)) {
      data = pleft;
      data.path = [
        {type: 'M', p: [0, data.h / 2]}, // 尖角为起点
        {type: 'L', p: [-data.lp, (data.h - data.wp) / 2]},
        {type: 'L', p: [-data.lp, 0]}, // 左下角
        {type: 'L', p: [-(data.lp + data.w), 0]}, // 右下角
        {type: 'L', p: [-(data.lp + data.w), data.h]}, // 右上角
        {type: 'L', p: [-data.lp, data.h]}, // 左上角
        {type: 'L', p: [-data.lp, (data.h + data.wp) / 2]},
        {type: 'L', p: [0, data.h / 2]},
      ];
    } else if (!this.isCross(ptop)) {
      data = ptop;
      data.path = [
        {type: 'M', p: [0, 0]}, // 尖角为起点
        {type: 'L', p: [data.wp / 2, -data.lp]},
        {type: 'L', p: [data.w / 2, -data.lp]}, // 右下角
        {type: 'L', p: [data.w / 2, -data.h - data.lp]}, // 右上角
        {type: 'L', p: [-data.w / 2, -data.h - data.lp]}, // 左上角
        {type: 'L', p: [-data.w / 2, -data.lp]}, // 左下角
        {type: 'L', p: [-data.wp / 2, -data.lp]},
        {type: 'L', p: [0, 0]},
      ];
    } else if (!this.isCross(pboom)) {
      data = pboom;
      data.path = [
        {type: 'M', p: [0, 0]}, // 尖角为起点
        {type: 'L', p: [data.wp / 2, data.lp]},
        {type: 'L', p: [data.w / 2, data.lp]}, // 右下角
        {type: 'L', p: [data.w / 2, data.h + data.lp]}, // 右上角
        {type: 'L', p: [-data.w / 2, data.h + data.lp]}, // 左上角
        {type: 'L', p: [-data.w / 2, data.lp]}, // 左下角
        {type: 'L', p: [-data.wp / 2, data.lp]},
        {type: 'L', p: [0, 0]},
      ];
    } else {
      return data;
    }
    this.state.d_datas.push(data);
    return data;
  };

  // 判断是否相交
  isCross = (r1) => {
    for (let i = 0; i < this.state.d_datas.length; i++) {
      const datas = this.state.d_datas[i];
      const r2 = {x: datas.x, y: datas.y, w: datas.w, h: datas.h};
      if (this.isCrossRect(r1, r2)) {
        return true;
      }
    }
    return false;
  };

  // 矩形是否相交
  isCrossRect = (r1, r2) => {

    // 计算两矩形可能的相交矩形的边界
    let nMaxLeft = (r1.x >= r2.x ? r1.x : r2.x) || 0;
    let nMaxTop = (r1.y >= r2.y ? r1.y : r2.y) || 0;
    let nMinRight = ((r1.x + r1.w) <= (r2.x + r2.w) ? (r1.x + r1.w) : (r2.x + r2.w)) || 0;
    let nMinBottom = ((r1.y + r1.h) <= (r2.y + r2.h) ? (r1.y + r1.h) : (r2.y + r2.h)) || 0;

    // 判断是否相交
    return !(nMaxLeft > nMinRight || nMaxTop > nMinBottom);
  };

  // 清除图层
  clearLayer = () => {
    const layer1 = this.map.getMapObj().getLayer('monitor_tip');
    const layer2 = this.map.getMapObj().getLayer('monitor_img');

    const layer3 = this.map.getMapObj().getLayer('monitor_mztext');
    const layer4 = this.map.getMapObj().getLayer('monitor_jqztext');
    const layer5 = this.map.getMapObj().getLayer('monitor_grzext');

    layer1 && this.map.getMapObj().removeLayer(layer1);
    layer2 && this.map.getMapObj().removeLayer(layer2);
    layer3 && this.map.getMapObj().removeLayer(layer3);
    layer4 && this.map.getMapObj().removeLayer(layer4);
    layer5 && this.map.getMapObj().removeLayer(layer5);
  };

  handleDialogOpen = (attr) => {
    // 点击查询弹出属性框
    // const info = {
    //   title: '监测点信息',
    //   content: [{
    //     name: '编号', value: attr.gid,
    //   }, {
    //     name: '监测点名称', value: attr.itemText,
    //   }, {
    //     name: '监测时间', value: attr.time.split('.')[0],
    //   }, {
    //     name: '监测压力', value: attr.itemValue,
    //   }],
    // };
    // let param = {
    //   x: attr.x,
    //   y: attr.y,
    //   info,
    // };
    // this.map.popup(param);

    // 点击查询弹出对话框
    this.setState({
      isDialog: true,
    });
  };

  // 对话框关闭
  handleDialogClose = () => {
    this.setState({
      isDialog: false,
    });
  };

  // 表格数据双击定位
  onTableDoubleClick = (record) => {
    this.map.centerAt(record);
  };

  barSelect = (item) => {
    this.showStationImg = 1;
    const {id} = item;
    switch (id) {
      case '门站':
        if (!this.showLayer.mzOpa) {
          this.showLayer.mzOpa = true;
          this.drawPoint(this.props.points);
        } else {
          this.showLayer.mzOpa = false;
          this.drawPoint(this.props.points);
        }
        break;
      case '加气站':
        if (!this.showLayer.jqzOpa) {
          this.showLayer.jqzOpa = true;
          this.drawPoint(this.props.points);
        } else {
          this.showLayer.jqzOpa = false;
          this.drawPoint(this.props.points);
        }
        break;
      case '管网':
        if (!this.showLayer.gwOpa) {
          this.showLayer.gwOpa = true;
          this.drawPoint(this.props.points, true);
        } else {
          this.showLayer.gwOpa = false;
          this.drawPoint(this.props.points, true);
        }
        break;
      default:
        break;
    }
    this.setState({
      selectedLayer: id,
    });
  };

  render() {
    const DialogComp = this.state.isDialog ? (
      <Dialog
        title={{
          name: '指标详情',
          icon: '',
        }}
        width={429}
        position={{
          right: 80,
          top: 120,
        }}
        onClose={this.handleDialogClose}
      >
        <div
          style={{
            height: 505,
            width: 429,
          }}
        >
          <Table
            style={{
              width: 426,
              height: 470,
              backgroundColor: '#FFFFFF',
            }}
            pagination={{
              hideOnSinglePage: true,
            }}
            size="middle"
            dataSource={this.state.dataSource}
            columns={this.state.cloumns}
            onRowDoubleClick={this.onTableDoubleClick}
          />
        </div>
      </Dialog>) : null;
    return (
      <div style={{width: '100%', height: 'calc(100vh - 120px)'}}>
        <EcityMap
          mapId="monitor"
          onMapLoad={this.onMapLoad}
        />
        <SwitchBar
          data={SWITCH_DATA}
          showId={['门站', '加气站', '管网']}
          onSelect={this.barSelect.bind(this)}
        />
        {DialogComp}
      </div>
    );
  }
}

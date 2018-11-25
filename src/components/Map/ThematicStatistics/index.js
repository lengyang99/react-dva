import React from 'react';
import { connect } from 'dva';
import { Tabs, message } from 'antd';
import ReactEcharts from 'echarts-for-react';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';
import { getUserInfo } from '../../../utils/utils';
import styles from './index.less';

const { TabPane } = Tabs;
const eoption = {
  color: ['#3398DB'],
  tooltip: {
    trigger: 'axis',
    // 坐标轴指示器，坐标轴触发有效
    axisPointer: {
      type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
    },
  },
  // 坐标轴偏移
  grid: {
    left: '3%',
    right: '4%',
    top: '10%',
    bottom: '7%',
    containLabel: true,
  },
  xAxis: [
    {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        interval: 0, // 横轴信息全部显示
        rotate: -30, // -30度角倾斜显示
      },
    },
  ],
  yAxis: [
    {
      type: 'value',
      name: '公里',
    },
  ],
  series: [
    {
      name: '统计数量',
      type: 'bar',
      barWidth: '60%',
      data: [10, 52, 200, 334, 390, 330, 220],
    },
  ],
};
// 全局消息提示设置
message.config({
  top: 300,
  duration: 2,
});
@connect(state => ({
  // metaData: state.thematicStatistics.results,
}))
export default class ThematicStatistics extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      metaData: null,
      option: eoption,
      total: 0, // 统计总数
      unit: '公里', // 统计单位
    };
  }

  componentDidMount() {
    const { ecode } = this.props;
    let userCode = ecode;
    if (!ecode) {
      const userInfo = getUserInfo();
      userCode = userInfo.user.ecode;
    }
    this.getMetaData(userCode);
  }

  // 查询管网元数据
  getMetaData = (userCode) => {
    this.props.dispatch({
      type: 'thematicStatistics/getMeta',
      payload: {
        ecode: userCode,
        fun: this.initMetaData,
      },
    });
  };

  // 获取对应的layerid
  getLayerIdByDno = (dno) => {
    const net = this.state.metaData.net;
    let layerid = 0;
    for (const i in net) {
      if (net[i].dno === dno) {
        layerid = net[i].layerid;
      }
    }
    return layerid;
  };

  // 初始化管网元数据
  initMetaData = (meta) => {
    if (!meta) {
      message.info('管网数据获取失败！');
      return;
    }
    this.state.metaData = meta;
    this.dataStatistic('管径');
  };

  // 数据统计
  dataStatistic = (type) => {
    let layerid = 0;
    // 管网元数据中的设备编号
    let dno = 0;
    switch (type) {
      case '管径':
        dno = 1;
        layerid = this.getLayerIdByDno(dno);
        this.props.dispatch({
          type: 'thematicStatistics/gjStatistics',
          payload: {
            ecode: this.props.ecode,
            id: layerid,
            params: {
              returnGeometry: false,
              spatialRel: 'esriSpatialRelIntersects',
              outFields: '*',
              groupByFieldsForStatistics: 'pipeDiam',
              orderByFields: 'pipeDiam',
              outStatistics: JSON.stringify([{
                statisticType: 'SUM',
                onStatisticField: 'pipeLength',
                outStatisticFieldName: '管道长度求和',
              }]),
            },
            fun: this.initEchart,
          },
        });
        break;
      case '管材':
        dno = 1;
        layerid = this.getLayerIdByDno(dno);
        this.props.dispatch({
          type: 'thematicStatistics/gcStatistics',
          payload: {
            ecode: this.props.ecode,
            id: layerid,
            params: {
              returnGeometry: false,
              spatialRel: 'esriSpatialRelIntersects',
              outFields: '*',
              groupByFieldsForStatistics: 'pipematerial',
              orderByFields: 'pipematerial',
              outStatistics: JSON.stringify([{
                statisticType: 'SUM',
                onStatisticField: 'pipeLength',
                outStatisticFieldName: '管道长度求和',
              }]),
            },
            fun: this.initEchart,
          },
        });
        break;
      case '管龄':
        dno = 1;
        layerid = this.getLayerIdByDno(dno);
        this.props.dispatch({
          type: 'thematicStatistics/glStatistics',
          payload: {
            ecode: this.props.ecode,
            id: layerid,
            params: {
              returnGeometry: false,
              spatialRel: 'esriSpatialRelIntersects',
              where: '',
              outFields: '*',
              groupByFieldsForStatistics: 'pressureRating',
              orderByFields: 'pressureRating',
              outStatistics: JSON.stringify([{
                statisticType: 'SUM',
                onStatisticField: 'pipeLength',
                outStatisticFieldName: '管道长度求和',
              }]),
            },
            fun: this.initEchart,
          },
        });
        break;
      case '阀门':
        dno = 3;
        layerid = this.getLayerIdByDno(dno);
        this.props.dispatch({
          type: 'thematicStatistics/fmStatistics',
          payload: {
            ecode: this.props.ecode,
            id: layerid,
            params: {
              returnGeometry: false,
              spatialRel: 'esriSpatialRelIntersects',
              outFields: '*',
              groupByFieldsForStatistics: 'eqptType',
              orderByFields: 'eqptType',
              outStatistics: JSON.stringify([{
                statisticType: 'COUNT',
                onStatisticField: 'eqptCode',
                outStatisticFieldName: '设备编码计数',
              }]),
            },
            fun: this.initEchart,
          },
        });
        break;
      case '调压设备':
        dno = 2;
        layerid = this.getLayerIdByDno(dno);
        this.props.dispatch({
          type: 'thematicStatistics/tyStatistics',
          payload: {
            ecode: this.props.ecode,
            id: layerid,
            params: {
              returnGeometry: false,
              spatialRel: 'esriSpatialRelIntersects',
              outFields: '*',
              groupByFieldsForStatistics: 'eqptType',
              orderByFields: 'eqptType',
              outStatistics: JSON.stringify([{
                statisticType: 'COUNT',
                onStatisticField: 'eqptCode',
                outStatisticFieldName: '设备编码计数',
              }]),
            },
            fun: this.initEchart,
          },
        });
        break;
      default:
        break;
    }
  };

  // echart数据初始化
  initEchart = (res) => {
    eoption.xAxis[0].data = res.xdata;
    eoption.series[0].data = res.ydata;
    eoption.yAxis[0].name = res.unit;
    this.setState({
      option: eoption,
      total: res.total,
      unit: res.unit,
    });
  };

  render() {
    if (!this.props.visible) {
      return null;
    }

    return (
      <Dialog
        width={450}
        title="管网专题统计"
        position={
          { bottom: 10, right: 50 }}
        onClose={this.props.onClose}
      >
        <Tabs
          size="small"
          className={styles.tabs}
          onChange={this.dataStatistic}
        >
          <TabPane tab="管径" key="管径" className={styles.tabPane}>
            <div className={styles.divSpan}>
              <span>管线总长度：</span>
              <span>{this.state.total}</span>
              <span>{this.state.unit}</span>
            </div>
            <ReactEcharts
              option={this.state.option}
              style={{ height: '290px', width: '400px' }}
            />
            {/*<div className={styles.tabPaneContent} id="echart_gj">*/}
              {/*<img src="images/map/thematic/管径.png" alt="管径专题统计" />*/}
            {/*</div>*/}
          </TabPane>
          <TabPane tab="管材" key="管材" className={styles.tabPane}>
            <div className={styles.divSpan}>
              <span>管线总长度：</span>
              <span>{this.state.total}</span>
              <span>{this.state.unit}</span>
            </div>
            <ReactEcharts
              option={this.state.option}
              style={{ height: '290px', width: '400px' }}
            />
            {/*<div className={styles.tabPaneContent}>*/}
              {/*<img src="images/map/thematic/管材.png" alt="管材专题统计" />*/}
            {/*</div>*/}
          </TabPane>
          <TabPane tab="管龄" key="管龄" className={styles.tabPane}>
            <div className={styles.divSpan}>
              <span>管线总长度：</span>
              <span>{this.state.total}</span>
              <span>{this.state.unit}</span>
            </div>
            <ReactEcharts
              option={this.state.option}
              style={{ height: '290px', width: '400px' }}
            />
            {/*<div className={styles.tabPaneContent}>*/}
              {/*<img src="images/map/thematic/管龄.png" alt="管龄专题统计" />*/}
            {/*</div>*/}
          </TabPane>
          <TabPane tab="调压设备" key="调压设备" className={styles.tabPane}>
            <div className={styles.divSpan}>
              <jian>调压设备总个数：</jian>
              <span>{this.state.total}</span>
              <span>{this.state.unit}</span>
            </div>
            <ReactEcharts
              option={this.state.option}
              style={{ height: '290px', width: '400px' }}
            />
            {/*<div className={styles.tabPaneContent}>*/}
              {/*<img src="images/map/thematic/调压设备.png" alt="调压设备专题统计" />*/}
            {/*</div>*/}
          </TabPane>
          <TabPane tab="阀门" key="阀门" className={styles.tabPane}>
            <div className={styles.divSpan}>
              <span>阀门总个数：</span>
              <span>{this.state.total}</span>
              <span>{this.state.unit}</span>
            </div>
            <ReactEcharts
              option={this.state.option}
              style={{ height: '290px', width: '400px' }}
            />
            {/*<div className={styles.tabPaneContent}>*/}
              {/*<img src="images/map/thematic/阀门.png" alt="阀门专题统计" />*/}
            {/*</div>*/}
          </TabPane>
        </Tabs>
      </Dialog>
    );
  }
}

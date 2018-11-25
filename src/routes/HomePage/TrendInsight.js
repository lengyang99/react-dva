import React, {Component} from 'react';
import {Tabs} from 'antd';
import echarts from 'echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';

const TabPane = Tabs.TabPane;
export default class OperationTopic extends Component {
  componentWillMount() {

  }

  componentDidMount() {
    this.drawBar();
  }

  componentDidUpdate() {
    this.drawBar();
  }

  componentWillUnmount() {

  }

    drawBar = () => {
      const myChart = echarts.init(document.getElementById(('main_bar2')));
      const option = {
        color: ['RGB(192,237,238)', 'RGB(233,226,245)'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          },
        },
        legend: {
          data: ['发现', '解决'],
        },
        grid: {
          left: '1%',
          right: '8%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
        series: [
          {
            name: '发现',
            type: 'line',
            stack: '总量',
            areaStyle: {normal: {}},
            data: [120, 132, 101, 134, 90, 230, 210, 120, 132, 101, 134, 90],
          },
          {
            name: '解决',
            type: 'line',
            stack: '总量',
            areaStyle: {normal: {}},
            data: [220, 182, 191, 234, 290, 330, 310, 120, 132, 101, 134, 90],
          },
        ],
      };
      myChart.setOption(option);
    }
    render() {
      const divstyle = {
        width: this.props.width,
        height: this.props.height,
      };
      return (
        <Tabs tabBarStyle={{marginBottom: 5}} defaultActiveKey="1">
          <TabPane tab="设备故障" key="1">
            <div style={{width: 'auto', 'marginLeft': '10px'}}>
              <div id="main_bar2" style={divstyle} />
            </div>
          </TabPane>
          <TabPane tab="工商户隐患" key="2">功能未完善,敬请期待...</TabPane>
          <TabPane tab="管网巡视" key="3">功能未完善,敬请期待...</TabPane>
          <TabPane tab="第三方施工" key="4">功能未完善,敬请期待...</TabPane>
        </Tabs>
      );
    }
}

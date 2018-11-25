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
      const myChart = echarts.init(document.getElementById(('main_bar')));
      const option = {
        color: ['RGB(91,176,240)', 'RGB(166,207,128)', 'RGB(107,221,255)', 'RGB(162,158,227)'],
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
          },
        },
        legend: {
          data: ['施工总数', '新增数', '关闭施工数', '监护数'],
        },
        grid: {
          left: '1%',
          right: '8%',
          bottom: '12%',
          height: '80%',
          containLabel: true,
        },
        xAxis: {
          type: 'value',
        },
        yAxis: {
          type: 'category',
          data: ['城北所', '城南所', '中心所', '开发区所', '万庄所', '白家务所'],
        },
        series: [
          {
            name: '施工总数',
            type: 'bar',
            stack: '总量',
            barWidth: '55%',
            label: {
              normal: {
                show: true,
                position: 'insideRight',
              },
            },
            data: [32, 30, 30, 34, 39, 26],
          },
          {
            name: '新增数',
            type: 'bar',
            barWidth: '55%',
            stack: '总量',
            label: {
              normal: {
                show: true,
                position: 'insideRight',
              },
            },
            data: [12, 13, 10, 34, 90, 45],
          },
          {
            name: '关闭施工数',
            barWidth: '55%',
            type: 'bar',
            stack: '总量',
            label: {
              normal: {
                show: true,
                position: 'insideRight',
              },
            },
            data: [22, 18, 19, 23, 29, 35],
          },
          {
            name: '监护数',
            type: 'bar',
            barWidth: '55%',
            stack: '总量',
            label: {
              normal: {
                show: true,
                position: 'insideRight',
              },
            },
            data: [15, 21, 20, 15, 19, 30],
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
          <TabPane tab="第三方施工" key="1">
            <div style={{width: 'auto', 'marginLeft': '10px'}}>
              <div id="main_bar" style={divstyle} />
            </div>
          </TabPane>
          <TabPane tab="故障" key="2">功能未完善,敬请期待...</TabPane>
          <TabPane tab="隐患" key="3">功能未完善,敬请期待...</TabPane>
          <TabPane tab="带气" key="4">功能未完善,敬请期待...</TabPane>
        </Tabs>
      );
    }
}

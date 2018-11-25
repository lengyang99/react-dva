import React, {Component} from 'react';
import echarts from 'echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';

export default class Appliedpoly extends Component {
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
      const myChart = echarts.init(document.getElementById(('main_bar3')));
      const option = {
        tooltip: {
          formatter: '{a} <br/>{b} : {c}%',
        },
        series: [
          {
            name: '完成率',
            type: 'gauge',
            min: 0,
            max: 100,
            splitNumber: 10,
            radius: '100%',
            axisLine: { // 坐标轴线
              show: false,
              lineStyle: { // 属性lineStyle控制线条样式
                width: 10,
                color: [[0.2, 'RGB(228,63,61)'], [0.4, 'RGB(233,142,44)'], [0.6, 'RGB(221,189,77)'], [0.8, 'RGB(124,187,85)'], [1, 'RGB(156,214,206)']],
              },
            },
            axisTick: { // 坐标轴小标记
              show: false,
              lineStyle: { // 属性lineStyle控制线条样式
                color: 'auto',
              },
            },
            axisLabel: {
              fontSize: 6,
            },
            splitLine: { // 分隔线
              length: 10, // 属性length控制线长
              lineStyle: { // 属性lineStyle（详见lineStyle）控制线条样式
                color: 'auto',
              },
            },
            title: {
              fontWeight: 'bolder',
              fontSize: 10,
              offsetCenter: [0, '-15%'],
            },
            pointer: {
              show: false,
            },
            detail: {
              formatter: '{value}%',
              fontSize: 8,
              offsetCenter: [0, '10%'],
            },
            data: [{value: 50, name: '完成率'}],
          },
        ],
      };
      myChart.setOption(option);
    }
    render() {
      const divstyle = {
        width: '100px',
        height: '100px',
      };
      return (
        <div style={{ width: 'auto', 'marginLeft': '10px' }}>
          <div id="main_bar3" style={divstyle} />
        </div>
      );
    }
}

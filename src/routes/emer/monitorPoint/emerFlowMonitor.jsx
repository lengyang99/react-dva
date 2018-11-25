import React from 'react';
import echarts from 'echarts';

export default class EmerFlowMonitor extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount = () => {
    // 基于准备好的dom，初始化echarts实例
    let flowChart = echarts.init(document.getElementById('flowMonitor'));
    let optioin = {
      tooltip: {
        trigger: 'axis',
      },
      toolbox: {
        show: false,
        feature: {
          mark: {show: true},
          dataView: {show: true, readOnly: false},
          magicType: {show: true, type: ['line', 'bar']},
          restore: {show: true},
          saveAsImage: {show: true},
        },
      },
      textStyle: {
        color: '#fff',
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: ['0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00'],
          axisLine: {
            lineStyle: {
              color: '#00bdf0',
            },
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          min: 60,
          max: 100,
          splitNumber: 4,
          axisLine: {
            lineStyle: {
              color: '#00bdf0',
            },
          },
        },
      ],
      series: [
        {
          name: '实际值',
          type: 'line',
          data: [86, 80, 76, 80, 75, 82, 80, 75, 80, 84, 87, 80, 78],
          symbol: 'emptyCircle',
          symbolSize: 4,
          itemStyle: {
            normal: {
              lineStyle: {
                color: '#2193ef',
              },
            },
          },
        },
        {
          name: '标准值',
          type: 'line',
          data: [75, 75, 75, 75, 75, 75, 75, 75, 75, 75, 75, 75, 75],
          symbol: 'emptyCircle',
          symbolSize: 4,
          itemStyle: {
            normal: {
              lineStyle: {
                color: '#25aa3d',
              },
            },
          },
        },
      ],
    };
    flowChart.setOption(optioin);
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  }

  render = () => {
    return (<div
      id="flowMonitor"
      style={{
        position: 'absolute',
        top: -5,
        left: 13,
        width: 315,
        height: 230,
      }}
    />);
  }
}

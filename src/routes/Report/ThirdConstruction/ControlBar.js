import React, { Component } from 'react';
import echarts from 'echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';

export default class ControlBar extends Component {
  componentDidMount() {
    this.drawBar();
  }

  componentDidUpdate() {
    this.drawBar();
  }
  getTotal = (arr, arr2) => {
    let sum = null;
    const arr3 = [];
    if (arr && arr2 && arr.length !== 0 && arr2.length !== 0) {
      arr.forEach((item, idx) => {
        sum = arr2[idx] + item;
        arr3.push(sum);
      });
    }
    return arr3;
  }
  // 数组取差集
  getArryMinux = (arr1 = [], arr2 = []) => {
    const result = [];
    const obj = {};
    if (arr2 === []) {
      return arr1;
    } else {
      arr2.forEach(item => {
        obj[item] = 1;
      });
      arr1.forEach(item => {
        if (!obj[item]) {
          obj[item] = 1;
          result.push(item);
        }
      });
      const arr3 = [...arr2, ...result];
      return arr3;
    }
  }
  drawBar = () => {
    const { zdData, ybData, nameData, totalData, newData } = this.props.reportData;
    const stationData = this.getArryMinux(this.props.stationNames, nameData);
    const option = {
      color: ['RGB(91,155,213)', 'RGB(237,124,49)', 'RGB(165,165,165)', 'RGB(255,190,0)'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        data: ['总数量', '重点施工', '一般施工'],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '4%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: stationData || [],
          axisTick: {
            alignWithLabel: true,
          },
          axisLabel: {
            interval: 0,
            rotate: 40,
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
        },
      ],
      series: [
        {
          name: '总数量',
          type: 'bar',
          data: totalData || [],
        },
        {
          name: '重点施工',
          type: 'bar',
          data: zdData || [],
        },
        {
          name: '一般施工',
          type: 'bar',
          data: ybData || [],
        },
        // {
        //   name: '新增数量',
        //   type: 'bar',
        //   data: newData || [],
        // },
      ],
    };
    const myChart = echarts.init(document.getElementById(('main_bar')));
    myChart.setOption(option);
  }
  render() {
    const divstyle = {
      width: 'calc((100vw - 10px) * 0.4)',
      height: 'calc((100% - 10px) * 1)',
    };
    return (
      <div style={{ height: '100%', width: 'auto', 'marginLeft': '10px', 'marginTop': '10px' }}>
        <div id="main_bar" style={divstyle} />
      </div>
    );
  }
}

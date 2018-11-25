import React, { Component } from 'react';
import echarts from 'echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';

export default class ConstructionBar extends Component {
  componentDidMount() {
    this.drawBar();
  }
  componentDidUpdate() {
    this.drawBar();
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
      const { jxData, dgData, rgData, qtData, cjData, nameData} = this.props.reportData;
      const stationData = this.getArryMinux(this.props.stationNames, nameData);
      const option = {
        color: ['RGB(91,155,213)', 'RGB(237,124,49)', 'RGB(165,165,165)', 'RGB(255,190,0)', 'RGB(68,114,196)'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        legend: {
          data: ['人工开挖', '机械开挖', '穿越顶管', '拆建', '其他'],
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
            name: '人工开挖',
            type: 'bar',
            // barWidth: '15%',
            data: rgData || [],
          },
          {
            name: '机械开挖',
            type: 'bar',
            data: jxData || [],
          },
          {
            name: '穿越顶管',
            type: 'bar',
            data: dgData || [],
          },
          {
            name: '拆建',
            type: 'bar',
            data: cjData || [],
          },
          {
            name: '其他',
            type: 'bar',
            data: qtData || [],
          },
        ],
      };
      const myChart = echarts.init(document.getElementById(('main_bar2')));
      myChart.setOption(option);
    }
    render() {
      const divstyle = {
        width: 'calc((100vw - 10px) * 0.4)',
        height: 'calc((100% - 10px) *1)',
      };
      return (
        <div style={{height: '100%', width: 'auto', 'marginLeft': '10px', 'marginTop': '10px'}}>
          <div id="main_bar2" style={divstyle} />
        </div>
      );
    }
}

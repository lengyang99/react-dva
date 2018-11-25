import React, {Component} from 'react';
import {connect} from 'dva';
import echarts from 'echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import styles from './TrendStatistics.less';

export default class HomePageCard extends React.Component {
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
      const {reportParams, stNameData, monthsData } = this.props.reportData;
      const labelTop = {
        normal: {
          label: {
            show: false,
            position: 'center',
          },
          labelLine: {
            show: false,
          },
        },
      };

      const labelBottom = {
        normal: {
          color: '#ccc',
          label: {
            show: true,
            position: 'center',
            textStyle: {
              baseline: 'middle',
            },
          },
          labelLine: {
            show: false,
          },
        },
      };
      const color = ['#1890ff', '#7fc0fd', '#acd598', '#f3e095', '#90e6f0', '#7fc0fd'];
      const myChart = echarts.init(document.getElementById(('main_bar')));
      const series = [];
      let datas = {};
      (reportParams || []).forEach((item, index) => {
        datas = {
          name: item.label || '',
          type: 'bar',
          stack: 'sum',
          barCategoryGap: '50%',
          label: {
            normal: {
              show: false,
            },
          },
          itemStyle: {
            normal: {
              color: color[index],
              barBorderColor: color[index],
              barBorderWidth: 4,
              barBorderRadius: 0,
              label: {
                textStyle: {
                  color: '#fff',
                  fontSize: 15,
                },
                show: true,
                position: 'insideTop',
              },

            },
          },
          data: item.value || [],
        },
        series.push(datas);
      });
      myChart.setOption({
        legend: {
          textStyle: {
            fontSize: 12,
            color: '#333',
          },
          data: stNameData || [],
        },
        calculable: true,
        xAxis: [
          {
            type: 'category',
            axisLabel: {
              textStyle: {
                color: '#333',
                fontSize: 12,
              },
            },
            axisLine: {
              lineStyle: {
                color: '#1890ff',
                width: 2,
              },
            },
            data: monthsData || [],
          },
        ],
        yAxis: [
          {
            type: 'value',
            axisLabel: {
              textStyle: {
                color: '#333',
                fontSize: 12,
              },
            },
            axisLine: {
              lineStyle: {
                color: '#1890ff',
                width: 2,
              },
            },
            boundaryGap: [0, 0.1],
          },
        ],
        series: series || [],
      });
    }

    render() {
      const divstyle = {
        width: this.props.width,
        height: this.props.height,
        minHeight: '350px',
      };
      return (
        <div style={{width: 'auto', 'marginLeft': '10px'}}>
          <div id="main_bar" style={divstyle} />
        </div>
      );
    }
}

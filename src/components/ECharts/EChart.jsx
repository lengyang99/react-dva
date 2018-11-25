import React from 'react';
import PropTypes from 'prop-types';
import echarts from 'echarts';

export default class EChart extends React.Component {
    static propTypes = {
        color: PropTypes.array,
        value: PropTypes.string,
        formatter: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    };

    constructor(props) {
        super(props);
    }

    componentDidMount = () => {
        this.setEChartsOption();
    };

    componentDidUpdate = () => {
        this.setEChartsOption();
    };

    componentWillUnmount = () => {
        // clearInterval(timeTicket);
    };

    setEChartsOption = () => {
        let {id, color, value, formatter, name, min, max} = this.props;
        let option = {
            tooltip: {
                show: false, formatter: "{a} <br/>{b} : {c}%"
            },
            series: [{
                name: '监测指数', type: 'gauge', min: min, max: max, splitNumber: 5,
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: color,
                        width: 4
                    }
                },
                axisTick: {
                    show: true, splitNumber: 10, length: 8,
                    lineStyle: {
                        color: 'auto',
                    }
                },
                axisLabel: {
                    textStyle: {
                        color: 'auto',
                        fontSize: 8
                    }
                },
                splitLine: {
                    show: true, length: 12,
                    lineStyle: {
                        color: 'auto',
                    }
                },
                pointer: {
                    width: 3
                },
                title: {
                    show: true, offsetCenter: [0, '-30%'],
                    textStyle: {
                        fontWeight: 'bolder', color: '#fff', fontSize: 11
                    }
                },
                detail: {
                    show: true, offsetCenter: [0, '70%'], formatter: formatter,
                    textStyle: {
                        color: 'auto', fontWeight: 'bolder', fontSize: 12
                    }
                },
                data: [{value: value, name: name}]
            }]
        };
        // 基于准备好的dom，初始化echarts实例
        let eChart = echarts.init(document.getElementById(`echart_${id}`));
        // let eChartDivs = document.getElementsByClassName(`echart_${id}`);
        // for (let i = 0; i < eChartDivs.length; i++) {
        //     let eChart = echarts.init(eChartDivs[i]);
        //     eChart.setOption(option);
        // }
        // let eChart = echarts.init([0]);
        // // 绘制图表
        eChart.setOption(option);
        // // 设置定时器
        // timeTicket = setInterval(function () {
        //     option.series[0].data[0].value = ((Math.random() * 2 + 24) / 100).toFixed(2) - 0;
        //     leftChart.setOption(option);
        // }, 2000);
    };

    render = () => {
        let { id, title } = this.props;
        return (
            <div style={{width: 165, height: 165, position: 'relative', display: 'inline-block'}}>
                <div id={`echart_${id}`} style={{width: 165, height: 165}}/>
                <div style={{position: 'absolute', top: 135, left: 0, width: 165, height: 20, textAlign: 'center'}}>
                    {title}
                </div>
            </div>
        );
    }
}

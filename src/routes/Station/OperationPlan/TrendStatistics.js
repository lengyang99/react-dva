import React, {Component} from 'react';
import {connect} from 'dva';
import echarts from 'echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';

export default class TrendStatistics extends React.Component {
    constructor(props) {
        super(props);

    }

    componentDidMount(){
    	this.drawBar()
    }
    componentDidUpdate () {
        this.drawBar();
    }

    drawBar = () => {
 	    let myChart = echarts.init(document.getElementById(('main_bar')));
    	myChart.setOption({
                animation: false,
    			legend: {
                    selectedMode: false,
                    textStyle: {
                        fontSize: 12,
                        color: '#333',
                    },
                    left: 15,
    			    data:['新奥','华都','华能']
    			},
    			grid: {
    			    left: '3%',
    			    right: '4%',
    			    bottom: '3%',
    			    containLabel: true
    			},
    			xAxis: {
    			    type: 'category',
    			    boundaryGap: false,
                    axisLabel: {
                        rotate: 30,
                        interval: 0
                    },
    			    data: ['0','20171020','20171030','20171110', '20171120', '20171130', '20171210']
    			},
    			yAxis: {
                    type: 'value',
                    axisLabel: {
                        textStyle: {
                            color: '#333',
                            fontSize: 12
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#1890ff',
                            width: 2
                        }
                    },
                    boundaryGap: [0, 0.1]  
    			},
    			series: [
    			    {
    			        name:'新奥',
    			        type:'line',
    			        stack: '总量',
                        symbol: 'none',
                        itemStyle: {
                            normal: {
                                color: '#0090FF', 
                            }
                        },
    			        data:[12000, 13200, 10100, 13400, 9000, 23000, 21000]
    			    },
    			    {
    			        name:'华都',
    			        type:'line',
    			        stack: '总量',
                        symbol: 'none',
                        itemStyle: {
                            normal: {
                                color: '#B7A3DF',
                            }
                        },
    			        data:[15000, 6000, 6600, 12000, 15000, 18000, 18000]
    			    },
    			    {
    			        name:'华能',
    			        type:'line',
    			        stack: '总量',
                        symbol: 'none',
                        itemStyle: {
                            normal: {
                                color: '#82C157',
                            }
                        },
    			        data:[6000, 8000, 10000, 12000, 19000, 15000, 20000]
    			    }
    			]
			});

    }
    render(){
    
    	return <div style={{width: 'auto'}}>
    		<div id="main_bar" style={{width: 500, height:250}}>

            </div>
    	</div>
    }
 }
import React, {Component} from 'react';
import {connect} from 'dva';
import echarts from 'echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';

export default class SupplyGas extends React.Component {
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
 	    let myChart = echarts.init(document.getElementById(('main_supplygas')));
    	myChart.setOption({
                animation: false,
                legend: {
                    orient: 'vertical',
                    left: 15,
                    selectedMode:false,
                    data: ['新奥','华都','华能']
                },
                color:['#2EC7C9', '#B7A3DF','#5AB1F0'],
                series : [
                    {
                        name: '访问来源',
                        type: 'pie',
                        radius : '55%',

                        center: ['50%', '60%'],
                        data:[
                            {value:335, name:'新奥'},
                            {value:310, name:'华都'},
                            {value:234, name:'华能'}
                        ],
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
	           		});

    }
    render(){
    
    	return <div style={{width: 'auto'}}>
    		<div id="main_supplygas" style={{width: 500, height:200}}>

            </div>
    	</div>
    }
 }
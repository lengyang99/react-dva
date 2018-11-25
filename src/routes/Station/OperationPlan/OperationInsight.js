import React, {Component} from 'react';
import {connect} from 'dva';
import echarts from 'echarts';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';

const data = [
    {value: '99', name: '设备完好率', percentage: '99%', color: '#2EC7C9'},
    {value: '100', name: '加臭合格率', percentage: '100%', color: '#B7A3DF'},
    {value: '98', name: '任务完成率', percentage: '98%', color: '#FFB981'},
    {value: '5', name: '隐患', percentage: '5%', color: '#D97A81'},
    {value: '2', name: '故障', percentage: '2%', color: '#8D98B3'}
];

export default class OperationInsight extends React.Component {
    constructor(props) {
        super(props);

    }

    componentDidMount(){
    	this.drawPei()
    }
    componentDidUpdate () {
        this.drawPei();
    }

    drawPei = () => {
        for (let i = 0; i < data.length; i++) {
            let myChart = echarts.init(document.getElementById(('main_operationinsight' + i)));
            myChart.setOption({
                name: "",
                animation: false,
                color: [data[i].color, '#CBCBCB'],
                series: [
                    {
                        type:'pie',
                        radius: ['70%', '90%'],
                        avoidLabelOverlap: false,
                        labelLine: {
                            normal: {
                                show: true
                            }
                        },
                        data:[
                            {
                                value:data[i].value, 
                                name: data[i].name,
                                label: {
                                    normal: {
                                        show: true,
                                        trigger: 'item',
                                        position: 'center',
                                        formatter: '{b}\n{d}%'
                                      
                                    }
                                },
                            },
                            {
                                value: 100 - data[i].value,
                                label: {
                                    normal: {
                                        show: false
                                    }
                                }
                            }
    
                           
                        ]
                    }
                ]   
                    
            });
        };
    }

    dealData = () => {
        let returnData = [];
        let temData = data;
        for (var i = 0; i < temData.length; i++) {
            let peiStyle = {
                float: 'left',
                marginLeft: '30px',
                marginTop: '20px',
                width: '100px',
                height: '100px'
            };
            returnData.push(
                <div key={`card_${i}`} style={{width: 'auto'}}>
                    <div id={'main_operationinsight' + i} style={peiStyle}></div>
                </div>
            )   
        };
        return returnData
    }
    render(){
        let divdata = this.dealData();
    	return (
            <div style={{width: 'auto'}}>
                {divdata}
            </div>
        )
    }
 }
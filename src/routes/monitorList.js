import React, { PureComponent } from 'react';
import {Table} from 'antd';
import styles from './index.less';
import {routerRedux} from 'dva/router';
export default class TableList extends PureComponent{
    constructor(){
        super()

        this.state = {

        }
    }

    componentDidMount(){

    }

    
    // 编辑，查看计划
    operationPlan = (record={}) => {
        // this.props.dispatch({
        //     type: 'device/queryPlanDetaile',
        //     payload: {
        //         planId: record.gid,
        //         function: record.functionKey || record.function,
        //     },
        //     callback: (data) => {
        //         if (data) {
        //             this.props.dispatch(routerRedux.push(`Odor-detail`));
        //         }
        //     },
        // });
        this.props.dispatch(routerRedux.push(`Odor-detail`));
    }
    render(){
        const { handleTableChange, pagination }=this.props;
        const columns = [
            {
              title: '编号',
              dataIndex: 'gid',
            },
            {
              title: '监测点名称',
              dataIndex: 'name',
            },
            {
              title: '值类型',
              dataIndex: 'type',
            },
            {
              title: '数据来源',
              dataIndex: 'source',
            },
            {
                title: '最新读书',
                dataIndex: 'read',
            },
            {
                title: '最新日期',
                dataIndex: 'data',
            },
            {
                title: '所属站点',
                dataIndex: 'station',
            },
            {
                title: '操作',
                dataIndex: 'action',
                render:(text,record)=>(
                    <span>
                    <a onClick={() => { this.operationPlan(record); }}>编辑</a>
                    <span style={{ color: 'e8e8e8' }}> | </span>
                    <a onClick={() => { this.operationPlan(record); }}>删除</a>
                    </span>
                )
            },
        ]
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
              console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            },
        }
        const data=[
            {   
                gid:1,
                name:'永唐秦站高压桥压力',
                type:'数值',
                source:'没来源',
                read:150,
                data: '2017-11-30',
                station:'永唐秦站',
            },
            {   
                gid:2,
                name:'桥压力',
                type:'日期',
                source:'没来源',
                read:150,
                data: '2017-11-30',
                station:'永唐秦站',
            },
            {   
                gid:3,
                name:'永唐',
                type:'选择',
                source:'没来源',
                read:150,
                data: '2017-11-30',
                station:'永唐秦站',
            },
        ]
        return(
        <div>
            <Table
            dataSource={data}
            columns={columns}
            pagination={pagination}
            onChange={handleTableChange}
            rowSelection={rowSelection}
            />
        </div>
        )
    }
}
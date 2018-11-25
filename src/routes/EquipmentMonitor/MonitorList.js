import React, { PureComponent } from 'react';
import {routerRedux} from 'dva/router';
import {connect} from 'dva';
import {Table,Button, Popconfirm} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import SearchPanel from './SearchPanel';
import styles from './index.less';
const pageParams = {
    pageno: 1,
    pagesize: 10,
};//分页参数

@connect(({equipmentMonitor, station}) => ({
  stations: station.stations,
  monitorData: equipmentMonitor.monitorData,
  monitorTotal: equipmentMonitor.monitorTotal,
}))

export default class TableList extends PureComponent{
    constructor(){
        super()

        this.state = {
            ...pageParams,
            searchParams:{},//查询参数
        }
    }

    componentDidMount(){
        const {dispatch} = this.props;
        dispatch({
            type: 'station/getStationData'
        })
        dispatch({
            type: 'equipmentMonitor/getDataSource'
        })
        dispatch({
            type: 'equipmentMonitor/getDataType'
        })

        this.queryOdorList(pageParams)
    }

     // 查询
    queryOdorList = (params = {}) => {
        console.log(params,'传过去的参数');
        this.props.dispatch({
            type: 'equipmentMonitor/getMonitorList',
            payload:params
        })
    };
    // 分页查询
    handleTableChange = (current, pageSize) => {
        const params = {
            pageno: current,
            pagesize: pageSize,
            ...this.state.searchParams,
        };
        this.setState({
            pageno:current,
            pagesize:pageSize,
        });
        this.queryOdorList({...params });
    };
    // 搜索
    handleOnSearch = (params) => {
        this.setState({ searchParams: { ...this.state.searchParams, ...params }, pageno: 1, pagesize: 10 });
        this.queryOdorList({
            ...this.state.searchParams,
            pageno: pageParams.pageno,
            pagesize: pageParams.pagesize,
            ...params,
        });
    };
    // 重置
    handleOnRest = () => {
        this.setState({searchParams: {}});
        this.setState(pageParams);
        this.queryOdorList(pageParams);
    };

    // 编辑，查看计划
    operationPlan = (record={}) => {
        this.props.dispatch({
            type: 'equipmentMonitor/getMonitorDetail',
            payload: {
                detectionId: record.gid,
            },
            callback: (res) => {
                this.props.dispatch(routerRedux.push(`monitorDetail?gid=${record.gid}`));
            }
        });
    }
    newPlan = () => {
        this.props.dispatch(routerRedux.push(`monitorDetail`));
    };

    delPlan = (record) => {
        this.props.dispatch({
            type: 'equipmentMonitor/delMonitorData',
            payload: {
                detectionId: record.gid,
            },
            callback: (res) => {
                this.handleOnSearch({})
            }
        });
    }
    render(){
        const { monitorData, monitorTotal, stations}=this.props;
        const {pageno, pagesize} = this.state;
        console.log(monitorData, 'monitorData');
        const pagination = {
            current: pageno,
            pageSize: pagesize,
            total: monitorTotal,
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (total, range) => {
              return (<div className={styles.pagination}>
                共 {total} 条记录 第{pageno}/{Math.ceil(total / pagesize)}页
              </div>);
            },
            onChange: (current, pageSize) => {
                this.handleTableChange(current, pageSize)
            }
        };
        const columns = [
            {
              title: '编号',
              dataIndex: 'gid',
            },
            {
              title: '监测点名称',
              dataIndex: 'jcdnamec',
            },
            {
              title: '值类型',
              dataIndex: 'valueType',
            },
            {
              title: '数据来源',
              dataIndex: 'dataSource',
            },
            {
                title: '最新读数',
                dataIndex: 'lastWarnValue',
            },
            {
                title: '最新日期',
                dataIndex: 'lastWarnTime',
            },
            {
                title: '设备名称',
                dataIndex: 'equipmentName',
            },
            {
                title: '所属站点',
                dataIndex: 'stationId',
                render: (text) => {
                    const station = stations && stations.filter(item =>
                        Number(item.gid) === Number(text)
                    )
                    const stationName = station.length > 0 ? station[0].name : ''
                    return <span>{stationName}</span>
                }
            },
            {
                title: '操作',
                dataIndex: 'action',
                render:(text,record)=>(
                    <span>
                        <a onClick={() => { this.operationPlan(record); }}>编辑</a>
                        <span style={{ color: 'e8e8e8' }}> | </span>
                        <Popconfirm title='确认删除该记录？' onConfirm={() => { this.delPlan(record)}} okText="确定" cancelText="取消">
                            <a>删除</a>
                        </Popconfirm>
                    </span>
                )
            },
        ]
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
              console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            },
        }

        return(
            <PageHeaderLayout>
                <SearchPanel
                    handleOnSearch={this.handleOnSearch}
                    handleOnRest={this.handleOnRest}
                />
                <div className={styles.button2}>
                    <Button type='primary' onClick={this.newPlan}> + 新建</Button>
                </div>
                <Table
                    dataSource={monitorData}
                    columns={columns}
                    rowKey={(record) => record.gid}
                    pagination={pagination}
                    rowSelection={rowSelection}
                />
            </PageHeaderLayout>
        )
    }
}
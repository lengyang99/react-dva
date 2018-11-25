import React, {PureComponent} from 'react';
import {Table, Row, Col, Input} from 'antd';
import moment from 'moment';
import styles from './index.less';

const FormatStr = 'YYYY-MM-DD HH:mm ';
export default class History extends PureComponent {
  // 分页改变时回调
  handleTableChange = (pagination) => {
    const params = {
      pageno: pagination.current,
      pagesize: pagination.pageSize,
    };
    this.queryTasks({planId: this.props.planId, ...params });
  };
  queryTasks = (params) => {
    this.props.dispatch({
      type: 'device/getTaskListById',
      payload: params,
    });
  }
  render() {
    const {taskList, activitiCode, taskPaginations: paginations} = this.props;
    const {planId, planName, functionName, stationName} = taskList && taskList.length !== 0 ? taskList[0] : {};
    const workColums = [
      {
        title: '工单编号',
        dataIndex: 'workOrderCode',
        key: 'workOrderCode',
        width: '12%',
      },
      // {
      //   title: '设备名称',
      //   dataIndex: 'eqName',
      //   key: 'eqName',
      //   width: '15%',
      //   render: (text, record) => {
      //     const eqNames = [];
      //     (record.eqList || []).forEach(item => {
      //       eqNames.push(item.eqName);
      //     });
      //     const eqName = eqNames.length !== 0 ? eqNames[0] : '';
      //     return <Tooltip title={eqName}><span>{eqName}</span></Tooltip>;
      //   },
      // },
      // {
      //   title: '设备位置',
      //   dataIndex: 'posDesc',
      //   key: 'posDesc',
      //   width: '20%',
      //   render: (text, record) => {
      //     const posDescs = [];
      //     (record.eqList || []).forEach(item => {
      //       posDescs.push(item.posDesc);
      //     });
      //     const posDesc = posDescs.length !== 0 ? posDescs[0] : '';
      //     return <Tooltip title={posDesc}><span>{posDesc}</span></Tooltip>;
      //   },
      // },
      {
        title: '任务生成时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: '13%',
        render: (text) => (text ? moment(text).format(FormatStr) : text),
      },
      {
        title: '要求完成时间',
        dataIndex: 'endTime',
        key: 'endTime',
        width: '13%',
        render: (text) => (text ? moment(text).format(FormatStr) : text),
      },
      {
        title: '工单状态',
        dataIndex: 'stateName',
        key: 'stateName',
        width: '12%',
      },
    ];
    const taskColumns = [
      {
        title: '任务编号',
        dataIndex: 'gid',
        key: 'gid',
        render: (text, record) => {
          return (<span>
            <div style={{color: record.taskType === 2 ? 'red' : '#379FFF'}}>
              {record.taskType === 2 ? '临时' : '常规'}</div>
            <div>{`${record.gid}`}</div>
          </span>);
        },
      },
      // {
      //   title: '设备名称',
      //   dataIndex: 'eqName',
      //   key: 'eqName',
      //   render: (text, record) => {
      //     const eqNames = [];
      //     (record.eqList || []).forEach(item => {
      //       eqNames.push(item.eqName);
      //     });
      //     const eqName = eqNames.length !== 0 ? eqNames[0] : '';
      //     return <Tooltip title={eqName}><span>{eqName}</span></Tooltip>;
      //   },
      // },
      // {
      //   title: '设备位置',
      //   dataIndex: 'posDesc',
      //   key: 'posDesc',
      //   render: (text, record) => {
      //     const posDescs = [];
      //     (record.eqList || []).forEach(item => {
      //       posDescs.push(item.posDesc);
      //     });
      //     const posDesc = posDescs.length !== 0 ? posDescs[0] : '';
      //     return <Tooltip title={posDesc}><span>{posDesc}</span></Tooltip>;
      //   },
      // },
      {
        title: '任务生成时间',
        dataIndex: 'createTime',
        key: 'createTime',
        render: (text) => (text ? moment(text).format(FormatStr) : text),
      },
      {
        title: '要求完成时间',
        dataIndex: 'endTime',
        key: 'endTime',
        render: (text) => (text ? moment(text).format(FormatStr) : text),
      },
      {
        title: '完成时间',
        dataIndex: 'feedbackTime',
        key: 'feedbackTime',
        render: (text, record) => {
          if (record.isFeedbackRequired === 1) {
            return <span>{text ? moment(text).format(FormatStr) : text}</span>;
          } else {
            return <span>{record.arriveTime ? moment(record.arriveTime).format(FormatStr) : record.arriveTime}</span>;
          }
        },
      },
      {
        title: '处理时长',
        dataIndex: 'timecost',
        key: 'timecost',
      },
      {
        title: '完成状态',
        dataIndex: 'status',
        key: 'status',
        render: (text) => {
          switch (text) {
            case 0: return <span style={{textAlign: 'center', 'color': 'red', cursor: 'pointer'}}>未完成</span>;
            case 1: return <span style={{textAlign: 'center', 'color': '#379FFF', cursor: 'pointer'}}>已完成</span>;
            case 2: return <span style={{textAlign: 'center', 'color': 'red', cursor: 'pointer'}}>已超期</span>;
            default: return <span style={{textAlign: 'center', 'color': '#379FFF', cursor: 'pointer'}}>超期已完成</span>;
          }
        },
      },
      {
        title: '处理人',
        dataIndex: 'assigneeNames',
        key: 'assigneeNames',
      },
    ];
    const columns = activitiCode ? workColums : taskColumns;
    const pagination = {
      current: paginations.current,
      pageSize: paginations.pageSize,
      total: paginations.total,
      pageSizeOptions: ['10', '20', '30', '40'],
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: (totals) => {
        const {current, pageSize} = paginations;
        return (<div className={styles.pagination}>
                 共 {totals} 条记录 第{current}/{Math.ceil(totals / pageSize)}页
        </div>);
      },
    };
    return (
      <div>
        {/* <span style={{fontSize: 16}}>基本信息</span>
        <Row type="flex" justify="space-between">
          <Col span={3}><label>计划性维护计划</label><Input style={{marginBottom: 10, marginTop: 10}} disabled value={planId} /></Col>
          <Col span={4}><Input style={{marginBottom: 10, marginTop: 30}} disabled value={planName} /></Col>
          <Col span={3}><label>类型</label><Input style={{marginBottom: 10, marginTop: 10}} disabled defaultValue={functionName} /></Col>
          <Col span={3}><label>所属站点</label><Input style={{marginBottom: 10, marginTop: 10}} disabled defaultValue={stationName} /></Col>
          <Col span={2}><label>触发次数</label><Input style={{marginBottom: 10, marginTop: 10}} disabled defaultValue={taskList.length} /></Col>
          <Col span={4}><label>公司</label><Input style={{marginBottom: 10, marginTop: 10}} disabled defaultValue={this.props.user.company} /></Col>
        </Row> */}
        <Table
          columns={columns}
          dataSource={taskList}
          rowKey={record => record.taskId}
          pagination={pagination}
          onChange={this.handleTableChange}
          // onRow={(record) => ({
          //   onDoubleClick: () => {
          //     if (record.processInstanceId || !record.activitiCode) {
          //       lookHandler({...record, action: 'edit'});
          //     }
          //   },
          // })}
        />
      </div>
    );
  }
}

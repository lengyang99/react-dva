import React, { PureComponent } from 'react';
import { Table } from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import propTypes from 'prop-types';

@connect(
  state => ({
    eqCustom: state.ledger.eqCustom,
  })
)
export default class MaintainList extends PureComponent {
  static propTypes = {
    type: propTypes.string.isRequired,
    eqCustom: propTypes.object.isRequired,
    pageNumber: propTypes.number.isRequired,
    setPageNumber: propTypes.func.isRequired,
  };
  handleChange = current => {
    const options = {
      type: this.props.type,
      equipmentId: this.props.eqCustom.gid,
      pageno: current,
      pagesize: 10,
    };
    this.props.setPageNumber(this.props.type, current);
    this.props.dispatch({
      type: 'ledger/fetchLedgerMaintain',
      payload: this.props.type === 'task' ? Object.assign(options, { planId: this.props.planId }) : options,
    });
  };
  handleClick = record => {
    if (this.props.type === 'plan') {
      this.props.setPlanId(record.planId);
      this.props.setPageNumber('task', 1);
      this.props.dispatch({
        type: 'ledger/fetchLedgerMaintain',
        payload: {
          type: 'task',
          equipmentId: this.props.eqCustom.gid,
          planId: record.planId,
          pageno: 1,
          pagesize: 10,
        },
      });
    }
  };
  handleClickOperation = (type, record) => {
    const {functionName, workStandardId, functionKey, taskType, planId} = record;
    if (type === 'plan') {
      this.props.dispatch({
        type: 'device/queryPlanDetaile',
        payload: {
          planId,
        },
        callback: (data) => {
          if (data) {
            this.props.dispatch(routerRedux.push(`plan-read?taskType=${taskType}&planId=${planId}&func=${functionName}&funcKey=${functionKey}&workId=${workStandardId}&action=read`));
          }
        },
      });
      this.props.dispatch({
        type: 'device/getTaskListById',
        payload: {planId: record.gid, pageno: 1, pagesize: 10},
      });
    }
  };
  status = (text) => {
    let status = '';
    switch (text) {
      case 0:
        status = '未完成';
        break;
      case 1:
        status = '已完成';
        break;
      case 2:
        status = '已超期';
        break;
      case 3:
        status = '超期完成';
        break;
      default:
        status = '--';
        break;
    }
    return status;
  };
  render() {
    const planColumns = [
      {
        title: '序号',
        dataIndex: 'index',
        width: 50,
      },
      {
        title: '编号',
        dataIndex: 'planId',
      },
      {
        title: '描述',
        dataIndex: 'name',
      },
      {
        title: '类型',
        dataIndex: 'taskType',
        render: (text) => (<span>{text === 1 ? '常规' : '临时'}</span>),
      },
      {
        title: '周期',
        dataIndex: 'cycleName',
      },
      {
        title: '上次完成日期',
        dataIndex: 'lastTaskTime',
      },
      {
        title: '下次执行日期',
        dataIndex: 'nextTaskTime',
      },
      {
        title: '负责人',
        dataIndex: 'assigneeName',
      },
      {
        title: '操作',
        render: record => (<a onClick={this.handleClickOperation.bind('', 'plan', record)}>查看详情</a>),
      },
    ];
    const recordColumns = [
      {
        title: '序号',
        dataIndex: 'index',
      },
      {
        title: '编号',
        dataIndex: 'taskId',
      },
      {
        title: '描述',
        dataIndex: 'taskName',
      },
      {
        title: '类型',
        dataIndex: 'taskType',
        render: (text) => (<span>{text === 1 ? '常规' : '临时'}</span>),
      },
      {
        title: '周期',
        dataIndex: 'cycleName',
      },
      {
        title: '下发日期',
        dataIndex: 'createTime',
      },
      {
        title: '责任人',
        dataIndex: 'assigneeName',
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (text) => (<span>{this.status(text)}</span>),
      },
      {
        title: '所属站点',
        dataIndex: 'stationName',
      },
      {
        title: '所属组织',
        dataIndex: 'orgName',
      },
    ];
    const columns = this.props.type === 'plan' ? planColumns : recordColumns;
    const { data, total } = this.props.data;
    return (
      <div>
        <p className="title">{this.props.title}</p>
        <Table
          pagination={{
            total,
            current: this.props.pageNumber,
            pageSize: 10,
            onChange: this.handleChange,
            showTotal: () => (<span>总计<span style={{ color: '#40a9ff' }}> {total} </span>条</span>),
          }}
          onRow={record => ({
            onClick: this.handleClick.bind('', record),
          })}
          dataSource={Array.isArray(data) ? data.map((item, index) => Object.assign(item, {index: (index + 1)})) : []}
          rowKey={this.props.rowKey}
          columns={columns}
        />
      </div>
    );
  }
}

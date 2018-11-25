import React, {PureComponent} from 'react';
import {Link} from 'dva/router';
import moment from 'moment';
import {Table, Dropdown, Menu, Icon, message, Popconfirm} from 'antd';
import {Modal, Button} from 'antd';

const confirm = Modal.confirm;


class PlanTable extends PureComponent {
  state = {};

  componentWillReceiveProps(nextProps) {

  }

  // handleTableChange = (pagination, filters, sorter) => {
  //   this.props.onChange(pagination, filters, sorter);
  // };

  /**
   * st===1 开启状态停用操作
   * */
  tranceState = (st, planId) => {
    let act = st === 1 ? 'stop' : 'start';
    let md = st === 1 ? '停止' : '启用';
    const {dispatch, refreshData} = this.props;
    confirm({
      title: `确定要${md}计划？`,
      onOk() {
        dispatch({
          type: 'station/tranceState',
          payload: planId,
          act: act,
          callback: ({success, msg}) => {
            if (success === true) {
              message.info(msg);
              refreshData && refreshData();
            } else {
              message.error(msg);
            }
          }
        })
      },
      onCancel() {
      },
    });
  };

  render() {
    const {data: {total, list}, loading, onTableChange,leakTypes} = this.props;
    const types = {};
    leakTypes.forEach(ii=>{
      types[ii.name] = ii.alias;
    });
    const columns = [
      {
        title: '计划名称',
        dataIndex: 'name',
      },
      {
        title: '责任人',
        dataIndex: 'assigneeName',
        render:(text,record)=>{
          let id = record.planId;
          let img = ['橙', '黄', '蓝', '绿', '紫'][id ? id % 5 : Math.floor(Math.random() * 5)];
          return <span style={{fontSize: 14,display:'inline-block'}}>
            <img style={{height:14,position:'relative',top:-2}} src={`/images/${img}.png`}/> {text}</span>
        }
      },
      {
        title: '检漏方式',
        dataIndex: 'functionKey',
        render:(text)=>{
          return types[text] || text;
        }
      },
      {
        title: '生效时间',
        dataIndex: 'startTime',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
      },
      {
        title: '操作',
        dataIndex: 'createTimes',
        render: (val, record) => {
          return (
            <Link to={`leak-task?planId=${record.planId}`}>查看</Link>
          )
        },
      },
    ];
    const paginationProps = {
      total: total,
      pageSizeOptions: ['10', '20', '30'],
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: function (total, [start, end]) {
        return <div style={{position: 'absolute', left: 10}}>
          共 {total} 条记录 当前第{start} 到 {end} 条
        </div>;
      }
    };
    return (
      <div>
        <Table
          loading={loading}
          rowKey="planId"
          dataSource={list}
          columns={columns}
          pagination={paginationProps}
          onChange={onTableChange}
        />
      </div>
    );
  }
}

export default PlanTable;

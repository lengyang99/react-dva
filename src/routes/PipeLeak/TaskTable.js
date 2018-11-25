import React, {PureComponent} from 'react';
import {Link} from 'dva/router';
import moment from 'moment';
import {Table, Dropdown, Menu, Icon, message, Popconfirm} from 'antd';
import {Modal, Button} from 'antd';

const confirm = Modal.confirm;

import styles from './index.less';

class PlanTable extends PureComponent {
  state = {};

  componentWillReceiveProps(nextProps) {

  }

  // handleTableChange = (pagination, filters, sorter) => {
  //   this.props.onChange(pagination, filters, sorter);
  // };



  render() {
    const {data: {total, list,current}, loading, onTableChange,leakTypes} = this.props;
    const types = {};
    leakTypes.forEach(ii=>{
      types[ii.name] = ii.alias;
    });
    const columns = [
      {
        title: '任务名称',
        dataIndex: 'name',
        width: '20%',
      },
      {
        title: '责任人',
        dataIndex: 'assigneeNames',
        width: '10%',
      },
      {
        title: '检漏方式',
        dataIndex: 'functionName',
        width: '10%',
        render:(text)=>{
          return types[text] || text;
        }
      },
      {
        title: '开始时间',
        dataIndex: 'startTime',
        width: '15%',
      },
      {
        title: '结束时间',
        dataIndex: 'endTime',
        width: '15%',
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: '10%',
        render:(text)=>{
          switch (text) {
            case 0:
              return (
                <span style={{'color': 'red'}}>未完成</span>
              );
            case 1:
              return (
                <span style={{'color': '#379FFF'}}>已完成</span>
              );
            default : 
              return (
                <span style={{'color': 'red'}}>已超期</span>
              );
          }
      },
    },
      {
        title: '操作',
        dataIndex:'cz',
        width: '10%',
        render: (val, record) => {
          return (
            <a onClick={()=>{
              this.props.showTaskInfo(record);
            }}>查看</a>
          )
        },
      },
    ];
    const paginationProps = {
      current:current,
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
          rowKey={(record) => record.taskId}
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

import React, { PureComponent } from 'react';
import {Table} from 'antd';
import {routerRedux} from 'dva/router';

export default class TableList extends PureComponent {
    // 编辑，查看计划
    operationPlan = ({gid, operationType}) => {
      this.props.dispatch(routerRedux.push(`Odor-detail?gid=${gid}&operationType=${operationType}`));
    }
    render() {
      const { handleTableChange, pagination, dataList} = this.props;
      // let upImg = <img style={{float: 'right', marginRight: '60%', 'marginTop': '10px'}} src="./images/homePageImages/上升.png" />;
      const columns = [
        {
          title: '日期',
          dataIndex: 'createdOn',
        },
        {
          title: '操作人',
          dataIndex: 'userName',
        },
        {
          title: '加臭机',
          dataIndex: 'machineName',
        },
        {
          title: '操作方式',
          dataIndex: 'operationType',
          render: (text) => (
            <span>{text}</span>
          ),
        },
        {
          title: '操作',
          dataIndex: 'action',
          render: (text, record) => (
            <span>
              <a onClick={() => { this.operationPlan(record); }}>详情</a>
            </span>
          ),
        },
      ];
      return (
        <div>
          <Table
            dataSource={dataList || []}
            columns={columns}
            pagination={pagination}
            onChange={handleTableChange}
            rowKey={record => record.gid}
          />
        </div>
      );
    }
}

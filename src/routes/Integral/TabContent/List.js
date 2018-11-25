import React, { PureComponent } from 'react';
import { Table, Divider, Popconfirm } from 'antd';
import { connect } from 'dva';

@connect(state => ({
  activeKey: state.integral.activeKey,
  integralList: state.integral.integralList,
}))
export default class List extends PureComponent {
  static propTypes = {

  };
  handleClick = (type, detail) => {
    switch (type) {
      case 'edit':
        this.props.dispatch({
          type: 'integral/editDetail',
          payload: {
            detail,
            isModalActive: true,
          },
        });
        break;
      case 'delete':
        this.props.dispatch({
          type: 'integral/deleteIntegral',
          payload: detail.gid,
          callback: () => {
            this.props.dispatch({
              type: 'integral/fetchIntegralList',
              payload: this.props.activeKey,
            });
          },
        });
        break;
      default:
        return 0;
    }
  };
  render() {
    const { integralList, activeKey } = this.props;
    const columns = [
      {
        title: '企业名称',
        dataIndex: 'name',
      },
      {
        title: '积分规则别名',
        dataIndex: 'itemAlias',
      },
      {
        title: '分值',
        dataIndex: 'itemScore',
      },
      {
        title: '单位',
        dataIndex: 'itemUnit',
      },
      {
        title: '积分描述',
        dataIndex: 'itemDes',
      },
      {
        title: '最后一次编辑',
        dataIndex: 'gmtModifiedby',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        render: (text, record) => (
          <span>
            <a onClick={this.handleClick.bind(this, 'edit', record)}>编辑</a>
            {activeKey !== 'config' ? (
              <span>
                <Divider type="vertical" />
                <Popconfirm title="确认删除吗" onConfirm={this.handleClick.bind(this, 'delete', record)}>
                  <a>删除</a>
                </Popconfirm>
              </span>
            ) : null }
          </span>
        ),
      },
    ];

    return <Table rowKey="gid" dataSource={integralList} columns={columns} />;
  }
}

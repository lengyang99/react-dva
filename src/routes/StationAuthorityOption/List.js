import React, { PureComponent } from 'react';
import { Table, Popconfirm } from 'antd';
import { connect } from 'dva';
import classnames from 'classnames';

@connect(state => ({
  authList: state.stationAuthorityOption.authList,
  searchOption: state.stationAuthorityOption.searchOption,
}))
class List extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      pageSize: 10,
      pageNum: 1,
    };
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'stationAuthorityOption/getAuthList',
      payload: {
        pageSize: 10,
        pageNum: 1,
      },
    });
  }
  handleClick = (type, record) => {
    switch (type) {
      case 'edit':
        this.props.dispatch({
          type: 'stationAuthorityOption/showModel',
          payload: true,
        });
        this.props.dispatch({
          type: 'stationAuthorityOption/showConfirmLoading',
          payload: false,
        });
        break;
      case 'delete':
        this.props.dispatch({
          type: 'stationAuthorityOption/deleteAuthList',
          payload: record.userid,
          callback: () => {
            this.props.dispatch({
              type: 'stationAuthorityOption/getAuthList',
              payload: {
                userName: this.props.searchOption,
                pageSize: this.state.pageSize,
                pageNum: this.state.pageNum,
              },
            });
          },
        });
        break;
      default:
        break;
    }
  };
  handlePageChange = (page, pageSizes) => {
    this.setState({
      pageNum: page,
      pageSize: pageSizes,
    });
    this.props.dispatch({
      type: 'stationAuthorityOption/getAuthList',
      payload: {
        userName: this.props.searchOption,
        pageSize: pageSizes,
        pageNum: page,
      },
    });
  };
  render() {
    const columns = [
      {
        title: '部门名称',
        dataIndex: 'groupName',
        key: 'groupName',
      },
      {
        title: '用户名',
        dataIndex: 'truename',
        key: 'truename',
      },
      {
        title: '站点权限',
        dataIndex: 'locName',
        key: 'locName',
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => (
          <span>
            <a onClick={this.handleClick.bind(this, 'edit', record)}>编辑</a>
            <span className="divider" />
            <Popconfirm
              title="确定清除权限?"
              onConfirm={this.handleClick.bind(this, 'delete', record)}
              okText="是"
              cancelText="否"
            >
              <a>清除全部权限</a>
            </Popconfirm>
          </span>
        ),
      },
    ];
    const { className, authList } = this.props;
    return (
      <div className={classnames(className)}>
        <Table
          rowKey="userid"
          dataSource={authList.list}
          columns={columns}
          pagination={{
            current: authList.pageNum,
            pageSize: authList.pageSize,
            total: authList.total,
            onChange: this.handlePageChange,
            showSizeChanger: true,
            onShowSizeChange: this.handlePageChange,
            showTotal: () => (<span>总计<span style={{ color: '#40a9ff' }}> {authList.total} </span>条</span>),
          }}
        />
      </div>
    );
  }
}

export default List;

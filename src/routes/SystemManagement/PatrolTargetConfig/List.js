import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Table, Button, Icon, Popconfirm, Divider } from 'antd';
import { routerRedux } from 'dva/router';
import styles from './List.less';

@connect(state => ({
  dataSource: state.PatrolTargetConfig.confingList,
  ecode: state.login.user.ecode,
}))
export default class List extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'PatrolTargetConfig/fetchListData',
    });
    const { ecode } = this.props;
    this.props.dispatch({ // 获取图层和筛选条件
      type: 'PatrolTargetConfig/fetchLayerNameData',
      payload: ecode,
    });
  }
  handleClick = (type, record) => {
    let path = {
      pathname: '/system-management/patrol-target-config-detial',
      historyPageName: '/system-management/patrol-target-config',
    };
    switch (type) {
      case 'add':
        path.detailData = {};
        this.props.dispatch(routerRedux.push(path));
        break;
      case 'edit':
        path.detailData = record;
        this.props.dispatch(routerRedux.push(path));
        break;
      case 'delete':
        this.props.dispatch({
          type: 'PatrolTargetConfig/deletePatrolTargetConfig',
          payload: {
            gid: record.gid,
          },
          callback: () => {
            this.props.dispatch({
              type: 'PatrolTargetConfig/fetchListData',
            });
          },
        });
        break;
      default:
        break;
    }
  };
  render() {
    const { dataSource } = this.props;
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '表单id',
        dataIndex: 'formid',
        key: 'formid',
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: '是否反馈',
        dataIndex: 'isfeedback',
        key: 'isfeedback',
        render: (text) => {
          return <span>{text ? '是' : '否'}</span>;
        },
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => (
          <span>
            <a onClick={this.handleClick.bind(this, 'edit', record)}>编辑</a>
            <Divider type="vertical" />
            <Popconfirm
              title="确定删除?一旦删除，不可撤销！"
              onConfirm={this.handleClick.bind(this, 'delete', record)}
              okText="是"
              cancelText="否"
            >
              <a>删除</a>
            </Popconfirm>
          </span>
        ),
      },
    ];
    return (
      <div className={styles.list}>
        <Row>
          <Button
            className={styles.btn}
            type="primary"
            onClick={this.handleClick.bind(this, 'add')}
          ><Icon type="plus" />增加</Button>
        </Row>
        <Row>
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey={(record) => record.gid}
          />
        </Row>
      </div>
    );
  }
}

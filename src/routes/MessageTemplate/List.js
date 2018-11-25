import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table } from 'antd';

@connect(state => ({
  tempList: state.messageTemplate.tempList,
  process: state.messageTemplate.process,
}))
export default class List extends PureComponent {
  static propTypes = {

  };
  componentDidMount() {
    this.props.dispatch({
      type: 'messageTemplate/fetchTempList',
      payload: this.props.process,
    });
  }
  handleEdit = record => {
    this.props.dispatch({ type: 'messageTemplate/toggleModal', payload: true });
    this.props.dispatch({
      type: 'messageTemplate/setFormDetail',
      payload: record,
    });
  };
  render() {
    const columns = [
      {
        title: '模版类型',
        dataIndex: 'process',
      },
      {
        title: '模版状态',
        dataIndex: 'state',
      },
      {
        title: '模版',
        dataIndex: 'message',
      },
      {
        title: '模版参数',
        dataIndex: 'msgParamrule',
      },
      {
        title: '模版描述',
        dataIndex: 'description',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        render: (text, record) => (
          <span>
            <a onClick={this.handleEdit.bind(this, record)}>编辑</a>
          </span>
        ),
      },
    ];
    const { tempList } = this.props;
    return (
      <Table rowKey="gid" columns={columns} dataSource={tempList} />
    );
  }
}

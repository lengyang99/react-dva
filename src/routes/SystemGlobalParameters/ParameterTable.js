import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Divider, Popconfirm, message } from 'antd';

@connect(state => ({
  parameterList: state.globalParameter.parameterList,
}))
class ParameterTable extends PureComponent {
  constructor(props) {
    super(props);
    // this.state = {
    //   current: 1,
    //   pageSize: 10,
    // }
    this.columns = [{
      title: '模块名',
      dataIndex: 'module',
      key: 'module',
      width: 100,
    }, {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '规则值',
      dataIndex: 'text',
      key: 'text',
      width: 200,
    }, {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 300,
    }, {
      title: '最后一次编辑',
      dataIndex: 'gmtModifiedby',
      key: 'gmtModifiedby',
    }, {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <span>
          <a onClick={this.handleConfirm.bind('', record, 'edit')}>修改</a>
          <Divider type="vertical" />
          <Popconfirm title="确定要删除吗?" okText="确定" cancelText="取消" onConfirm={this.handleConfirm.bind('', record, 'singleDelete')}>
            <a>删除</a>
          </Popconfirm>
        </span>
      ),
    }];
  }
  /*
   @desc 批量选择(单选)监听
   @param record: 被操作的行数据, selected: 选中状态, selectedRows: 被选中的数据集合
   */
  handleSelectRows = (record, selected, selectedRows) => {
    this.props.dispatch({
      type: 'globalParameter/getSelectedRows',
      payload: selectedRows,
    });
  };
  /*
   @desc 全选监听
   @param selected: 选中状态, selectedRows: 被选中的数据集合
   */
  handleSelectAll = (selected, selectedRows, changeRows) => {
    this.props.dispatch({
      type: 'globalParameter/getSelectedRows',
      payload: selectedRows,
    });
  };
  /*
   @desc 修改/删除行
   @param record: 单行的记录, type: 事件类型
   */
  handleConfirm = (record, type) => {
    if (type === 'singleDelete') {
      console.log('删除单条数据', record);
      this.props.dispatch({
        type: 'globalParameter/deleteParameter',
        payload: record.gid,
        callback: (res) => {
          message.success(res.msg);
          this.queryParameterList();
        },
      });
      return;
    }
    this.props.dispatch({
      type: 'globalParameter/makeModalShow',
      payload: {
        modalType: type,
        modalForm: record,
      },
    });
  };
  /*
   @desc 每页显示条数
   @param current: 当前页, size: 每页显示条数
   */
  // pageSizeChange= (current, size) => {
  //   console.log('每页条数:', size);
  //   this.setState({
  //     pageSize: size,
  //   });
  // };
  // handleShowTotal = (total, range) => {
  //   // return `共${total}条记录 第${range[0]}/${range[1]}页`;
  //   return `共${total}条记录 第${this.state.current}页`;
  // };
  // handleCurrentPageChange = (page, pageSize) => {
  //   console.log(page, pageSize);
  // };
  queryParameterList = () => {
    this.props.dispatch({
      type: 'globalParameter/queryParameterList',
      payload: {
        module: '',
        name: '',
      },
    });
  };
  render() {
    const { parameterList } = this.props;
    return (
      <Table
        // pagination={{
        //   showTotal: this.handleShowTotal,
        //   total: parameterList.length,
        //   current: this.state.current,
        //   // onChange: this.handleCurrentPageChange,
        //   pageSize: this.state.pageSize,
        //   showSizeChanger: true,
        //   pageSizeOptions: ['10', '20', '30', '40'],
        //   onShowSizeChange: this.pageSizeChange,
        //   showQuickJumper: true,
        // }}
        // rowSelection={{
        //   onSelect: this.handleSelectRows,
        //   onSelectAll: this.handleSelectAll,
        // }}
        dataSource={parameterList}
        columns={this.columns}
      />
    );
  }
}

export default ParameterTable;

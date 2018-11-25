import React, { PureComponent } from 'react';
import { Table, Popconfirm } from 'antd';
import propTypes from 'prop-types';
import { connect } from 'dva';

@connect(
  state => ({
    funs: state.login.funs,
  })
)
export default class List extends PureComponent {
  static propTypes = {
    dataSource: propTypes.array.isRequired,
    deleteItem: propTypes.func.isRequired,
    clickEdit: propTypes.func.isRequired,
  };
  handleEdit = (record) => {
    this.props.toggleModal(true);
    this.props.setModalOption({
      id: record.id,
      orderBy: record.orderBy,
      fieldName: record.fieldName,
      enumType: record.enumType,
      fieldValue: record.fieldValue === null ? undefined : record.fieldValue,
      measureunit: record.measureunit,
    });
    if (record.enumType === '下拉框') {
      this.props.clickEdit('下拉');
      this.props.dispatch({
        type: 'ledger/fetchOptions',
        payload: record.classSpecGid,
      });
    } else {
      this.props.clickEdit('非下拉');
    }
  };
  deleteItem = (record) => {
    this.props.deleteItem(record);
  };
  render() {
    const { funs } = this.props;
    let ledger_edit = true; // 设备台账编辑
    let ledger_delete = true; // 设备台账删除
    for ( let i = 0; i < funs.length; i++ ){
      let json = funs[i];
      if (json.code=='ledger_edit') {
        ledger_edit = false;
      }
      if (json.code=='ledger_delete') {
        ledger_delete = false;
      }
    }
    const columns = [
      {
        title: '序号',
        dataIndex: 'orderBy',
      },
      {
        title: '属性名称',
        dataIndex: 'fieldName',
      },
      {
        title: '属性值',
        dataIndex: 'fieldValue',
      },
      {
        title: '单位',
        dataIndex: 'measureunit',
      },
      {
        title: '类型',
        dataIndex: 'enumType',
      },
      {
        title: '必填',
        dataIndex: 'isMust',
        render: (text, record) => {
          return record.isMust ? '是' : '否';
        },
      },
      {
        title: '操作',
        render: (text, record) => (
          <span>
            <Popconfirm
              title="确定删除?一旦删除，不可撤销！"
              onConfirm={this.deleteItem.bind(this, record)}
              okText="是"
              cancelText="否"
            >
              <a disabled={ledger_delete}>删除</a>
            </Popconfirm>
            <span className="divider" />
            <a disabled={ledger_edit} onClick={this.handleEdit.bind('', record)}>修改</a>
          </span>
        ),
      },
    ];
    return (
      <Table rowKey="id" dataSource={this.props.dataSource} columns={columns} pagination={false} />
    );
  }
}

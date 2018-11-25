import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table } from 'antd';
import {routerRedux} from 'dva/router';

@connect(state => ({
  funs: state.login.funs,
  ledgeData: state.ichAccount.ledgeData,
  totalNumbers: state.ichAccount.totalNumbers,
  searchOptions: state.ichAccount.searchOptions,
  loading: state.ichAccount.loading,
  filterOption: state.ichAccount.filterOption,
  typeList: state.ichAccount.typeList,
  gasList: state.ichAccount.gasList,
}))
export default class List extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'ichAccount/fetchLedgerData',
      payload: this.props.searchOptions,
    });
  }
  clickEdit = (record) => {
    let path = {
      pathname: '/ichmanager/ichAccountDetail',
      detailData: record,
      historyPageName: '/ichmanager/ichAccount',
    };
    this.props.dispatch(routerRedux.push(path));
  };
  handleConnect = (record) => {
    this.props.dispatch({
      type: 'ichAccount/fetchRegulatorList',
      payload: {
        pageOption: this.props.filterOption,
      },
    });
    this.props.dispatch({
      type: 'ichAccount/setSelectedIchAccount',
      payload: record,
    });
  };
  handleChangeTable = ({ current, pageSize }, filters, sorter) => {
    console.log(filters);
    if (filters.label) {
      this.props.dispatch({
        type: 'ichAccount/fetchLedgerData',
        payload: {
          ...this.props.searchOptions,
          label: filters.label.join(','),
        },
      });
    }
  };
  render() {
    const { ledgeData, totalNumbers, searchOptions, dispatch, loading, typeList, gasList, funs } = this.props;
    let meter_edit = true; // 编辑权限
    for (let i = 0; i < funs.length; i++) {
      let json = funs[i];
      if (json.code === 'gsh_mount_regulator') {
        meter_edit = false;
      }
    }
    const columns = [
      {
        title: '系统用户名称',
        dataIndex: 'customer_desc',
        key: 'customer_desc',
        width: 200,
      },
      {
        title: '用户别名',
        dataIndex: 'alias',
        key: 'alias',
        width: 200,
      },
      {
        title: 'BP',
        dataIndex: 'customer_num',
        key: 'customer_num',
        width: 200,
      },
      {
        title: '合同账户',
        dataIndex: 'contract_account',
        key: 'contract_account',
        width: 200,
      },
      {
        title: '合同帐户描述',
        dataIndex: 'contract_account_desc',
        key: 'contract_account_desc',
        width: 200,
      },
      {
        title: '联系人',
        dataIndex: 'contactPeople',
        key: 'contactPeople',
        width: 100,
      },
      {
        title: '联系电话',
        dataIndex: 'contactPhone',
        key: 'contactPhone',
        width: 200,
      },
      {
        title: '系统联系电话',
        dataIndex: 'contact_num',
        key: 'contact_num',
        width: 200,
      },
      {
        title: '是否五小',
        dataIndex: 'label',
        key: 'label',
        filters: [{value: 'Y', text: '是'}, {value: 'N', text: '否'}],
        width: 150,
        render: (text) => {
          return <span>{text === 'Y' ? '是' : '否'}</span>;
        },
      },
      {
        title: '开口气量',
        dataIndex: 'ykkqty',
        key: 'ykkqty',
        width: 150,
      },
      {
        title: '用气性质',
        dataIndex: 'gas_properties',
        key: 'gas_properties',
        width: 150,
        render: (value) => {
          const item = gasList.find((ele) => ele.logmark === value);
          return <span>{item ? item.alias : ''}</span>;
        },
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width: 200,
        render: (text, record) => (
          <span>
            <a onClick={this.clickEdit.bind(this, record)}>详情</a>
            {meter_edit ? null : <span className="divider" />}
            {meter_edit ? null : <a onClick={this.handleConnect.bind(this, record)}>关联调压器</a>}
          </span>
        ),
      },
    ];
    // 表格分页
    const pagination = {
      total: totalNumbers,
      current: searchOptions.pageno,
      pageSize: searchOptions.pagesize,
      showSizeChanger: true,
      showQuickJumper: true,
      onChange(page, pageSize) {
        dispatch({
          type: 'ichAccount/searchValueOnchange',
          payload: {
            ...searchOptions,
            pageno: page,
            pagesize: pageSize,
          },
        });
        dispatch({
          type: 'ichAccount/fetchLedgerData',
          payload: {
            ...searchOptions,
            pageno: page,
            pagesize: pageSize,
          },
        });
      },
      onShowSizeChange(current, pageSize) {
        dispatch({
          type: 'ichAccount/searchValueOnchange',
          payload: {
            ...searchOptions,
            pageno: current,
            pagesize: pageSize,
          },
        });
        dispatch({
          type: 'ichAccount/fetchLedgerData',
          payload: {
            ...searchOptions,
            pageno: current,
            pagesize: pageSize,
          },
        });
      },
      showTotal() { // 设置显示一共几条数据
        return <div>共 {totalNumbers} 条数据</div>;
      },
    };
    return (
      <div>
        <Table
          columns={columns}
          dataSource={ledgeData}
          rowKey="gid"
          onRow={(record) => ({
            onDoubleClick: () => {
              this.clickEdit(record);
            },
          })}
          pagination={pagination}
          loading={loading}
          onChange={this.handleChangeTable}
        />
      </div>
    );
  }
}

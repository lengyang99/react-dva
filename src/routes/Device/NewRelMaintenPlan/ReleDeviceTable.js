import React, {Component} from 'react';
import {Table, Button, Checkbox, Popconfirm, Icon} from 'antd';
import NewDeviceModal from '../NewModalForm/NewDeviceModal';
import NewAreaEqModal from '../NewModalForm/NewAreaEqModal';
import styles from './index.less';

const defaultPage = {
  pageno: 1,
  pagesize: 10,
};
// 添加设备弹出框参数配置
const defaultRowSelect = {
  selKeys: [], // 选中的行key
  selRows: {}, // 选中的行
};
export default class ReleDeviceTable extends Component {
  constructor(props) {
    super(props);
    this.defaultPageSize = 10;
    this.state = {
      ...defaultPage,
      ...defaultRowSelect,
      checked: props.isSyncEquipment === 1, // 是否按区域制定计划
      visible: false, // 设备弹出框1
      areaEqVisible: false, // 设备弹出框2
      targetData: props.value || [], // 添加完界面上显示的设备数据
      current: 1, // 当前页
      showBt: false, // 上下移按钮
      select: {
        record: {},
        index: null,
      },
    };
  }
    // 每次改变都会更新整个dataSource
    handleCheckChage = (e, gid, column) => {
      const newData = [...this.state.targetData];
      const target = newData.filter(item => gid === item.gid)[0];
      if (target) {
        target[column] = e.target.checked ? 1 : 2;
        this.targetDataChange(newData);
      }
    };
    // 更新表单的targetData
    targetDataChange = (data) => {
      this.sortEqu(data);
      this.setState({targetData: data});
      if (this.props.onChange) {
        this.props.onChange(data);
      }
    }
    // 弹框的显隐
    showModal=(type) => {
      if (type) {
        this.setState({
          visible: true,
        });
      } else {
        this.setState({
          areaEqVisible: true,
        });
      }
    }
    // 设备排序
    sortEqu =(equArray) => {
      equArray.forEach((item, index) => {
        Object.assign(item, {findex: index + 1});
      });
    }
    // 添加设备时默认活动
    setEqActive = (equArray) => {
      equArray.forEach(item => {
        Object.assign(item, {isActive: 1});
      });
    }
  // 删除设备
  reduceEqu = (gid) => {
    const { targetData } = this.state;
    const reduceItem = targetData.filter(item => {
      return item.gid !== gid;
    });
    this.targetDataChange(reduceItem);
  }
  // 添加设备
  addEqu = () => {
    const { targetData, selRows } = this.state;
    const {selectEq, selectEqKeys} = this.getSelecedRows(selRows);
    if (selectEqKeys.length > 0) {
      const tarData = targetData.filter(item => {
        // 存在eqId即编辑模式 用eqId去重
        const gid = item.eqId ? item.eqId : item.gid;
        return !selectEqKeys.includes(gid);
      });
      this.setEqActive([...tarData, ...selectEq]);
      this.targetDataChange([...tarData, ...selectEq]);
    }
  }
  // 清空选中行
  resetSelectRows = () => {
    this.setState(defaultRowSelect);
  }
  // 上下移动单击行样式
  rowClassName = (record, index) => {
    return index === this.state.select.index ? styles.selectRow : '';
  };
  // 单击事件
  handleClick = (record, index) => {
    this.setState({
      select: {
        record,
        index,
      },
      showBt: true,
    }, () => {
      this.rowClassName();
    });
  }
  // 上移
  handleClickBySortUp = (record, index) => {
    const { current, targetData } = this.state;
    const currNum = (current - 1) * this.defaultPageSize;
    const temp = targetData[currNum + index];
    targetData[currNum + index] = targetData[(currNum + index) - 1];
    targetData[(currNum + index) - 1] = temp;
    if (index !== 0) {
      this.handleClick(record, index - 1);
    } else {
      this.setState({ current: current - 1 });
      this.handleClick(record, this.defaultPageSize - 1 - index);
    }
    this.targetDataChange(targetData);
  }
  // 下移
  handleClickBySortDown = (record, index) => {
    const { current, targetData } = this.state;
    const currNum = (current - 1) * this.defaultPageSize;
    const temp = targetData[currNum + index];
    targetData[currNum + index] = targetData[currNum + index + 1];
    targetData[currNum + index + 1] = temp;
    if (index < this.defaultPageSize - 1) {
      this.handleClick(record, index + 1);
    } else {
      this.setState({ current: current + 1 });
      this.handleClick(record, index - (this.defaultPageSize - 1));
    }
    this.targetDataChange(targetData);
  }
  // 父组件改变子组件的分页
  onChangePage = (params) => {
    if (params.pageno && params.pagesize) {
      this.setState({pageno: params.pageno, pagesize: params.pagesize});
    } else {
      this.setState({pageno: 1, pagesize: 10});
    }
  }
  // 分页
  onPaginationChange = (params) => {
    this.setState(params);
  }
  // 排序时改变
  handleTableChage = (pagination) => {
    this.setState({
      current: pagination.current,
    });
  }
  // 确认
  handleOk = (type) => {
    if (this.state.checked) {
      this.setEqActive(this.props.areaEqData);
      this.targetDataChange(this.props.areaEqData);
    } else {
      this.addEqu();
    }
    this.handleCancel(type);
  }
  // 取消
  handleCancel = (type) => {
    this.resetSelectRows();
    if (type === 1) {
      this.setState({visible: false});
    } else {
      this.setState({areaEqVisible: false});
    }
  }
  // 获取分页下的勾选行和勾选行key
  getSelecedRows = (selRows) => {
    let selectEq = [];
    const selectEqKeys = [];
    const data = Object.values(selRows);
    (data || []).forEach(item => {
      selectEq = [...new Set([...selectEq, ...item])];
    });
    selectEq.forEach(item => {
      selectEqKeys.push(item.gid);
    });
    return { selectEq, selectEqKeys };
  }
  getPageSizeByTotal = (total) => {
    if (total >= 0 && total < 100) {
      return ['10', '20', '30', '40'];
    } else if (total >= 100 && total < 500) {
      return ['50', '100', '200', '400'];
    } else if (total >= 500 && total < 5000) {
      return ['100', '500', '1000', '2000'];
    } else if (total >= 5000 && total < 10000) {
      return ['1000', '2000', '3000', '4000'];
    } else if (total >= 10000) {
      return ['10000', '15000', '20000', '25000'];
    }
  }
  handleBoxCheck = (value) => {
    this.setState({checked: value});
  }
  render() {
    const { disabled, eqTotal, workObjectType, functionGroup, isSyncEquipment, funcList, activeKey, functionKey} = this.props;
    // 如果functionKey为null，默认isSetEquipment为0，用于解决刷新页面数据出不来问题 by caizhongjie
    const {isSetEquipment} = funcList[`${activeKey}_${functionKey}`] || {isSetEquipment: 0};
    const {current, visible, areaEqVisible, checked, select: {record, index}, showBt, targetData, selKeys, selRows, pageno, pagesize} = this.state;
    const total = targetData.length;
    const totalSum = Math.ceil(total / this.defaultPageSize);
    const lastPage = total % this.defaultPageSize === 0 ? this.defaultPageSize : total % this.defaultPageSize;
    // 表格分页
    const pagination = {
      current,
      total: checked && !areaEqVisible ? eqTotal : total,
      size: 'small',
      defaultPageSize: this.defaultPageSize,
      showTotal: (totals) => {
        return (<div>共 {totals} 条记录 </div>);
      },
    };
    const pagination2 = {
      total: eqTotal || 0,
      current: pageno,
      pageSize: pagesize,
      showQuickJumper: true,
      showSizeChanger: true,
      pageSizeOptions: this.getPageSizeByTotal(eqTotal),
      size: 'small',
      showTotal: (totals) => {
        return (<div>
               共 {totals} 条记录 第{pageno}/{Math.ceil(totals / pagesize)}页
        </div>);
      },
    };
    const pagination3 = {
      current,
      total: eqTotal || 0,
      size: 'small',
      defaultPageSize: this.defaultPageSize,
      showTotal: (totals) => {
        return (<div>共 {totals} 条记录 </div>);
      },
    };
    const eqModalPagination = !checked ? pagination2 : pagination3;
    const rowSelection = !checked ? {
      selectedRowKeys: selKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        const newSelRows = {...selRows};
        newSelRows[`${pageno}行`] = selectedRows;
        this.setState({selRows: newSelRows, selKeys: selectedRowKeys});
      },
      getCheckboxProps: records => ({
        disabled: targetData.find(item => {
          const gid = item.eqId ? item.eqId : item.gid;
          return gid === records.gid;
        }) !== undefined,
      }),
    } : null;
    // 计划性维护
    const columnsPreForm = [
      {
        key: 'findex',
        title: '序号',
        dataIndex: 'findex',
      },
      {
        key: 'eqCode',
        title: '设备编号',
        dataIndex: 'eqCode',
      }, {
        key: 'eqName',
        title: '设备名称',
        dataIndex: 'eqName',
      },
      {
        key: 'eqStatus',
        title: '设备状态',
        dataIndex: 'eqStatus',
      },
      {
        key: 'posDesc',
        title: '位置',
        dataIndex: 'posDesc',
      },
      {
        key: 'isActive',
        title: '是否活动',
        dataIndex: 'isActive',
        render: (text, records) => {
          return (<Checkbox
            disabled={this.state.checked || disabled === 'read' || isSyncEquipment === 1 || disabled === 'edit'}
            checked={text === 1}
            onChange={e => { this.handleCheckChage(e, records.gid, 'isActive'); }}
          />);
        },
      },
      {
        title: '操作',
        dataIndex: 'action',
        render: (text, records) => (
          <span>
            <a disabled={disabled === 'read'} onClick={() => { this.reduceEqu(records.gid); }}>删除</a>
          </span>
        ),
      },
    ];
    // 计划性维护(弹框显示)
    const columnsPreModal = [
      {
        key: 'eqCode',
        title: '设备编号',
        dataIndex: 'eqCode',
      }, {
        key: 'eqName',
        title: '设备名称',
        dataIndex: 'eqName',
      },
      {
        key: 'eqStatus',
        title: '设备状态',
        dataIndex: 'eqStatus',
      },
      {
        key: 'stationName',
        title: '所属站点',
        dataIndex: 'stationName',
      },
      {
        key: 'posDesc',
        title: '位置',
        dataIndex: 'posDesc',
      },
    ];
    //  工商户不按工商户制定计划
    const columnsEq = [
      {
        key: 'findex',
        title: '序号',
        dataIndex: 'findex',
        width: '5%',
      },
      {
        key: 'houseHoldName',
        title: '用户名称',
        dataIndex: 'houseHoldName',
        width: '20%',
      },
      {
        key: 'houseHoldCode',
        title: '客户号',
        dataIndex: 'houseHoldCode',
        width: '10%',
      },
      {
        title: '合同号',
        dataIndex: 'contractNum',
        key: 'contractNum',
        width: '10%',
      },
      {
        key: 'eqCode',
        title: '设备编号',
        dataIndex: 'eqCode',
        width: '10%',
      },
      {
        key: 'eqName',
        title: '表钢号',
        dataIndex: 'eqName',
        width: '10%',
      },
      {
        key: 'posDesc',
        title: '地址',
        dataIndex: 'posDesc',
        width: '25%',
      },
      {
        key: 'isActive',
        title: '是否活动',
        dataIndex: 'isActive',
        width: '5%',
        render: (text, records) => {
          return (<Checkbox
            disabled={disabled === 'read' || disabled === 'edit'}
            checked={text === 1}
            onChange={e => { this.handleCheckChage(e, records.gid, 'isActive'); }}
          />);
        },
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: '5%',
        render: (text, records) => (
          <span>
            <a disabled={disabled === 'read'} onClick={() => { this.reduceEqu(records.gid); }}>删除</a>
          </span>
        ),
      }];
    //  工商户按工商户制定计划
    const columnsGsh = [
      {
        key: 'findex',
        title: '序号',
        dataIndex: 'findex',
        width: '4%',
      },
      {
        key: 'houseHoldName',
        title: '用户名称',
        dataIndex: 'houseHoldName',
        width: '15%',
        render: (text, records) => (<span>{records.customer_desc ? records.customer_desc : text}</span>),
      },
      {
        key: 'houseHoldCode',
        title: '客户号',
        dataIndex: 'houseHoldCode',
        width: '10%',
        render: (text, records) => (<span>{records.customer_num ? records.customer_num : text}</span>),
      },
      {
        title: '合同号',
        dataIndex: 'contractNum',
        key: 'contractNum',
        width: '10%',
        render: (text, records) => (<span>{records.contract_code ? records.contract_code : text}</span>),
      },
      {
        key: 'contract_account',
        title: '合同账户',
        dataIndex: 'contract_account',
        width: '15%',
      },
      {
        key: 'customer_status',
        title: '状态',
        dataIndex: 'customer_status',
        width: '5%',
      },
      {
        key: 'cus_typeName',
        title: '用户类型',
        dataIndex: 'cus_typeName',
        width: '10%',
      },
      {
        key: 'posDesc',
        title: '地址',
        dataIndex: 'posDesc',
        width: '20%',
        render: (text, records) => (<span>{records.addr_contract ? records.addr_contract : text}</span>),
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: '5%',
        render: (text, records) => (
          <span>
            <a disabled={disabled === 'read'} onClick={() => { this.reduceEqu(records.gid); }}>删除</a>
          </span>
        ),
      },
    ];
    const gshColumns = workObjectType === 1 ? columnsEq : columnsGsh;
    // 工商户不按工商户制定计划（弹框显示）
    const columns2Eq = [
      {
        key: 'houseHoldName',
        title: '用户名称',
        dataIndex: 'houseHoldName',
        width: '20%',
      },
      {
        key: 'houseHoldCode',
        title: '客户号',
        dataIndex: 'houseHoldCode',
        width: '10%',
      },
      {
        title: '合同号',
        dataIndex: 'contractNum',
        key: 'contractNum',
        width: '10%',
      },
      {
        key: 'eqCode',
        title: '设备编号',
        dataIndex: 'eqCode',
        width: '15%',
      },
      {
        key: 'meterReader',
        title: '读表人',
        dataIndex: 'meterReader',
        width: '5%',
      },
      {
        key: 'eqName',
        title: '表钢号',
        dataIndex: 'eqName',
        width: '15%',
      },
      {
        key: 'posDesc',
        title: '地址',
        dataIndex: 'posDesc',
        width: '20%',
      },
    ];
    // 工商户按工商户制定计划(弹框显示)
    const columns2Gsh = [
      {
        key: 'customer_desc',
        title: '用户名称',
        dataIndex: 'customer_desc',
        width: '20%',
      },
      {
        key: 'customer_num',
        title: '客户号',
        dataIndex: 'customer_num',
        width: '10%',
      },
      {
        title: '合同号',
        dataIndex: 'contract_code',
        key: 'contract_code',
        width: '10%',
      },
      {
        key: 'contract_account',
        title: '合同账户',
        dataIndex: 'contract_account',
        width: '15%',
      },
      {
        key: 'customer_status',
        title: '用户状态',
        dataIndex: 'customer_status',
        width: '5%',
      },
      {
        key: 'cus_typeName',
        title: '用户类型',
        dataIndex: 'cus_typeName',
        width: '10%',
      },
      {
        key: 'addr_contract',
        title: '地址',
        dataIndex: 'addr_contract',
        width: '25%',
      },
    ];
    const gshColumns2 = workObjectType === 1 ? columns2Eq : columns2Gsh;
    const columns = functionGroup === 'household' ? gshColumns : columnsPreForm;
    const columns2 = functionGroup === 'household' ? gshColumns2 : columnsPreModal;
    // mode : 1 计划性维护选设备  2：工商户选工商户 3:工商户选工商户
    const mode = functionGroup === 'household' ? workObjectType === 1 ? 1 : 2 : 0;
    const showModal = isSetEquipment === 0 && workObjectType !== 3;
    return (
      <div>
        <div className={styles['span-button']}>
          <div className={styles.order} />
          <span className={styles['span-title']}>关联设备</span>
          <div style={{display: 'inline-block'}}>
            <Button
              type="primary"
              htmlType="button"
              disabled={disabled === 'read'}
              className={styles['new-dev-btn']}
              onClick={() => this.showModal(showModal)}
            >+ 添加设备
            </Button>
          </div>
          <div style={{float: 'right', marginTop: 10, display: showBt ? 'inline-block' : 'none'}}>
            <Button
              type="primary"
              size="small"
              style={{ marginRight: 5, display: current === 1 && index === 0 ? 'none' : 'inline-block' }}
              onClick={() => { this.handleClickBySortUp(record, index); }}
            ><Icon type="caret-up" />上移</Button>
            <Button
              type="primary"
              size="small"
              style={{ display: current === totalSum && index === lastPage - 1 ? 'none' : 'inline-block' }}
              onClick={() => { this.handleClickBySortDown(record, index); }}
            ><Icon type="caret-down" />下移</Button>
          </div>
        </div>
        <div style={{clear: 'both'}} />
        {showModal ? <NewDeviceModal
          visible={visible}
          selRows={selRows}
          selKeys={selKeys}
          targetData={targetData || []}
          callbackSave={({newSelRows, selectedRowKeys}) => {
            this.setState({selRows: newSelRows, selKeys: selectedRowKeys});
          }}
          handleOk={() => this.handleOk(1)}
          handleCancel={() => this.handleCancel(1)}
        /> : <NewAreaEqModal
          {...this.props}
          columns={columns2}
          mode={mode}
          areaEqVisible={areaEqVisible}
          checked={checked}
          rowSelection={rowSelection}
          onPaginationChange={this.onPaginationChange}
          pagesize={pagesize}
          handleBoxCheck={this.handleBoxCheck}
          handleTableChage={this.handleTableChage}
          pagination={eqModalPagination}
          handleOk={() => this.handleOk(2)}
          handleCancel={() => this.handleCancel(2)}
        />}
        <Table
          columns={columns}
          dataSource={targetData || []}
          pagination={pagination}
          onChange={this.handleTableChage}
          rowKey={records => records.gid}
          rowClassName={this.rowClassName}
          onRow={(records, indexs) => ({
                      onClick: this.handleClick.bind('', records, indexs),
                    })}
          bordered
        />
      </div>
    );
  }
}

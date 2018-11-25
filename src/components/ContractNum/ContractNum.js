/**
 * Created by hexi on 2018/7/19.
 */
/**
 * 合同号搜索组件
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { getAttachInfo } from '../../services/seeMedia';
import { getCurrTk } from '../../utils/utils.js';
import { Select, message, Button, Modal, Table, Spin, Form, Input, Row, Col } from 'antd';
import PropTypes from 'prop-types';
// import { getledgerDataList } from '../../services/ichAccount';
import styles from './index.less';

const FormItem = Form.Item;
@connect(state => ({
  data: state.contractNum.data,
  columns: state.contractNum.columns,
  loading: state.contractNum.loading,
  pageno: state.contractNum.pageno,
  visible: state.contractNum.visible,
  param: state.contractNum.param,
  totalPage: state.contractNum.totalPage,
  selectedRowKeys: state.contractNum.selectedRowKeys,
  selectedRows: state.contractNum.selectedRows,
  fields: state.contractNum.fields,
  fromData: state.submitFormManage ? state.submitFormManage.formData.params[0].items : [],
}))
@Form.create()
class ContractNum extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  onChangeValue = () => {
    this.props.dispatch({
      type: 'contractNum/loadData',
      payload: {
        loading: true,
        visible: true,
        selectedRowKeys: [],
        selectedRows: [],
      },
    });
    this.props.dispatch({
      type: 'contractNum/tableQuery',
      payload: {
        pageno: 1,
        pagesize: 10,
        param: '',
      },
    });
  }
  handleCancel = (e) => {
    this.props.dispatch({
      type: 'contractNum/loadData',
      payload: {
        visible: false,
      },
    });
  }
  handleOk = (e) => {
    let obj = {};
    const { selectedRows } = this.props;
    if (selectedRows.length > 0) {
      obj = {
        subscriber_name: selectedRows[0].customer_desc, // 用户名称
        contract_num: selectedRows[0].contract_account, // 合同账户
        address: selectedRows[0].contract_account_desc, // 地址
        phone: selectedRows[0].contactPhone, // 联系电话
        linkman: selectedRows[0].contactPeople, // 联系人
      };
    }
    if (this.props.request && obj.contract_num) {
      this.props.dispatch({
        type: 'contractNum/queryForm',
        payload: {
          contract_account: obj.contract_num,
        },
        callback: (data) => {
          if (data.list) {
            if (data.list.length > 0) {
              obj = {};
              for (const el of this.props.fromData.values()) {
                if (el.visible === 1) {
                  for (const elem of this.props.fields.values()) {
                    if (el.alias === elem.title) {
                      if (el.type === 'IMG' || el.type === 'ADO' || el.type === 'ATT') {
                        obj[el.name] = [];
                        // 处理文件
                        getAttachInfo(data.list[0][elem.key]).then((res) => {
                          if (!res.success) {
                            message.info(res.msg);
                            return;
                          }
                          res.data.forEach((item) => {
                            obj[el.name].push({
                              uid: item.id,
                              name: item.filename,
                              url: `${window.location.origin}/proxy/attach/downloadFile?id=${item.id}&token=${getCurrTk()}`,
                            });
                          });
                        });
                      } else {
                        obj[el.name] = data.list[0][elem.key];
                        // console.log(el.alias);
                      }
                    }
                  }
                }
              }
              this.props.onChangeValue(obj);
            }
          }
        },
      });
    } else {
      this.props.onChangeValue(obj);
    }
    this.props.dispatch({
      type: 'contractNum/loadData',
      payload: {
        visible: false,
      },
    });
  }
  // 隔行换色
  setRowClassName = (record, index) => {
    if (index % 2 !== 0) {
      return styles.doubleRow;
    }
  };
  // 显示总页数
  showTotal = total => {
    return `共${total}条数据`;
  };
  clickSearch = (e) => {
    // 表单提交
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'contractNum/loadData',
          payload: {
            loading: true,
            selectedRowKeys: [],
            selectedRows: [],
          },
        });
        this.props.dispatch({
          type: 'contractNum/tableQuery',
          payload: {
            pageno: 1,
            pagesize: 10,
            param: values.inputSeach,
          },
        });
      } else {
        message.warning('提交失败！');
      }
    });
  }
  // 分页改变
  tablePageChange = pagination => {
    this.props.dispatch({
      type: 'contractNum/loadData',
      payload: {
        loading: true,
        selectedRowKeys: [],
        selectedRows: [],
      },
    });
    this.props.dispatch({
      type: 'contractNum/tableQuery',
      payload: {
        pageno: pagination.current,
        pagesize: 10,
        param: this.props.param,
      },
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={styles.span} >
        <Input
          value={this.props.value}
          onClick={this.onChangeValue}
        />
        <Modal
          title="合同号"
          visible={this.props.visible}
          onOk={this.handleOk}
          width={1100}
          onCancel={this.handleCancel}
        >
          <div style={{ textAlign: 'center', width: '100%', height: '100% ' }}>
            <Form
              onSubmit={this.clickSearch}
              style={{
                width: '100%',
                padding: '0 20px',
              }}
            >
              <Row gutter={10}>
                <Col span={21} >
                  <FormItem>
                    {getFieldDecorator('inputSeach', {
                      rules: [],
                    })(<Input placeholder="请输入用户名称、合同账户、地址进行搜索！" />)}
                  </FormItem>
                </Col>
                <Col span={3} >
                  <Button type="primary" htmlType="submit">
                    搜索
                  </Button>
                </Col>
              </Row >
            </Form >
            <Spin tip="Loading..." spinning={this.props.loading}>
              <Table
                dataSource={this.props.data}
                columns={this.props.columns}
                style={{ width: '100%', height: '100%', padding: '0 20px' }}
                bordered
                pagination={{
                  current: this.props.pageno,
                  pageSize: 10,
                  total: this.props.totalPage,
                  showTotal: this.showTotal,
                }}
                rowClassName={this.setRowClassName}
                onChange={this.tablePageChange}
                rowSelection={{
                  onChange: (selectedRowKeys, selectedRows) => {
                    this.props.dispatch({
                      type: 'contractNum/loadData',
                      payload: {
                        selectedRowKeys,
                        selectedRows,
                      },
                    });
                  },
                  type: 'radio',
                  selectedRowKeys: this.props.selectedRowKeys,
                }}
              />
            </Spin>
          </div>
        </Modal>
      </div>
    );
  }
}

export default ContractNum;

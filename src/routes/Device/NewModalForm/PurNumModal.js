/**
 * Created by hexi on 2018/7/19.
 */
/**
 * 合同号搜索组件
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Select, message, Button, Modal, Table, Spin, Form, Input, Row, Col } from 'antd';
import PropTypes from 'prop-types';
// import { getledgerDataList } from '../../services/ichAccount';
import styles from './PurNumModal.less';

const FormItem = Form.Item;
@connect(state => ({
  data: state.purNumModal.data,
  columns: state.purNumModal.columns,
  loading: state.purNumModal.loading,
  pageno: state.purNumModal.pageno,
  visible: state.purNumModal.visible,
  wlcode: state.purNumModal.wlcode,
  totalPage: state.purNumModal.totalPage,
  selectedRowKeys: state.purNumModal.selectedRowKeys,
  selectedRows: state.purNumModal.selectedRows,
}))
@Form.create()
class ContractNum extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.factoryCode = this.props.placeInfo[0].faccode;
  }

  onChangeValue = () => {
    this.props.dispatch({
      type: 'purNumModal/loadData',
      payload: {
        loading: true,
        visible: true,
        selectedRowKeys: [],
        selectedRows: [],
      },
    });
    this.props.dispatch({
      type: 'purNumModal/tableQuery',
      payload: {
        pageno: 1,
        pagesize: 10,
        factoryCode: this.factoryCode,
        wlcode: '',
      },
    });
  }
  handleCancel = (e) => {
    this.props.dispatch({
      type: 'purNumModal/loadData',
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
        code: selectedRows[0].code, // 物料编号
      };
    }
    this.props.onChangeValue(obj);
    this.props.dispatch({
      type: 'purNumModal/loadData',
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
          type: 'purNumModal/loadData',
          payload: {
            loading: true,
            selectedRowKeys: [],
            selectedRows: [],
          },
        });
        this.props.dispatch({
          type: 'purNumModal/tableQuery',
          payload: {
            pageno: 1,
            pagesize: 10,
            factoryCode: this.factoryCode,
            wlcode: values.inputSeach,
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
      type: 'purNumModal/loadData',
      payload: {
        loading: true,
        selectedRowKeys: [],
        selectedRows: [],
      },
    });
    this.props.dispatch({
      type: 'purNumModal/tableQuery',
      payload: {
        pageno: pagination.current,
        pagesize: 10,
        wlcode: this.props.wlcode,
        factoryCode: this.factoryCode,
      },
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={styles.span} >
        <Input
          value={this.props.purNumModalValue}
          onClick={this.onChangeValue}
        />
        <Modal
          title="物料编号"
          visible={this.props.visible}
          onOk={this.handleOk}
          width={800}
          bodyStyle={{ height: 550 }}
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
                    })(<Input placeholder="请输入物料编号、物料名称！" />)}
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
                scroll={{ y: 350 }}
                rowClassName={this.setRowClassName}
                onChange={this.tablePageChange}
                rowSelection={{
                  onChange: (selectedRowKeys, selectedRows) => {
                    this.props.dispatch({
                      type: 'purNumModal/loadData',
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

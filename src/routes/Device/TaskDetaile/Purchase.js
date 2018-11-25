import React, { Component } from 'react';
import { Button, message, Form, Select, Col, Row, Input } from 'antd';
import { connect } from 'dva';
import styles from './index.less';
import PurchaseTable from './PurchaseTable';
import NewPurchaseModal from '../NewModalForm/NewPurchaseModal';

const FormItem = Form.Item;
const Option = Select.Option;
const defaultPage = {
  pageno: 1,
  pagesize: 10,
};
let uid = 0;
@Form.create()
@connect(({ login }) => ({
  userInfo: login.user,
}))
export default class Purchase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...defaultPage,
      btLoding: false,
      visible: false,
      selectedRowKeys: [],
      purchaseData: [], // 订单数据
      formData: {}, // 模态框的数据
      disabled: '',
      gys: {},
    };
  }
  modal = null;
  targetDataChange = (tarData) => {
    this.setState({ purchaseData: tarData });
  };
  componentDidMount() {
    this.props.dispatch({
      type: 'device/initPurchaseOrderInfo',
      payload: { taskId: String(this.props.taskId) },
      callback: ({ data, success, msg, gys }) => {
        if (success && data.length > 0) {
          this.setState({ purchaseData: data, gys, disabled: 'read' });
        } else {
          message.warn(msg);
        }
      },
    });
  }
  // 删除物料
  reducePick = (wl) => {
    const { purchaseData } = this.state;
    const reduceItem = purchaseData.filter(item => {
      return item.gid !== wl.gid;
    });
    this.targetDataChange(reduceItem);
  };
  // 增加
  create = () => {
    const placeInfo = this.props.placeInfo;
    const { facname, faccode, cbname, cbcode, wlcode, wlname } = placeInfo && placeInfo.length > 0 ? placeInfo[0] : {};
    this.setState({ visible: true, formData: { yw: '1001', cb: cbcode, cbname, fc: faccode, facname, kcdcode: wlcode, kcdname: wlname } });
  };
  // 删除
  delete = () => {
    const { selectedRowKeys } = this.state;
    const newData = [...this.state.purchaseData];
    const target = newData.filter(item => !selectedRowKeys.includes(item.gid));
    if (target) {
      this.onPurchaseDataChange(target);
    }
  }
  handleSubmit = (e) => {
    const { form, dispatch, placeInfo } = this.props;
    const { purchaseData } = this.state;
    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (purchaseData.length === 0) {
          message.warn('请添加采购订单！');
          return;
        }
        const { bukrs, ekgrp, lifnr, ekorg } = values;
        const purchaseOrder = {
          bukrs, // 公司代码
          ekgrp, // 采购组
          lifnr, // 供销商
          ekorg, // 采购组织
          order_Info: purchaseData.map(item => ({
            afnam: item.afnam, // 申请者
            gsber: item.gsber, // 业务范围
            kostl: item.kostl, // 成本中心
            matnr: item.matnr, // 物料编号
            menge: item.menge, // 数量
            mwskz: item.mwskz, // 税码
            netpr: item.netpr, // 净价
            werks: item.werks, // 工厂
            describe: item.describes, // 描述
            lgort: item.lgort, // 库存地点
            'EKPO-KNTTP': 'K',
          })),
        };
        this.setState({ btLoding: true });
        dispatch({
          type: 'device/savePurchaseOrderInfo',
          payload: { taskId: String(this.props.taskId), purchaseOrder: JSON.stringify(purchaseOrder) },
          callback: ({ success, msg }) => {
            if (success) {
              message.success('保存成功');
              this.setState({ btLoding: false });
              // handleBack();
            } else {
              message.warn(msg);
              this.setState({ btLoding: false });
            }
          },
        });
      }
    });
  };
  handleChangeVisible = () => {
    this.setState({ visible: !this.state.visible });
  }
  // 重置
  restState = () => {
    this.modal.resetFields();
  }
  sortFindex = (data) => {
    data.forEach((item, idx) => {
      Object.assign(item, { afnam: this.props.userInfo.id });
    });
  }
  onPurchaseDataChange = (data) => {
    this.sortFindex(data);
    this.setState({ purchaseData: data });
  }
  handleOk = () => {
    const { formData, purchaseData } = this.state;
    this.modal.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.handleChangeVisible();
        // Object.assign(values, { name: values.alias });
        const formInfo = {
          gid: `NEW_${uid += 1}`,
          ...values,
        };
        // 如果处于编辑状态,否则是新建状态
        // if (isEdit) {
        //   // 编辑时作替换操作 不改变原有顺序
        //   const findex = formData.findex - 1;
        //   const newData = [...purchaseData];
        //   newData[findex] = formInfo;
        //   this.onPurchaseDataChange(newData);
        // } else {
        const params = [];
        params.push(formInfo);
        const newData = [...params, ...purchaseData];
        this.onPurchaseDataChange(newData);
        // }
        this.restState();
      }
    });
  }
  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const { selectedRowKeys, purchaseData, visible, formData, disabled } = this.state;
    const { cname, ccode, supplier } = this.props.placeInfo && this.props.placeInfo.length > 0 ? this.props.placeInfo[0] : {};
    const supplierFilter = (supplier || []).filter((item) => {
      return item.lifnr !== '0000009990';
    });
    const formItemLayout = {
      labelCol: {
        xs: { span: 12 },
        sm: { span: 10 },
      },
      wrapperCol: {
        xs: { span: 28 },
        sm: { span: 12 },
        md: { span: 6 },
      },
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: (seldRowKeys) => {
        this.setState({ selectedRowKeys: seldRowKeys });
      },
    };
    return (
      <div>
        <div >
          <Form
            hideRequiredMark
            onSubmit={this.handleSubmit}
          >
            {/* {disabled === 'read' ? <Row >
              <Col span={9}>
                <FormItem
                  label="订单"
                  {...formItemLayout}
                >
                  {getFieldDecorator('order', {
                    rules: [{ required: true, message: '请选择移动类型' }],
                    initialValue: '',
                  })(
                    <Select
                      disabled={disabled === 'read'}
                      style={{ width: 240 }}
                    />
                    )}
                </FormItem>
              </Col>
              <Col span={7}>
                <FormItem
                  label="采购订单号"
                  {...formItemLayout}
                >
                  {getFieldDecorator('orderNumber', {
                    rules: [{ required: true, message: '请选择公司名称' }],
                    initialValue: '',
                  })(
                    <Select
                      disabled={disabled === 'read'}
                      notFoundContent="暂无数据"
                      style={{ width: 240 }}
                    />
                    )}
                </FormItem>
              </Col>
            </Row> : null} */}
            <Row>
              <Col span={9}>
                <FormItem
                  label="采购组织"
                  {...formItemLayout}
                >
                  {getFieldDecorator('ekorg', {
                    rules: [{ required: true, message: '请选择采购组织' }],
                    initialValue: ccode || '',
                  })(
                    <Select
                      disabled={disabled === 'read'}
                      notFoundContent="暂无数据"
                      style={{ width: 240 }}
                    >
                      {ccode ? <Option value={ccode}>{`【${ccode}】 ${cname}`}</Option> : null}
                    </Select>
                    )}
                </FormItem>
              </Col>
              <Col span={7}>
                <FormItem
                  label="采购组"
                  {...formItemLayout}
                >
                  {getFieldDecorator('ekgrp', {
                    initialValue: 'P07',
                  })(
                    <Input
                      disabled
                      style={{ width: 240 }}
                    />
                    )}
                </FormItem>
              </Col>
            </Row>
            <Row >
              <Col span={9}>
                <FormItem
                  label="供销商"
                  {...formItemLayout}
                >
                  {getFieldDecorator('lifnr', {
                    rules: [{ required: true, message: '请选择供销商' }],
                    initialValue: this.state.gys.lifnr ? this.state.gys.lifnr : supplierFilter[0] ? supplierFilter[0].lifnr : '',
                  })(
                    <Select
                      disabled={disabled === 'read'}
                      showSearch
                      notFoundContent="暂无数据"
                      style={{ width: 240 }}
                      optionFilterProp="children"
                      filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >
                      {supplierFilter ? supplierFilter.map((item) => {
                        return (
                          <Option key={item.lifnr} value={item.lifnr}>
                            {`${item.name}`}
                          </Option>
                        );
                      }) : null}
                    </Select>
                    )}
                </FormItem>
              </Col>
              <Col span={7}>
                <FormItem
                  label="公司代码"
                  {...formItemLayout}
                >
                  {getFieldDecorator('bukrs', {
                    initialValue: ccode,
                  })(
                    <Input
                      disabled
                      style={{ width: 240 }}
                    />
                    )}
                </FormItem>
              </Col>
            </Row>
            {disabled === 'read' ? null : <div>
              <Button type="primary" style={{ marginBottom: 10, marginRight: 5 }} onClick={this.create}>增加</Button>
              <Button type="primary" style={{ marginBottom: 10, marginLeft: 5 }} onClick={this.delete}>删除</Button>
            </div>}
            <FormItem>
              <PurchaseTable data={purchaseData} rowSelection={rowSelection} />
            </FormItem>
          </Form>
          {visible && <NewPurchaseModal
            ref={modal => { this.modal = modal; }}
            visible={visible}
            formData={formData}
            handleOk={this.handleOk}
            handleCancel={this.handleChangeVisible}
            placeInfo={this.props.placeInfo}
          />}
          <Button
            className={styles.button}
            style={{ display: disabled === 'read' ? 'none' : 'inline-block' }}
            type="primary"
            htmlType="submit"
            disabled={disabled === 'read'}
            loading={this.state.btLoding}
            onClick={this.handleSubmit}
          >提交</Button>
        </div>
      </div>
    );
  }
}

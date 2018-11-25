import React, { PureComponent } from 'react';
import { Modal, Form, Select, Input } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
@Form.create()
export default class NewCaterModal extends PureComponent {
  state={
    visible: false,
  }
  handleCancel = () => {
    this.setState({visible: !this.state.visible});
  }
  handleClose = () => {
    this.props.form.resetFields();
    if (this.props.resetRecord) {
      this.props.resetRecord();
    }
  }
  handleOk = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const {gid, trueName, ecode, cCompany} = this.props.user;
        const subData = {
          ...values,
          ecode,
          ename: cCompany,
          createrId: gid,
          createrName: trueName,
          functionKey: values.functionName,
        };
        this.subData(subData);
      }
    });
  }
  subData = (subData) => {
    const {action, gid, functionKey} = this.props.record;
    if (action === 'edit') {
      Object.assign(subData, {gid, functionKey});
    }
    this.props.dispatch({
      type: `operationStandard/${action === 'edit' ? 'edit' : 'add'}OperaType`,
      payload: subData,
      callback: (res) => {
        if (res.success) {
          if (action === 'new') {
            this.props.callbackFunc(subData.functionName, subData.functionGroup);
          } else {
            this.props.queryCatergoryData();
          }
          this.setState({visible: false});
        }
      },
    });
  }
  showModal = () => {
    this.setState({visible: true});
  }
  // 校检
  handleCheckAlias = (rule, value, callback2, type) => {
    // 如果处于编辑状态下的校检名称，当前名称不会作为重名依据
    const {action, gid} = this.props.record;
    const pattern = /^[A-Za-z]+$/;
    if (value === '') {
      callback2(`请输入类型分类${type === 'name' ? '名称' : '英文名'}`);
    } else if (type === 'key' && !pattern.test(value)) {
      callback2('请输入英文名称');
    } else {
      const params = type === 'name' ? { functionName: value } : { functionKey: value };
      if (action === 'edit') {
        Object.assign(params, { gid});
      }
      this.props.dispatch({
        type: 'operationStandard/validateParentFunction',
        payload: params,
        callback: (res) => {
          if (res.data && res.data.length !== 0) {
            callback2(`已经存在该类型分类${type === 'name' ? '名称' : '英文名'},请重新输入`);
          } else {
            callback2();
          }
        },
      });
    }
    // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
    // callback();
  }
  render() {
    const {form, record, functionGroup} = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };
    const AppliyOptions = (functionGroup || []).map(item =>
      <Option key={item.logmark} value={item.logmark}>{item.alias}</Option>
    );
    return (
      <div>
        <Modal
          visible={this.state.visible}
          title={`${record.action === 'edit' ? '编辑' : '新建'}类型分类`}
          maskClosable={false}
          destroyOnClose
          afterClose={() => this.handleClose()}
          onOk={this.handleOk}
          onCancel={() => this.handleCancel()}
        >
          <Form >
            <FormItem
              label="类型分类名称"
              {...formItemLayout}
            >
              {getFieldDecorator('functionName', {
                             validateTrigger: ['onBlur'],
                             rules: [
                               { validator: (rule, value, callback2) => this.handleCheckAlias(rule, value, callback2, 'name') },
                           ],
                                initialValue: record.action === 'edit' || record.action === 'read' ? record.functionName : '',
                            })(
                              <Input
                                disabled={record.action === 'read'}
                                placeholder="类型名称"
                              />
                                )}
            </FormItem>
            <FormItem
              label="应用场景"
              {...formItemLayout}
            >
              {getFieldDecorator('functionGroup', {
                                rules: [
                                    { required: true, message: '应用场景名称' },
                                ],
                                initialValue: record.action === 'edit' || record.action === 'read' ? record.functionGroup : '',
                            })(
                              <Select
                                disabled={record.action === 'edit' || record.action === 'read'}
                                placeholder="应用场景"
                              >{AppliyOptions}</Select>
                                )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

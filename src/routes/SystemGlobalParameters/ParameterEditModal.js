import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select, message } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
@connect(state => ({
  selectedRows: state.globalParameter.selectedRows,
  modal: state.globalParameter.modal,
  moduleSelectList: state.globalParameter.moduleSelectList,
}))
@Form.create({mapPropsToFields: (props) => {
  const { modal } = props;
  return {
    module: Form.createFormField({value: modal.modalForm === null ? '' : modal.modalForm.module}),
    name: Form.createFormField({value: modal.modalForm === null ? '' : modal.modalForm.name}),
    text: Form.createFormField({value: modal.modalForm === null ? '' : modal.modalForm.text}),
    description: Form.createFormField({value: modal.modalForm === null ? '' : modal.modalForm.description}),
  };
}})
export default class ParameterEditModal extends PureComponent {
  handleOK = (e) => {
    e.preventDefault();
    const { modal, form, selectedRows, dispatch } = this.props;
    if (modal.modalType === 'batchDelete') {
      if (selectedRows.length > 0) {
        console.log('批量删除');
        console.log(selectedRows);
      } else {
        message.warning('还未选择任何数据');
      }
    } else {
      console.log('新建或者编辑');
      form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values);
          dispatch({
            type: `globalParameter/${modal.modalType}Parameter`,
            payload: modal.modalType === 'add' ? values : {gid: modal.modalForm.gid, record: values},
            callback: (res) => {
              message.success(res.msg);
              this.queryParameterList();
            },
          });
        }
      });
    }
  };
  handleHideModal = () => {
    this.props.dispatch({
      type: 'globalParameter/makeModalHide',
    });
  };
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
    const { modal, moduleSelectList } = this.props;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
    };
    return (
      <Modal
        title={modal.modalType === 'add' ? '新建系统配置' : '编辑系统配置'}
        visible={modal.modalVisible}
        okText="确认"
        cancelText="取消"
        onOk={this.handleOK}
        onCancel={this.handleHideModal}
      >
        {modal.modalType !== 'batchDelete' ?
          <Form>
            <FormItem
              {...formItemLayout}
              label="模块名称"
              hasFeedback
            >
              {getFieldDecorator('module', {
                rules: [{ required: true, message: 'Please select your habitual residence!' }, {
                  // validator: this.checkConfirm,
                }],
              })(
                <Select
                  showSearch
                  style={{ width: 200 }}
                  placeholder="请选择模块名称"
                  optionFilterProp="children"
                  // onChange={handleChange}
                  // filterOption={(input, option) => option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {
                    moduleSelectList.map((item, index) => {
                      return (
                        <Option value={item.value}>{item.text}</Option>
                      );
                    })
                  }
                </Select>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="规则名称"
              hasFeedback
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true, message: '请输入规则名称!',
                }, {
                  // validator: this.checkConfirm,
                }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="模块值"
              hasFeedback
            >
              {getFieldDecorator('text', {
                rules: [{
                  required: true, message: '请输入规则值!',
                }, {
                  // validator: this.checkConfirm,
                }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="描述"
              hasFeedback
            >
              {getFieldDecorator('description', {
                rules: [{
                  required: true, message: '请输入描述信息!',
                }, {
                  // validator: this.checkConfirm,
                }],
              })(
                <Input />
              )}
            </FormItem>
          </Form>
          :
          <p>确认删除吗?</p>}
      </Modal>
    );
  }
}

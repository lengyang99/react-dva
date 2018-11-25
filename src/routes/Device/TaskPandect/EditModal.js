import React, { PureComponent } from 'react';
import { Modal, Form, Select, Input, DatePicker } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
const TextArea = Input.TextArea;
@Form.create()
export default class EditModal extends PureComponent {
  state={
    visible: false,
  }
  handleCancel = () => {
    this.setState({visible: false});
  }
  handleClose = () => {
    this.props.form.resetFields();
  }
  handleOk = () => {
    this.props.handleOk();
  }
  showModal = () => {
    this.setState({visible: !this.state.visible});
  }
  render() {
    const {form, record, userInfo} = this.props;
    const assigneeOptions = (userInfo || []).map(item =>
      <Option key={item.gid} value={`${item.gid}`} dataRef={item}>{item.truename}</Option>
    );
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
    return (
      <div>
        <Modal
          visible={this.state.visible}
          title="编辑任务"
          maskClosable={false}
          destroyOnClose
          afterClose={() => this.handleClose()}
          onOk={this.handleOk}
          onCancel={() => this.handleCancel()}
        >
          <Form >
            <FormItem
              label="设备编号"
              {...formItemLayout}
            >
              {getFieldDecorator('gid', {
                                initialValue: record.action === 'edit' || record.action === 'read' ? record.eqCodes : '',
                            })(
                              <TextArea
                                disabled
                                rows={3}
                              />
                                )}
            </FormItem>
            <FormItem
              label="处理人"
              {...formItemLayout}
            >
              {getFieldDecorator('assigneeIds', {})(
                <Select
                  mode="multiple"
                  labelInValue
                  disabled={record.action === 'read'}
                  placeholder="处理人"
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {assigneeOptions}
                </Select>
                                )}
            </FormItem>
            <FormItem
              label="要求完成时间"
              {...formItemLayout}
            >
              {getFieldDecorator('endTime', {
                                rules: [
                                    { required: true, message: '要求完成时间' },
                                ],
                            })(
                              <DatePicker />
                                )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

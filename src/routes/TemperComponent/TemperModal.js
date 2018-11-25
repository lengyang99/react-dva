
import { Modal, Form, Select, Input, DatePicker } from 'antd';
import moment from 'moment';

const FormItem = Form.Item;
const Option = Select.Option;
export default Form.create()(
  (props) => {
    const { handleCancel, showMore, handleOk, record, form } = props;
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
          visible
          title={`${record.action}气质组分记录`}
          maskClosable={false}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          {!showMore ? <Form >
            <FormItem
              label="仪表编号"
              {...formItemLayout}
            >
              {getFieldDecorator('meterCode', {
                                rules: [
                                    { required: true, message: '请输入名称' },
                                    { max: 50, message: '最大长度不超过50' },
                                ],
                                initialValue: record.meterCode || '',
                            })(
                              <Input
                                placeholder="仪表编号"
                              />
                                )}
            </FormItem>
            <FormItem
              label="描述"
              {...formItemLayout}
            >
              {getFieldDecorator('scheduleDesc', {
                                rules: [{ required: true, message: '请输入描述' }],
                                initialValue: record.scheduleDesc || '',
                            })(
                              <Input
                                placeholder="描述"
                              />
                                )}
            </FormItem>
            <FormItem
              label="量程"
              {...formItemLayout}
            >
              {getFieldDecorator('gasRange', {
                                rules: [{ required: true, message: '请输入量程' }],
                                initialValue: record.gasRange || '',
                            })(
                              <Input
                                placeholder="量程"
                              />
                                )}
            </FormItem>
            <FormItem
              label="测量值"
              {...formItemLayout}
            >
              {getFieldDecorator('scheduleObserved', {
                                rules: [{ required: true, message: '请输入测量值' }],
                                initialValue: record.scheduleObserved || '',
                            })(
                              <Input
                                placeholder="测量值"
                              />
                                )}
            </FormItem>
            <FormItem
              label="单位"
              {...formItemLayout}
            >
              {getFieldDecorator('scheduleUnit', {
                                rules: [{ required: true, message: '请输入单位' }],
                                initialValue: record.scheduleUnit || '',
                            })(
                              <Input
                                placeholder="单位"
                              />
                                )}
            </FormItem>
            <FormItem
              label="时间"
              {...formItemLayout}
            >
              {getFieldDecorator('scheduleTime', {
                                rules: [{ required: true, message: '请输入时间' }],
                                initialValue: record.scheduleTime ? moment(record.scheduleTime) : null,
                            })(
                              <DatePicker
                                format="YYYY-MM-DD hh:mm"
                                placeholder="时间"
                              />
                                )}
            </FormItem>
          </Form> : <Form>
            <FormItem
              label="测量值"
              {...formItemLayout}
            >
              {getFieldDecorator('adjustObserved', {
                                   rules: [{ required: true, message: '请输入测量值' }],
                                   initialValue: record.adjustObserved || '',
                               })(
                                 <Input
                                   placeholder="测量值"
                                 />
                                   )}
            </FormItem>
            <FormItem
              label="单位"
              {...formItemLayout}
            >
              {getFieldDecorator('adjustUnit', {
                                   rules: [{ required: true, message: '请输入单位' }],
                                   initialValue: record.adjustUnit || '',
                               })(
                                 <Input
                                   placeholder="单位"
                                 />
                                   )}
            </FormItem>
            <FormItem
              label="时间"
              {...formItemLayout}
            >
              {getFieldDecorator('adjustTime', {
                                   rules: [{ required: true, message: '请输入时间' }],
                                   initialValue: record.adjustTime ? moment(record.adjustTime) : null,
                               })(
                                 <DatePicker
                                   format="YYYY-MM-DD hh:mm"
                                   placeholder="时间"
                                 />
                                   )}
            </FormItem>
          </Form>}
        </Modal>
      </div>
    );
  }
);

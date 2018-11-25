import React, {PureComponent} from 'react';
import { Modal, Radio, Form, Select, Input, InputNumber} from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const UNIT = ['NM³', 'Mpa', '℃', 'M³', 'NM³/h', 'mmg/Nm3', 'mm', 'Kpa', '吨'];
const TYPES = {
  TITLE_DIVIDER: '标题',
  DIVIDERTHICK: '分隔',
  TXT: '短文本',
  TXTEXT: '长文本',
  DATE: '日期',
  DATETIME: '时间戳',
  NUM: '数字',
  TXTSEL: '选择',
};
@Form.create()
export default class CheckItemModal extends PureComponent {
    type='TXT';
    handleTypeChange = (val) => {
      switch (val) {
        case 'NUM':
          this.type = 'NUM';
          break;
        case 'TXTSEL':
          this.type = 'SEL';
          break;
        default:
          this.type = 'TXT';
      }
    }
    render() {
      const { form, visible, onCancel, onOk, rangeData, handleCheckAlias } = this.props;
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
            visible={visible}
            title="新增检查项"
            maskClosable={false}
            onOk={onOk}
            onCancel={onCancel}
          >
            <Form>
              <FormItem
                label="检查项"
                {...formItemLayout}
              >
                {getFieldDecorator('alias', {
                            rules: [
                                { required: true, message: '请输入检查项名称' },
                                { max: 15, message: '最大长度不超过15' },
                                { validator: handleCheckAlias },
                            ],
                            initialValue: '',
                        })(
                          <Input
                            placeholder="名称"
                          />
                            )}
              </FormItem>
              <FormItem
                label="类型"
                {...formItemLayout}
              >
                {getFieldDecorator('type', {
                            rules: [{ required: true, message: '请选择数据类型' }],
                            initialValue: '',
                        })(
                          <Select
                            onChange={this.handleTypeChange}
                            placeholder="数据类型"
                          >
                            {
                                      Object.keys(TYPES).map(kk =>
                                        <Option key={kk} value={kk}>{TYPES[kk]}</Option>
                                      )
                                    }
                          </Select>
                            )}
              </FormItem>
              {this.type === 'NUM' ? <FormItem
                label="单位"
                {...formItemLayout}
              >
                {getFieldDecorator('unit', {
                            rules: [{ required: true, message: '请选择单位' }],
                            initialValue: '',
                        })(
                          <Select
                            placeholder="数据类型"
                          >
                            {
                                UNIT.map(item =>
                                  <Option key={item} value={item}>{item}</Option>
                                )
                            }
                          </Select>
                            )}
              </FormItem> : null}
              {this.type === 'SEL' ? <FormItem
                label="选择范围"
                {...formItemLayout}
              >
                {getFieldDecorator('defaultvalue', {
                            rules: [{ required: true, message: '请选择范围' }],
                            initialValue: '',
                        })(
                          <Select
                            placeholder="选择域"
                          >
                            {
                                (rangeData || []).map(item =>
                                  <Option key={item.alias} value={item.alias}>{item.alias}</Option>
                                )
                            }
                          </Select>
                            )}
              </FormItem> : null}
              {this.type === 'NUM' ? <FormItem
                label="小数位数"
                {...formItemLayout}
              >
                {getFieldDecorator('accuracy', {
                            rules: [{ required: true, message: '请输入小数位数最大不超过4位' }],
                            initialValue: '',
                        })(
                          <InputNumber
                            max={4}
                          />
                            )}
              </FormItem> : null}
              <FormItem
                label="是否必填"
                {...formItemLayout}
              >
                {getFieldDecorator('required', {
                            rules: [{ required: true, message: '请输入选择域' }],
                            initialValue: 1,
                        })(
                          <RadioGroup >
                            <Radio value={1}>是</Radio>
                            <Radio value={0}>否</Radio>
                          </RadioGroup>
                            )}
              </FormItem>
            </Form>
          </Modal>
        </div>
      );
    }
}

import React from 'react';
import PurNumModal from './PurNumModal';
import { Modal, Form, Select, Input, Row, Button, Col, InputNumber } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

@Form.create()
export default class NewPurchaseModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      purNumModalValue: '',
    };
  }
  render() {
    const { visible, handleCancel, handleOk, formData, form, typeData, materialInfo, placeInfo } = this.props;
    const { getFieldDecorator } = form;
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
    const typeOptions = (typeData || []).map(item =>
      <Option key={item.value} value={item.value}>{item.name}</Option>
    );
    return (
      <div>
        <Modal
          visible={visible}
          title="选择物料"
          maskClosable={false}
          onOk={handleOk}
          onCancel={handleCancel}
          width={700}
        >
          <Form>
            <Row gutter={10}>
              <Col span={12}>
                <FormItem
                  label="物料编号"
                  {...formItemLayout}
                  hasFeedback
                >
                  {getFieldDecorator('matnr', {
                    rules: [{ required: true, message: '请选择物料编号' }],
                    initialValue: this.state.purNumModalValue,
                  })(
                    // <Select>
                    //   <Option value={80001032}>80001032</Option>
                    //   <Option value={80001033}>80001033</Option>
                    // </Select>
                    <PurNumModal
                      placeInfo={placeInfo}
                      materialInfo={materialInfo}
                      purNumModalValue={this.state.purNumModalValue} // 并未使用
                      onChangeValue={(obj) => {
                        this.setState({
                          purNumModalValue: obj.code,
                        });
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="数量"
                  {...formItemLayout}
                  hasFeedback
                >
                  {getFieldDecorator('menge', {
                    rules: [{ required: true, message: '请填写数量' }],
                    initialValue: formData.num || '',
                  })(
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      placeholder="数量"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="净价"
                  {...formItemLayout}
                  hasFeedback
                >
                  {getFieldDecorator('netpr', {
                    rules: [{ required: true, message: '请填写净价' }],
                    initialValue: formData.jj || '',
                  })(
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      placeholder="净价"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="工厂"
                  {...formItemLayout}
                  hasFeedback
                >
                  {getFieldDecorator('werks', {
                    rules: [{ required: true, message: '请选择工厂' }],
                    initialValue: formData.fc || '',
                  })(
                    <Select>
                      {formData.fc ? <Option value={formData.fc}>{`【${formData.fc}】 ${formData.facname}`}</Option> : null}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="成本中心"
                  {...formItemLayout}
                  hasFeedback
                >
                  {getFieldDecorator('kostl', {
                    initialValue: formData.cb || '',
                  })(
                    <Select>
                      {formData.cb ? <Option value={formData.cb}>{`【${formData.cb}】 ${formData.cbname}`}</Option> : null}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="税码"
                  {...formItemLayout}
                  hasFeedback
                >
                  {getFieldDecorator('mwskz', {
                    initialValue: 'J1' || '',
                  })(
                    <Select>
                      <Option value="J1">J1</Option>
                      <Option value="J0">J0</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="业务范围"
                  {...formItemLayout}
                  hasFeedback
                >
                  {getFieldDecorator('gsber', {
                    initialValue: formData.yw || '',
                  })(
                    <Input
                      disabled
                      placeholder="业务范围"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="库存地"
                  {...formItemLayout}
                  hasFeedback
                >
                  {getFieldDecorator('lgort', {
                    initialValue: formData.kcdcode || '',
                  })(
                    <Select>
                      {formData.kcdcode ? <Option value={formData.kcdcode}>{`【${formData.kcdcode}】 ${formData.kcdname}`}</Option> : null}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="描述"
                  {...formItemLayout}
                  hasFeedback
                >
                  {getFieldDecorator('describes', {
                    initialValue: formData.describe || '',
                  })(
                    <TextArea />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  }
}

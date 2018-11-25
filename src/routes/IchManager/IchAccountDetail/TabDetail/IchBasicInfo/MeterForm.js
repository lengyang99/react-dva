import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Row, Col, Input, Button } from 'antd';
import styles from './MeterForm.less';


const FormItem = Form.Item;
@connect(state => ({
  meterDetail: state.ichAccountDetail.meterDetail,
}))
@Form.create({mapPropsToFields: (props) => {
  const { meterDetail } = props;
  return {
    contract_code: Form.createFormField({value: meterDetail.contract_code}),
    install_num: Form.createFormField({value: meterDetail.install_num}),
    contract_account: Form.createFormField({value: meterDetail.contract_account}),
    customer_desc: Form.createFormField({value: meterDetail.customer_desc}),
    eq_name: Form.createFormField({value: meterDetail.eq_name}),
    gas_equipment: Form.createFormField({value: meterDetail.gas_equipment}),
    install_pos: Form.createFormField({value: meterDetail.install_pos}),
    meter_type: Form.createFormField({value: meterDetail.meter_type}),
    run_status: Form.createFormField({value: meterDetail.run_status}),
  };
}})
export default class MeterForm extends PureComponent {
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Form>
          <Row gutter={24}>
            <Col span={12}>
              <FormItem label="合同号" className={styles.formItem}>
                {getFieldDecorator('contract_code', {
                  rules: [{
                    // required: true,
                    message: 'Input something!',
                  }],
                })(
                  <Input placeholder="合同号" className={styles.formItem_input} disabled />
                )}
              </FormItem>
              <FormItem label="安装号" className={styles.formItem}>
                {getFieldDecorator('install_num', {
                  rules: [{
                    // required: true,
                    message: 'Input something!',
                  }],
                })(
                  <Input placeholder="安装号" className={styles.formItem_input} disabled />
                )}
              </FormItem>
              <FormItem label="表钢号" className={styles.formItem}>
                {getFieldDecorator('eq_name', {
                  rules: [{
                    // required: true,
                    message: 'Input something!',
                  }],
                })(
                  <Input placeholder="表钢号" className={styles.formItem_input} disabled />
                )}
              </FormItem>
              <FormItem label="开口气量" className={styles.formItem}>
                {getFieldDecorator('开口气量', {
                  rules: [{
                    // required: true,
                    message: 'Input something!',
                  }],
                })(
                  <Input placeholder="开口气量" className={styles.formItem_input} disabled />
                )}
              </FormItem>
              <FormItem label="安装位置" className={styles.formItem}>
                {getFieldDecorator('install_pos', {
                  rules: [{
                    // required: true,
                    message: 'Input something!',
                  }],
                })(
                  <Input placeholder="安装位置" className={styles.formItem_input} disabled />
                )}
              </FormItem>
              <FormItem label="铅封号" className={styles.formItem}>
                {getFieldDecorator('铅封号', {
                  rules: [{
                    // required: true,
                    message: 'Input something!',
                  }],
                })(
                  <Input placeholder="铅封号" className={styles.formItem_input} disabled />
                )}
              </FormItem>
              <FormItem label="读表单元" className={styles.formItem}>
                {getFieldDecorator('读表单元', {
                  rules: [{
                    // required: true,
                    message: 'Input something!',
                  }],
                })(
                  <Input placeholder="读表单元" className={styles.formItem_input} disabled />
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="表类型" className={styles.formItem}>
                {getFieldDecorator('meter_type', {
                  rules: [{
                    // required: true,
                    message: 'Input something!',
                  }],
                })(
                  <Input placeholder="表类型" className={styles.formItem_input} disabled />
                )}
              </FormItem>
              <FormItem label="表型号" className={styles.formItem}>
                {getFieldDecorator('表型号', {
                  rules: [{
                    // required: true,
                    message: 'Input something!',
                  }],
                })(
                  <Input placeholder="表型号" className={styles.formItem_input} disabled />
                )}
              </FormItem>
              <FormItem label="运行状态" className={styles.formItem}>
                {getFieldDecorator('run_status', {
                  rules: [{
                    // required: true,
                    message: 'Input something!',
                  }],
                })(
                  <Input placeholder="运行状态" className={styles.formItem_input} disabled />
                )}
              </FormItem>
              <FormItem label="量程" className={styles.formItem}>
                {getFieldDecorator('量程', {
                  rules: [{
                    // required: true,
                    message: 'Input something!',
                  }],
                })(
                  <Input placeholder="量程" className={styles.formItem_input} disabled />
                )}
              </FormItem>
              <FormItem label="厂商" className={styles.formItem}>
                {getFieldDecorator('厂商', {
                  rules: [{
                    // required: true,
                    message: 'Input something!',
                  }],
                })(
                  <Input placeholder="厂商" className={styles.formItem_input} disabled />
                )}
              </FormItem>
              <FormItem label="读表人编号" className={styles.formItem}>
                {getFieldDecorator('读表人编号', {
                  rules: [{
                    // required: true,
                    message: 'Input something!',
                  }],
                })(
                  <Input placeholder="读表人编号" className={styles.formItem_input} disabled />
                )}
              </FormItem>
              <FormItem label="读表人" className={styles.formItem}>
                {getFieldDecorator('customer_desc', {
                  rules: [{
                    // required: true,
                    message: 'Input something!',
                  }],
                })(
                  <Input placeholder="读表人" className={styles.formItem_input} disabled />
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}


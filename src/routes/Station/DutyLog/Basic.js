import React, {PureComponent} from 'react';
import {Form, Input, Select, Row, Col} from 'antd';
import styles from './DutyDetail.less';

const Item = Form.Item;
const Option = Select.Option;
@Form.create()
export default class Basic extends PureComponent {
  constructor(props) {
    super(props);
  }

  handleBChange = (val) => {
    const {workTime, form} = this.props;
    const bc = (workTime || []).filter(item => item.name === val)[0];
    form.setFieldsValue({
      st: bc ? bc.startTime : '',
      et: bc ? bc.endTime : '',
    });
  }
  render() {
    const {workTime, basicData, disable,isNewbc, update} = this.props;
    const {zbr, bc, jiebanr, jiaobansj, jiebansj} = basicData || {};
    const {getFieldDecorator} = this.props.form;
    const newBc = (workTime || []).filter(item => item.name === bc)[0];
    const workTimeOptions = (workTime || []).map(item => {
      return (<Option key={item.name}>
        {item.name}
      </Option>);
    });
    return (
      <Form>
        <Row type="flex" justify="space-around">
          <Col span={6}>
            <Item
              label="值班人"
              labelCol={{span: 5}}
              wrapperCol={{span: 12}}
            >
              {getFieldDecorator('zbr', {rules: [{ required: true, message: '请填写值班人' }], initialValue: !isNewbc ? zbr : jiebanr })(<Input readOnly={update} />)}
            </Item>
          </Col>
          <Col span={6}>
            <Item
              label="接班时间"
              labelCol={{span: 5}}
              wrapperCol={{span: 12}}
            >
              {getFieldDecorator('jieban', {initialValue: !isNewbc ? jiebansj : null})(<Input readOnly />)}
            </Item>
          </Col>
          <Col span={6}>
            <Item
              label="交班时间"
              labelCol={{span: 5}}
              wrapperCol={{span: 12}}
            >
              {getFieldDecorator('jiaoban', {initialValue: !isNewbc ? jiaobansj : null})(<Input readOnly />)}
            </Item>
          </Col>
        </Row>
        <Row type="flex" justify="space-around">
          <Col span={6}>
            <Item
              label="班次"
              labelCol={{span: 5}}
              wrapperCol={{span: 12}}
            >
              {getFieldDecorator('bc', {rules: [{ required: true, message: '请填写班次' }], initialValue: !isNewbc ? bc : null})(
                <Select
                  disabled={update || disable}
                  onChange={this.handleBChange}
                >{workTimeOptions || null}</Select>)}
            </Item>
          </Col>
          <Col span={6}>
            <Item
              label="开始时间"
              labelCol={{span: 5}}
              wrapperCol={{span: 12}}
            >
              {getFieldDecorator('st', {initialValue: newBc ? newBc.startTime : null})(<Input readOnly />)}
            </Item>
          </Col>
          <Col span={6}>
            <Item
              label="结束时间"
              labelCol={{span: 5}}
              wrapperCol={{span: 12}}
            >
              {getFieldDecorator('et', {initialValue: newBc ? newBc.endTime : null})(<Input readOnly />)}
            </Item>
          </Col>
        </Row>
        {/* <Item className={styles.form_item}>
          <label className={styles.form_label}>值班人</label>
          {getFieldDecorator('zbr', {rules: [{ required: true, message: '请填写值班人' }], initialValue: !isNewbc ? zbr : jiebanr })(<Input className={styles.form_input} readOnly={update} />)}
          <span />
        </Item>
        <Item className={styles.form_item}>
          <label className={styles.form_label}>接班时间</label>
          {getFieldDecorator('jieban', {initialValue: !isNewbc ? jiebansj : null})(<Input className={styles.form_input} readOnly />)}
          <span />
        </Item>
        <Item className={styles.form_item}>
          <label className={styles.form_label}>交班时间</label>
          {getFieldDecorator('jiaoban', {initialValue: !isNewbc ? jiaobansj : null})(<Input className={styles.form_input} readOnly />)}
          <span />
        </Item>
        <Item className={styles.form_item}>
          <label className={styles.form_label}>班次</label>
          {getFieldDecorator('bc', {rules: [{ required: true, message: '请填写班次' }], initialValue: !isNewbc ? bc : null})(<Select className={styles.form_input} readOnly={update}>{workTimeOptions || null}</Select>)}
          <span />
        </Item>
        <Item className={styles.form_item}>
          <label className={styles.form_label}>开始时间</label>
          {getFieldDecorator('jieban', {initialValue: !isNewbc ? jiebansj : null})(<Input className={styles.form_input} readOnly />)}
          <span />
        </Item>
        <Item className={styles.form_item}>
          <label className={styles.form_label}>结束时间</label>
          {getFieldDecorator('jiaoban', {initialValue: !isNewbc ? jiaobansj : null})(<Input className={styles.form_input} readOnly />)}
          <span />
        </Item> */}
      </Form>
    );
  }
}

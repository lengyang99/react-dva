import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Modal, Input, Select, Row, Col, Checkbox } from 'antd';
import styles from './Dialog.less';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(state => ({
  visible: state.PatrolTargetConfig.visible,
  feedbackDetial: state.PatrolTargetConfig.feedbackDetial,
  feedbackList: state.PatrolTargetConfig.feedbackList,
}))
@Form.create({
  mapPropsToFields(props) {
    return {
      alias: Form.createFormField({ value: props.feedbackDetial.alias }),
      type: Form.createFormField({ value: props.feedbackDetial.type }),
      required: Form.createFormField({ value: props.feedbackDetial.required }),
      defaultvalue: Form.createFormField({ value: props.feedbackDetial.defaultvalue }),
    };
  },
  onValuesChange(props, value) {
    props.dispatch({
      type: 'PatrolTargetConfig/feedbackValuesChange',
      payload: value,
    });
  },
})
export default class Dialog extends PureComponent {
  handleOk = () => {
    let list = [];
    const { feedbackList, feedbackDetial, isAdd } = this.props;
    this.props.form.validateFields((err, value) => {
      if (!err) {
        if (!isAdd) { // 编辑
          feedbackList.forEach(item => {
            if (item.findex === feedbackDetial.findex) {
              list.push(feedbackDetial);
            } else {
              list.push(item);
            }
          });
        } else { // 新增
          feedbackList.forEach(item => {
            list.push(item);
          });
          list.unshift(feedbackDetial);
        }
        this.props.dispatch({
          type: 'PatrolTargetConfig/setFeedbackData',
          payload: list,
        });
        this.props.dispatch({
          type: 'PatrolTargetConfig/showModal',
          payload: false,
        });
      }
    });
  };
  handleCancel = () => {
    this.props.dispatch({
      type: 'PatrolTargetConfig/showModal',
      payload: false,
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const { visible, types, feedbackDetial } = this.props;
    return (
      <div>
        <Modal
          title="反馈项配置"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Form>
            <Row type="flex" justify="center">
              <Col span={5} className={styles.col}><label className={styles.label} htmlFor="name">名称 :</label></Col>
              <Col span={15}>
                <FormItem>
                  {getFieldDecorator('alias', {
                    rules: [{required: true, message: '不能为空'}],
                  })(
                    <Input />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row type="flex" justify="center">
              <Col span={5} className={styles.col}><label className={styles.label} htmlFor="type">数据类型 :</label></Col>
              <Col span={15}>
                <FormItem>
                  {getFieldDecorator('type', {
                    rules: [{required: true, message: '不能为空'}],
                  })(
                    <Select placeholder="请选择" allowClear >
                      {types.map(item => (
                        <Option key={item.value}>{item.name}</Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            {
              feedbackDetial.type === 'RDO' || feedbackDetial.type === 'TXTSEL' ?
                <Row type="flex" justify="center">
                  <Col span={5} className={styles.col}><label className={styles.label} htmlFor="type">选择域 :</label></Col>
                  <Col span={15}>
                    <FormItem>
                      {getFieldDecorator('defaultvalue', {
                        rules: [{required: true, message: '不能为空'}],
                      })(
                        <Input placeholder="选择域，逗号连接" />
                      )}
                    </FormItem>
                  </Col>
                </Row> :
                null
            }
            {
              feedbackDetial.type === 'TXT' || feedbackDetial.type === 'TXTEXT' || feedbackDetial.type === 'NUM' || feedbackDetial.type === 'RDO' || feedbackDetial.type === 'TXTSEL' ?
                <Row type="flex" justify="center">
                  <Col span={5} className={styles.col}><label className={styles.label} htmlFor="type">默认值 :</label></Col>
                  <Col span={15}>
                    <FormItem>
                      {getFieldDecorator('defaultvalue', {
                        rules: [{required: true, message: '不能为空'}],
                      })(
                        <Input placeholder="默认值" />
                      )}
                    </FormItem>
                  </Col>
                </Row> :
                null
            }
            {
              feedbackDetial.type === 'NUM' ?
                <Row type="flex" justify="center">
                  <Col span={5} className={styles.col}><label className={styles.label} htmlFor="type">单位 :</label></Col>
                  <Col span={15}>
                    <FormItem>
                      {getFieldDecorator('defaultvalue', {
                        rules: [{required: true, message: '不能为空'}],
                      })(
                        <Input placeholder="单位" />
                      )}
                    </FormItem>
                  </Col>
                </Row> :
                null
            }
            {
              feedbackDetial.type === 'NUM' || feedbackDetial.type === 'RDO' || feedbackDetial.type === 'TXTSEL' ?
                <Row type="flex" justify="center">
                  <Col span={5} className={styles.col}><label className={styles.label} htmlFor="type">预警范围 :</label></Col>
                  <Col span={15}>
                    <FormItem>
                      {getFieldDecorator('defaultvalue', {
                        rules: [{required: true, message: '不能为空'}],
                      })(
                        <Input placeholder="逗号连接，如：值1，值2" />
                      )}
                    </FormItem>
                  </Col>
                </Row> :
                null
            }
            {
              feedbackDetial.type === 'NUM' || feedbackDetial.type === 'RDO' || feedbackDetial.type === 'TXTSEL' ?
                <Row type="flex" justify="center">
                  <Col span={5} className={styles.col}><label className={styles.label} htmlFor="type">预警提醒说明 :</label></Col>
                  <Col span={15}>
                    <FormItem>
                      {getFieldDecorator('defaultvalue', {
                        rules: [{required: true, message: '不能为空'}],
                      })(
                        <Input placeholder="预警提醒说明" />
                      )}
                    </FormItem>
                  </Col>
                </Row> :
                null
            }
            <Row type="flex" justify="center">
              <Col span={5} className={styles.col}><label className={styles.label} htmlFor="type">是否必填 :</label></Col>
              <Col span={15}>
                <FormItem>
                  {getFieldDecorator('required', {
                    valuePropName: 'checked',
                  })(
                    <Checkbox />
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

import React, { Component } from 'react';
import { connect } from 'dva';
import propTypes from 'prop-types';
import { Form, Button, Input, Modal } from 'antd';
import fetch from '../../utils/request';

const FormItem = Form.Item;
const UNSELECTED = '-1'; // 未选中节点

class SortForm extends Component {
  static propTypes = {
    visible: propTypes.bool.isRequired,
    toggleModal: propTypes.func.isRequired,
  };

  handleClickSaveSort = () => {
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        console.log('设备分类提交失败!!!');
        return;
      }

      const gid = this.props.classification.gid;
      if (this.props.method === 'add' && gid === UNSELECTED) { // 添加1级节点
        this.props.dispatch({
          type: 'sortmanagement/setClassification',
          payload: { gid: 0 },
        });
      }
      const classification = {
        gid: this.props.form.getFieldValue('gid'),
        parentId: this.props.form.getFieldValue('parentId'),
        clsCode: this.props.form.getFieldValue('clsCode'),
        description: this.props.form.getFieldValue('description'),
      };
      fetch('/proxy/eqClassification/', {
        method: 'POST',
        body: { ...classification },
      }).then(data => {
        this.props.dispatch({
          type: 'sortmanagement/setClassification',
          payload: classification,
        });
        this.props.toggleModal(false);
        this.props.query();
      });
    });
  };

  render() {
    const { visible, toggleModal } = this.props;
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
      <div>
        <Modal
          visible={visible}
          title="添加分类"
          onCancel={toggleModal.bind(this, false)}
          footer={[
            <Button key="back" size="large" onClick={toggleModal.bind(this, false)}>返回</Button>,
            <Button key="submit" type="primary" size="large" onClick={this.handleClickSaveSort}>保存</Button>,
          ]}
        >
          <Form onSubmit={this.handleClickSaveSort}>
            <FormItem
              {...formItemLayout}
              style={{ display: 'none' }}
              label="gid"
              hasFeedback
            >
              {getFieldDecorator('gid')(
                <Input />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              style={{ display: 'none' }}
              label="parentId"
              hasFeedback
            >
              {getFieldDecorator('parentId')(
                <Input />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="分类编码"
              hasFeedback
            >
              {getFieldDecorator('clsCode', {
                rules: [{ required: true, message: '请输入分类编码!' }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="分类名称"
              hasFeedback
            >
              {getFieldDecorator('description', {
                rules: [{ required: true, message: '请输入分类名称!' }],
              })(
                <Input />
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default connect(
  state => ({
    classification: state.sortmanagement.classification,
  })
)(
  Form.create({
    mapPropsToFields(props) {
      if (props.method === 'add') {
        return {
          gid: Form.createFormField({ value: '' }),
          parentId: Form.createFormField({ value: props.classification.gid }),
          clsCode: Form.createFormField({ value: '' }),
          description: Form.createFormField({ value: '' }),
        };
      } else if (props.method === 'update') {
        return {
          gid: Form.createFormField({ value: props.classification.gid }),
          parentId: Form.createFormField({ value: props.classification.parentId }),
          clsCode: Form.createFormField({ value: props.classification.clsCode }),
          description: Form.createFormField({ value: props.classification.description }),
        };
      }
    },
  })(SortForm)
);

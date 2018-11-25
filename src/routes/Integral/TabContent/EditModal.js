import React, { PureComponent } from 'react';
import { Modal, Form, Select, Input } from 'antd';
import { connect } from 'dva';

const FormItem = Form.Item;
const Option = Select.Option;
const TextArea = Input.TextArea;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};

@connect(state => ({
  activeKey: state.integral.activeKey,
  isModalActive: state.integral.isModalActive,
  companyList: state.integral.companyList,
  unitList: state.integral.unitList,
  detail: state.integral.detail,
}))
@Form.create({
  mapPropsToFields: props => ({
    ecode: Form.createFormField({value: props.detail.ecode}),
    itemAlias: Form.createFormField({value: props.detail.itemAlias}),
    itemScore: Form.createFormField({value: props.detail.itemScore}),
    itemUnit: Form.createFormField({value: props.detail.itemUnit}),
    itemDes: Form.createFormField({value: props.detail.itemDes}),
  }),
  onValuesChange: (props, field) => {
    props.dispatch({
      type: 'integral/setDetail',
      payload: {...props.detail, ...field},
    });
  },
})
export default class EditModal extends PureComponent {
  static propTypes = {

  };
  componentDidMount() {
    this.props.dispatch({ type: 'integral/fetchUnitList' });
    this.props.dispatch({ type: 'integral/fetchCompanyList' });
  }
  handleModal = type => {
    switch (type) {
      case 'edit':
        this.props.form.validateFields(err => {
          if (!err) {
            if (this.props.detail.gid) {
              this.props.dispatch({
                type: 'integral/updateIntegral',
                payload: this.props.detail,
                callback: () => {
                  this.props.dispatch({
                    type: 'integral/fetchIntegralList',
                    payload: this.props.activeKey,
                  });
                },
              });
            } else {
              this.props.dispatch({
                type: 'integral/postIntegral',
                payload: this.props.detail,
                callback: () => {
                  this.props.dispatch({
                    type: 'integral/fetchIntegralList',
                    payload: this.props.activeKey,
                  });
                },
              });
            }
          }
        });
        break;
      case 'close':
        this.props.dispatch({
          type: 'integral/setModalActive',
          payload: false,
        });
        break;
      default:
        return 0;
    }
  };
  handleClose = () => {
    this.props.dispatch({
      type: 'integral/resetDetail',
    });
  };
  render() {
    const { isModalActive, companyList, unitList } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        title="编辑上报积分配置"
        visible={isModalActive}
        onOk={this.handleModal.bind(this, 'edit')}
        onCancel={this.handleModal.bind(this, 'close')}
        afterClose={this.handleClose}
      >
        <Form>
          <FormItem {...formItemLayout} label="公司名称">
            {getFieldDecorator('ecode', {
              rules: [{ required: true, message: '公司不能为空' }],
            })(
              <Select
                showSearch
                selectKey
                placeholder="请选择公司"
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {companyList.map(option => <Option key={option.ecode} value={option.ecode}>{option.name}</Option>)}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="积分规则别名">
            {getFieldDecorator('itemAlias', {
              rules: [{ required: true, message: '积分规则别名不能为空' }],
            })(
              <Input placeholder="请输入积分规则别名" />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="积分值">
            {getFieldDecorator('itemScore', {
              rules: [{ required: true, message: '积分值不能为空' }],
            })(
              <Input placeholder="请输入积分值" />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="积分单位">
            {getFieldDecorator('itemUnit', {
              rules: [{ required: true, message: '积分单位不能为空' }],
            })(
              <Select
                showSearch
                selectKey
                placeholder="请选择积分单位"
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {unitList.map(option => <Option key={option.unitName} value={option.unitName}>{option.unitName}</Option>)}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="描述">
            {getFieldDecorator('itemDes', {
              rules: [{ required: true, message: '描述不能为空' }],
            })(
              <TextArea />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

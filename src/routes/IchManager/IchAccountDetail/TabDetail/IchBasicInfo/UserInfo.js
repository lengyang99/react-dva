import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Form, Row, Col, Input, Button, Select, message } from 'antd';
import DetailInfo from './DetailInfo';
import styles from './UserInfo.less';


const FormItem = Form.Item;
const Option = Select.Option;
@connect(state => ({
  userDetail: state.ichAccountDetail.userDetail,
  gasList: state.ichAccountDetail.gasList,
  typeList: state.ichAccountDetail.typeList,
}))
@Form.create({
  mapPropsToFields: (props) => {
    const { userDetail } = props;
    // console.log(userDetail);
    return userDetail && {
      compCodeTxt: Form.createFormField({ value: userDetail.compCodeTxt }),
      alias: Form.createFormField({ value: userDetail.alias }),
      addrContract: Form.createFormField({ value: userDetail.addrContract }),
      contactNum: Form.createFormField({ value: userDetail.contactNum }),
      contactPhone: Form.createFormField({ value: userDetail.contactPhone }),
      contractAccount: Form.createFormField({ value: userDetail.contractAccount }),
      contractAccountDesc: Form.createFormField({ value: userDetail.contractAccountDesc }),
      customerDesc: Form.createFormField({ value: userDetail.customerDesc }),
      customerStatus: Form.createFormField({ value: userDetail.customerStatus }),
      customerType: Form.createFormField({ value: userDetail.customerType }),
      meterQuantity: Form.createFormField({ value: userDetail.meterQuantity }),
      replaceTime: Form.createFormField({ value: userDetail.replaceTime }),
      gasProperties: Form.createFormField({ value: userDetail.gasProperties }),
      customerNum: Form.createFormField({ value: userDetail.customerNum }),
      ykkqty: Form.createFormField({ value: userDetail.ykkqty }),
      contactPeople: Form.createFormField({ value: userDetail.contactPeople }),
    };
  }
})
export default class UserInfo extends PureComponent {
  handleSave = () => {
    const { form, userDetail } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', Object.assign({ gid: userDetail.gid }, values));
        this.props.dispatch({
          type: 'ichAccountDetail/editGsh',
          payload: {
            gid: this.props.userDetail.gid,
            alias: values.alias,
            contactPeople: values.contactPeople,
            contactPhone: values.contactPhone,
          },
          callback: (res) => {
            // this.props.dispatch(routerRedux.push('/ichmanager/ichAccount'));
            this.props.dispatch({
              type: 'ichAccountDetail/getIchAccountDetail',
              payload: {
                gsh_gid: this.props.userDetail.gid,
              },
            });
          },
        });
      }
    });
  };
  clickDetail = () => {
    this.props.dispatch(routerRedux.push('/workOrder-list'));
  };
  componentDidMount() {
    this.props.dispatch({
      type: 'ichAccountDetail/fetchSearchOptions',
    });
  }
  render() {
    const { gasList, typeList } = this.props;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = (x, y) => {
      return {
        labelCol: { span: x },
        wrapperCol: { span: y, push: 1 },
      };
    };
    return (
      <div className={styles.user__container}>
        <div className={styles.header}><span className={styles.header__icon} />基本信息</div>
        <div>
          <Form>
            <div>
              <Col span={12}>
                <FormItem label="公司名称" {...formItemLayout(4, 15)} >
                  {getFieldDecorator('compCodeTxt', {
                    rules: [{
                      // required: true,
                      message: 'Input something!',
                    }],
                  })(
                    <Input placeholder="公司名称" disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="系统用户名称" {...formItemLayout(4, 15)} >
                  {getFieldDecorator('customerDesc', {
                    rules: [{
                      // required: true,
                      message: 'Input something!',
                    }],
                  })(
                    <Input placeholder="系统用户名称" disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="用户别名" {...formItemLayout(4, 15)} >
                  {getFieldDecorator('alias', {
                    rules: [{
                      // required: true,
                      message: 'Input something!',
                    }],
                  })(
                    <Input placeholder="用户别名" />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="合同账户" {...formItemLayout(4, 15)} >
                  {getFieldDecorator('contractAccount', {
                    rules: [{
                      // required: true,
                      message: 'Input something!',
                    }],
                  })(
                    <Input placeholder="合同账户" disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="合同账户描述" {...formItemLayout(4, 15)} >
                  {getFieldDecorator('contractAccountDesc', {
                    rules: [{
                      // required: true,
                      message: 'Input something!',
                    }],
                  })(
                    <Input placeholder="合同账户描述" disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="用气性质" {...formItemLayout(4, 15)} >
                  {getFieldDecorator('gasProperties', {
                    rules: [{
                      // required: true,
                      message: 'Input something!',
                    }],
                  })(
                    <Select disabled>
                      {
                        gasList.map((item, index) => {
                          return (
                            <Option value={item.name}>{item.alias}</Option>
                          );
                        })
                      }
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="用户状态" {...formItemLayout(4, 15)} >
                  {getFieldDecorator('customerStatus', {
                    rules: [{
                      // required: true,
                      message: 'Input something!',
                    }],
                  })(
                    <Input placeholder="用户状态" disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="BP" {...formItemLayout(4, 15)} >
                  {getFieldDecorator('customerNum', {
                    rules: [{
                      // required: true,
                      message: 'Input something!',
                    }],
                  })(
                    <Input placeholder="BP" disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="用户类型" {...formItemLayout(4, 15)} >
                  {getFieldDecorator('customerType', {
                    rules: [{
                      // required: true,
                      message: 'Input something!',
                    }],
                  })(
                    <Select disabled>
                      {
                        typeList.map((item, index) => {
                          return (
                            <Option value={item.alias}>{item.alias}</Option>
                          );
                        })
                      }
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="联系人" {...formItemLayout(4, 15)} >
                  {getFieldDecorator('contactPeople', {
                    rules: [{
                      // required: true,
                      message: 'Input something!',
                    }],
                  })(
                    <Input placeholder="联系人" />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="联系电话" {...formItemLayout(4, 15)} >
                  {getFieldDecorator('contactPhone', {
                    rules: [{
                      // required: true,
                      message: 'Input something!',
                    }],
                  })(
                    <Input placeholder="联系电话" />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="系统联系电话" {...formItemLayout(4, 15)} >
                  {getFieldDecorator('contactNum', {
                    rules: [{
                      // required: true,
                      message: 'Input something!',
                    }],
                  })(
                    <Input placeholder="系统联系电话" disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="用气地址" {...formItemLayout(4, 15)} >
                  {getFieldDecorator('addrContract', {
                    rules: [{
                      // required: true,
                      message: 'Input something!',
                    }],
                  })(
                    <Input placeholder="用气地址" disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="置换时间" {...formItemLayout(4, 15)}>
                  {getFieldDecorator('replaceTime', {
                    rules: [{
                      // required: true,
                      message: 'Input something!',
                      // disabled: true,
                    }],
                  })(
                    <Input placeholder="置换时间" disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="表具数量" {...formItemLayout(4, 15)}>
                  {getFieldDecorator('meterQuantity', {
                    rules: [{
                      // required: true,
                      message: 'Input something!',
                      // disabled: true,
                    }],
                  })(
                    <Input placeholder="表具数量" disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="开口气量" {...formItemLayout(4, 15)}>
                  {getFieldDecorator('ykkqty', {
                    rules: [{
                      // required: true,
                      message: 'Input something!',
                      // disabled: true,
                    }],
                  })(
                    <Input placeholder="开口气量" disabled />
                  )}
                </FormItem>
              </Col>
            </div>
            <DetailInfo />
            <Row>
              <Button
                style={{ float: 'right', marginRight: '25px', marginBottom: '20px' }}
                type="primary"
                onClick={this.handleSave}
              >保存</Button>
            </Row>
          </Form>
        </div>
      </div>
    );
  }
}

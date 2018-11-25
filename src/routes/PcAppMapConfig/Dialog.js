import React, { Component } from 'react';
import { Modal, Select, Row, Col, Form } from 'antd';
import propTypes from 'prop-types';
import { connect } from 'dva';
import styles from './Dialog.less';

const Option = Select.Option;
const FormItem = Form.Item;

@connect(state => ({
  ecode: state.login.user.ecode,
  visible: state.PcAppMapConfig.visible,
  confirmLoading: state.PcAppMapConfig.confirmLoading,
  detail: state.PcAppMapConfig.detail,
  ecodeList: state.PcAppMapConfig.ecodeList,
  searchHistory: state.PcAppMapConfig.searchHistory,
  mapTpkList: state.PcAppMapConfig.mapTpkList,
}))
@Form.create({
  mapPropsToFields(props) {
    return {
      module: Form.createFormField({ value: props.detail.module }),
      name: Form.createFormField({ value: props.detail.name }),
      ecode: Form.createFormField({ value: props.detail.ecode }),
    };
  },
  onValuesChange(props, value) {
    props.dispatch({
      type: 'PcAppMapConfig/onValuesChange',
      payload: value,
    });
  },
})
export default class Dialog extends Component {
  static propTypes = {
    visible: propTypes.bool,
    confirmLoading: propTypes.bool,
  };
  static defaultProps = {
    visible: false,
    confirmLoading: false,
  };
  componentDidMount() {
    this.props.dispatch({
      type: 'PcAppMapConfig/fetchMapTpkList',
      payload: this.props.ecode,
    });
  }
  handleOk = () => {
    this.props.form.validateFields((err, value) => {
      if (!err) {
        if (this.props.detail.gid) { // 修改
          this.props.dispatch({
            type: 'PcAppMapConfig/modifyListData',
            payload: { ...value, gid: this.props.detail.gid },
            callback: () => {
              this.props.dispatch({ // 关闭弹窗
                type: 'PcAppMapConfig/showModal',
                payload: false,
              });
              this.props.dispatch({ // 重新搜索
                type: 'PcAppMapConfig/fetchListData',
                payload: {
                  ecode: this.props.searchHistory.ecode,
                  module: this.props.searchHistory.module,
                },
              });
            },
          });
        } else { // 新添加
          this.props.dispatch({
            type: 'PcAppMapConfig/addListData',
            payload: (value.name).map(item => ({
              ecode: value.ecode,
              module: value.module,
              name: item,
              text: item.split('：')[1],
            })),
            callback: () => {
              this.props.dispatch({ // 关闭弹窗
                type: 'PcAppMapConfig/showModal',
                payload: false,
              });
              this.props.dispatch({ // 重新搜索
                type: 'PcAppMapConfig/fetchListData',
                payload: {
                  ecode: this.props.searchHistory.ecode,
                  module: this.props.searchHistory.module,
                },
              });
            },
          });
        }
      }
    });
  };
  handleCancel = () => {
    this.props.dispatch({
      type: 'PcAppMapConfig/showModal',
      payload: false,
    });
  };

  render() {
    const { visible, confirmLoading, ecodeList, mapTpkList, detail } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Modal
          title="新建资源配置"
          visible={visible}
          onOk={this.handleOk}
          confirmLoading={confirmLoading}
          onCancel={this.handleCancel}
        >
          <Form>
            <Row type="flex" justify="center">
              <Col span={4} ><label className={styles.label} htmlFor="module">所属平台:</label></Col>
              <Col span={16}>
                <FormItem>
                  {getFieldDecorator('module', {
                    rules: [{required: true, message: '不能为空'}],
                  })(
                    <Select placeholder="请选择" allowClear >
                      <Option value="pc" key="pc">PC端</Option>
                      <Option value="app" key="app">移动端</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row type="flex" justify="center">
              <Col span={4}><label className={styles.label} htmlFor="ecode">企业名称:</label></Col>
              <Col span={16}>
                <FormItem>
                  {getFieldDecorator('ecode', {
                    rules: [{required: true, message: '不能为空'}],
                  })(
                    <Select placeholder="请选择" allowClear >
                      {ecodeList.map(item => (
                        <Option key={item.ecode} value={item.ecode}>{item.name}</Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row type="flex" justify="center">
              <Col span={4}><label className={styles.label} htmlFor="name">所属图层:</label></Col>
              <Col span={16}>
                <FormItem>
                  {getFieldDecorator('name', {
                    rules: [{required: true, message: '不能为空'}],
                  })(
                    <Select mode={detail.gid ? '' : 'multiple'} placeholder="可多选" allowClear >
                      {mapTpkList.map(item => (
                        <Option key={`${item.fileType}：${item.url}`} value={`${item.fileType}：${item.url}`}>{`${item.fileType}：${item.url}`}</Option>
                      ))}
                    </Select>
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

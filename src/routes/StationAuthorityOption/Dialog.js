import React, { PureComponent } from 'react';
import { Modal, Select } from 'antd';
import { connect } from 'dva';
import styles from './Dialog.less';

const Options = Select.Option;
@connect(state => ({
  visible: state.stationAuthorityOption.visible,
  confirmLoading: state.stationAuthorityOption.confirmLoading,
  siteList: state.stationAuthorityOption.siteList,
}))
export default class Dialog extends PureComponent {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     siteValue: '',
  //   };
  // }
  handleOk = () => {
    this.props.dispatch({
      type: 'stationAuthorityOption/showConfirmLoading',
      payload: true,
    });
    this.props.dispatch({
      type: 'stationAuthorityOption/showModel',
      payload: false,
    });
    // this.props.dispatch({
    //   type: 'stationAuthorityOption/showConfirmLoading',
    //   payload:
    // })
  };
  handleCancel = () => {
    this.props.dispatch({
      type: 'stationAuthorityOption/showModel',
      payload: false,
    });
  };
  // handleSelectSite = (value) => {
  //   this.setState({
  //     siteValue: value,
  //   });
  // };
  componentDidMount() {
    this.props.dispatch({
      type: 'stationAuthorityOption/fetchSiteList',
    });
  }
  render() {
    const { visible, confirmLoading, siteList } = this.props;
    return (
      <div>
        <Modal
          title="新建资源配置"
          visible={visible}
          onOk={this.handleOk}
          confirmLoading={confirmLoading}
          onCancel={this.handleCancel}
        >
          <label className={styles.label}>站点权限：</label>
          <Select
            className={styles.select}
            mode="multiple"
            placeholder="可多选"
            allowClear
            onChange={this.handleSelectSite}
          >
            {
              siteList.map((item, index) => {
                return (
                  <Options key={item.value}>{item.text}</Options>
                );
              })
            }
          </Select>
        </Modal>
      </div>
    );
  }
}

/**
 * Created by hexi on 2018/1/31.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import AddrList from './AddrList.js';

export default class ContactModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.selectdata = [];
  }

  onCheckChange = (data) => {
    this.selectdata = data;
  }

  render() {
    const { data, onCancel, onOK, visible, defaultValue, isRadio } = this.props;
    return (
      <Modal
        width={500}
        bodyStyle={{ height: '500px', overflow: 'auto' }}
        title="选择人员"
        maskClosable={false}
        visible={visible}
        onCancel={onCancel}
        onOk={() => { onOK(this.selectdata); }}
      >
        {visible ?
          <AddrList
            defaultValue={defaultValue}
            isRadio={isRadio}
            data={data}
            onCheckChange={this.onCheckChange}
          />
          : null
        }
      </Modal>
    );
  }
}

/**
 * 通讯录
 * @prop {function} onCancel -点击遮罩层或右上角叉或取消按钮的回调
 * @prop {function} onOK -点击确定回调
 * @prop {array} data - 格式：[{name:'张三',id:'11'},{name:'李四',id:'11'}]
 *                      说明：name,id必须存在，{}中name为固定key名称，其他key可随意命名
 * @prop {bool} visible - 模态框是否可见
 * @prop {bool} isRadio - 是否为单选
 * @prop {bool} defaultValue - 单选、多选默认值(单选 any 、多选string[])
 */

ContactModal.propTypes = {
  onCancel: PropTypes.func,
  onOK: PropTypes.func,
  data: PropTypes.array,
  visible: PropTypes.bool,
  isRadio: PropTypes.bool,
  defaultValue: PropTypes.arrayOf(PropTypes.string),
};

ContactModal.defaultProps = {
  onCancel: () => null,
  onOK: () => null,
  data: [],
  visible: false,
  isRadio: true,
  defaultValue: [],
};


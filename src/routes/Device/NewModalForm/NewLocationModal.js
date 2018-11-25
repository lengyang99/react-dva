import React, { PureComponent } from 'react';
import { Modal} from 'antd';
import TreeLists from '../../Location/subcomponent/TreeLists';

export default class NewLocationModal extends PureComponent {
  render() {
    const { visible, handleCancel, handleSelectLocation, handleOk} = this.props;
    return (<Modal
      visible={visible}
      title="关联位置"
      maskClosable={false}
      onOk={handleOk}
      onCancel={handleCancel}
      width={420}
      bodyStyle={{
        height: 460,
        overflowY: 'auto',
    }}
    >
      <TreeLists onSelect={handleSelectLocation} />
    </Modal>);
  }
}

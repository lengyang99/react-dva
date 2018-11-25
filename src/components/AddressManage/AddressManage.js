/**
 * Created by hexi on 2018/1/11.
 */
import {PureComponent} from 'react';
import {Modal} from 'antd';
import PropTypes from 'prop-types';
import {Link} from 'dva/router';
import TreeList from '../TreeList/index.js';

export default class AddressManage extends PureComponent {
  constructor(props) {
    super(props);
    this.selectValues = [];
  }

  getSelectValue = () => {
    return this.selectValues;
  }

  OnSelectTree = (selectedKeys, e) => {
    let treedata = this.refs.addressTree.state.treeData;
    let selectData = [];
    this.getSelectData(treedata, e.node.props.eventKey, selectData);
    this.selectValues = selectData[0];
  }

  getSelectData = (treedata, eventkey, selectData) => {
    for (let i = 0; i < treedata.length; i++) {
      if (eventkey === treedata[i].id) {
        selectData.push(treedata[i]);
        return selectData;
      }

      if (treedata[i].children && treedata[i].children.length) {
        this.getSelectData(treedata[i].children, eventkey, selectData);
      }
    }
  }

  handleAddCancel = () => {
    this.props.onCloseModal();
  }

  handleAddOK = () => {
    let params = this.getSelectValue();
    let values = {id: params.id, name: params.name};
    this.props.onSelectClick(values);
    this.props.onCloseModal();
  }


  render() {
    return (
    <Modal
      width={420}
      title="位置信息"
      visible={true}
      onCancel={this.handleAddCancel.bind(this)}
      onOk={this.handleAddOK.bind(this)}
    >
      <div style={{ overflowY: 'hidden', overflowX: 'auto'}}>
        <TreeList ref="addressTree" onSelect={this.OnSelectTree.bind(this)}></TreeList>
      </div>
    </Modal>
    );
  }
}

AddressManage.defaultProps = {
  onSelectClick: (f) => f,
  onCloseModal: (f) => f,
};

AddressManage.propTypes = {
  onSelectClick: PropTypes.func,
  onCloseModal: PropTypes.func,
};


/**
 * Created by hexi on 2018/1/11.
 */
import {PureComponent} from 'react';
import {Modal} from 'antd';
import PropTypes from 'prop-types';
import {Link} from 'dva/router';
import MalfunctionTree from '../MalfunctionTree/index.js';
import styles from './index.less';

export default class FaultSystem extends PureComponent {

  constructor(props) {
    super(props);
    this.selectValues = [];
  }

  getSelectValue = () => {
    let params = {};
    for (let i = 0; i < this.selectValues.length; i++) {
      params[`repair_${this.selectValues[i].type}`] = this.selectValues[i];
    }
    return params;
  }

  onSelectTree = (selectedKeys, e) => {
    // if (e.node.props.children) {
    //   return;
    // }
    let treedata = this.refs.MalfunctionTree.state.treeData;
    let selectData = [];
    this.getSelectData(treedata, selectData, 0, e.node.props.eventKey, treedata);
    this.selectValues = selectData;
  }

  getSelectData = (treedata, selectData, index, eventkey, getParentData) => {
    for (let i = 0; i < treedata.length; i++) {
      if (treedata[i].children && treedata[i].children.length) {
        this.getSelectData(treedata[i].children, selectData, index, eventkey, getParentData);
      }
      if (eventkey === treedata[i].id) {
        selectData.push(treedata[i].data);
        selectData[index].name = treedata[i].name;
        selectData[index].pid = treedata[i].pid;
        index++;
        this.getSelectData(getParentData, selectData, index, treedata[i].pid, getParentData);
        return;
      }
    }
  }

  handleFaultCancel = () => {
    this.props.onCloseModal();
  }

  handleFaultOK = () => {
    let values = {};
    let params = this.getSelectValue();
    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        values[key] = {id: params[key].key, name: params[key].name};
      }
    }
    this.props.onSelectClick(values);
    this.props.onCloseModal();
  }

  render() {
    return (
      <Modal
        width={420}
        title="故障体系"
        visible={true}
        onCancel={this.handleFaultCancel.bind(this)}
        onOk={this.handleFaultOK.bind(this)}
      >
        <div style={{overflowY: 'hidden', overflowX: 'auto'}}>
          <MalfunctionTree
            type="TREE"
            ref="MalfunctionTree"
            treeType="solution"
            onSelect={this.onSelectTree.bind(this)}></MalfunctionTree>
        </div>
      </Modal>
    );
  }
}

FaultSystem.defaultProps = {
  onSelectClick: (f) => f,
  onCloseModal: (f) => f,
};
FaultSystem.propTypes = {
  onSelectClick: PropTypes.func,
  onCloseModal: PropTypes.func,
}


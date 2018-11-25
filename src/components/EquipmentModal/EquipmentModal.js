/**
 * Created by hexi on 2018/1/31.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Modal} from 'antd';
import Equipment from '../Equipment/index.js';
import styles from './index.less';

export default class EquipmentModal extends Component {
  constructor(props) {
    super(props);

    this.equipData = this.props.record;
    this.state = {
      equipIndex: -1,
    };
  }

  componentWillReceiveProps(nextProps) {

  }

  handleDevClick = (record, index) => {
    this.equipData.push(record);
    this.setState({
      equipIndex: index,
    });
  }
  handleDoubleClick = (record, index) => {
    this.handleDevClick(record, index);
    this.handleEquipOK();
  }
  handleEquipCancel = () => {
    this.props.onCloseModal();
  }

  handleEquipOK = () => {
    let record = this.equipData;
    let equipValue = [];
    if (record.length > 0) {
      for (let i = 0; i < record.length; i++) {
        equipValue.push({eqcode: record[i].eqCode, dname: record[i].eqName});
      }
    }
    this.setState({oldeqData: this.equipData})
    // let addrInfo = {name: record.stationName, id: record.stationId}; // 当前设备所处的位置信息
    // this.props.onSelectClick(equipValue, addrInfo);
    this.props.onSelectClick(equipValue, record);
    this.props.onCloseModal();
  }

  rowClassName = (record, index) => {
    return index === this.state.equipIndex ? styles.selectDev : '';
  };

  render() {
    const {oldeqData} = this.props
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.equipData = selectedRows;
      },
      getCheckboxProps: record => {  
        return {defaultChecked : oldeqData && oldeqData.length > 0 && oldeqData.some(item => item.eqcode === record.eqCode)}
      },
      // selectedRowKeys: (data1, data2, data3) => {
      //   console.log('test');
      // },
    };

    return (
        <Modal
          width={1050}
          title="设备选择"
          maskClosable={false}
          visible={true}
          onCancel={this.handleEquipCancel.bind(this)}
          onOk={this.handleEquipOK.bind(this)}
        >
          <Equipment
            // onClick={this.handleDevClick}
            onDoubleClick={this.handleDoubleClick}
            tableConfig={{
              rowSelection: rowSelection,
              scroll: {x: 500},
              rowClassName: this.rowClassName.bind(this),
            }}
            sideStyle={{height: 300, overflowY: 'auto'}}
          />
        </Modal>
    );
  }
}

EquipmentModal.defaultProps = {
  onSelectClick: (f) => f,
  onCloseModal: (f) => f,
  defaultValue: '',
};

EquipmentModal.propTypes = {
  onSelectClick: PropTypes.func,
  onCloseModal: PropTypes.func,
  defaultValue: PropTypes.string,
};

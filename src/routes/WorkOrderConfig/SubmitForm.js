/**
 * Created by hexi on 2018/1/31.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import EquipmentModal from '../../components/EquipmentModal/EquipmentModal.js';
import FaultManage from '../../components/FaultSystem/FaultSystem.js';
import AddressManage from '../../components/AddressManage/AddressManage.js';
import SubmitForm from './Form.js';

export default class SubmitFormModal extends Component {
  constructor(props) {
    super(props);
    this.equipFieldName = '';
    this.faultFieldName = '';
    this.addressFieldName = '';
    this.materialFieldName = '';
    this.state = {
      showEquipModal: false, // 显示设备弹框
      equipValue: '', // 默认选中的设备
      showFaultModal: false, // 显示故障弹框
      showAddressModal: false, // 显示位置控件
      // showMaterialModal: false, // 显示物料信息
      oldeqData: [],
    };
  }

  componentWillReceiveProps(nextProps) {

  }

  validateRequired = () => {
    return this.refs.submitFormRef.validateRequired();
  }

  getValues = () => {
    return this.refs.submitFormRef.getValues();
  }

  getAttValues = () => {
    return this.refs.submitFormRef.getAttValues();
  }

  setGeomTitle = (name, value) => {
    this.refs.submitFormRef.setGeomTitle(name, value);
  }

  devHandleClick = (fieldName, value) => {
    this.equipFieldName = fieldName;
    this.setState({
      showEquipModal: true,
      equipValue: value,
    });
  }

  onSelectedEquipment = (equipValue) => {
    if (equipValue.length > 0) {
      this.refs.submitFormRef.handleChange(this.equipFieldName, equipValue);
      let equipName = '';
      for (let i = 0; i < equipValue.length; i++) {
        equipName += `${equipValue[i].eqcode}、`;
      }
      this.setState({oldeqData: equipValue})
      equipName = equipName.substring(0, equipName.length - 1);
      this.refs.submitFormRef.setDevInputValue(this.equipFieldName, equipName);
    }
  }

  onCloseEquipmentModal = () => {
    this.setState({
      showEquipModal: false,
    });
  }

  faultHandleClick = (fieldName) => {
    this.faultFieldName = fieldName;
    this.setState({
      showFaultModal: true,
    });
  }

  onSelectedFault = (values) => {
    this.refs.submitFormRef.handleChange(this.faultFieldName, values);
  }

  onCloseFaultModal = () => {
    this.setState({
      showFaultModal: false,
    });
  }

  addressHandleClick = (fieldName) => {
    this.addressFieldName = fieldName;
    this.setState({
      showAddressModal: true,
    });
  }

  onSelectedAddress = (values) => {
    this.refs.submitFormRef.handleChange(this.addressFieldName, values);
    this.refs.submitFormRef.setAddInputValue(this.addressFieldName, values.name);
  }

  onCloseAddressModal = () => {
    this.setState({
      showAddressModal: false,
    });
  }

  // materialHandleClick = (fieldName) => {
  //   this.materialFieldName = fieldName;
  //   this.setState({
  //     showMaterialModal: true,
  //   });
  // }
  //
  // onCloseModal = () => {
  //   this.setState({
  //     showMaterialModal: false,
  //   });
  // }

  onSelectClick = (datas) => {

  };
  //是否到工作流审批
  isWorkflowApproval1 = () => {
    this.props.isWorkflowA()
  }

  render() {
    return (
      <div>
        <SubmitForm
          workflowApproval={this.isWorkflowApproval1}
          data={this.props.data}
          getMap={this.props.getMap}
          geomHandleClick={this.props.geomHandleClick}
          geomSelectedPoint={this.props.geomSelectedPoint}
          column={this.props.column}
          cascade={this.props.cascade}
          ref="submitFormRef"
          devHandleClick={this.devHandleClick}
          faultHandleClick={this.faultHandleClick}
          addressHandleClick={this.addressHandleClick}
          materialHandleClick={this.materialHandleClick}
          onChangeGeomValue={this.onChangeGeomValue}
          backToForm={this.props.backToForm}
        />
        {this.state.showEquipModal ? <EquipmentModal
          onSelectClick={this.onSelectedEquipment}
          onCloseModal={this.onCloseEquipmentModal}
          defaultValue={this.state.equipValue}
          oldeqData={this.state.oldeqData}
        /> : null}
        {this.state.showFaultModal ? <FaultManage
          onSelectClick={this.onSelectedFault}
          onCloseModal={this.onCloseFaultModal}
        /> : null}
        {this.state.showAddressModal ? <AddressManage
          onSelectClick={this.onSelectedAddress}
          onCloseModal={this.onCloseAddressModal}
        /> : null}
      </div>
    );
  }
}

SubmitFormModal.defaultProps = {
  data: [],
  column: 1,
  cascade: [], // 接收参数是否包含隐藏显示
  getMap: (f) => f, // 获取地图
  geomHandleClick: (f) => f, // 选取地址，点击地址按钮之前的操作
  geomSelectedPoint: () => f, // 地址选取，选取地址之后的操作
};

SubmitFormModal.propTypes = {
  data: PropTypes.array.isRequired,
  cascade: PropTypes.array,
  column: PropTypes.number,
  getMap: PropTypes.func,
  geomHandleClick: PropTypes.func,
  geomSelectedPoint: PropTypes.func,
};

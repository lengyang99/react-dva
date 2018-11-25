import React, { PureComponent } from 'react';
import { Button, Icon, notification } from 'antd';
import { connect } from 'dva';
import propTypes from 'prop-types';
import EqHead from '../component/EqHead';
import List from './List';
import Dialog from './Dialog';
import { addOrModifyTechParam, deleteTechParam } from '../../../services/eqLedger';

@connect(
  state => ({
    funs: state.login.funs,
    gid: state.ledger.eqCustom.gid === undefined ? '' : state.ledger.eqCustom.gid,
    eqCode: state.ledger.eqCustom.eqCode,
    eqName: state.ledger.eqCustom.eqName,
    list: state.ledger.TechParamList,
  }),
)
export default class Param extends PureComponent {
  static propTypes = {
    eqCode: propTypes.string,
    gid: propTypes.oneOfType([propTypes.string, propTypes.number]).isRequired,
    eqName: propTypes.string,
    list: propTypes.array.isRequired,
  };
  static defaultProps = {
    eqName: '',
    eqCode: '',
  };
  state = {
    visible: false,
    isAdd: false,
    modalOption: {
      orderBy: '',
      fieldName: '',
      enumType: '',
      fieldValue: '',
      measureunit: '',
    },
  };
  setModalOption = modalOption => {
    this.setState({
      modalOption,
    });
  };

  fetchTheList = () => {
    this.props.dispatch({
      type: 'ledger/fetchTechParamList',
      payload: this.props.gid,
    });
  };

  toggleModal = flag => {
    this.setState({
      visible: flag,
    });
  };

  handleAdd = () => {
    // console.log("stringify: "+JSON.stringify(this.props.list));
    // console.log("length: "+this.props.list.length);
    // var person = this.props.list[this.props.list.length-1];
    // console.log("person: "+JSON.stringify(person));
    // console.log("orderBy: "+person.orderBy);
    this.setState({
      visible: true,
      isAdd: true,
      modalOption: {
        orderBy: this.props.list.length ? (this.props.list[this.props.list.length - 1].orderBy + 1) : '0',
        fieldName: '',
        enumType: '文本框',
        fieldValue: '',
        measureunit: '',
      },
    });
  };

  confirm = () => {
    const params = Object.assign(this.state.modalOption, { eqGid: this.props.gid });
    if (params.orderBy === '' || params.enumType === '') {
      notification.warn({
        message: '序号或类型为必添项！',
      });
    } else {
      addOrModifyTechParam(params).then((data) => {
        if (data.success) {
          this.fetchTheList();
          this.setState({
            visible: false,
          });
          notification.success({
            message: '提交成功',
          });
        } else {
          this.setState({
            visible: false,
          });
          notification.error({
            message: '提交失败',
          });
        }
      });
    }
  };

  deleteItem = (recod) => {
    deleteTechParam(recod.id).then((data) => {
      if (data.success) {
        this.fetchTheList();
        notification.success({
          message: '删除成功',
        });
      } else {
        notification.error({
          message: '删除失败',
        });
      }
    });
  };
  clickEdit = (param) => {
    if (param === '下拉') {
      this.setState({
        isAdd: false,
      });
    } else {
      this.setState({
        isAdd: true,
      });
    }
  };
  render() {
    const { visible, modalOption, isAdd } = this.state;
    const { eqCode, eqName, list, funs } = this.props;
    let ledger_add = true; // 设备台账添加
    for (let i = 0; i < funs.length; i++) {
      let json = funs[i];
      if (json.code == 'ledger_add') {
        ledger_add = false;
      }
    }
    return (
      <div>
        <EqHead name={eqName} id={eqCode} />
        <Button type="primary" disabled={ledger_add} onClick={this.handleAdd}><Icon type="plus" />添加</Button>
        <p className="title">技术参数</p>
        <List
          dataSource={Array.isArray(list) ? list : []}
          toggleModal={this.toggleModal}
          setModalOption={this.setModalOption}
          deleteItem={this.deleteItem}
          clickEdit={this.clickEdit}
        />
        <Dialog
          visible={visible}
          modalOption={modalOption}
          toggleModal={this.toggleModal}
          setModalOption={this.setModalOption}
          confirm={this.confirm}
          isAddModel={isAdd}
        />
      </div>
    );
  }
}

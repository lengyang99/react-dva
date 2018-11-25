import React from 'react';
import { connect } from 'dva';
import { Button, message, Form, Table } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import SearchPanel from '../commonTool/SelectPanelTool/SearchPanel';
import SubmitForm from './SubmitForm.js';

@connect(state => ({
  user: state.login.user,
  orderTypeData: state.workOrderConfig.orderTypeData,
  FormTypeid: state.workOrderConfig.FormTypeid,
  selectValue: state.workOrderConfig.selectValue,
}))
@Form.create()

export default class workOrderOverview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    this.props.dispatch({ // 事件类型数据字典
      type: 'workOrderConfig/orderTypeData',
      payload: { ecode: this.props.user.ecode },
    });
  }

  // 表单提交
  handleSubmit = e => {
    const arrGid = [];
    const arrValue = [];
    const params = this.refs.formOrderRef.getValues();
    for (const [key, value] of Object.entries(params)) {
      for (const elem of this.props.FormTypeid.values()) {
        if (elem.name === key && elem.value !== value) {
          arrGid.push(Number(elem.gid));
          arrValue.push(value || '');
        }
      }
    }
    if (arrGid.length === 0) {
      message.info('数据没有改变！无需提交！');
      return;
    }
    this.props.dispatch({ // 事件类型数据字典
      type: 'workOrderConfig/submitValue',
      payload: { gids: JSON.stringify(arrGid), values: JSON.stringify(arrValue) },
    });
    // let paramsAtt = this.refs.formOrderRef.getAttValues();
    // for (let key in paramsAtt) {
    //   if (paramsAtt.hasOwnProperty(key)) {
    //     paramsAttArray.push({ name: key, value: paramsAtt[key] });
    //   }
    // }
  };

  filterEventTypeData = (datas) => {
    const stationConfigs = [];
    for (let i = 0; i < datas.length; i++) {
      if (datas[i].eventtype !== 3) {
        stationConfigs.push({
          name: datas[i].eventname,
          value: datas[i].eventtype,
        });
      }
    }
    return stationConfigs;
  };
  onChangeOrderType = (value) => {
    this.props.dispatch({
      type: 'workOrderConfig/getOrderType',
      payload: { typeid: value.orderType, ecode: this.props.user.ecode, selectValue: value.orderType },
    });
  }

  render() {
    const orderTypeData = this.filterEventTypeData(this.props.orderTypeData);

    // 事件类型配置
    const eventTypeConfig = [{
      name: 'orderType',
      alias: '工单类型',
      valueType: 'ddl',
      value: this.props.selectValue,
      selectValues: orderTypeData,
      width: '300px',
    }];
    return (
      <PageHeaderLayout>
        <div style={{ textAlign: 'center', width: '100%', height: 'calc(100% - 175px)', minHeight: 'calc(100vh - 175px)' }}>
          <SearchPanel field={eventTypeConfig} onclick={this.onChangeOrderType} style={{ padding: '20px', marginBottom: '20px', borderBottom: '1px solid #d9d9d9' }} />
          <div style={{ width: 1000, textAlign: 'left', margin: '0 auto' }}>
            <SubmitForm
              data={this.props.FormTypeid}
              column={2}
              ref="formOrderRef"
            />
          </div>
          <div style={{ width: '100%', marginTop: '10px' }}>
            <Button
              type="primary"
              loading={this.props.btnloading}
              onClick={this.handleSubmit}
            >
              提交
            </Button>
          </div>
        </div>
      </PageHeaderLayout>
    );
  }
}


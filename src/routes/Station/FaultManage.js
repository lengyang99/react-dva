import React, {Component} from 'react';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import FaultSearch from './SearchPanel/FaultSearch';
import {connect} from 'dva';
import FaultTableList from '../../components/FaultManage/FaultTableList';
import { parse } from 'qs';

@connect(state => ({
  faultType: state.eventForm.faultType,
  faultDescript: state.eventForm.faultDescript,
  faultList: state.eventForm.faultList.eventlist,
  eventForm:state.eventForm.eventForm,

}))

export default class FaultManage extends Component {

  constructor(props) {
    super(props);
    this.initDictionary();
    // this.getEventForm();
    this.getStationList();

  }

  componentDidMount() {
    this.queryFaultList({eventtype: 5, pagesize: 100});
  }

  //获取表单信息
  getEventForm=()=>{
    const data=parse(this.props.location.search.substring(1));
    this.props.dispatch({
      type:'eventForm/getEventForm',
      eventType:5,
      callback:(res)=>{
      }
    });
  };


  handleCancel = () => {
    this.setState({ showModal: false });
    this.props.history.goBack();
  }

  queryFaultList = (params = {}) => {
    this.props.dispatch({
      type: 'eventForm/getFaultList',
      payload: params,
    })
  };

  initDictionary = () => {
    this.props.dispatch({
      type: 'eventForm/getFaultType',
      payload: {
        key: '1008'
      }
    });
    this.props.dispatch({
      type: 'eventForm/getFaultDescript',
      payload: {
        key: '1013',
      }
    });
  }
  expOnChange = (params) => {
    this.queryFaultList(params);
  };

  //获取站点下的受理人
  getStationList=()=>{
    this.props.dispatch({
      type:'eventForm/getStationUserList',
      callback:(res)=>{
        this.props.dispatch({
          type:'eventForm/getEventForm',
          eventType:6,
          stationUsers:res,
        });
      }
    });
  }

  render() {
    const data = this.props.faultList;
    return (
      <PageHeaderLayout>
        <br/>
        <div style={{backgroundColor: '#fff', minHeight: '70vh'}}>
          <FaultSearch
            extprops={this.props}
            faultType={this.props.faultType.map((item) => ({
              name: item.name,
              alias: item.alias
            }))}
            faultDescript={this.props.faultDescript.map((item) => ({
              name: item.name,
              alias: item.alias
            }))}
            formData={this.props.eventForm}
            expOnChange={this.expOnChange}
          >
          </FaultSearch>
          <div style={{marginTop: 20}}>
            <FaultTableList
              data={data}
            />
          </div>
        </div>
      </PageHeaderLayout>
    );
  }
}

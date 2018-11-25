import React,{Component} from 'react';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import DangerSearch from '../../components/DangerManage/DangerSearch';
import { parse } from 'qs';
import {connect} from 'dva';
import DangerTableList from '../../components/DangerManage/DangerTableList';
@connect(state=>({
  dangerType:state.eventForm.dangerType,
  dangerDescript:state.eventForm.dangerDescript,
  dangerList:state.eventForm.dangerList,
  eventForm:state.eventForm.eventForm,
}))
export default class DangerManage extends Component{

  constructor(props){
    super(props);
    this.initDictionary();
    // this.getEventForm();
    this.getStationList();
  }

  componentDidMount(){
    this.queryDangerList({eventtype:6,pageno:1,pagesize:100});
  }

  initDictionary=()=>{
    this.props.dispatch({
      type:'eventForm/getDangerType',
      payload:{
        key:'1019',
      }
    });
    this.props.dispatch({
      type:'eventForm/getDangerDescript',
      payload:{
        key:'1011',
      }
    });
  };



  queryDangerList=(params={})=>{
    this.props.dispatch({
      type:'eventForm/getDangerList',
      payload:params,
    });
  }

  expOnChange=(params)=>{
    this.queryDangerList(params);
  }

  //获取表单信息
  getEventForm=()=>{
      const data=parse(this.props.location.search.substring(1));
      this.props.dispatch({
        type:'eventForm/getEventForm',
        eventType:6,
        callback:(res)=>{

        }
      });
  }

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
  };

  render(){
    const data=this.props.dangerList.eventlist;
    return(
      <PageHeaderLayout>
        <br/>
        <DangerSearch
          extprops={this.props}
          dangerType={this.props.dangerDescript}
          // dangerDescript={this.props.dangerDescript}
          formData={this.props.eventForm}
          expOnChange={this.expOnChange}
        >
        </DangerSearch>
        <div style={{marginTop:20}}>
          <DangerTableList
            data={data}
            />
        </div>

      </PageHeaderLayout>
    );
  }
}



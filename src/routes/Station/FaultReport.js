import React, {PureComponent} from 'react';
import {Tabs} from 'antd';
const TabPane = Tabs.TabPane;
import {connect} from 'dva';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {Modal, Button, Spin, Steps, message} from 'antd';
import SubmitForm from "../../components/SubmitForm/SubmitForm.js";
import { parse } from 'qs';

const column=2;

@connect(({eventForm})=>({
  eventForm:eventForm.eventForm
}))

export default class FaultReport extends PureComponent{

  constructor(props){
    super(props);

    this.geom={};

    this.state={
      showModal:true
    }
    this.getEventForm();

  }

  componentDidMount(){
    //this.getEventForm();
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

  //上报表单数据
  handleOk=()=>{
    let data=parse(this.props.location.search.substring(1));
    let length=this.props.eventForm.params.length;
    let paramsObj={};
    let paramsAttArray=[];
    for(let i=0;i<length;i++) {
      let validate = this.refs['formRef_' + i].validateRequired();
      let params = this.refs['formRef_' + i].getValues();
      if (validate) {
        message.warning('字段【' + validate + '】为空！');
        return;
      }

      for (let key in params) {
        if (params.hasOwnProperty(key)&&params[key]!=null&&params[key].length>0) {
          paramsObj[key] = params[key];
        }
      }

      let paramsAtt = this.refs['formRef_' + i].getAttValues();
      for (let key in paramsAtt) {
        if (paramsAtt.hasOwnProperty(key)) {
          paramsAttArray.push({name: key, value: paramsAtt[key]});
        }
      }
    }

      let optparams={
        userid:'2',
        eventtype:5,
        properties:paramsObj
      };

      this.props.dispatch({
        type:'eventForm/reportFormEvent',
        params:optparams,
        callback:(res)=>{
          //表单上传成功后  上报附件

          if(paramsAttArray.length>0){
            this.props.dispatch({
              type:'eventForm/reportEventFile',
              formData:paramsAttArray,
              businesskey:res,
              callback:(resAtt)=>{
                  if(resAtt){
                    message.info('故障上报成功');
                    this.setState({showModal:false});
                    this.props.history.goBack();
                  }
            }
            });
          }else{
            message.info('故障上报成功');
            this.setState({ showModal: false });
            this.props.history.goBack();
          }
        }
      });
  }



  handleCancel = () => {
    this.setState({ showModal: false });
    this.props.history.goBack();
  }
  initForm=()=>{
    let params=this.props.eventForm.params;
    let forms=[];
    for(let i=0;i< params.length;i++){
      console.log(params[i].items),
        forms.push(
        <div>
          <SubmitForm data={params[i].items} key={'key'+i}  column={column} ref={'formRef_' + i}>
          </SubmitForm>
        </div>
      );
    }
    return forms;
  };

  render(){
    console.log(this.props.eventForm);
    let form=this.initForm();
    return(
      <PageHeaderLayout>
      <div>
        <Modal
          maskClosable={false}
          width={750}
          visible={this.state.showModal}
          onCancel={this.handleCancel}
          footer={null}
          wrapClassName={'web'}
          title={this.props.eventForm.tableName}>
          <div style={{'margin-top': '25px'}}>
            {form}
          </div>
          <div style={{'margin-right': '32px', 'padding-left': '8px', 'margin-top': '20px', height: '52px'}}>
            <Button style={{float: 'right'}} onClick={this.handleCancel}>取消</Button>
            <Button style={{float: 'right', 'margin-right': '16px'}} type="primary" onClick={this.handleOk}>提交</Button>
          </div>
        </Modal>
      </div>
      </PageHeaderLayout>
    );
  }
}

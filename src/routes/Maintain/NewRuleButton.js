import React, { Component } from 'react';
import {Button} from 'antd';
import {connect} from 'dva';
import NewRuleForm from './ModalForm/NewRuleForm';
const submitData={};

@connect(state => ({
  areaData: state.maintain.areaData,
  maintain: state.maintain
}))
class NewRuleButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
        visible:false,
        loading:false
    }
    
  }
    componentDidMount(){
    this.props.dispatch({
      type: 'maintain/getAreaData',
    });
  }
  form = null;
    //检查差异
    checkDiff= (functionKey) =>{
      let diff=[];
      let diffMsg={};
      switch(functionKey){
        case 'safety_check':
          diffMsg={
          formLabel:'工商户表个数',
        }
        break;
        case 'meter_read':
          diffMsg={
          formLabel:'工商户表个数'
        }
        break;
        default:
          diffMsg={
          formLabel:'维护人'
        }
      }
      diff.push(diffMsg);
      return diff;
    }
   //隐藏对话框
    handleCancel = () => {
        this.visibleStateChange();
        this.form.resetFields();
    }
    visibleStateChange=()=>{
      this.setState({visible:!this.state.visible})
    }
  //设置loading延时
  handleOk_R = () => {
    this.setState({loading: true});
    setTimeout(() => {
      this.setState({loading: false});
      this.handleCancel();
      this.props.onRulePlanFinish();
    }, 2000);

  }
  //提交表单
  handleSubmitRulePlan = (e) => {
    e.preventDefault();
    this.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let formMsg={
          startTime:values.startTime.format('YYYY-MM-DD HH:mm:ss'),
          function:this.props.functionKey,
        }
        Object.assign(submitData,formMsg)
        this.props.dispatch({
          type: 'maintain/submitRulePlan',
          payload: submitData,
        });
        this.handleOk_R();
      }
    });
  }
    render(){

        return(
            <div style={{float:'left',marginLeft:17,marginRight:12}}>
              <Button
              type="primary"
              onClick={() => {
                this.visibleStateChange()
              }}>+ 常规
              </Button>
              <NewRuleForm
                  {...this.props}
                  ref={form => {
                    this.form = form;
                  }}
                  handleCancel={this.handleCancel}
                  handleSubmitRulePlan={this.handleSubmitRulePlan}
                  visible={this.state.visible}
                  diff={this.checkDiff(this.props.functionKey)}
                  loading={this.state.loading}
                  getParams={(params)=>{
                  Object.assign(submitData,params)   
                  }}
              />
            </div>
        )
    }
}
export default NewRuleButton;
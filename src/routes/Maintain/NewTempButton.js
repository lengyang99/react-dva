import React, { Component } from 'react';
import {Button} from 'antd';
import {connect} from 'dva';
import NewTempForm from './ModalForm/NewTempForm';

const submitData={};

@connect(state => ({
  areaData: state.maintain.areaData,
  equData: state.maintain.equData,
  origEquData:state.maintain.origEquData,
  maintain: state.maintain
}))
class NewTempButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
        visible:false,
        loading:false,
        searchText:'',
    }
    
  }
    componentDidMount(){
    this.props.dispatch({
      type: 'maintain/getAreaData',
    });
  }
  form = null;
  pare
    //检查差异
    checkDiff= (functionKey) =>{
      let diff=[];
      let diffMsg={};
      switch(functionKey){
        case 'safety_check':
          diffMsg={
            hasUserItem:false,
            defaultSearchText:'工商户/地址',
            columns : [{
            title: '用户名称',
            dataIndex: 'name',
            render: text => <a href="#">{text}</a>,
        }, {
            title: '用户地址',
            dataIndex: 'address',
        }, {
            title: '表缸号',
            dataIndex: 'code',
        },
         {
            title: '用气设备',
            dataIndex: 'equName',
        }], 
        }
        break;
        case 'meter_read':
          diffMsg={
            asUserItem:false,
            defaultSearchText:'工商户/地址',
            columns: [{
              title: '用户名称',
              dataIndex: 'name',
              render: text => <a href="#">{text}</a>,
            }, {
              title: '用户地址',
              dataIndex: 'address',
            }, {
              title: '表缸号',
              dataIndex: 'code',
            },
            {
              title: '用气设备',
              dataIndex: 'equName',
            }],
        }
        break;
        default:
          diffMsg={
            hasUserItem:true,
            defaultSearchText:'阀门名称/阀门编号',
            columns : [{
            title: '设备名称',
            dataIndex: 'name',
            render: text => <a href="#">{text}</a>,
        }, {
            title: '设备编号',
            dataIndex: 'code',
        }, {
            title: '位置',
            dataIndex: 'address',
        }],
        }
      }
      diff.push(diffMsg);
      return diff;
    }

   //取消事件
    handleCancel = () => {
        this.visibleStateChange();
        this.form.resetFields();
        this.props.dispatch({
            type: 'maintain/restEquData',
            payload:{},
            });
    }
    //隐藏/显示表单
    visibleStateChange=()=>{
      this.setState({visible:!this.state.visible})
    }
  //设置loading延时
  handleOk_R = () => {
    this.setState({loading: true});
    setTimeout(() => {
      this.setState({loading: false});
      this.handleCancel();
      this.props.onTempPlanFinish();
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
            <div style={{margin:17}}>
              <Button
              type="primary"
              onClick={() => {
                this.visibleStateChange()
              }}>+ 临时
              </Button>
              <NewTempForm
                  {...this.props}
                  ref={form => {
                    this.form = form;
                  }}
                  handleCancel={this.handleCancel}
                  handleSubmitRulePlan={this.handleSubmitRulePlan}
                  visible={this.state.visible}
                  diff={this.checkDiff(this.props.functionKey)}
                  loading={this.state.loading}
                  searchText={this.state.searchText}
                  searchTextChange={(searchText)=>{
                    this.setState({searchText:searchText})
                  }}
                  getParams={(params)=>{
                  Object.assign(submitData,params)   
                  }}
              />
            </div>
        )
    }
}
export default NewTempButton;
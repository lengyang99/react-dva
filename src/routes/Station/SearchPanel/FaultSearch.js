import React,{Component} from 'react';
import styles from './FaultSearch.less'
import PropTypes from 'prop-types';
import {routerRedux, Link} from 'dva/router';
import SubmitForm from "../../../components/SubmitForm/SubmitForm.js";
import { parse } from 'qs';
import Equipment from '../../../components/Equipment/index';
import styles2 from '../../Ledger/ledger/EqModal.less';

import {Modal,Button,Input,DatePicker,Icon,Select,message} from 'antd'
const {RangePicker}=DatePicker;


const defaultState={
    eventtype:5,//事件类型
    gzleixing:'',//故障类型
    gzwenti:'',//故障问题
    reporttime:[null,null],//时间区间
    ext:'', //扩展字段
    eventstate:'',//事件状态
    pageno:1,//当前页
    pagesize:100//页码数
}

export default class FaultSearch extends Component{

  constructor(props){
    super(props);
    this.state={
      ...defaultState,
      showModal:false,
      showEquipModal:false,
      column:2,
      expand:false,
      equipName:'',
      select:{
        index:null,
        record:{},
      },
    }
  }

  toggle=()=>{
    this.setState({
      expand:!this.state.expand
    });
  };

  rangeChangeHandle=(dates)=>{
    this.setState({
      reporttime:dates
    });
  };

  onClickDevBtn=(name)=>{
    this.setState({
      showEquipModal:true,
      equipName:name,
    });
  };

  likeChangeHandle=(e)=>{
    this.setState({ext:e.target.value});
  };

  rowClassName = (record, index) => {
    return index === this.state.select.index ? styles2.select : '';
  };

  handleClick = (record, index) => {
    this.setState({
      select: {
        record,
        index,
      },
    }, () => {
      this.rowClassName();
    });
  };
  handleDoubleClick = (record, index) => {
    this.handleClick(record, index);
    this.setState({showEquipModal: false});
  }
  queryHandle=()=>{
    this.props.expOnChange(this.getExpData());
  };
  
  resetHandle=()=>{
    this.setState(defaultState);
  };

  faultTypeChange=(value)=>{
    this.setState({
      gzleixing:value
    });
  };

  faultDescriptChange=(value)=>{
    this.setState({
      gzwenti:value
    });
  };

  getExpData=()=>{
    const {eventtype,gzleixing,gzwenti,reporttime:[st,et],ext,eventstate,pageno,pagesize}=this.state;
    let reporttime='';
    if(st!=null){
      reporttime= st.format('YYYY-MM-DD 00:00:00');
    }

    if(et!=null){
      reporttime=reporttime+'`'+et.format('YYYY-MM-DD 23:59:59');
    }
    return {
      reporttime,
      eventtype,
      gzleixing,
      gzwenti,
      ext,
      eventstate,
      pageno,
      pagesize
    };
  };

  handleCancel = () => {
    this.setState({
      showModal: false,
      showEquipModal:false,
    });
  };
  handleEquipCancel=()=>{
    this.setState({
      showEquipModal:false,
    });
  };

  //上报表单数据
  handleOk=()=>{
    let length=this.props.formData.params.length;
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

    this.props.extprops.dispatch({
      type:'eventForm/reportFormEvent',
      params:optparams,
      callback:(res)=>{
        //表单上传成功后  上报附件
        if(paramsAttArray.length>0){
          this.props.extprops.dispatch({
            type:'eventForm/reportEventFile',
            formData:paramsAttArray,
            businesskey:res,
            callback:(resAtt)=>{
              if(resAtt){
                message.info('故障上报成功');
                this.setState({showModal:false});
                this.props.expOnChange(this.getExpData());
                //this.props.history.goBack();

              }
            }
          });
        }else{
          message.info('故障上报成功');
          this.setState({ showModal: false });
          this.props.expOnChange(this.getExpData());
          //this.props.history.goBack();
        }
      }
    });


  };

  handleEquipOK=()=>{
    this.setState({
      showEquipModal:false,
      equipValue:this.state.select.record.eqName,
    },()=>{
      this.refs['formRef_0'].setDevInputValue(this.state.equipName,this.state.equipValue);
    });
  }

  initForm=()=>{
    let params=this.props.formData.params;
    let forms=[];
    for(let i=0;i< params.length;i++){
      console.log(params[i].items),
        forms.push(
          <div>
            <SubmitForm
              data={params[i].items}
              key={'key'+i}
              column={this.state.column}
              ref={'formRef_' + i}
              devHandleClick={this.onClickDevBtn}
            />
          </div>
        );
    }
    return forms;
  }

//故障上报
  faultRepoert=()=>{
    this.setState({
        showModal:true,
    });


  }

  render(){
    const res=this.props.formData.tableName;
    let form=this.initForm();

    //故障问题类型
    const faultTypeArray=this.props.faultType;
    const faultTypeOptions=faultTypeArray.map(ii=>
    <Select.Option key={ii.name}>
      {ii.alias}
    </Select.Option>
    );
  //故障问题
    const faultDescriptArray=this.props.faultDescript;
    const faultDescriptOption=faultDescriptArray.map(ii=>
      <Select.Option key={ii.name}>
        {ii.alias}
      </Select.Option>
    );
    const {expand}=this.state;

  return(
    <div>
      <div >
      <div>
        <label>上报时间：</label>
        <div className={styles['field-block']}>
          <RangePicker style={{with:200}}
                       value={this.state.reporttime}
                       onChange={this.rangeChangeHandle}
          />
        </div>
        <div className={styles['field-block']}>
          <label>快速：</label>
          <Input placeholder="事件编号/上报人/事件地址/备注"
                style={{width:222}}
                className={styles.input}
                 value={this.state.ext}
                 onChange={this.likeChangeHandle}
          />
        </div>
        <div className={styles['field-block']} style={
          Object.assign({
            position: 'relative',
          }, expand ? {top: 40} : {})}>
          <Button style={{marginRight: 20}} type="primary" onClick={this.queryHandle}>查询</Button>
          <Button  onClick={this.resetHandle}>重置</Button>
          <a style={{marginLeft: 8, fontSize: 12}} onClick={this.toggle}>
            {expand ? '收起' : '展开'}<Icon type={expand ? 'up' : 'down'}/>
          </a>
        </div>
      </div>
        <div style={{
          paddingTop:10,
          display:expand?'block':'none',
        }}>
        <div className={styles['field-block']}>
          <label>故障类别：</label>
          <Select   style={{width:240,marginRight:42}}
                    className={styles['field-block']}
                    value={this.state.gzleixing}
                    onChange={this.faultTypeChange}
          >
            {faultTypeOptions}
          </Select>
        </div>
        <div className={styles['field-block']}>
          <label>故障问题：</label>
          <Select  style={{width:240}}
                  className={styles['field-block']}
                  value={this.state.gzwenti}
                  onChange={this.faultDescriptChange}
          >
            {faultDescriptOption}
          </Select>
        </div>
        </div>
        <div style={{marginTop:20}}>
          <Button  type="primary" onClick={this.faultRepoert}>
            {/*<Link to={`/station/FaultReport`}>故障上报</Link>*/}
            故障上报
          </Button>
        </div>
      </div>

      <div>
        <Modal
          maskClosable={false}
          width={800}
          visible={this.state.showModal}
          onCancel={this.handleCancel}
          footer={null}
          wrapClassName={'web'}
          title={this.props.formData.tableName}
        >
          <div style={{'margin-top': '25px'}}>
            {form}
          </div>
          <div style={{'margin-right': '32px', 'padding-left': '8px', 'margin-top': '20px', height: '52px'}}>
            <Button style={{float: 'right'}} onClick={this.handleCancel}>取消</Button>
            <Button style={{float: 'right', 'margin-right': '16px'}} type="primary" onClick={this.handleOk.bind(this)}>提交</Button>
          </div>
        </Modal>
      </div>

      <div>
        <Modal
          width={1050}
          maskClosable={false}
          wrapClassName={'web'}
          visible={this.state.showEquipModal}
          onCancel={this.handleEquipCancel}
          onOk={this.handleEquipOK.bind(this)}
        >
          <Equipment
            onClick={this.handleClick}
            onDoubleClick={this.handleDoubleClick}
            tableConfig={{
              scroll: { x: 500 },
              rowClassName: this.rowClassName,
            }}
            sideStyle={{ height: 300, overflowY: 'auto' }}
          />
        </Modal>
      </div>
    </div>
  );
  }

}
/**
 * 查询和重置的按钮都会触发expOnChange
 * 返回查询条件对应的值
 * @type {{faultType: Array, faultDescript: Array}}
 */
FaultSearch.defaultProps={
  faultType:[],//故障类型
  faultDescript:[],//故障问题
  formData:{
    tableName:'',
    params:[],
  },
  expOnChange:f=>f
};

FaultSearch.propTypes={
  faultType:PropTypes.array,
  expOnChange:PropTypes.func,
  faultDescript:PropTypes.array,
  formData:PropTypes.object,

};



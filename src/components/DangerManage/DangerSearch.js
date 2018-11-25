import React,{PureComponent} from 'react';
import {DatePicker,Input,Select,Button,Modal,Icon,message} from 'antd'
import PropTypes from 'prop-types';
const {RangePicker}=DatePicker;
import styles from './DangerSearch.less';
import styles2 from '../../routes/Ledger/ledger/EqModal.less';

import SubmitForm from "../SubmitForm/SubmitForm";

import Equipment from '../Equipment/index';
const defaultState={
    eventtype:6,//事件类型
    yhleixing:'',//隐患类型
    yhwenti:'',//隐患问题
    reporttime:[null,null],//时间区间
    ext:'',//事件状态
    pageno:1,//
    pagesize:100,//页码数
}

class DangerSearch extends PureComponent{

  constructor(props){
    super(props);
      this.state={
        ...defaultState,
      showModal:false,
      showEquipModal:false,
      column:2,
      expand:false,
      dangerDescript:[],
      equipValue:'',
      equipName:'',
      select: {
        index: null,
        record: {},
      },
    }
  }

  toggle=()=>{
    this.setState({
      expand:!this.state.expand,
    });
  };

  dangerTypeChange=(value)=>{
    let yhwentis=[];
    const yhleixingArray=this.props.dangerType;

    for(let i=0;i<yhleixingArray.length;i++){
      if(yhleixingArray[i].name==value){
        yhwentis=yhleixingArray[i].selectValues;
      }
    }
    this.setState({
      yhleixing:value,
      dangerDescript:yhwentis,
    });
  };

  dangerDescriptChange=(value)=>{
    this.setState({
      yhwenti:value,
    });
  }

  dangerRepoert=()=>{
    this.setState({
      showModal:true,
    });
  };
  handleCancel=()=>{
    this.setState({
      showModal:false,
    });
  };
  handleEquipCancel=()=>{
      this.setState({
        showEquipModal:false,
      });
  };

  queryHandle=()=>{
    this.props.expOnChange(this.getExpData());
  };

  resetHandle=()=>{
    this.setState(defaultState);
  };

  rangeChangeHandle=(datas)=>{
    this.setState({
      reporttime:datas
    });
  };

  onClickDevBtn=(name)=>{
      this.setState({
        showEquipModal:true,
        equipName:name,
      });
  };

  setDevInputValue=(name, val)=>{
    this.setState({
      [name]: val
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


  handleEquipOK=()=>{
    this.setState({
      showEquipModal:false,
      equipValue:this.state.select.record.eqName,
    },()=>{
      this.refs['formRef_0'].setDevInputValue(this.state.equipName,this.state.equipValue);
    });

  };



  initForm=()=>{
    let params=this.props.formData.params;
    let forms=[];
    for(let i=0;i<params.length;i++){
      forms.push(
        <div>
          <SubmitForm
            data={params[i].items}
            key={'key'+i}
            column={this.state.column}
            ref={'formRef_'+i}
            devHandleClick={this.onClickDevBtn}
          />
        </div>
      );
      return forms;
    }
  }


  getExpData=()=>{
    const {eventtype,yhleixing,yhwenti,reporttime:[st,et],ext,pageno,pagesize}=this.state;
    let reporttime='';
    if(st!=null){
      reporttime=st.format('YYYY-MM-DD 00:00:00');
    }
    if(et!=null){
      reporttime=reporttime+'`'+et.format('YYYY-MM-DD 23:59:59');
    }
    return{
      reporttime,
      eventtype,
      yhleixing,
      yhwenti,
      ext,
      pageno,
      pagesize
    };
  }

  //上报表单数据
  handleOk=()=>{
    let length=this.props.formData.params.length;
    let paramsObj={};
    let paramsAttArray=[];
    for(let i=0;i<length;i++){
      let validate=this.refs['formRef_'+i].validateRequired();
      let params=this.refs['formRef_'+i].getValues();
      if(validate){
        message.warning('字段【'+validate+'】为空！');
        return;
      }

      for(let key in params){
        if(params.hasOwnProperty(key)&&params[key]!=null&&params[key].length>0){
          paramsObj[key]=params[key];
        }
      }
      let paramsAtt=this.refs['formRef_'+i].getAttValues();
      for(let key in paramsAtt){
        if(paramsAtt.hasOwnProperty(key)){
          paramsAttArray.push({name:key,value:paramsAtt[key]});
        }
      }
    }

    let optparams={
      userid:'2',
      eventtype:6,
      properties:paramsObj
    };

    this.props.extprops.dispatch({
      type:'eventForm/reportFormEvent',
      params:optparams,
      callback:(res)=>{
        if(paramsAttArray.length>0){
          this.props.extprops.dispatch({
            type:'eventForm/reportEventFile',
            formData:paramsAttArray,
            businesskey:res,
            callback:(resAtt)=>{
              if(resAtt){
                message.info('隐患上报成功');
                this.setState({showModal:false});
                this.props.expOnChange(this.getExpData());
              }
            }
          });
        }else{
          message.info('隐患上报成功');
          this.setState({showModal:false});
          this.props.expOnChange(this.getExpData());
        }
      }
    });
  };


  render(){
    const res=this.props.formData.tableName;
    let form=this.initForm();

    const expand=this.state.expand;
    const dangerTypeArray=this.props.dangerType;
    const dangerTypeOption=dangerTypeArray.map(ii=>
    <Select.Option key={ii.name}>
      {ii.alias}
    </Select.Option>
    );
    let dangerDesciptArray=[];
    if(this.state.dangerDescript!=null&&this.state.dangerDescript.length>0){
      dangerDesciptArray=this.state.dangerDescript;
    }else{
      let dangerwentis=[];
      for(let i=0;i<dangerTypeArray.length;i++){
        dangerTypeArray[i].selectValues.map(ii=>{
            dangerwentis.push(ii);
          }
        );
      }
      dangerDesciptArray=dangerwentis;
    }
    const dangerDescriptOption=dangerDesciptArray.map(ii=>
      <Select.Option key={ii.name}>
        {ii.alias}
      </Select.Option>
    );

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
              <div className={styles['field-block']}style={
                Object.assign({
                  position:'relative',
                },expand?{top:40}:{})
              }>
                <Button style={{marginLeft:20}} type="primary" onClick={this.queryHandle}>查询</Button>
                <Button style={{marginLeft:20}} onClick={this.resetHandle}>重置</Button>
                <a style={{marginLeft:8,fontSize:12}} onClick={this.toggle}>
                  {expand?'收起':'展开'}<Icon type={expand?'up':'down'}/>
                </a>
              </div>
            </div>

          </div>
          <div style={{
            paddingTop:10,
            display:expand?'block':'none',
          }}>
            <div className={styles['field-block']}>
              <label>隐患类别：</label>
              <Select   style={{width:240,marginRight:42}}
                        className={styles['field-block']}
                        value={this.state.yhleixing}
                        onChange={this.dangerTypeChange}
                        allowClear
              >
                {dangerTypeOption}
              </Select>
            </div>
            <div className={styles['field-block']}>
              <label>隐患问题：</label>
              <Select  style={{width:240}}
                       className={styles['field-block']}
                       value={this.state.yhwenti}
                       onChange={this.dangerDescriptChange}
                       allowClear
              >
                {dangerDescriptOption}
              </Select>
            </div>
          </div>

          <div style={{marginTop:20}}>
            <Button  type="primary" onClick={this.dangerRepoert}>
              {/*<Link to={`/station/FaultReport`}>故障上报</Link>*/}
              隐患上报
            </Button>
          </div>
        </div>

        <div>
          <Modal
            maskClosable={false}
            width={800}
            visible={this.state.showModal}
            onCancel={this.handleCancel.bind(this)}
            footer={null}
            wrapClassName={'web'}
            // title={this.props.formData.tableName}
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
            title="设备选择"
            maskClosable={false}
            wrapClassName={'web'}
            visible={this.state.showEquipModal}
            onCancel={this.handleEquipCancel}
            onOk={this.handleEquipOK.bind(this)}
          >
            <Equipment
              onClick={this.handleClick}
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

DangerSearch.defaultProps={
  dangerType:[],
  // dangerDescript:[],
  formData:{
    tableName:'',
    params:[],
  },
  expOnChange:f=>f
};

DangerSearch.propTypes={
  dangerType:PropTypes.array,
  // dangerDescript:PropTypes.array,
  formData:PropTypes.object,
  expOnChange:PropTypes.func,

};

export default DangerSearch;

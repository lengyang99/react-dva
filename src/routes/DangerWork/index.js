import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { parse } from 'qs';
import moment from 'moment';
import _ from 'lodash';
import { Modal, Button, Spin, Steps, message, Select } from 'antd';
import EcityMap from '../../components/Map/EcityMap';
import styles from './index.less';
import SubmitForm from '../commonTool/SubmitFormModal/SubmitFormModal';
import parseValues from '../../utils/utils';
const datetimeFormat = 'YYYY-MM-DD HH:mm:ss'
const column = 2;
const Step = Steps.Step;

@connect(state => ({
  formData: state.device.formDangerData,
  userInfo: state.login.user,
  workDetail: state.dangerWork.dangerWorkEdit,
}))

class DangerWork extends Component {
  constructor(props) {
    super(props);
    this.map = null;
    this.wocode = '';
    this.sqdno = '';
    this.gid = '';
    this.taskId = '';
    this.taskType = '';
    this.newplan = '';
    this.isComAgain = 0;
    this.geom = {};
    this.geomData = {};
    this.dataType = 0; // 区分当前表单数据是事件表单还是工单表单， 0事件，1工单
    this.state = {
      loading: true, // 控制是否显示加载效果
      btnloading: false, // 控制按钮等待效果
      showModal: true,
      leadArr: [], //审批人数组
      lead: '', //审批人
      isShowlead: false,
      replacement: {}, //碰接置换提交的数据
      json: {}, //提交的数据
      secondData: {}, //第二次提交的数据（gid,sqdno）
    };

    this.initParams();
  }

  componentDidMount(){
    console.log('componentDidMount')
  }

  componentWillUnmount(){
    //清楚详情数据
    this.props.dispatch({
      type: 'dangerWork/delDangerWorkData',
    });
  }


  // 绑定地图对象
  bindMap = (map) => {
    this.map = map;
  }

  // 获取表单信息
  getFormData = () => {
    this.props.dispatch({
      type: 'device/getDangerFormData',
      payload: {
        formId: 3820
      },
      callback: (res) => {
        console.log(res, 'getFormData')
        this.setState({
          loading: false,
        });
      },
    });
  };

  //获取表单详情
  getFormDetailData = () => {
    this.props.dispatch({
      type: 'dangerWork/dangerWorEdit',
      payload: {
        sqdno: this.sqdno,
      },
      callback: (res) => {
        console.log(res, 'getFormDetailData')
        this.setState({loading: false,});
      },
    });
  };

  initParams = () => {
    const { location: { search } } = this.props;
    const {wocode, taskType, taskId, newplan, sqdno, gid} = parseValues(search) || {};
    this.wocode = wocode;
    this.sqdno = sqdno;
    this.taskType = taskType;
    this.taskId = taskId;
    this.newplan = newplan;
    this.gid = gid;
    if(newplan === 'newplan' || newplan === undefined){
      this.getFormData();
    }else if(newplan === 'editplan'){
      this.getFormDetailData();
    }
  }

  // 上报表单数据
  handleOk = () => {
    // let data = parse(this.props.location.search.substring(1));
    let length = this.newplan === 'editplan' ? this.props.workDetail.params.length : this.props.formData.length;
    // let length = this.props.formData.length;
    let paramsObj = {};
    let paramsAttArray = [];

    for (let i = 0; i < length; i++) {
      let validate = this.refs[`formRef_${i}`].validateRequired();
      let params = this.refs[`formRef_${i}`].getValues();
      if (validate) {
        message.warning(`字段【${validate}】为空！`);
        return;
      }
      for (let key in params) {
        if (params.hasOwnProperty(key)) {
          paramsObj[key] = params[key];
        }
      }

      let paramsAtt = this.refs[`formRef_${i}`].getAttValues();
      for (let key in paramsAtt) {
        if (paramsAtt.hasOwnProperty(key)) {
          paramsAttArray.push({ name: key, value: paramsAtt[key] });
        }
      }
    }

    Object.assign(paramsObj, this.geomData);
    const {gid, ecode, username, role, groupName} = this.props.userInfo

    const {effect_end_date, danger_task_plan_date, scene_cantor, address, task_implementer, task_level, task_type, security_custody, task_operator, remark} = paramsObj
    const {formData, workDetail} = this.props;

    let cantorS = []; //现场指挥
    let custodyS = []; //安全监护
    let operatorS = []; //运营人员
    let leverS = '';
    let typeS = '';
    let lock = false;
    formData && formData.length > 0 && formData[0].items.map(item => {
      lock = true;
    //   if(item.type === 'CONTACTM'){
    //     if(item.name === 'scene_cantor'){
    //       // const valueStr = scene_cantor.replace(/\[|]/g, "")
    //       // const xczh = valueStr ? valueStr.split(",") : []
    //       // this.checkUser(valueStr, 'scene_cantor')
    //       this.checkUser(scene_cantor.toString(), 'scene_cantor')
    //       item.selectValues.map(item1 => {
    //         if(scene_cantor.includes(item1.name)){
    //           cantorS.push({itcode: item1.name, name: item1.alias})
    //         }
    //       })
    //     }
    //     if(item.name === 'security_custody'){
    //       this.checkUser(security_custody.toString(), 'security_custody')
    //       item.selectValues.map(item1 => {
    //         if(security_custody.includes(item1.name)){
    //           custodyS.push({itcode: item1.name, name: item1.alias})
    //         }
    //       })
    //     }
    //     if(item.name === 'task_operator'){
    //       this.checkUser(task_operator.toString(), 'task_operator')
    //       item.selectValues.map(item1 => {
    //         if(task_operator.includes(item1.name)){
    //           operatorS.push({itcode: item1.name, name: item1.alias})
    //         }
    //       })
    //     }
    //   }
      if(item.name === 'task_level'){
        item.selectValues.map(item1 => {
          if(item1.name === task_level){
            leverS = item1.alias;
          }
        })
      }
      if(item.name === 'task_type'){
        item.selectValues.map(item1 => {
          if(item1.name === task_type){
            typeS = item1.alias;
          }
        })
      }
      lock = false;
    })
    let item = []
    if(this.newplan === 'editplan'){

      const {commander, guardian, plandate, type, lever, address_geom, enddate, implimenter, introduction, address, operator} = paramsObj
      // workDetail.params && workDetail.params[0].item.map(item => {
      //   if(item.name === 'task_type'){
      //     item.selectValues.map(item1 => {
      //       if(item1.name === task_type){
      //         typeS = item1.alias;
      //       }
      //     })
      //   }
      // })
      item = [{plandate, enddate, commander, address, implimenter: [{itcode:'',name: implimenter}], lever, type, guardian, operator}];
    }else{
      item = [{plandate: danger_task_plan_date, enddate: effect_end_date, commander: scene_cantor, address, implimenter: [{itcode:'',name: task_implementer}], lever: leverS, type: typeS, guardian: security_custody, operator: task_operator}];
    }
    let json = {
      bukrs: ecode, //ecode,
      // item: [{plandate: danger_task_plan_date, enddate: effect_end_date, commander: cantorS, address, implimenter: [{itcode:'',name: task_implementer}], lever: leverS, type: typeS, guardian: custodyS, operator: operatorS}],
      item,
      projectname: paramsObj.projectname,
      introduction: remark ? remark : paramsObj.introduction,
      proposer: username,
      proposerdepart: groupName,//role,
      attachurl: "",
      pageurl: `${window.location.origin}/proxy/order/workOrder-list-detail`,   //跳转路径
      applytime: moment().format(datetimeFormat), //当前时间
      sqdno: this.newplan === 'editplan' ? this.sqdno : this.wocode, //跳转过来的
      businesstype: '',
      approver: this.state.lead,
    };
    this.setState({json})
    console.log(json, 'optparams')
    if(!lock){
      this.setState({btnloading: true,});
      const paramsSub = {
        dangerwork: json,
        isComAgain: this.isComAgain,
        isEdit: this.newplan === 'editplan' ? 1 : 0,
        geom: Object.keys(this.geom).length > 0 ? `${this.geom.x},${this.geom.y}` : paramsObj.address_geom,
        ecode,
        gid: this.newplan === 'editplan' ? this.gid : '',
      }
      console.log(json, 'jjjjjjjjjjj')
      console.log(paramsSub, '提交数据')
      this.submitEventForm(json, paramsSub, paramsAttArray);
    }
  };
  //确认负责人提交
  handleOkSec = () => {
    let length = this.props.formData.length;
    let paramsObj = {};
    let paramsAttArray = [];

    for (let i = 0; i < length; i++) {
      let params = this.refs[`formRef_${i}`].getValues();
      for (let key in params) {
        if (params.hasOwnProperty(key)) {
          paramsObj[key] = params[key];
        }
      }

      let paramsAtt = this.refs[`formRef_${i}`].getAttValues();
      for (let key in paramsAtt) {
        if (paramsAtt.hasOwnProperty(key)) {
          paramsAttArray.push({ name: key, value: paramsAtt[key] });
        }
      }
    }

    Object.assign(paramsObj, this.geomData);
    let json = Object.assign({}, this.state.json);
    json.approver = this.state.lead;
    json.sqdno = this.state.secondData.sqdno;
    const secGid = this.state.secondData.gid;
    this.setState({
      btnloading: true,
    });
    const paramsSub = {
      dangerwork: json,
      isComAgain: this.isComAgain,
      isEdit: this.newplan === 'editplan' ? 1 : 0,
      geom: `${this.geom.x},${this.geom.y}`,
      ecode: this.props.userInfo.ecode,
      gid: this.newplan === 'editplan' ? this.gid : secGid,
    }
    console.log(json, 'jjjjjjjjjjj')
    console.log(paramsSub, '提交数据')
    this.submitEventForm(json, paramsSub, paramsAttArray)


  }

  submitEventForm = (json, paramsSub, formData) => {
    const {ecode, username, gid} = this.props.userInfo

    this.props.dispatch({
      type: 'submitFormManage/dangerWork',
      params:  JSON.stringify(paramsSub),
      formData,
      userInfo: this.props.userInfo,
      callback: (flag, res) => {
        console.log(flag, res, 'resssss')
        if(res.code === '0'){
          if(this.newplan === 'newplan' || this.newplan === 'editplan'){
            message.info('上报成功');
            this.setState({ showModal: false, btnloading: false, isShowlead: false });
            this.props.history.goBack();
          }else if(this.newplan === undefined){
            this.handReplacement(formData, res.data);
          }
        }else if(res.code === '1'){
          const leadArr = res.msg.split(",")
          this.setState({
            leadArr,
            isShowlead: true,
            btnloading: false,
            secondData: res.data,
          })
        }else if(res.code === '2' || !res.success){
          message.error(res.msg);
          this.setState({ btnloading: false});
        }
      }
    });
  };

  checkUser = (valueStr, fileName) => {
    if(this.newplan === 'newplan'){
      return
    }
    this.props.dispatch({
      type: 'submitFormManage/getUserName',
      params: valueStr,
      callback: (res) => {
        if(res.error){
          message.info('查询人员失败！');
          this.setState({btnloading: false})
          return
        }
        let replacement = Object.assign({}, this.state.replacement);
        let replacementArr = []
        res && res.items.map(item => {
          replacementArr.push(item.gid)
        })
        replacement[fileName] = replacementArr
        this.setState({replacement})
        console.log(res, replacement,'ewssssssssss')
      }
    });
  }

  submitAttach = (res, paramsAttArray, paramsObj) => {
    // 上报成功之后再上报附件
    // 当存在附件字段提交附件
    if (paramsAttArray.length > 0) {
      this.props.dispatch({
        type: 'submitFormManage/submitAttach',
        formData: paramsAttArray,
        attInfo: res ? res.data : '',
        userInfo: this.props.userInfo,
        callback: (resAtt, data) => {
          if(resAtt){
            if(this.newplan === 'newplan'){
              message.info('上报成功');
              this.setState({ showModal: false, btnloading: false, isShowlead: false });
              this.props.history.goBack();
            }else{
              this.handReplacement(paramsAttArray, data)
            }
          }else{
            this.setState({ btnloading: false });
          }
        }
      });
    } else {
      if(this.newplan === 'newplan'){
        message.info('上报成功');
        this.setState({ showModal: false, btnloading: false, isShowlead: false });
        this.props.history.goBack();
      }else{
        this.handReplacement(paramsAttArray, data)
      }
    }
  };

  handReplacement = (paramsAttArray, data) => {
    let length = this.props.formData.length;
    let paramsObj = {};

    for (let i = 0; i < length; i++) {
      let params = this.refs[`formRef_${i}`].getValues();

      for (let key in params) {
        if (params.hasOwnProperty(key)) {
          paramsObj[key] = params[key];
        }
      }
    }
    const fileName = paramsAttArray[0].name;
    const {effect_end_date, danger_task_plan_date, scene_cantor, address, task_implementer, task_level, task_type, security_custody, task_operator, is_workflow_approval, remark} = paramsObj;
    const {replacement} = this.state;
    const properties = {
      is_workflow_approval: "10000001",
      effect_end_date,
      danger_task_plan_date,
      remark,
      // scene_cantor: replacement.scene_cantor,
      scene_cantor,
      address,
      task_implementer,
      task_level,
      task_type,
      security_custody,
      task_operator,
      [fileName]: data.uuid
    }
    console.log(properties, 'valllllllllllll')
    this.props.dispatch({
      type: 'workOrder/submitTaskFormData',
      payload: {
        taskId: this.taskId,
        taskType: this.taskType,
        taskCode: '',
        userid: this.props.userInfo.gid,
        user: this.props.userInfo.trueName,
        properties: JSON.stringify(properties),
        isSave: 0,
      },
      callback: (res) => {
        console.log(res, 'mmmmmmmm')
        if (res) {
          message.info('上报成功');
          this.setState({ showModal: false, btnloading: false, isShowlead: false });
          this.props.history.goBack();
        } else {
          this.setState({ btnloading: false });
        }
      },
    });
  }

  handleCancel = () => {
    this.setState({ showModal: false });
    this.props.history.goBack();
  }

  onClickGeomBtn = (name) => {
    this.setState({
      showModal: false,
    });
  }

  onSelectedPoint = (name, geom) => {
    this.geomData[`${name}_geom`] = `${geom.x},${geom.y}`;
    this.geom = geom;
    this.setState({
      showModal: true,
    });
  };

  initDealPrams = () => {
    let params = [];
    if(this.newplan === 'editplan'){
      params = this.props.workDetail && this.props.workDetail.params ? this.props.workDetail.params : [];
    }else{
      params = this.props.formData ? this.props.formData : [];
    }

    let forms = [];
    if (params.length === 0) {
      return { forms: forms };
    }
    for (let i = 0; i < params.length; i++) {
      forms.push(
        <div>
          <SubmitForm
            getMap={this.getMap}
            data={params[i].items}
            cascade={[]}
            geomHandleClick={this.onClickGeomBtn}
            geomSelectedPoint={this.onSelectedPoint}
            column={column}
            ref={`formRef_${i}`}
          />
        </div>
      );
    }
    return {forms: forms };
  };

  getMap = () => {
    return this.map;
  };

  backToForm = () => {
    this.setState({
      showModal: true,
    });
  };
  leadChange = (val) => {
    this.isComAgain = 1;
    this.setState({lead: val})
  }
  handleCancelOk = () => {
    this.setState({ showModal: false, btnloading: false, isShowlead: false });
    this.props.history.goBack();
  }

  render() {
    let { steps, forms } = this.initDealPrams();
    const {leadArr} = this.state;
    return (
      <div>
        <div style={{ width: '100%', height: 'calc(100vh - 120px)' }}>
          <div style={{ width: '100%', height: '35px', paddingTop: '2px' }}>
            <Button onClick={this.backToForm}>返回</Button>
          </div>
          <div style={{ width: '100%', height: 'calc(100vh - 155px)' }}>
            <EcityMap mapId='reportEvent' onMapLoad={this.bindMap}></EcityMap>
          </div>
        </div>
        <Modal
          width={780}
          maskClosable={false}
          visible={this.state.showModal}
          onCancel={this.handleCancel}
          footer={null}
          wrapClassName={'web'}
          title={this.props.formData.alias}>

          <Spin style={{ position: 'absolute', marginLeft: '340px' }} spinning={this.state.loading} tip="加载中……" />

          <div>
            {forms}
          </div>
          <div className={styles.btn_div}>
            <Button style={{ float: 'right' }} onClick={this.handleCancel}>取消</Button>
            <Button style={{ float: 'right', marginRight: '16px' }} type="primary"
              loading={this.state.btnloading} onClick={this.handleOk.bind(this)}>提交</Button>
          </div>
        </Modal>
        <Modal
          width={500}
          maskClosable={false}
          visible={this.state.isShowlead}
          onCancel={this.handleCancelOk}
          footer={null}
          wrapClassName={'webL'}
          title="请选择业务审批人">
          <div>
            <label>审批人: </label>
            <Select style={{width: 180}} value={this.state.lead} searchPlaceholder="请选择业务审批人"
                    onChange={this.leadChange}>
                {
                  leadArr && leadArr.map((item, index) =>
                    <Option key={index} value={item}>{item}</Option>
                  )
                }
            </Select>
          </div>
          <div className={styles.btn_div}>
            <Button style={{ float: 'right' }} onClick={this.handleCancelOk}>取消</Button>
            <Button style={{ float: 'right', marginRight: '16px' }} type="primary"
              loading={this.state.btnloading} onClick={this.handleOkSec.bind(this)}>提交</Button>
          </div>
        </Modal>
      </div>
    );
  }
}

export default DangerWork;

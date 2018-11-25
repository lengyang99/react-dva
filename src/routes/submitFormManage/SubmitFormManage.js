import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { parse } from 'qs';
import { Modal, Button, Spin, Steps, message } from 'antd';
import EcityMap from '../../components/Map/EcityMap';
import styles from './SubmitFormManage.less';
import SubmitForm from '../commonTool/SubmitFormModal/SubmitFormModal.js';

const column = 2;
const Step = Steps.Step;

@connect(state => ({
  formData: state.submitFormManage.formData,
  eventDatailData: state.event.eventDatailData,
  userInfo: state.login.user,
}))

class SubmitFormManage extends Component {
  constructor(props) {
    super(props);

    this.pageData = parse(props.location.search.substring(1));
    this.map = null;
    this.geom = {};
    this.geomData = {};
    this.dataType = 0; // 区分当前表单数据是事件表单还是工单表单， 0事件，1工单
    this.state = {
      loading: true, // 控制是否显示加载效果
      btnloading: false, // 控制按钮等待效果
      showModal: true,
      showNextBtn: false,
      showBeforeBtn: false,
      stepnum: 0,
      disabled: true,
    };

    this.getFormData();
  }

  componentWillMount() {

  }

  componentDidMount() {

  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'submitFormManage/saveFormData',
      payload: {
        formData: {
          tableName: '',
          params: [{
            items: [],
          }],
        },
      },
    });
  }

  // 绑定地图对象
  bindMap = (map) => {
    this.map = map;
  }

  // 获取表单信息
  getFormData = () => {
    const data = parse(this.props.location.search.substring(1));
    this.props.dispatch({
      type: 'submitFormManage/getFormData',
      params: data,
      callback: (res) => {
        let showNextBtn = false;
        this.dataType = 1;
        if (res.formType === 'event') {
          this.dataType = 0;
          if (res.params.length > 1) {
            showNextBtn = true;
          }
        }

        this.setState({
          showNextBtn,
          loading: false,
          disabled: false,
        });
      },
    });
  }

  // 上报表单数据
  handleOk = () => {
    const data = parse(this.props.location.search.substring(1));
    let length = this.props.formData.params.length;
    const paramsObj = {};
    const paramsAttArray = [];
    if (this.dataType === 1) {
      length = 1;
    }
    for (let i = 0; i < length; i++) {
      const validate = this.refs[`formRef_${i}`].validateRequired();
      const params = this.refs[`formRef_${i}`].getValues();
      if (validate) {
        message.warning(`字段【${validate}】为空！`);
        return;
      }
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          paramsObj[key] = params[key];
        }
      }

      const paramsAtt = this.refs[`formRef_${i}`].getAttValues();
      for (const key in paramsAtt) {
        if (paramsAtt.hasOwnProperty(key)) {
          paramsAttArray.push({ name: key, value: paramsAtt[key] });
        }
      }
    }

    Object.assign(paramsObj, this.geomData);

    const userid = this.props.userInfo.gid;
    const username = this.props.userInfo.trueName;
    const optparams = {
      userid,
      user: username,
      x: this.geom.x,
      y: this.geom.y,
      eventtype: data.eventtype,
      properties: paramsObj,
      eventid: this.pageData.eventid,
    };
    if (this.pageData.eventid) {
      optparams.eventid = this.pageData.eventid;
    }
    this.setState({
      btnloading: true,
    });
    //  modify- ly 0712
    if (this.pageData.taskId) {
      Object.assign(optparams, { taskId: this.pageData.taskId });
      this.reportTaskFormEvent(optparams, (res) => {
        this.submitAttach(res, paramsAttArray, paramsObj);
      });
    } else {
      this.submitEventForm(optparams, (res) => {
        this.submitAttach(res, paramsAttArray, paramsObj);
      });
    }
  }
  // 上报 modify- ly
  reportTaskFormEvent = (params, callback) => {
    this.props.dispatch({
      type: 'submitFormManage/reportTaskFormEvent',
      params,
      callback: (res) => {
        if (!res.success) {
          message.error(res.msg);
          this.setState({ btnloading: false });
          return;
        }
        callback && callback(res);
      },
    });
  }
  submitEventForm = (params, callback) => {
    this.props.dispatch({
      type: 'submitFormManage/reportFormEvent',
      params,
      callback: (res) => {
        if (!res.success) {
          message.error(res.msg);
          this.setState({ btnloading: false });
          return;
        }
        callback && callback(res);
      },
    });
  }

  submitAttach = (res, paramsAttArray, paramsObj) => {
    // 上报成功之后再上报附件
    // 当存在附件字段提交附件
    if (paramsAttArray.length > 0) {
      this.props.dispatch({
        type: 'submitFormManage/submitAttach',
        formData: paramsAttArray,
        attInfo: res.data,
        userInfo: this.props.userInfo,
        callback: (resAtt) => {
          if (resAtt) {
            message.info('上报附件成功');
            this.setState({ showModal: false, btnloading: false });
            this.props.history.goBack();
            // 隐患工单返回时传递是否立即整改参数
            // if (this.pageData.eventtype === '10') {
            //   let path = {
            //     pathname: this.props.history.location.pathname,
            //     rectify: paramsObj.promptly_rectify,
            //     eventid: res.data.gid,
            //   };
            //   this.props.dispatch(routerRedux.push(path));
            // } else {
            //   this.props.history.goBack();
            // }
          } else {
            this.setState({ btnloading: false });
          }
        },
      });
    } else {
      if (this.pageData.taskId) {
        message.success('派单成功');
      } else {
        message.success('上报成功');
      }
      this.setState({ showModal: false, btnloading: false });
      this.props.history.goBack();
      // 隐患工单返回时传递是否立即整改参数
      // if (this.pageData.eventtype === '10') {
      //   let path = {
      //     pathname: this.props.history.location.pathname,
      //     rectify: paramsObj.promptly_rectify,
      //     eventid: res.data.gid,
      //   };
      //   this.props.dispatch(routerRedux.push(path));
      // } else {
      //   this.props.history.goBack();
      // }
    }
  }

  handleCancel = () => {
    this.setState({ showModal: false });
    this.props.history.goBack();
  }

  onClickNextForm = () => {
    const num = this.state.stepnum + 1;
    let showNextBtn = false;
    let showBeforeBtn = false;
    if (this.props.formData.params.length > 1) {
      if (num < this.props.formData.params.length - 1) {
        showNextBtn = true;

        if (num >= 1) {
          showBeforeBtn = true;
        }
      }

      if (num === this.props.formData.params.length - 1) {
        showBeforeBtn = true;
      }
    }

    this.setState({
      stepnum: num,
      showNextBtn,
      showBeforeBtn,
    });
  }

  onClickBeformForm = () => {
    const num = this.state.stepnum - 1;
    let showBeforeBtn = true;
    if (num === 0) {
      showBeforeBtn = false;
    }

    this.setState({
      stepnum: num,
      showBeforeBtn,
      showNextBtn: true,
    });
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

  onShowModal = () => {

  }

  initDealPrams = () => {
    const params = this.props.formData.params;
    const eventDatailData = this.props.eventDatailData.params;
    const steps = [];
    const forms = [];
    if (!params) {
      return { steps, forms };
    }
    if (params.length === 0) {
      return { steps, forms };
    }
    if (eventDatailData && eventDatailData.length !== 0 && this.pageData.eventid) { // wxj
      for (const e of (params[0].items || params).values()) {
        for (const elem of eventDatailData[0].items.values()) {
          if (e.name === elem.name) {
            e.value = elem.value;
          }
        }
      }
    }
    if (this.dataType === 0) { // 根据返回数据类型解析表单
      for (let i = 0; i < params.length; i++) {
        steps.push(
          <Step title={params[i].groupname} />
        );

        const formclassname = (i === this.state.stepnum ? styles.submit_form_show : styles.submit_form_hide);
        forms.push(
          <div className={formclassname}>
            <SubmitForm
              getMap={this.getMap}
              data={params[i].items}
              cascade={this.props.formData.cascade}
              geomHandleClick={this.onClickGeomBtn}
              geomSelectedPoint={this.onSelectedPoint}
              backToForm={this.backToForm}
              column={column}
              ref={`formRef_${i}`}
            />
          </div>
        );
      }
    } else {
      forms.push(
        <div className={styles.submit_form_show}>
          <SubmitForm
            getMap={this.getMap}
            data={params}
            cascade={this.props.formData.cascade}
            geomHandleClick={this.onClickGeomBtn}
            geomSelectedPoint={this.onSelectedPoint}
            backToForm={this.backToForm}
            column={column}
            ref="formRef_0"
          />
        </div>
      );
    }

    return { steps, forms };
  }

  getMap = () => {
    return this.map;
  }

  backToForm = () => {
    this.setState({
      showModal: true,
    });
  };

  render() {
    const { steps, forms } = this.initDealPrams();
    return (
      <div>
        <div style={{ width: '100%', height: 'calc(100vh - 120px)' }}>
          <div style={{ width: '100%', height: '35px', paddingTop: '2px' }}>
            <Button onClick={this.backToForm}>返回</Button>
          </div>
          <div style={{ width: '100%', height: 'calc(100vh - 155px)' }}>
            <EcityMap mapId="reportEvent" onMapLoad={this.bindMap} />
          </div>
        </div>
        <Modal
          // 375
          width={780}
          maskClosable={false}
          visible={this.state.showModal}
          onCancel={this.handleCancel}
          footer={null}
          wrapClassName="web"
          title={this.tableName || this.props.formData.tableName}
        >

          <Spin style={{ position: 'absolute', marginLeft: '340px' }} spinning={this.state.loading} tip="加载中……" />
          <div
            className={this.dataType === 0 && this.props.formData.params.length > 1 ? styles.submit_form_show : `${styles.submit_form_hide} ${styles.div_step}`}
          >
            <Steps current={this.state.stepnum} size="small">
              {steps}
            </Steps>
          </div>
          <div>
            {forms}
          </div>
          <div className={styles.btn_div}>
            <div className={!this.state.showNextBtn ? styles.submit_form_show : styles.submit_form_hide}>
              <Button style={{ float: 'right' }} onClick={this.handleCancel}>取消</Button>
              <Button
                disabled={this.state.disabled}
                style={{ float: 'right', marginRight: '16px' }}
                type="primary"
                loading={this.state.btnloading}
                onClick={this.handleOk.bind(this)}
              >提交</Button>
            </div>
            <div>
              <Button
                className={this.state.showNextBtn ? styles.submit_form_show : styles.submit_form_hide}
                style={{ float: 'right', marginRight: '16px' }}
                type="primary"
                onClick={this.onClickNextForm}
              >下一步</Button>
              <Button
                className={this.state.showBeforeBtn ? styles.submit_form_show : styles.submit_form_hide}
                style={{ float: 'right', marginRight: '16px' }}
                onClick={this.onClickBeformForm}
              >上一步</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default SubmitFormManage;

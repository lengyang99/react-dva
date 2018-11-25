import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Steps, Tabs, Button, Modal, message, Icon } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import EcityMap from '../../../components/Map/EcityMap';
import SubmitForm from '../../commonTool/SubmitFormModal/SubmitFormModal.js';
import { DrawPointMapTool } from '../../../components/Map/common/maptool/DrawPointMapTool';
import FormDetail from '../../commonTool/FormDetail/FormDetail';
import InternalService from '../InternalService';

const Step = Steps.Step;
const TabPane = Tabs.TabPane;

@connect(state => ({
  user: state.login.user,
  userFuns: state.login.funs,
  processlist: state.workOrder.processlist, // 进度条表
  processVerlist: state.workOrder.processVerlist, // 进度条表
  tab: state.workOrder.tab, // tab相关数据
  AllDetail: state.workOrder.detailInfo, // 事件详情
  userTask: state.workOrder.userTask, // 右下流程操作按钮
  taskFormData: state.workOrder.taskFormData, // 模态框表单配置信息
}))

export default class EventDetail extends React.Component {
  constructor(props) {
    super(props);
    this.tool = this.props.location;
    if (this.tool.params) {
      localStorage.setItem('workOrderDetail', JSON.stringify(this.tool));
    } else {
      const dataString = localStorage.getItem('workOrderDetail');
      this.tool = JSON.parse(dataString);
    }

    this.currentStep = 0;
    this.map = null;
    this.geom = {};
    this.showpoint = '';
    this.selectPoint = false;
    this.tabIndex = '0'; // 记录当前查询的tab的下标

    this.eventtype = ''; // 记录当前工单对应的event_type
    this.state = {
      isShowMap: false, // 是否展示地图
      formToMap: false, // 记录是否由表单界面跳转
      showModal: false, // 是否展示模态框
      showModalDialog: false,
      showDetail: true, // 显示详情页面
      ModelData: {}, // 相关按钮内的值
      showVerList: false,
      refreshIndex: 0,
      loading: false,
    };
    this.getProcesslist();
    this.getDetailtab();
    this.getUserTask();
  }

  getProcesslist = () => {
    this.props.dispatch({
      type: 'workOrder/getProcesslist',
      payload: {
        processInstanceId: this.tool.processInstanceId,
      },
    });
  };
  getProcessVerlist = () => {
    this.props.dispatch({
      type: 'workOrder/getProcessVerlist',
      payload: {
        processInstanceId: this.tool.processInstanceId,
      },
    });
  };

  getDetailtab = () => {
    this.props.dispatch({
      type: 'workOrder/getDetailtab',
      payload: {
        formid: this.tool.formid,
        processInstanceId: this.tool.processInstanceId,
      },
      callback: ((tab, type) => {
        if (this.props.user.ecode === '0611' && type == '0') {
          this.setState({
            showVerList: true,
          })
          this.getProcessVerlist();
        }
        this.getAllDetail(0, tab);
      }),
    });
  };

  getUserTask = () => {
    this.props.dispatch({
      type: 'workOrder/getUserTask',
      payload: {
        processInstanceId: this.tool.processInstanceId,
        assignee: this.props.user.gid,
        plat: 'web',
      },
    });
  };

  getTaskFormData = (data) => {
    this.props.dispatch({
      type: 'workOrder/getTaskFormData',
      payload: {
        taskId: data.taskId,
        taskType: data.taskType,
        taskCode: '',
        userid: this.props.user.gid,
      },
      callback: () => {
        this.setState({
          ModelData: data,
          showModal: true,
          showModalDialog: true,
        });
      },
    });
  };

  getAllDetail = (index, tab) => {
    // let url = this.props.tab[active].url;
    // if(url.substring(url.length-1)==='?') {
    //   url = url.substring(0,url.length-1);
    // }
    // url = url + (url.indexOf('?') > -1 ? '&' : '?');
    // if(active ==='4'){
    //   this._tool.processInstanceId =487559;
    // }
    // modify by lengyang
    let url = '';
    if (this.props.tab[index].name === 'taskInfo') {
      url = `&processInstanceId=${this.tool.processInstanceId}`;
    } else {
      url = `&userid=${this.props.user.gid}&processInstanceId=${this.tool.processInstanceId}&workOrderNum=${this.tool.workOrderNum}&where=${encodeURI(JSON.stringify({ processInstanceId: this.tool.processInstanceId }))}`;
    }
    // 2018-07-11
    // url = url + urlExtra;
    let tmptab = this.props.tab;
    if (tab) {
      tmptab = tab;
    }
    const data = { url: tmptab[index].url + url, formName: tmptab[index].name, urlExtra: url };
    this.props.dispatch({
      type: 'workOrder/getAllDetail',
      payload: data,
    });
  };

  onChangeTab = (active) => {
    this.props.dispatch({
      type: 'workOrder/changeAllDetail',
      payload: {},
    });
    this.tabIndex = active;
    this.getAllDetail(active);
  };

  getReportApproise = (gid) => {
    this.props.dispatch({
      type: 'workOrder/getApproiseFormData',
      payload: {
        key: 'approise',
      },
      callback: () => {
        this.setState({
          ModelData: { taskName: '评价', taskId: 'approiseBtn', gid },
          showModal: true,
          showModalDialog: true,
        });
      },
    });
  }

  submitAppromiseData = (params) => {
    this.props.dispatch({
      type: 'workOrder/submitApproiseData',
      payload: {
        userid: this.props.user.gid,
        control_id: this.state.ModelData.gid,
        params: JSON.stringify(params),
      },
      callback: () => {
        let refreshIndex = this.state.refreshIndex;
        this.setState({ showModal: false, showModalDialog: false, loading: false, refreshIndex: (refreshIndex + 1) });
        if (this.state.showVerList) {
          this.getProcessVerlist();
        }
        this.getProcesslist();
        this.getAllDetail(this.tabIndex);
        this.getUserTask();
        this.clearFormData();
      },
    });
  }

  getCopyWoFormData = () => {
    this.props.dispatch({
      type: 'workOrder/getWorkorderFormData',
      payload: {
        processinstanceid: this.tool.processInstanceId,
      },
      callback: (res) => {
        this.eventtype = res.eventtype;
        this.setState({
          ModelData: { taskName: '工单复制', taskId: 'copyWo' },
          showModal: true,
          showModalDialog: true,
        });
      },
    });
  }

  getStepDivs = (processlist) => {
    const steps = [];
    processlist.map((process, i) => {
      if (process.state === '1' || process.state === '2') {
        this.currentStep = i + 1;
      }
      steps.push(
        <Step
          key={`Step${i}`}
          title={process.tasktext}
        />
      );
    });
    return steps;
  };
  getSteVerDivs = (processlist) => {
    const steps = [];
    const arr = [];
    const aliasObj = {
      sg_address: '施工点发现',
      is_notice_image: '签发告知函',
      sg_distance: '是否有影响',
      varchar30: '管位探测',
      varchar32: '设置警示标志',
      protection_scheme_img: '签订保护协议',
      varchar39: '审批照片',
      jd_img: '交底照片',
      bhfa: '保护方案执行',
      pipe_zb: '管位增补',
      sg_close: '关单',
    };
    const obj = {};
    try {
      if (Object.values(processlist).length > 0) {
        for (const [key, value] of Object.entries(aliasObj)) {
          arr.push({ name: value, value: processlist[key] });
        }
      }
    } catch (e) {
      console.log(e);
    }
    arr.map((process, i) => {
      if (process.value === 1) {
        obj.icon = <Icon type="check-circle-o" />;
      } else {
        obj.icon = <img src="images/eventOverview/未进行.png" alt="图标" />;
        // obj.icon = <Icon type="close-circle-o" />;
      }
      steps.push(
        <Step
          key={`StepVer${i}`}
          title={process.name}
          {...obj}
        />
      );
    });
    return steps;
  };
  // 跳转至危险作业详情
  toDangerWork = () => {
    const sqdno = this.tool.workOrderNum;
    this.props.dispatch(routerRedux.push(`query/report-dangerwork-detail?sqdno=${sqdno}`))
  }

  getTabDivs = (tabs) => {
    const tabDivs = [];
    const that = this;
    let funBtn = [];
    this.props.userFuns.forEach((item) => {
      if (item.code === 'wo_leader_evalute') {
        funBtn.push({ key: 'approise', name: '发布评价', click: this.getReportApproise.bind(this), refreshIndex: this.state.refreshIndex });
      }
    });
    for (let i = 0; i < tabs.length; i++) {
      let tabPane = (
        <TabPane tab={tabs[i].alias} key={i}>
          <div style={{ minWidth: 1000, height: 'calc(100% - 350px)', overflowY: 'auto' }}>
            <FormDetail
              key={`FormDetail${i}`}
              funBtn={funBtn}
              tabName={this.props.tab[i].name}
              data={this.props.AllDetail[this.props.tab[i].name] || {}}
              showPoint={this.onChangeIsShowMap}
              // toDangerWork={that.toDangerWork.bind(that)}
              sqdno={this.tool.workOrderNum}
            />
          </div>
        </TabPane>
      );
      if (tabs[i].name === 'innerServiceinfo') {
        tabPane = (
          <TabPane tab={tabs[i].alias} key={i}>
            <InternalService
              detail={this.props.AllDetail[this.props.tab[i].name] || {}}
              processInstanceId={this.tool.processInstanceId}
            />
          </TabPane>
        );
      }
      tabDivs.push(tabPane);
    }
    return tabDivs;
  };

  getButtonDivs = (buttons) => {
    const buttonDivs = [];
    buttons.map((button, i) => {
      buttonDivs.push(
        <Button
          key={i}
          type="primary"
          style={{ marginRight: 20 }}
          onClick={this.getTaskFormData.bind(this, button)}
        >{button.taskName}</Button>);
    });
    if (this.state.showVerList) {
      buttonDivs.push(
        <Button
          key="copy"
          type="primary"
          style={{ marginRight: 20 }}
          onClick={this.getCopyWoFormData.bind(this)}
        >工单复制</Button>
      );
    }
    return buttonDivs;
  };

  handleCancel = () => {
    this.setState({ showModal: false, showModalDialog: false, formToMap: false });
    this.clearFormData();
  };

  handleOk = () => {
    let paramsObj = {};
    const paramsAttArray = [];
    const validate = this.refs.formRef_1.validateRequired();
    if (validate) {
      message.warning(`字段【${validate}】为空！`);
      return;
    }
    const params = this.refs.formRef_1.getValues();
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        paramsObj[key] = params[key];
      }
    }
    paramsObj = { ...paramsObj, ...this.geom };

    const paramsAtt = this.refs.formRef_1.getAttValues();
    for (const key in paramsAtt) {
      if (paramsAtt.hasOwnProperty(key)) {
        paramsAttArray.push({ name: key, value: paramsAtt[key] });
      }
    }

    this.setState({
      loading: true,
    });
    if (this.state.ModelData.taskId === 'approiseBtn') {
      this.submitAppromiseData(paramsObj);
    } else if (this.state.ModelData.taskId === 'copyWo') {
      this.reportEvent(paramsObj, paramsAttArray);
    } else {
      this.props.dispatch({
        type: 'workOrder/submitTaskFormData',
        payload: {
          taskId: this.state.ModelData.taskId,
          taskType: this.state.ModelData.taskType,
          taskCode: '',
          userid: this.props.user.gid,
          user: this.props.user.trueName,
          properties: JSON.stringify(paramsObj),
          isSave: 0,
        },
        callback: (res) => {
          if (paramsAttArray.length > 0) {
            this.props.dispatch({
              type: 'workOrder/submitAttach',
              formData: paramsAttArray,
              attInfo: res,
              user: this.props.user,
              callback: (resAtt) => {
                if (resAtt) {
                  message.info('提交成功');
                  this.setState({ showModal: false, showModalDialog: false, loading: false });
                  if (this.state.showVerList) {
                    this.getProcessVerlist();
                  }
                  this.getProcesslist();
                  this.getAllDetail(this.tabIndex);
                  this.getUserTask();
                  this.clearFormData();
                }
              },
            });
          } else {
            message.info('提交成功');
            this.setState({ showModal: false, showModalDialog: false, loading: false });
            if (this.state.showVerList) {
              this.getProcessVerlist();
            }
            this.getProcesslist();
            this.getAllDetail(this.tabIndex);
            this.getUserTask();
            this.clearFormData();
          }
        },
      });
    }
  };

  reportEvent = (paramsObj, paramsAttArray) => {
    this.props.dispatch({
      type: 'workOrder/reportEventFormData',
      payload: {
        userid: this.props.user.gid,
        user: this.props.user.trueName,
        properties: JSON.stringify(paramsObj),
        eventtype: this.eventtype,
      },
      callback: (res) => {
        if (paramsAttArray.length > 0) {
          this.props.dispatch({
            type: 'workOrder/submitAttach',
            formData: paramsAttArray,
            attInfo: res.data,
            user: this.props.user,
            callback: (resAtt) => {
              if (resAtt) {
                message.info('提交成功');
                this.setState({ showModal: false, showModalDialog: false, loading: false });
                if (this.state.showVerList) {
                  this.getProcessVerlist();
                }
                this.getProcesslist();
                this.getAllDetail(this.tabIndex);
                this.getUserTask();
                this.clearFormData();
              }
            },
          });
        } else {
          message.info('提交成功');
          this.setState({ showModal: false, showModalDialog: false, loading: false });
          if (this.state.showVerList) {
            this.getProcessVerlist();
          }
          this.getProcesslist();
          this.getAllDetail(this.tabIndex);
          this.getUserTask();
          this.clearFormData();
        }
      },
    });
  }

  clearFormData = () => {
    this.geom = {};
    this.props.dispatch({
      type: 'workOrder/changeTaskFormData',
      payload: {
        params: [],
        cascade: {},
      },
    });
  };

  onClickGeomBtn = () => {
    this.selectPoint = true;
    if (this.map) {
      this.map.resetMap();
    }

    this.setState({
      showDetail: false,
      showModal: false,
      showModalDialog: true,
      formToMap: true,
      isShowMap: true,
    });
  }

  geomSelectedPoint = (name, geom) => {
    this.geom[`${name}_geom`] = `${geom.x},${geom.y}`;
    this.showpoint = `${geom.x},${geom.y}`;
    this.setState({
      showDetail: true,
      showModal: true,
      showModalDialog: true,
      isShowMap: false,
    });
  }

  getMap = () => {
    return this.map;
  }

  mapLoad = (aMap) => {
    this.map = aMap;
    // if (!this.selectPoint) {
    //   const dot = this.showpoint.split(",");
    //   this.showPoint({x: dot[0], y: dot[1]});
    // }
  };

  showOnePoint = (point) => {
    if (!point || !point.x || !point.y || point.x <= 0 || point.y <= 0) {
      return;
    }
    this.map.getMapDisplay().clear();
    const param = {
      id: 'testlayerid0',
      layerId: 'testlayer0',
      src: '../../images/woPoint.png',
      width: 19,
      height: 27,
      angle: 0,
      x: parseFloat(point.x),
      y: parseFloat(point.y),
    };
    this.map.getMapDisplay().image(param);
  }

  // 展示点
  showPoint = (taskPoints, key) => {
    let that = this;
    if (!taskPoints) {
      return;
    }
    if (Array.isArray(taskPoints)) {
      for (let i = 0; i < taskPoints.length; i++) {
        let position = {};
        if (typeof taskPoints[i].geometry === 'string') {
          position = JSON.parse(taskPoints[i].geometry);
        } else {
          position = taskPoints[i].geometry;
        }
        const param = {
          id: taskPoints[i].gid,
          layerId: `layeridPoint_${key}`,
          layerIndex: 10,
          attr: taskPoints[i],
          markersize: 8,
          linecolor: [255, 0, 0],
          fillcolor: [135, 206, 235],
          x: position.x,
          y: position.y,
        };
        this.map.getMapDisplay().point(param);
      }
    } else if (typeof taskPoints === 'object') {
      const param = {
        id: 'point',
        layerId: `layeridPoint`,
        src: './images/task-detail/location.png',
        width: 36,
        height: 31,
        angle: 0,
        attr: taskPoints,
        x: taskPoints.x,
        y: taskPoints.y,
        layerIndex: 10,
      };
      this.map.getMapDisplay().image(param);
      this.map.zoomIn();
      setTimeout(() => {
        this.map.centerAt(taskPoints);
      }, 2000);
    }
  };


  onChangeIsShowMap = (point) => {
    if (!point) {
      return;
    }
    this.selectPoint = false;
    this.showpoint = point;
    const dot = point.split(",");
    if (this.map) {
      this.map.clear();
      this.map.resetToDefaultMapTool();
    }
    let a = this.state.isShowMap;
    this.showPoint({ x: dot[0], y: dot[1] });
    this.setState({
      isShowMap: !this.state.isShowMap,
      showDetail: false,
    }, () => {
    });
  }

  goBack = () => {
    if (this.state.isShowMap) {
      this.setState({
        isShowMap: false,
        showModal: (this.state.formToMap === true ? true : this.state.showModal),
        showModalDialog: true,
        formToMap: false,
        showDetail: true,
      });
      return;
    }

    if (this.tool.historyPageName) {
      if (this.tool.historyPageName === '/event-list-detail') {
        this.props.dispatch(routerRedux.push({ pathname: this.tool.historyPageName, params: this.tool.params.params, eventtype: this.tool.params.eventtype, eventid: this.tool.params.eventid, historyPageName: this.tool.params.historyPageName }));
      } else {
        this.props.dispatch(routerRedux.push({ boolea: this.tool.boolea, pathname: this.tool.historyPageName, params: this.tool.params }));
      }
    } else {
      this.props.history.goBack();
    }
  };

  isWorkflowApproval = () => {
    const { userTask: { taskType, taskId } } = this.props;
    this.setState({ showModal: false, showModalDialog: false });
    this.props.dispatch(routerRedux.push(`/query/report-dangerwork?wocode=${this.tool.workOrderNum}&taskType=${taskType}&taskId=${taskId}`));
  }

  render() {
    const steps = this.getStepDivs(this.props.processlist);
    const stepsVer = this.getSteVerDivs(this.props.processVerlist);
    const tabs = this.getTabDivs(this.props.tab);
    const buttons = this.getButtonDivs(this.props.userTask);
    return (
      <PageHeaderLayout showBack={this.goBack.bind(this)}>
        <div style={{ width: '100%', minWidth: '1000px', height: 'calc(100% - 175px)', minHeight: 'calc(100vh - 175px)', position: 'relative' }}>
          {this.state.showDetail ? <div style={{ width: '100%', height: '100%' }}>
            {this.state.showVerList ?
              <div style={{ height: '100%', overflow: 'auto', width: '100%' }}>
                <div style={{ width: '170px', marginRight: '10px', float: 'left', height: '100%', padding: '20px 0 0 20px' }}>
                  <Steps current={1000} size="small" direction="vertical" style={{ margin: '0px auto', minHeight: 'calc(100vh - 280px)' }}>
                    {stepsVer}
                  </Steps>
                </div>
                <Tabs style={{ borderLeft: '10px solid #EEF0F3', paddingLeft: '10px', minHeight: 'calc(100vh - 280px)', width: 'calc(100% - 180px)' }} animated={false} onChange={this.onChangeTab} activeKey={this.tabIndex}>
                  {tabs}
                </Tabs>
              </div>
              :
              <div>
                <div style={{ width: '100%', height: 70, padding: '22px 50px' }}>
                  <Steps current={this.currentStep} style={{ width: '80%', margin: '0px auto' }}>
                    {steps}
                  </Steps>
                </div>
                <Tabs style={{ marginLeft: 40, minHeight: 'calc(100vh - 280px)' }} animated={false} onChange={this.onChangeTab} activeKey={this.tabIndex}>
                  {tabs}
                </Tabs>
              </div>
            }
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, marginBottom: 10 }}>
              {buttons}
            </div>
          </div> : null}
          <div style={{ width: '100%', height: '100%', position: 'absolute', display: this.state.isShowMap ? 'block' : 'none', zIndex: 1000 }}>
            <EcityMap mapId="workorderDetail2" onMapLoad={this.mapLoad.bind(this)} />
          </div>
          {this.state.showModalDialog ?
            <Modal
              width="770px"
              visible={this.state.showModal}
              onCancel={this.handleCancel}
              wrapClassName="web"
              footer={null}
              // onOk={this.handleOk}
              title={this.state.ModelData.taskName}
            >
              <div style={{ display: 'block' }}>
                <SubmitForm
                  isWorkflowA={this.isWorkflowApproval}
                  data={this.props.taskFormData.params}
                  getMap={this.getMap}
                  cascade={this.props.taskFormData.cascade}
                  geomHandleClick={this.onClickGeomBtn.bind(this)}
                  geomSelectedPoint={this.geomSelectedPoint.bind(this)}
                  column={2}
                  ref="formRef_1"
                />
              </div>
              <div style={{ height: '30px', marginTop: '25px' }}>
                <Button style={{ float: 'right', marginLeft: '15px', marginRight: '30px' }} onClick={this.handleCancel.bind(this)}>取消</Button>
                <Button type="primary" style={{ float: 'right' }} loading={this.state.loading} onClick={this.handleOk.bind(this)}>确定</Button>
              </div>
            </Modal>:null}
        </div>
      </PageHeaderLayout>
    );
  }
}

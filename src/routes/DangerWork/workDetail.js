import React from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Steps, Tabs, Button, Modal, message} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import EcityMap from '../../components/Map/EcityMap';
import SubmitForm from '../commonTool/SubmitFormModal/SubmitFormModal.js';
import { DrawPointMapTool } from '../../components/Map/common/maptool/DrawPointMapTool';
import FormDetail from '../commonTool/FormDetail/FormDetail';
import parseValues from '../../utils/utils';
import styles from './index.less'

const Step = Steps.Step;
const TabPane = Tabs.TabPane;

@connect(state => ({
  user: state.login.user,
  workDetail: state.dangerWork.dangerWorkDetail, // 事件详情
}))

export default class EventDetail extends React.Component {
  constructor(props) {
    super(props);

    this.currentStep = 0;
    this.map = null;
    this.geom = {};
    this.showpoint = '';
    this.sqdno = '';
    this.tabIndex = 0; // 记录当前查询的tab的下标

    this.state = {
      isShowMap: false, // 是否展示地图
      formToMap: false, // 记录是否由表单界面跳转
      showModal: false, // 是否展示模态框
      showDetail: true, // 显示详情页面
      ModelData: {}, // 相关按钮内的值
      loading: false,
    };
    this.initParams()
  }

  componentDidMount(){

  }

  initParams = () => {
    const { location: { search } } = this.props;
    const {sqdno} = parseValues(search) || {};
    this.sqdno = sqdno;
    this.workDetail(sqdno)
  };

  workDetail = (val) => {
    this.props.dispatch({
      type: 'dangerWork/dangerWorDetail',
      payload: {
        sqdno: val,
        // ecode: '0031'
      },
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




  getTabDivs = () => {
    const tabs = [
      {alias: '申请详情', name: '申请详情'},
    ]
    const {workDetail} = this.props;
    console.log('workDetail', workDetail);
    const tabDivs = [];
    for (let i = 0; i < tabs.length; i++) {
      const tabPane = (
        // <TabPane tab={tabs[i].alias} key={i}>
          <div style={{minWidth: 1000, height: 'calc(100% - 350px)', overflowY: 'auto'}}>
            <div className={styles['detail']}><b>{tabs[0].name}</b></div>
            <FormDetail
              key={`FormDetail${i}`}
              tabName={tabs[i].name}
              data={workDetail || {}}
              showPoint={this.onChangeIsShowMap}
            />
          </div>
        // </TabPane>
      );
      tabDivs.push(tabPane);
    }
    return tabDivs;
  };





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
    this.setState({
      showDetail: false,
      showModal: false,
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
      isShowMap: false,
    });
  }

  getMap = () => {
    return this.map;
  }

  mapLoad = (aMap) => {
    this.map = aMap;
  }

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
    this.showPoint({x: dot[0], y: dot[1]});
    this.setState({
      isShowMap: !this.state.isShowMap,
      showDetail: false,
    }, () => {
    });
  }

  // 展示点
  showPoint = (taskPoints, key) => {
    let that = this;
    if (!taskPoints) {
      return;
    }
    if(Array.isArray(taskPoints)){
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
    }else if(typeof taskPoints === 'object'){
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
      setTimeout(()=>{
        this.map.centerAt(taskPoints);
      },2000);
    }

  };

  goBack = () => {
    if (this.state.isShowMap) {
      this.setState({
        isShowMap: false,
        showModal: (this.state.formToMap === true ? true : this.state.showModal),
        formToMap: false,
        showDetail: true,
      });
      return;
    }
    this.props.history.goBack()
  };

  render() {
    const tabs = this.getTabDivs();
    return (
      <PageHeaderLayout showBack={this.goBack.bind(this)}>
        <div style={{width: '100%', minWidth: '1000px', height: 'calc(100% - 175px)', minHeight: 'calc(100vh - 175px)', position: 'relative'}}>
          {this.state.showDetail ? <div>
            {/* <Tabs style={{marginLeft: 40, minHeight: 'calc(100vh - 280px)'}} animated={false} onChange={this.onChangeTab}> */}
            {tabs}
            {/* </Tabs> */}

          </div> : null}
          <div style={{ width: '100%', height: '100%', left: 0, top: 0, position: 'absolute', zIndex: 1000, display: this.state.isShowMap ? 'block' : 'none'}}>
            <EcityMap mapId="workorderDetail" onMapLoad={this.mapLoad.bind(this)} />
          </div>
        </div>
      </PageHeaderLayout>
    );
  }
}

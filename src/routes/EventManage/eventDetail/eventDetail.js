import React from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import { Steps, Button, Icon, Tabs } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
// import Tab from '../../commonTool/Tab/Tab';
// import utils from '../../../utils/utils';
import FormDetail from '../../commonTool/FormDetail/FormDetail';
import EcityMap from '../../../components/Map/EcityMap';

const Step = Steps.Step;
const TabPane = Tabs.TabPane;

@connect(state => ({
  eventDatailData: state.event.eventDatailData,
  user: state.login.user,
}))

export default class EventDetail extends React.Component {
  constructor(props) {
    super(props);
    this._tool = this.props.location;
    if (this._tool.params) {
      localStorage.setItem('eventDetail', JSON.stringify(this._tool));
    } else {
      const dataString = localStorage.getItem('eventDetail');
      this._tool = JSON.parse(dataString);
    }
    this.showpoint = '';
    this.tabIndex = 0;
    this.state = {
      isShowMap: false,
    };
    this.map = null; // 类ArcGISMap的实例
    this.getEventDatil();
  }

  onMapCreated = (arcGISMap) => {
    this.map = arcGISMap;
    this.showPoint();
  }

  getEventDatil = () => {
    let processinstanceid = this._tool.record ? this._tool.record.processinstanceid : '';
    let wocode = this._tool.record ? this._tool.record.wocode : '';
    let url = `&eventid=${this._tool.eventid}&eventtype=${this._tool.eventtype}&where=${encodeURI(JSON.stringify({ eventid: this._tool.eventid }))}`;
    this.props.dispatch({
      type: 'event/getEventDetailData',
      payload: {
        eventtype: this._tool.eventtype,
        eventid: this._tool.eventid,
        plat: 'web',
      },
      urlExtra: url,
    });
  };

  onChangeIsShowMap = (point) => {
    if (!point) {
      return;
    }
    this.showpoint = point;
    this.setState({
      isShowMap: !this.state.isShowMap,
    });
  };

  showPoint = () => {
    let point = this.showpoint;
    let onePoint = point.split(',');
    // appEvent.emit('mapEvent.mapDisplay.clear');
    const param = {
      id: point,
      layerId: 'testlayer0',
      src: '../../images/woPoint.png',
      height: 27,
      width: 19,
      // markersize: 8,
      // linecolor: [226, 130, 34],
      // fillcolor: [255, 255, 255, 0.4],
      // attr: onePoint,
      x: onePoint[0],
      y: onePoint[1],
      // click: (point) => {
      //   appEvent.emit('mapEvent.mapOper.popup', {
      //     x: point.geometry.x,
      //     y: point.geometry.y,
      //     info: {
      //       title: taskPoints[i].layername,
      //       content: [
      //         {name: '#', value: point.attributes.gid},
      //         {name: '图层名称', value: point.attributes.layername},
      //         {name: 'Gis编号', value: point.attributes.taskid},
      //         {name: '状态', value: point.attributes.isArrive === 1 ? '已到位' : '未到位'},
      //       ]
      //     },
      //   });
      // }
    };
    this.map.getMapDisplay().image(param);
    this.map.zoomIn();
    this.map.centerAt(param);
    // appEvent.emit('mapEvent.mapDisplay.point', param);
    // appEvent.emit('mapEvent.mapOper.centerAt', param);
  }
  // getTabsField = (params) => {
  //   let steps = [];
  //   let field = [];
  //   if (!params) {
  //     return {steps: steps, field: field};
  //   }
  //   params.map((param, i) => {
  //     steps.push(<Step title={param.alias}/>);
  //     field.push({key: param.id, tab: param.alias, value: <FormDetail data={param.items} props={this.props}/>})
  //   });
  //   return {steps: steps, field: field};
  // };

  goBack = () => {
    if (this.state.isShowMap) {
      this.setState({
        isShowMap: false,
      });
      return;
    }

    if (this._tool.historyPageName) {
      this.props.dispatch(routerRedux.push({ pathname: this._tool.historyPageName, params: this._tool.params }));
    } else {
      this.props.history.goBack();
    }
  };

  showWorkorderDetail = () => {
    let path = {
      pathname: '/order/workOrder-list-detail',
      processInstanceId: this._tool.record.processinstanceid,
      formid: this._tool.record.formid,
      workOrderNum: this._tool.record.wocode,
      params: this._tool,
      historyPageName: '/event-list-detail',
    };
    this.props.dispatch(routerRedux.push(path));
  }

  showWoByEventClick = (record) => {
    let path = {
      pathname: '/order/workOrder-list-detail',
      processInstanceId: record.processinstanceid,
      formid: record.formid,
      workOrderNum: record.wocode,
      params: this._tool,
      historyPageName: '/event-list-detail',
    };
    this.props.dispatch(routerRedux.push(path));
  }

  onChangeTab = (active) => {
    this.props.dispatch({
      type: 'workOrder/changeAllDetail',
      payload: {},
    });
    this.tabIndex = active;
    this.getAllDetail(active);
  }

  getTabDivs = (tabs) => {
    let tabDivs = [];
    if (!tabs.params) {
      return tabDivs;
    }
    if (tabs.params.length === 0) {
      return tabDivs;
    }
    if (tabs.params.length === 1) {
      tabDivs.push(
        <FormDetail
          data={tabs}
          showPoint={this.onChangeIsShowMap.bind(this)}
          showWoClick={this.showWorkorderDetail.bind(this)}
          showWoByEventClick={this.showWoByEventClick.bind(this)}
        />
      );
    } else {
      for (let i = 0; i < tabs.params.length; i++) {
        let tabPane = (
          <TabPane tab={tabs.params[i].alias} key={i}>
            <div style={{ minWidth: 970, height: 'calc(100% - 350px)', overflowY: 'auto' }}>
              <FormDetail
                key={`FormDetail${i}`}
                tabName={tabs.params[i].businesskey}
                data={tabs.params[i].data || {}}
                showPoint={this.onChangeIsShowMap.bind(this)}
                showWoByEventClick={this.showWoByEventClick.bind(this)}
              />
            </div>
          </TabPane>
        );
        tabDivs.push(tabPane);
      }
      tabDivs = (
        <Tabs style={{ marginLeft: 40, minHeight: 'calc(100vh - 280px)' }} animated={false} onChange={this.onChangeTab}>
          {tabDivs}
        </Tabs>);
    }
    return tabDivs;
  };

  render() {
    // const {steps, field} = this.getTabsField(this.props.eventDatailData.params);
    const tabs = this.getTabDivs(this.props.eventDatailData);
    return (
      <PageHeaderLayout showBack={this.goBack.bind(this)}>
        <div
          style={{ width: '100%', height: 'calc(100% - 175px)', minHeight: 'calc(100vh - 175px)', position: 'relative' }}>
          {this.state.isShowMap ?
            <div style={{ width: '100%', height: '100%', left: 0, top: 0, position: 'absolute', zIndex: 1000 }}>
              <EcityMap mapId="eventDetail" onMapLoad={this.onMapCreated} /></div> : null}
          <div style={{ display: !this.state.isShowMap ? 'block' : 'none' }}>
            {tabs}
          </div>
        </div>
      </PageHeaderLayout>
    );
  }
}


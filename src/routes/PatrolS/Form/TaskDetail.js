import React from 'react';
import {Table, Button, Icon} from 'antd';
import {routerRedux, Link} from 'dva/router';
import {connect} from 'dva';
import DetailPanel from '../../commonTool/DetailPanel/DetailPanel';
import utils from '../../../utils/utils';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import EcityMap from '../../../components/Map/EcityMap';
import TrackInfo from '../../positionAndTrace/TraceInfo.js';

const hideFeekBack = true;

@connect(state => ({
  patrolTaskDetailData: state.patrolPlanList.patrolTaskDetailData || {},
}))

export default class DialogTable extends React.Component {
  constructor(props) {
    super(props);
    this.tool = this.props.location;
    if (this.tool.data) {
      localStorage.setItem('patrolPlanListTD', JSON.stringify(this.tool));
    } else {
      let dataString = localStorage.getItem('patrolPlanListTD');
      this.tool = JSON.parse(dataString);
    }
    this.currentPointTimer = null;
    this.state = {
      isShowMap: false,
      showTraceDialog: false,
      tableHeight: window.innerHeight - 340,
    };
    this.map = null;

    this.getSearchValue();
    this.onMapLoad = this.onMapLoad.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize = () => {
    this.setState({
      tableHeight: window.innerHeight - 370
    });
  };

  // 获取任务详情数据
  getSearchValue = () => {
    this.props.dispatch({
      type: 'patrolPlanList/getPatrolTaskDetailData',
      payload: {
        gid: this.tool.data.gid
      },
    });
  };

  closeMap = () => {
    this.setState({
      isShowMap: false,
    });
  };

  // 定位
  location = () => {
    this.setState({
      isShowMap: true,
    });
  };

  onMapLoad(arcGISMap) {
    this.map = arcGISMap;
    arcGISMap.getMapDisplay().clear();
    this.showArea(this.props.patrolTaskDetailData.planArea.areaPolygon);
    this.showPath(this.props.patrolTaskDetailData.planArea.pathPolygon);
    this.showPoints(this.props.patrolTaskDetailData.taskPoints);
    this.setState({
      showTraceDialog: true
    })
  }

  // 展示点
  showPoints = (taskPoints = [], currentPoint = {}) => {
    this.map.getMapDisplay().image({x:0, y:0});
    for (let i = 0; i < taskPoints.length; i++) {
      this.showPoint(taskPoints[i]);
    }
  };

  showPoint = (taskPoint) => {
    let img = '';
    if(taskPoint.isArrive === 1){
      img = 'isArrive.png';
    }else{
      if(this.props.patrolTaskDetailData.endTime > new Date()){
        img = 'noArrive.png';
      }else{
        img = 'overTime.png';
      }
    }
    let position = JSON.parse(taskPoint.geom || {});
    const param = {
      id: taskPoint.gid,
      layerId: 'testlayer0',
      src: './images/task-detail/' + img,
      width: 20,
      height: 28,
      angle: 0,
      attr: taskPoint,
      x: position.x,
      y: position.y,
      layerIndex: 6,
      click: (point) => {
        this.map.popup({
          x: point.geometry.x,
          y: point.geometry.y,
          info: {
            title: taskPoint.layername,
            content: [
              {name: '#', value: point.attributes.gid},
              {name: '图层名称', value: point.attributes.layername},
              {name: 'Gis编号', value: point.attributes.taskid},
              {name: '状态', value: point.attributes.isArrive === 1 ? '已到位' : '未到位'},
            ]
          },
        });
      }
    };
    this.map.getMapDisplay().image(param);
  };

  // 展示面
  showArea = (planArea) => {
    if (!planArea) {
      return;
    }
    const paramArea = {
      id: 'paramArea1',
      layerId: 'testlayer2',
      layerIndex: 1,
      dots: JSON.parse(planArea),
    };
    this.map.centerAt(paramArea.dots[0]);
    this.map.getMapDisplay().polygon(paramArea);
  };

  // 展示线
  showPath = (planPath) => {
    if (!planPath) {
      return;
    }
    let lines = JSON.parse(planPath);
    for (let i = 0; i < lines.length; i++) {
      const paramLine = {id: 'paramLine' + i, layerId: 'testlayer2', layerIndex: 2, dots: lines[i]};
      this.map.getMapDisplay().polyline(paramLine);
    }
  };

  // 单击行
  clickTest = (record) => {
    // let position = JSON.parse(record.position);
    // this.props.appEvent.emit('mapEvent.mapOper.popup', {
    //     x: position.x,
    //     y: position.y,
    //     info: {
    //         title: record.layername,
    //         content: [
    //             {name: '#', value: record.gid},
    //             {name: '图层名称', value: record.layername},
    //             {name: 'Gis编号', value: record.taskid},
    //             {name: '状态', value: record.isArrive === 1 ? '已到位' : '未到位'},
    //         ]
    //     },
    // });
  };

  goBack = () => {
    if (!this.tool.params) {
      this.props.history.goBack();
    } else {
      if (this.state.isShowMap) {
        this.setState({
          isShowMap: false,
          showTraceDialog: false
        });
        return;
      }
      let path = {
        pathname: '/query/patrol-task-list',
        params: this.tool.params,
        isExpand: this.tool.isExpand,
      };
      this.props.dispatch(routerRedux.push(path));
    }
  };

  render() {
    const columns = [{
      title: '设备类型', dataIndex: 'layername', key: 'layername', width: '65'
    }, {
      title: '设备编号', dataIndex: 'gid', key: 'gid', width: '80'
    }, {
      title: '到位情况', dataIndex: 'isArrive', key: 'isArrive', width: '65',
      render(text) {
        return text === 1 ? <span style={{'color': '#379FFF'}}>已完成</span>
         : <span style={{'color': 'red'}}>未完成</span>;
      }
    }, {
      title: '反馈情况', dataIndex: 'isFeedback', key: 'isFeedback', width: '65',
      sorter(a, b) {
        return a.isFeedback - b.isFeedback;
      },
      render(text) {
        return text === 1 ? '已反馈' : '未反馈';
      }
    }];

    const columnsContainFeedBack = [{
      title: '设备类型', dataIndex: 'layername', key: 'layername', width: '65'
    },
     {
      title: '到位情况', dataIndex: 'isArrive', key: 'isArrive', width: '65',
      render(text) {
        return text === 1 ?
          <span style={{textAlign: 'center', 'color': '#379FFF'}}>已到位</span>
         : <span style={{textAlign: 'center', 'color': 'red'}}>未到位</span>
      }},
      {
        title:'到位点时间',  dataIndex: 'arriveTime', key: 'arriveTime', width: '65',
      },
      {
        title:'精度(米)',  dataIndex: 'accuracy', key: 'accuracy', width: '65',
      },
    ];

    // 表格分页
    const pagination = {
      total: this.props.patrolTaskDetailData.length,
      pageSize: 20,
      showSizeChanger: true,
      showQuickJumper: true,
      onShowSizeChange(current, pageSize) {
        console.log('Current: ', current, '; PageSize: ', pageSize)
      },
      onChange(current) {
        console.log('Current: ', current)
      },
      showTotal: function () {  // 设置显示一共几条数据
        return <div id='pageTotal'>共 {this.total} 条数据</div>;
      }
    };
    let scrollY = this.state.tableHeight - (this.state.isShowMap ? 370 : 0);
    // 任务详情页面配置
    const field = {
      object: this.tool.data,
      location: this.location,
      table: <Table
        columns={hideFeekBack?columnsContainFeedBack:columns}
        dataSource={this.props.patrolTaskDetailData.taskPoints}
        pagination={pagination}
        rowKey={(record) => record.gid}
        onRow={(record, index) => ({
          onDoubleClick: () => {
            this.location();
          },
        })}
      />
    };

    return (
      <PageHeaderLayout showBack={this.goBack}>
        <div  style={{width: '100%', height: 'calc(100% - 175px)', minHeight: 'calc(100vh - 175px)', position: 'relative'}}>
          <div style={{display: !this.state.isShowMap?'block':'none'}}>
            <DetailPanel field={field} hideFeekBack={hideFeekBack} />
          </div>
          {this.state.isShowMap ?
            <div style={{width: '100%', height: '100%',left: 0, top: 0,position:'absolute',zIndex: 98}}>
              <EcityMap mapId="taskDetail" onMapLoad={this.onMapLoad} />
            </div> : null}
          {this.state.showTraceDialog ? <TrackInfo
            persons={[{id: this.props.patrolTaskDetailData.userids, name: this.props.patrolTaskDetailData.usernames, online: 1}]}
            queryDate={{startTime: this.props.patrolTaskDetailData.startTime, endTime: this.props.patrolTaskDetailData.endTime}}
            map={this.map}
            onClose={this.goBack}>
          </TrackInfo> : null}
        </div>
      </PageHeaderLayout>
    );
  }
}


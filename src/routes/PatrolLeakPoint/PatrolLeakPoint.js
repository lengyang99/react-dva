import React, {Component} from 'react';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {Table, DatePicker, message, Popover, Icon} from 'antd';
import SearchTablePanel from '../commonTool/SearchTablePanel/SearchTablePanel';
import EcityMap from '../../components/Map/EcityMap';
import {connect} from 'dva';
import {getAttachUrl} from '../../services/api';
import parseValues from '../../utils/utils';
import {routerRedux, Router, Route, Link} from 'dva/router';
const {RangePicker} = DatePicker;
import moment from 'moment';

const lineColor = ['#00CD66', '#3C763D', '#EC3842', '#D738EC', '#3871EC',
  '#EC9138', '#ECD438', '#98EC38', '#3DEC38', '#38EC86', '#67DDEF'];

const defaultParams = {
  startTime: null,
  endTime: null,
  pageno: 1,
  pagesize: 10,
};

@connect(state => ({
  user: state.login.user,
  token: state.login.token,
  patrolLeakPointData: state.patrolLeakPoint.patrolLeakPointData,
  patrolLeakPointTotal: state.patrolLeakPoint.patrolLeakPointTotal,
  bluetoothPointData: state.patrolLeakPoint.bluetoothPointData,
  bluetoothPointTotal: state.patrolLeakPoint.bluetoothPointTotal
}))

export default class PatrolDutyReport extends Component {
  constructor(props) {
    super(props);
    this.map = null; // 类ArcGISMap的实例
    this.state = {
      params: {
        ...defaultParams,
      },
      isShowMap: false,
    };
    this.initParams()
  }

  startTime = '';
  endTime = '';
  userids = '';
  functionKey = '';
  userName = '';
  taskId = '';

  componentDidMount(){
    if(this.functionKey === 'check_leak_device'){
      // this.getBluetoothDate()
      this.props.dispatch({
        type: 'patrolLeakPoint/queryBluetoothPoint',
        payload: {
          taskId: this.taskId,
          startTime: this.startTime,
          endTime: this.endTime,
          pageno: 1, 
          pagesize: 10,
        },
      });
    }else if(this.functionKey === 'check_leak_car'){
      // this.getPatrolLeakPointData();
      this.props.dispatch({
        type: 'patrolLeakPoint/queryPatrolLeakPoint',
        payload: {
          taskId: this.taskId,
          startTime: this.startTime,
          endTime: this.endTime,
          pageno: 1, 
          pagesize: 10,
        },
      });
    }
  }

  initParams = () => {
    const {location: {search}} = this.props;
    const {userids, startTime, endTime, functionKey, userName, taskId} = parseValues(search) || {};
    this.userids = userids;
    this.startTime = startTime;
    this.endTime = endTime;
    this.functionKey = functionKey;
    this.userName = userName;
    this.taskId = taskId;
  };

  onMapCreated = (arcGISMap) => {
    this.map = arcGISMap;
    // this.queryPatrolPosition();
  };
  //巡检车任务详情；
  getPatrolLeakPointData = () => {
    let {startTime, endTime, pageno, pagesize} = this.state.params;
    let payload = {};
    // payload.ecode = this.props.user.ecode;
    // payload.ecode = '0011';

    if (startTime && endTime) {
      payload.startTime = startTime.format('YYYY-MM-DD') + ' 00:00:00';
      payload.endTime = endTime.format('YYYY-MM-DD') + ' 23:59:59';
    }
    payload.pageno = pageno;
    payload.pagesize = pagesize;
    this.props.dispatch({
      type: 'patrolLeakPoint/queryPatrolLeakPoint',
      payload: payload,
    });
  };
  //检漏仪任务详情；
  getBluetoothDate = () => {
    let {startTime, endTime, pageno, pagesize} = this.state.params;
    let payload = {};
      payload.taskId = this.taskId;

    if (startTime && endTime) {
      payload.startTime = startTime.format('YYYY-MM-DD') + ' 00:00:00';
      payload.endTime = endTime.format('YYYY-MM-DD') + ' 23:59:59';
    }
    payload.pageno = pageno;
    payload.pagesize = pagesize;
    this.props.dispatch({
      type: 'patrolLeakPoint/queryBluetoothPoint',
      payload: payload,
    });
  }
  onClearMap = () => {
    this.map.getMapDisplay().removeLayer('show_trace_point');
    this.map.getMapDisplay().removeLayer('show_trace_line');
    this.map.getMapDisplay().removeLayer('play_trace_layer');
    this.map.getMapDisplay().removeLayer('show_stagnate_point_layer');
  }

  queryPatrolPosition = () => {
    // let stime = moment('2017-12-24').format('YYYYMMDDHHmmss');
    // let etime = moment('2017-12-25').format('YYYYMMDDHHmmss');

    // let adddays = moment(stime, 'YYYYMMDDHHmmss').add(7, 'days').format('YYYYMMDDHHmmss');
    let adddays = moment(this.startTime, 'YYYYMMDDHHmmss').add(7, 'days').format('YYYYMMDDHHmmss');
    if (this.startTime > this.endTime) {
      message.info('开始时间不得大于结束时间');
      return;
    }

    if (adddays < this.startTime) {
      message.info('查询时间不得大于7天');
      return;
    }
    // 每次查询之前清空图层
    this.onClearMap();
    // let userids = [51];
    this.props.dispatch({
      type: 'patrolTrace/queryPatrolPosition',
      // data: {
      //   userIds: userids.join(','),
      //   startTime: stime,
      //   endTime: etime
      // },
      data: {
        userIds: this.userids,
        startTime: this.startTime,
        endTime: this.endTime
      },
      callback: (res) => {
        // this.stagnatePointList = [];
        let resultList = res.upList;
        for (let i = 0; i < resultList.length; i++) {
          let length = 0;  // 记录人员巡检的里程

          let tmpPerson = {};
          // for (let k = 0; k < this.persons.length; k++) {
          //   if ((this.persons[k].id + '') === resultList[i].userid) {
          //     tmpPerson = this.persons[k];
          //     break;
          //   }
          // }

          for (let k = 0; k < resultList[i].points.length; k++) {
            let forlength = resultList[i].points[k].length;
            let dots = [];
            for (let j = 0; j < forlength; j++) {
              let id = resultList[i].userid + '_' + k + '_' + j;
              this.showPointMap(resultList[i].points[k][j], tmpPerson, id);
              dots.push({x: resultList[i].points[k][j].x, y: resultList[i].points[k][j].y});
              if (j < forlength - 1) {
                let xlength = Math.abs(resultList[i].points[k][j].x - resultList[i].points[k][j + 1].x);
                let ylnegth = Math.abs(resultList[i].points[k][j].y - resultList[i].points[k][j + 1].y);
                let tmplength = Math.sqrt(xlength * xlength + ylnegth * ylnegth);
                length = length + tmplength;
              }
            }

            //画出轨迹线
            let color = '';
            if (i < lineColor.length) {
              color = lineColor[i];
            }
            else {
              color = lineColor[i % lineColor.length];
            }
            this.showPolylineMap(dots, resultList[i].userid + '_' + k, color);
          }

          tmpPerson.patrollength = parseFloat(length / 1000).toFixed(3);


        }

      }
    });
  };

  showPointMap = (data, pserson, id) => {
    if (data.x <= 0 || data.y <= 0) {
      return;
    }
    data.username = this.userName;
    let param = {
      id: 'show_trace_point_' + id,
      layerId: 'show_trace_point',
      src: '../../images/positionTraceImage/point.png',
      x: data.x,
      y: data.y,
      width: 12,
      height: 12,
      angle: 0,
      attr: data,
      click: (attr) => {
        this.map.popup({
          x: attr.attributes.x,
          y: attr.attributes.y,
          info: {
            title: '轨迹点信息',
            content: [
              {name: '用户', value: attr.attributes.username},
              {name: '时间', value: attr.attributes.time},
              {name: '速度', value: parseFloat(attr.attributes.speed).toFixed(3) + '公里/时'},
              {name: 'x值', value: attr.attributes.x},
              {name: 'y值', value: attr.attributes.y},
              {name: '经度', value: attr.attributes.lon},
              {name: '纬度', value: attr.attributes.lat},
              {name: '精度', value: parseFloat(attr.attributes.accuracy).toFixed(2)},
              {name: '电量', value: attr.attributes.battery},
            ],
          }
        });
      }
    };
    this.map.getMapDisplay().image(param);
  };
  //展示详情点；
  showDetailPointMap = (data) => {
    if (data.longitude <= 0 || data.latitude <= 0) {
      return;
    }
    // x: taskPoints[i].longitude
    for (var i = 0; i < data.length; i++) {
      if(this.functionKey === 'check_leak_device'){
        let param = {
          id: 'show_detail_point_' + data[i].taskId,
          layerId: 'show_detail_point',
          src: '../../images/task-detail/isArrive.png',
          x: data[i].longitude,
          y: data[i].latitude,
          width: 20,
          height: 28,
          angle: 0,
          attr: data,
        };
        this.map.getMapDisplay().image(param);
      }else if(this.functionKey === 'check_leak_car'){
        const pointeDate = JSON.parse(data[i].geometry)
        console.log(pointeDate, "aaaaa");
        let param = {
          id: 'show_detail_point_' + data[i].taskid,
          layerId: 'show_detail_point',
          src: '../../images/task-detail/isArrive.png',
          x: pointeDate.x,
          y: pointeDate.y,
          width: 20,
          height: 28,
          angle: 0,
          attr: data,
        };
        this.map.getMapDisplay().image(param);
      }
    }
  }

  showPolylineMap = (dots, id, color) => {
    if (dots.length === 0) {
      return;
    }
    this.map.centerAt(dots[0]);
    let paramLine = {
      id: 'show_trace_line_' + id,
      layerId: 'show_trace_line',
      color: color,
      width: 4,
      dots: dots
    };
    this.map.getMapDisplay().polyline(paramLine);
  };

  showMap = () => {
    let that = this;
    this.setState({
      isShowMap: true,
    });
    let datas = this.props.patrolLeakPointData;
    let detailPonit = this.functionKey === 'check_leak_device' ? this.props.bluetoothPointData : this.props.patrolLeakPointData;
    let first = null;
    for (let i = 0; i < datas.length; i++) {
      let geometry = JSON.parse(datas[i].geometry);
      if(i===0){
        first=geometry;
      }
      const param = {
        id: `testlayerid${i}`,
        layerId: 'leakpointlayer',
        src: '../../images/positionTraceImage/leak_point.png',
        attr: datas[i],
        x: geometry.x,
        y: geometry.y,
        width: 18,
        height: 18,
        click: (point) => {
          that.map.popup({
            x: point.geometry.x,
            y: point.geometry.y,
            info: {
              title: point.attributes.gid,
              content: [
                {name: '上报人', value: point.attributes.reportUser},
                {name: '上报时间', value: point.attributes.reportTime},
                // {name: '光照强度', value: point.attributes.light},
                {name: '甲烷浓度', value: point.attributes.methane},
              ]
            },
          });
        }
      };
      this.map.getMapDisplay().image(param);
    }
    this.showDetailPointMap(detailPonit)
    this.queryPatrolPosition();

    if(first){
      this.map.centerAt(first);
    }
  };

  onChangeRangeTime = (value) => {
    let params = this.state.params;
    params.startTime = value[0];
    params.endTime = value[1];
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
    this.getPatrolLeakPointData();
  };

  reset = () => {
    let params = this.state.params;
    params.startTime = null;
    params.endTime = null;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
    this.getPatrolLeakPointData();
  };

  goBack = () => {
    if(this.state.isShowMap){
      this.setState({isShowMap: false});
      return
    }
    this.props.dispatch(routerRedux.push(`/query/leak-task?function=${this.functionKey}`))
  };

  render() {
    let that = this;

    // 表格列
    const columns = [
      {
        title: '上报人',
        dataIndex: 'taskId',
        key: 'taskId',
        render: (text) => {
          return <span>{this.userName}</span>
        }
      },
      {
        title: '上报时间', dataIndex: this.functionKey === 'check_leak_device' ? 'time' : 'reportTime', key: 'time',
      },
      // {
      //   title: '光照强度', dataIndex: 'light', key: 'light',
      // },
      {
        title: '甲烷浓度',
        dataIndex: this.functionKey === 'check_leak_device' ? 'concentration' : 'methane',
         key: 'concentration',
        render:(text)=>{
          return `${text} ppm*m`
        }
      }
    ];

    if(this.functionKey === 'check_leak_car'){
      columns.push({
        title: '照片', dataIndex: 'img', key: 'isstoped',
        render: (text, record) => {
          let src = getAttachUrl(record.img);
          return (<Popover style={{padding: 0}} trigger="click" content={<img style={{width: 300, height: 300}} src={src}/>}>
            <img style={{width: 48, height: 48}} src={src}/>
          </Popover>);
        }
      })
    }

    // 表格分页
    const pagination = {
      total: this.functionKey === 'check_leak_car' ? this.props.patrolLeakPointTotal : this.props.bluetoothPointTotal,
      current: that.state.params.pageno,
      pageSize: that.state.params.pagesize,
      showSizeChanger: true,
      showQuickJumper: true,
      onChange(page, pageSize) {
        let params = that.state.params;
        params.pageno = page;
        params.pagesize = pageSize;
        that.setState({
          params: params,
        });
        that.getPatrolLeakPointData();
      },
      onShowSizeChange(current, pageSize) {
        let params = that.state.params;
        params.pageno = current;
        params.pagesize = pageSize;
        that.setState({
          params: params,
        });
        that.getPatrolLeakPointData();
      },
      showTotal: function () {  // 设置显示一共几条数据
        return <div>共 {this.total} 条数据</div>;
      }
    };

    // 任务页面配置
    const field = {
      searchWidth: '300px',
      search: [
        <RangePicker style={{width: 230, marginTop: 2}}
                     value={[this.state.params.startTime, this.state.params.endTime]}
                     onChange={this.onChangeRangeTime}/>,
      ],
      table: <Table
        rowKey={(record) => record.gid}
        columns={columns}
        dataSource={this.functionKey === 'check_leak_car' ? this.props.patrolLeakPointData : this.props.bluetoothPointData}
        bordered={false}
        pagination={pagination}
      />,
      other: <img src='../images/task-detail/location.png' onClick={this.showMap}/>,
    };
    return (
      <PageHeaderLayout showBack={this.goBack}>
        <div
          style={{width: '100%', height: 'calc(100% - 175px)', minHeight: 'calc(100vh - 175px)', position: 'relative'}}>
          <SearchTablePanel field={field} onReset={this.reset}/>
          <div style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            display: this.state.isShowMap ? 'block' : 'none',
            backgroundColor: '#fff',
            left: 0,
            top: 0,
            zIndex: 111
          }}>
            <EcityMap mapId="patrolLeakPoint" onMapLoad={this.onMapCreated}/>
          </div>
        </div>
      </PageHeaderLayout>
    );
  }
}

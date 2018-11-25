import React, {PureComponent} from 'react';
import {connect} from 'dva';
import _ from 'lodash';
import {Table, Button, Input, message, Select, Popconfirm, Divider, InputNumber, Col, DatePicker } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {routerRedux} from 'dva/router';
import styles from './CheckData/style.less'
import parseValues from '../../utils/utils';

const {Option} = Select;
const operator = ['张三', '李四', '王五', '刘麻子'];

@connect(({station, login}) => ({
  objManage: station.objManage,
  groups: station.groups,
  user: login.user,
  stations: station.stations,
  userDatas: login.datas ||[]
}))
export default class CheckData extends PureComponent {
  constructor(props) {
    super(props);
    this.edit = false;
    this.state = {
      data: [],
      operator: '',
      adjustTime: null,
      areaObj: '',
      stationId: '',
      noticeTotal: 0,
      pageno: 1,
      pagesize: 10,
    };
    this.initParams()
  }

  ecode = '';
  equipmentUnitId = '';
  stationId = '';

  componentDidMount(){
    const {pageno, pagesize} = this.state;
    this.props.dispatch({
      type: 'station/getStationData'
    });
    this.props.dispatch({
      type: 'station/queryNotice',
      payload: {
        pageno:{pageno, pagesize}
      },
      callback: ({data, total}) =>{
        this.setState({
          data,
          noticeTotal: total,
        })
      }
    });

    this.props.dispatch({
      type: 'station/queryObjManage',
    });



  }

  initParams = () => {
    const { location: { search } } = this.props;
    const { stationId, operator, adjustTime, areaObj} = parseValues(search) || '';
    // this.stationId = stationId;
    // this.operator = operator;
    // this.adjustTime = adjustTime;
    // this.areaObj = areaObj;
    this.setState({
      operator,
      adjustTime,
      areaObj,
      stationId
    })
  };
  changeAreaHandler = (fileName, val) => {
    console.log(fileName, val);
    this.setState({
      [fileName]: val,
    })
  };

  checkHandler = (params = {}) => {
   const {operator, adjustTime, areaObj, stationId, pagesize} = this.state;
   this.props.dispatch({
    type: 'station/queryNotice',
    payload:{
      operatorName: operator,
      adjustTime,
      adjustPressureTargetId: areaObj,
      stationId,
      pageno: 1,
      pagesize,
      ...params
    },
    callback: ({data, total}) =>{
      this.setState({
        data,
        noticeTotal: total,
      })
    }
   })
   if (Object.keys(params).length === 0) {
     this.setState({
        pageno: 1,
     })
   }
  };

  addNotice = () => {
    this.props.dispatch(routerRedux.push(`/station/addnotice`));
  };

  clickRow = (val) => {
    console.log(val, 'click');
    const {adjustTime} = this.state
    this.props.dispatch(routerRedux.push(`/station/record?adjustPressureRecordId=${val.gid}&adjustPressureTargetId=${val.adjustPressureTargetId}&adjustTime=${adjustTime}&adjustType=${val.adjustType}`));
  };

  pageChange = (current, pageSize) => {
    console.log(current, pageSize, 'current, pageSize');
    this.setState({
      pageno: current,
      pagesize: pageSize,
    })
    // this.props.dispatch({
    //   type: 'station/queryNotice',
    //   payload: {
    //     pageno:{
    //       pageno: current,
    //       pagesize: pageSize,
    //     }
    //   },
    //   callback: ({data, total}) =>{
    //     this.setState({
    //       data,
    //     })
    //   }
    // });
    this.checkHandler({pageno: current, pagesize: pageSize})
  };

  render() {
    // const {objManage } = this.props;
    const objManage = [...this.props.objManage];
    objManage.unshift({gid: '', name: '全部'})
    const stations = [...this.props.stations];
    stations.unshift({gid: '', name: '全部'})
    const {data, noticeTotal, pageno, pagesize} = this.state;
    const pagination = {
      total: noticeTotal,
      current: pageno,
      pageSize: pagesize,
      showTotal: (total, range) => {
        return (<div>
          共 {total} 条记录 第{pageno}/{Math.ceil(total / pagesize)}页
        </div>);
      },
      onChange: (current, pageSize) => {
        this.pageChange(current, pageSize)
      }
    };
    console.log(this.state, 'state,state');
    const columns = [
      {
        title: '调整时间',
        dataIndex: 'adjustTime',
        key: 'adjustTime',
      }, {
        title: '操作人',
        dataIndex: 'operatorName',
        key: 'operatorName',
      }, {
        title: '调压对象',
        dataIndex: 'adjustPressureTargetName',
        key: 'adjustPressureTargetName',
      },{
        title: '通知调整压力',
        dataIndex: 'afterAdjustPressure',
        key: 'beforeAdjustPressure',
      },{
        title: '实际调整压力',
        dataIndex: 'trueAdjustPressure',
        key: 'trueAdjustPressure',
      },{
        title: '阶段',
        dataIndex: 'status',
        key: 'status',
        render: (text) =>
         text === 1 ? <span>通知</span> : <span>调压完成</span>
      }
    ];


    return (
    <PageHeaderLayout>
      <div style={{ padding: '20px 0'}}>
        <div style={{ height: 40}}>
          <div className={styles['field-block']}>
            <label>日期：</label>
            <DatePicker onChange={(data, dataString) => {this.changeAreaHandler('adjustTime', dataString)}}/>
          </div>
          <div className={styles['field-block']}>
            <label>站点：</label>
            <Select
              defaultValue="全部"
              style={{ width: 120 }}
              onSelect={(val) => {this.changeAreaHandler('stationId', val)}}
            >
              {
                stations && stations.map((item) =>
                  <Option key={item.gid} value={item.gid} dataRef={item}>{item.name}</Option>
                )
              }
            </Select>
          </div>
          <div className={styles['field-block']}>
            <label>操作人：</label>
            <Select
              defaultValue="全部"
              allowClear
              style={{ width: 120 }}
              onSelect={(val) => {this.changeAreaHandler('operator', val)}}
            >
              {
                operator && operator.map((item) =>
                  <Option key={item} value={item} >{item}</Option>
                )
              }
            </Select>
          </div>
          <div className={styles['field-block']}>
            <label>调压对象：</label>
            <Select
              defaultValue="全部"
              style={{ width: 200 }}
              onSelect={(val) => {this.changeAreaHandler('areaObj', val)}}
            >
              {
                objManage && objManage.map((item) =>
                  <Option key={item.gid} value={item.gid} >{item.name}</Option>
                )
              }
            </Select>
          </div>
          <div className={styles['field-block']}><Button type='primary' onClick={() => this.checkHandler({})}>查询</Button></div>
          <div style={{dispaly: 'inline-block' , float: 'right', marginRight: 15}}><Button type='primary' onClick={this.addNotice}>发起通知</Button></div>
        </div>
            <Table
              style={{cursor: 'pointer'}}
              rowKey={record => record.gid}
              columns={columns}
              dataSource={data}
              pagination={pagination}
              onRow={(record) => ({
                onDoubleClick: () => {this.clickRow(record)},
              })}
            />
      </div>
    </PageHeaderLayout>
    );
  }
}

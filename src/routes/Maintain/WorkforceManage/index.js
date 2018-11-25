import React, { Component } from 'react';
import {connect} from 'dva';
import moment from 'moment';
import { Select, Button, Radio, message, Modal, Input, Tooltip} from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './index.less';
import WorkCalendar from './WorkCalendar';
// import DangerWork from '../../../components/DangerWork';
import {routerRedux} from 'dva/router';
const RadioGroup = Radio.Group;
const Option = Select.Option;
const confirm = Modal.confirm;
@connect(({ station, maintain, login}) => ({
  regions: station.regions,
  // areaData: maintain.areaData,
  user: login.user,
}))
export default class IntelliSche extends Component {
  state={
    selectd: '班组排班',
    showChecked: false,
    staId: '',
    month: moment().add(1, 'months').format('YYYY-MM'),
    date: moment().format('YYYY-MM'),
    areaData: [],  //区域数据
    stationid: '',  //A0001
    regionId: '',  //区域id
    regionName: '',
    zoneId: '',  //部门id
    pbType: '',  //排班类型
    isShowDanger: false,
  }
  calendar = null;
  ecodeName = '';
  componentDidMount() {
    //查询网格所
    this.props.dispatch({
      type: 'station/getRegionData',
      callback: (data) => {
        if(data === undefined ||  data.length === 0){
          return
        }
        this.setState({
          zoneId: data[0].gid,
        })
        this.checkArea(data[0].stationCode, data[0].gid)
      }
    });
    this.ecodeName = this.props.user.cCompany
  }

  checkArea = (val, zoneId) => {
    //查询人员
    this.props.dispatch({
      type: 'station/queryFeedbackUsers',
      payload:{stationId: zoneId},
    });
    const params = {
      selectd: '班组排班',
      regionId: '',
      zoneId: zoneId,
      pbType: '',
    }
    this.calendar.getSchedulData(params);
    this.props.dispatch({
      type: "maintain/queryModuleAreaData",
      payload: {stationid: val},
      callback: (data) => {
        if(data.length === 0) return
        this.setState({
          areaData: data,
          stationid: val,
          // regionId: data[0].children && data[0].children.length > 0 ?  data[0].children[0].gid : '',
          // regionName: data[0].children && data[0].children.length > 0 ?  data[0].children[0].name : '',
        })
      },
    });
  }

  // 查询
  onSearch = () => {
    if (this.calendar) {
      const params = {...this.state}
      this.calendar.getSchedulData(params);
      //查询人员
      this.props.dispatch({
        type: 'station/queryFeedbackUsers',
        payload:{stationId: this.state.zoneId},
      });
    }
  }


  onDateChange = (date) => {
    this.setState({date, month: moment(date).add(1, 'months').format('YYYY-MM')});
  }
  onChangeMonth = (value) => {
    this.setState({month: value});
  };

  changeHandler = (val, fileName, node) => {
    const {dispatch, regions, areaData} = this.props;
    if(fileName === 'zoneId'){
      const {dataRef} = node.props;
      //查询人员
      this.props.dispatch({
        type: 'station/queryFeedbackUsers',
        payload:{stationId: val},
      });
      this.props.dispatch({
        type: "maintain/queryModuleAreaData",
        payload: {stationid: dataRef.stationCode},
        callback: (data) => {
          if(data.length === 0) return
          this.setState({
            areaData: data,
            stationid: dataRef.stationCode,
            // regionId: data[0].children && data[0].children.length > 0 ?  data[0].children[0].gid : '',
            // regionName: data[0].children && data[0].children.length > 0 ?  data[0].children[0].name : '',
            regionId: '',
            regionName: '',
          }, () => {
            this.onSearch()
          })
        },
      });
      this.setState({
        regionId: '',
      })
    }else if(fileName === 'regionId'){
      const {dataRef} = node.props;
      console.log(dataRef, 'dataRef')
      this.setState({
        regionName: dataRef ? dataRef.name : '',
      }, () => {
        this.onSearch()
      })
    }
    this.setState({
      [fileName]: val,
    })
  }

  render() {
    const {regions} = this.props;
    const {areaData, stationid} = this.state;

    return (
      <PageHeaderLayout>
        <div>
          <div>
            <div className={styles['field-block']}>
              <label> 企业名称: </label>
              <Input value={this.ecodeName} className={styles.select} disabled/>
            </div>
            <div className={styles['field-block']}>
              <label> 组织: </label>
              <Select
                placeholder="请选择组织"
                style={{width: 180}}
                className={styles.select}
                value={this.state.zoneId}
                allowClear
                onSelect={(val, node) => {this.changeHandler(val, 'zoneId', node)}}
              >
                {
                  regions && regions.map((item) =>
                      <Option key={item.gid} value={item.gid} dataRef={item}><Tooltip className={styles['textOverflowS']} placement="top" title={item.name}>{item.name}</Tooltip></Option>
                  )
                }
              </Select>
            </div>
            <div className={styles['field-block']}>
              <label> 区域: </label>
              <Select
                placeholder="请选择区域"
                style={{width: 180}}
                className={styles.select}
                value={this.state.regionId}
                allowClear
                onSelect={(val, node) => {this.changeHandler(val, 'regionId', node)}}
              >
                <Option key='all' value=''>
                    <Tooltip placement="top" title='全部'>全部</Tooltip>
                </Option>
                {
                  areaData && areaData.map((item) => {
                    if(item.children && item.children.length > 0){
                        return item.children.map((item1) =>
                            <Option key={item1.eqlocation.gid} value={item1.gid} dataRef={item1}>
                                <Tooltip placement="top" title={item1.name}>{item1.name}</Tooltip>
                            </Option>
                        )
                    }
                  })
                }
              </Select>
            </div>
            {/* <div className={styles['field-block']}>
              <label> 排班类型: </label>
              <Select
                value={this.state.pbType}
                className={styles.select}
                onSelect={val => this.changeHandler(val, 'pbType')}>
                <Option key='work_1' value='1'>周排班</Option>
                <Option key='work_2' value='2'>排班</Option>
              </Select>
            </div> */}
            {/* <div className={styles['field-block']}><Button type='primary' onClick={this.onSearch.bind(this)}>查询</Button></div> */}
          </div>
        </div>
        <div>
          <WorkCalendar
            {...this.props}
            onRef={(ref) => { this.calendar = ref; }}
            onDateChange={(date) => { this.onDateChange(date); }}
            bcType={this.state.selectd}
            region={{id: this.state.regionId, name: this.state.regionName}}
            zoneId={this.state.zoneId}
            stationid={stationid}
            showChecked={this.state.showChecked}
            areaData={this.state.areaData}
          />
        </div>
      </PageHeaderLayout>
    );
  }
}

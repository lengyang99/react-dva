import React, {PureComponent} from 'react';
import {Tabs, Button, message, Select, Col, Table, Input, Popconfirm, TimePicker, Divider, Row} from 'antd';
import {connect} from 'dva';
import moment from 'moment';
import _ from 'lodash';
import {routerRedux} from 'dva/router';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import parseValues from '../../utils/utils';
import styles from './CheckData/style.less'

const Option = Select.Option;
const PeriodFormat = 'HH:mm:ss';

@connect(({station, login}) => ({
  groups: station.groups,
  data: station.data,
  stations: station.stations,
  classManage: station.classManage,
  user: login.user,
  userDatas: login.datas ||[]
}))



export default class ClassManage extends PureComponent {
  constructor(){
    super()

    this.state = {
      data: [],
      backupsData: [],  //原始数据；
      st: null,
      et: null,
      isShow: false,
      isEndShow: false,
      stationId: '',
      ecode: '',
      isChangeA: false,
    };
    this.idx = 0
    this.edit = false;
  };

  componentDidMount() {
    this.props.dispatch({
      type: 'station/getStationData'
    });
  }
  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setState({
        data: nextProps.value,
      });
      this.edit = false;
    }
  }

  getRowByKey(key) {
    return this.state.data.filter(item => item.gid === key)[0];
  }

  index = 0;
  cacheOriginData = {};

  toggleEditable(e, key) {
    e.preventDefault && e.preventDefault();
    const target = this.getRowByKey(key);
    if(this.state.isChangeA){
      message.error('请先点击查询！');
      return
    }
    if (target) {
      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        this.cacheOriginData[key] = {...target};
      }
      target.editable = !target.editable;
      const newData = [...this.state.data]
      this.setState({data: newData});
      this.edit = !this.edit;
    }
  }

  remove(key) {
    const { stationId, ecode} = this.state;
    if(!isNaN(Number(key))){
      this.props.dispatch({
        type: 'station/delClassManage',
        payload: {
          workTimeId: key,
        },
        callback: () => {
          this.props.dispatch({
            type: 'station/queryClassManage',
            payload: {
              ecode,
              stationId,
            },
            callback: (data)=> {
              console.log(data, "del");
                this.setState({
                  data: data,
                })
              }
          })
        }
      })
    }else{
      const newData = this.state.data.filter(item => item.gid !== key);
      this.setState({data: newData});
      this.edit = false;
    }
  }

  newMember = () => {
    if(!this.state.stationId){
      message.error('请先选择站点并点击查询！');
      return;
    }
    if (this.state.isChangeA) {
      message.error('请先点击查询！');
      return;
    }
    if (this.edit === true) {
      message.error('请先保存编辑的行信息。');
      return;
    }
    const newData = [...this.state.data];
    newData.push({
      gid: `NEW_TEMP_ID_${this.index}`,
      findex: this.idx,
      name: '',
      startTime: null,
      endTime: null,
      editable: true,
      isNew: true,
    });
    this.index += 1;
    this.setState({data: newData});
    this.edit = true;

  };

  handleFieldChange = (value, fieldName, key, idx) => {
    console.log(value, fieldName, "value");
    if(fieldName === 'startTime'){
      console.log(2222);
      this.setState({
        st: value,
        isShow :false,
      })
    }
    if(fieldName === 'endTime'){
      this.setState({
        et: value,
        isEndShow: false,
      })
    }
    const newData = [...this.state.data];

    const target = this.getRowByKey(key)
    if (target) {
      target[fieldName] = value;
      this.setState({
        data: newData,
      });
    }

  };

  saveRow(e, key) {
    e.persist();
    setTimeout(() => {
      if (this.clickedCancel) {
        this.clickedCancel = false;
        return;
      };
      const {data, backupsData} = this.state;
      const target = this.getRowByKey(key) || {};
      if (!target.name || !target.startTime || !target.endTime) {
        message.error('请填写完整反馈项信息！');
        return;
      };

      // const nameUnique = _.sortBy(data, 'name')
      // for (var i = 0; i < nameUnique.length - 1; i++) {
      //     if (nameUnique[i].name === nameUnique[i + 1].name) {
      //         message.error("班次名称不能相同,请修改！");
      //         return
      //     }
      // }
      delete target.isNew;
      this.toggleEditable(e, key);
      this.edit = false;
      this.idx = target.findex;
    }, 10);
  }

  cancel(e, key) {
    this.clickedCancel = true;
    e.preventDefault();
    const target = this.getRowByKey(key);
    if (this.cacheOriginData[key]) {
      Object.assign(target, this.cacheOriginData[key]);
      target.editable = false;
      delete this.cacheOriginData[key];
    }
    this.setState({data: [...this.state.data]});
    this.edit = false;
  };

  submitHandler = () => {
    const {data, backupsData, stationId, ecode} = this.state;
    if(data.length === backupsData.length){
      let isChange = 0
      for (var i = 0; i < backupsData.length; i++) {
        if(data[i].name === backupsData[i].name && data[i].startTime === backupsData[i].startTime && data[i].endTime === backupsData[i].endTime){
          isChange++
        }
      }
      if(isChange === backupsData.length){
        message.error('数据没有修改不用提交！');
        return;
      }
    }

    const params = [];
    this.state.data.map((item) => {
      return params.push({
        "workTimeId": !isNaN(Number(item.gid)) ? item.gid : null,
        "ecode": ecode,
        "stationId": stationId,
        "name": item.name,
        "startTime":  typeof(item.startTime) === 'string' ? item.startTime : moment(item.startTime).format('HH:mm:ss'),
        "endTime": typeof(item.endTime) === 'string' ? item.endTime : moment(item.endTime).format('HH:mm:ss'),
      })
    })
      console.log(params, "params,☆");
      this.props.dispatch({
        type: 'station/addClassManage',
        payload: params,
        callback: ({success, msg}) => {
          if(success){
            message.success('创建班次成功！')
          }else{
            message.warn('创建班次失败！')
          }
        }
      })
  };

  isShowHandle = (val) => {
    console.log(val, 123);
    this.setState({
      isShow : val,
    })
  }
  isEndShowHandle = (val) => {
    console.log(val, 'val');
    this.setState({
      isEndShow : val,
    })
  };

  changeAreaHandler = (val, node) => {
    const {dataRef} = node.props;
    if (val === '') {
      this.setState({isChangeA: false})
    }else{
      this.setState({isChangeA: true})
    }
    // this.props.dispatch({
    //   type: 'station/queryGroups',
    //   payload:{stationId:val},
    // });
    this.setState({
      stationId: val,
      stationName: dataRef.name,
      ecode: dataRef.ecode,
    })
  };

  checkHandler = () => {
   const {stationId, ecode, areaId} = this.state;
   this.edit = false;
   this.setState({isChangeA: false});
    this.props.dispatch({
      type: 'station/queryClassManage',
      payload: {
        ecode,
        stationId,
      },
      callback: (data) => {
        console.log(data, "data");
        const arr = [];
        for (var i = 0; i < data.length; i++) {
          arr.push(Object.assign({}, data[i]))
        }
        this.setState({
          data: data,
          backupsData: arr,
        })
      }
    })
  };



  render() {
  console.log(this.state.data,this.isShow, "state★");
  const stations = [...this.props.stations];
  stations.unshift({gid: '', name: '全部'})
  const columns = [
    {
      title: '班次',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text, record, index) => {
        if (record.editable) {
          return (
            <Input
              value={text}
              onChange={
                e =>
                  this.handleFieldChange(e.target.value, 'name', record.gid, index)
              }
            />
          );
        }
        return text;
      },
    }, {
      title: '值班开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 150,
      render: (text, record, index) => {
        let st = typeof(text) === 'string' ? moment(text, 'HH:mm:ss') : text;
        if (record.editable) {
          return (
              <TimePicker
                format={PeriodFormat}
                value={st}
                // open={this.state.isShow}
                // disabledHours={()=>{
                //   let end = index > 0 ? moment(this.state.data[index - 1].endTime, 'HH:00') : null;
                //   return _.range(0,end ? end.hour() + 1 :0);
                // }}
                onChange={ value => this.handleFieldChange(value, 'startTime', record.gid)}
                // onOpenChange={(val) => this.isShowHandle(val)}
              />
          );
        }
        return <TimePicker value={st} format='HH:mm:ss' disabled/>;
      },
    },  {
      title: '值班结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text, record) => {
        let et = typeof(text) === 'string' ? moment(text, 'HH:mm:ss') : text;
        if (record.editable) {
          return (
              <TimePicker
                hideDisabledOptions={true}
                // disabledHours={()=>{
                //   let begin = this.state.st;
                //   return _.range(0,begin ? begin.hour():0);
                // }}
                format='HH:mm:ss'
                value={et}
                // open={this.state.isEndShow}
                onChange={ value => this.handleFieldChange(value, 'endTime', record.gid)}
                // onOpenChange={(val) => this.isEndShowHandle(val)}
              />
          );
        }
        return <TimePicker value={et} format='HH:mm:ss' disabled/>;
      },
    },{
      title: '操作',
      key: 'action',
      render: (text, record) => {
        if (record.editable) {
          if (record.isNew) {
            return (
              <span>
                <a onClick={(e) => {
                  this.saveRow(e, record.gid)
                }}>保存</a>
                <Divider type="vertical"/>
                <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.gid)}>
                  <a>删除</a>
                </Popconfirm>
              </span>
            );
          }
          return (
            <span>
              <a onClick={(e) => {
                this.saveRow(e, record.gid)
              }}>保存</a>
              <Divider type="vertical"/>
              <a onClick={e => this.cancel(e, record.gid)}>取消</a>
            </span>
          );
        }
        return (
          <span>
            <a onClick={e => this.toggleEditable(e, record.gid)}>编辑</a>
            <Divider type="vertical"/>
            <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.gid)}>
              <a>删除</a>
            </Popconfirm>
          </span>
        );
      },
    }];

    return (
      <PageHeaderLayout>
        <div style={{minWidth: 700}}>
          <div style={{ height: 40, margin: '20px 20px', padding: '20px 0'}} id='area'>
            <div className={styles['field-block']}>
              <label>站点：</label>
              <Select
                defaultValue="全部"
                style={{ width: 120 }}
                onSelect={this.changeAreaHandler}
                getPopupContainer={() => document.getElementById('area')}
              >
                {
                  stations && stations.map((item) =>
                    <Option key={item.gid} value={item.gid} dataRef={item}>{item.name}</Option>
                  )
                }
              </Select>
            </div>
            <div className={styles['field-block']}><Button type='primary' onClick={this.checkHandler}>查询</Button></div>
            <div style={{dispaly: 'inline-block' , float: 'right', marginRight: 20}}>
              <Button
                type='primary'
                onClick={this.newMember}
                icon="plus"
              >
                新增班次
              </Button>
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={this.state.data}
            pagination={false}
            rowKey={record => record.gid}
          />
          <Row style={{textAlign: 'center', margin: '20px 0'}}>
            <Col span={2} offset={10}><Button type='primary' onClick={this.submitHandler} loading={this.state.submitting}>提交</Button></Col>
            <Col span={2}><Button type='primary' onClick={this.checkHandler}>重置</Button></Col>
          </Row>
        </div>
      </PageHeaderLayout>
    );
  }
}

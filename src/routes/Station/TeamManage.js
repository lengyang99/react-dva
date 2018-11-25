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
const PeriodFormat = 'HH:00';

@connect(({station, login}) => ({
  // funcList: station.funcList,
  groups: station.groups,
  data: station.data,
  stations: station.stations,
  classManage: station.classManage,
  user: login.user,
  userDatas: login.datas ||[],
  feedbackUsers: station.feedbackUsers,
}))



export default class TeamManage extends PureComponent {
  constructor(){
    super()

    this.state = {
      data: [],
      backupsData: [],  //原始数据；
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
    const {stationId, ecode, areaId} = this.state;
    if(!isNaN(Number(key))){
      this.props.dispatch({
        type: 'station/delTeamManage',
        payload: {
          workGroupId: key,
        },
        callback: (data) => {
          this.props.dispatch({
            type: 'station/queryTeamManage',
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
      workGroupName: '',
      monitorName: '',
      memberLead: '',
      memberName: [],
      editable: true,
      isNew: true,
    });
    this.index += 1;
    this.setState({data: newData});
    this.edit = true;

  };

  handleFieldChange = (value, fileName, key, node) => {
    console.log(value, fileName, "value");
    let val = value
    const newData = [...this.state.data];
    const target = this.getRowByKey(key)
    if(fileName === 'memberName' && val !== []){
      const memberArr = [];
      node.map(item => {
        memberArr.push({
          id: item.props.dataRef.userid,
          name: item.props.dataRef.truename,
        })
      })
      val = memberArr
    }else if(fileName === 'monitorName'){
      if(value !== undefined){
        const {dataRef} = node.props;
        val = {id: dataRef.userid, name: value}
      }
    }
    else if(fileName === 'memberLead' ){
      if(value !== undefined){
        const {dataRef} = node.props;
        val = {id: dataRef.userid, name: value}
      }else{
        val = {id: '', name: ''}
      }
    }
    if (target) {
      target[fileName] = val;
      this.setState({
        data: newData,
      });
      console.log(target, "target");
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
      if (!target.workGroupName || !target.monitorName) {
        message.error('请填写完整反馈项信息！');
        return;
      };
      if (target.memberName && target.memberName.length === 0 && !target.members) {
        message.error('请填写完整反馈项信息！');
        return;
      };

      const nameUnique = _.sortBy(data, 'name')
      for (var i = 0; i < nameUnique.length - 1; i++) {
          if (nameUnique[i].workGroupName === nameUnique[i + 1].workGroupName) {
              message.error("班组名称不能相同,请修改！");
              return
          }
      }
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
    console.log(123);
    const {data, backupsData, stationId, ecode} = this.state;
    const params = [];
    this.state.data.map((item) => {
      const membersArr = [];
        if(item.members && !item.memberName){
            item.members.map( item1 => {
              if(item1.memberStatus === 0){
                membersArr.push({
                  "memberStatus": 0,
                  "workGroupMemberId": item1.gid,
                  "ecode": item1.ecode,
                  "stationId": item1.stationId,
                  "workGroupId": item.gid,
                  "memberId": item1.memberId,
                  "memberName": item1.memberName
                })
              }
            })
        }else if(item.members && item.memberName){
          item.memberName.map( item1 => {
            membersArr.push({
              "memberStatus": 0,
              "workGroupMemberId": null,
              "ecode": ecode,
              "stationId": stationId,
              "workGroupId": item.gid,
              "memberId": item1.id,
              "memberName": item1.name,
            })
          })
        }else if(!item.members && item.memberName){
          item.memberName.map((item2) =>
            membersArr.push({
              "memberStatus": 0,
              "workGroupMemberId": null,
              "ecode": ecode,
              "stationId": stationId,
              "workGroupId": null,
              "memberId": item2.id,
              "memberName": item2.name,
            })
          )
        }
        if(item.members && !item.memberLead){
          item.members.map(item1 => {
            if(item1.memberStatus === 1){
              membersArr.push({
                "memberStatus": 1,
                "workGroupMemberId": item1.gid,
                "ecode": item1.ecode,
                "stationId": item1.stationId,
                "workGroupId": item.gid,
                "memberId": item1.memberId,
                "memberName": item1.memberName,
              })
            }
          })
        }else if(item.members && item.memberLead){
          membersArr.push({
            "memberStatus": 1,
            "workGroupMemberId": null,
            "ecode": ecode,
            "stationId": stationId,
            "workGroupId": item.gid,
            "memberId": item.memberLead.id,
            "memberName": item.memberLead.name,
          })
        }else if(item.memberLead){
          membersArr.push({
            "memberStatus": 1,
            "workGroupMemberId": null,
            "ecode": ecode,
            "stationId": stationId,
            "workGroupId": null,
            "memberId": item.memberLead.id,
            "memberName": item.memberLead.name,
          })
        }
      return params.push({
        "workGroupId": !isNaN(Number(item.gid)) ? item.gid : null,
        "ecode": ecode,
        "stationId": stationId,
        "monitorId": typeof (item.monitorName) == 'object' ? item.monitorName.id : item.monitorId,
        "workGroupName": item.workGroupName,
        "monitorName":  typeof (item.monitorName) == 'object' ? item.monitorName.name : item.monitorName,
        "members": JSON.stringify(membersArr),
      })
    })
      console.log(params, "params,☆");
      this.props.dispatch({
        type: 'station/addTeamManage',
        payload: params,
        callback: ({success, msg}) => {
          if(success){
            message.success('创建班组成功！')
            this.props.dispatch({
              type: 'station/queryTeamManage',
              payload: {
                ecode,
                stationId,
              },
              callback: (data) => {
                this.setState({
                  data: data
                })
              }
            })
          }else{
            message.warn('创建班组失败！')
          }
        }
      })
      console.log(params, '★★');
  };

  changeAreaHandler = (val, node) => {
    const {dataRef} = node.props;
    if (val === '') {
      this.setState({isChangeA: false})
    }else{
      this.setState({isChangeA: true})
    }
    this.props.dispatch({
      type: 'station/queryFeedbackUsers',
      payload:{stationId:val},
    });
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
      type: 'station/queryTeamManage',
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
  const {feedbackUsers } = this.props;
  const stations = [...this.props.stations];
  stations.unshift({gid: '', name: '全部'})
  const columns = [
    {
      title: '班组',
      dataIndex: 'workGroupName',
      key: 'workGroupName',
      render: (text, record, index) => {
        if (record.editable) {
          return (
            <Input
              value={text}
              onChange={
                (e) =>
                  this.handleFieldChange(e.target.value, 'workGroupName', record.gid)
              }
            />
          );
        }
        return text;
      },
    }, {
      title: '班长',
      dataIndex: 'monitorName',
      key: 'monitorName',
      render: (text, record) => {
        const val = typeof text == 'object' ? text.name : text 
        if (record.editable) {
          return (
            <Select
              mode="combobox"
              allowClear
              style={{ width: 100 }}
              value={val}
              onChange={
                (value, node) => {this.handleFieldChange(value, 'monitorName', record.gid, node)}
              }
            >
              {
                feedbackUsers && feedbackUsers.map(item =>
                  <Option key={item.userid} value={item.truename} dataRef={item}>{item.truename}</Option>
                )
              }
            </Select>
          );
        }
        return val;
      },
    },  {
      title: '成员',
      dataIndex: 'memberName',
      key: 'memberName',
      render: (text, record) => {
        const member = [];
        record.members && record.members.length > 0 && record.members.map((item)=> {
          if(item.memberStatus === 0){
            member.push(item.memberName)
          }
        })
        const memberArr = text ? _.map(text, 'name') : member
        if (record.editable) {
          return (
            <Select
              mode="multiple"
              placeholder="请选择组成员"
              value={memberArr}
              style={{ width: 120 }}
              onChange={
                (value, node) => {this.handleFieldChange(value, 'memberName', record.gid, node)}
              }
            >
              {
                feedbackUsers && feedbackUsers.map(item =>
                  <Option key={item.userid} value={item.truename} dataRef={item}>{item.truename}</Option>
                )
              }
            </Select>
          );
        }
        return memberArr.join(',');
      },
    }, {
      title: '上级负责人',
      dataIndex: 'memberName',
      key: 'memberLead',
      render: (text, record) => {
        let memberLead = '';
        record.members && record.members.length > 0 && record.members.map((item)=> {
          if(item.memberStatus === 1){
            memberLead = item.memberName
          }
        })
        const memberArr = record.memberLead ? record.memberLead.name : memberLead
        if (record.editable) {
          return (
            <Select
              mode="combobox"
              allowClear
              style={{ width: 100 }}
              value={memberArr}
              onChange={
                (value, node) => {this.handleFieldChange(value, 'memberLead', record.gid, node)}
              }
            >
              {
                feedbackUsers && feedbackUsers.map(item =>
                  <Option key={item.userid} value={item.truename} dataRef={item}>{item.truename}</Option>
                )
              }
            </Select>
          );
        }
        return memberArr;
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
                新增班组
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

import React, {PureComponent} from 'react';
import {Tabs, Button, message, Select, Col, Table, Input, Popconfirm, TimePicker, Divider} from 'antd';
import {connect} from 'dva';
import moment from 'moment';
import {routerRedux} from 'dva/router';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import parseValues from '../../utils/utils';

const Option = Select.Option;

@connect(({station, login}) => ({
  // funcList: station.funcList,
  groups: station.groups,
  eqUnit: station.eqUnit,
  data: station.data,
  stations: station.stations,
  classManage: station.classManage,
  user: login.user,
  userDatas: login.datas ||[]
}))



export default class TeamManage extends PureComponent {
  constructor(){
    super()

    this.state = {
      data: [],
      stationId: '',
      areaId: '',
      equipmentUnitId: '',
      ecode: '',
      backupsData: [],
      pageno: 1,
      pagesize: 10,
    };
    this.idx = 0
    this.edit = false;
  };

  componentDidMount() {
    this.props.dispatch({
      type: 'station/getStationData'
    });
    this.props.dispatch({
      type: 'station/queryObjManage',
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
    this.props.dispatch({
      type: 'station/queryGroups',
      payload:{stationId:target.stationId},
    });
    this.props.dispatch({
      type: 'station/queryCheckEq',
      payload:{areaId:target.areaId},
    });
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
    if(!isNaN(Number(key))){
      const {stationId} = this.state;
      this.props.dispatch({
        type: 'station/delObjManage',
        payload: {
          adjustPressureTargetId: key,
        },
        callback: (data) => {
          this.props.dispatch({
            type: 'station/queryObjManage',
            payload: {
              stationId,
            },
            callback: (data)=> {
              this.setState({
                data: data,
              })
            },
          })
        }
      })
    }else{
      const newData = this.state.data.filter(item => item.gid !== key);
      this.setState({data: newData});
    }
    this.edit = false;
  }

  newMember = () => {

    if (this.edit === true) {
      message.error('请先保存编辑的行信息。');
      return;
    }
    const newData = [...this.state.data];
    newData.unshift({
      gid: `NEW_TEMP_ID_${this.index}`,
      name: '',
      stationName: '',
      areaName: '',
      equipmentUnitName: '',
      stationId: '',
      areaId: '',
      status: 0,
      ecode: '',
      equipmentUnitId: '',
      editable: true,
      isNew: true,
    });
    this.index += 1;
    this.setState({
      data: newData,
      pageno: 1,
    });
    this.edit = true;

  };

  handleFieldChange = (value, fieldName, key, node) => {
    if(fieldName === 'stationName'){
      const {dataRef} = node.props;
      this.props.dispatch({
        type: 'station/queryGroups',
        payload:{stationId:dataRef.gid},
      });
      this.setState({
        stationId:dataRef.gid,
        ecode: dataRef.ecode,
      })
    }
    if(fieldName === 'areaName'){
      const {dataRef} = node.props;
      this.props.dispatch({
        type: 'station/queryCheckEq',
        payload:{areaId:dataRef.gid},
      });
      this.setState({areaId:dataRef.gid})
    }
    if(fieldName === 'equipmentUnitName'){
      const {dataRef} = node.props;
      this.setState({equipmentUnitId:dataRef.gid})
    }

    const newData = [...this.state.data];
    const target = this.getRowByKey(key)
    console.log(target,newData,this.state.data, 'new');
    if (target) {
      if(fieldName === 'stationName'){
        const {dataRef} = node.props;
        target['stationId'] = dataRef.gid;
        target['ecode'] = dataRef.ecode;
        target['areaName'] = '';
        target['equipmentUnitName'] = '';
      }
      if(fieldName === 'areaName'){
        const {dataRef} = node.props;
        target['areaId'] = dataRef.gid;
        target['equipmentUnitName'] = '';
      }
      if(fieldName === 'equipmentUnitName'){
        const {dataRef} = node.props;
        target['equipmentUnitId'] = dataRef.gid;
      }
      target[fieldName] = value;
      this.setState({
        data: newData,
      });
      console.log(target,newData, "target");
    }

  };

  saveRow(e, key) {
    e.persist();
    setTimeout(() => {
      if (this.clickedCancel) {
        this.clickedCancel = false;
        return;
      };
      const target = this.getRowByKey(key) || {};
      if (!target.name || !target.equipmentUnitName || !target.areaName || !target.stationName) {
        message.error('请填写完整反馈项信息！');
        return;
      };

      const nameUnique = _.sortBy(this.state.data, ['name', 'areaId'])
      for (var i = 0; i < nameUnique.length - 1; i++) {
          if (nameUnique[i].name === nameUnique[i + 1].name && nameUnique[i].areaId === nameUnique[i + 1].areaId) {
              message.error(`调压对象【${nameUnique[i].name}】名称重复,请修改！`);
              return
          }
      }
      // this.props.dispatch({
      //   type: 'station/objManageNameOnly',
      //   payload:{
      //     eqUnitId: target.equipmentUnitId,
      //     adjustPressureTargetId: !isNaN(Number(target.gid)) ? target.gid : null,
      //     adjustPressureTargetName: target.name
      //   },
      //   callback: (res) => {
      //     console.log(res);
      //     if(res.data.length > 0){
      //       message.error("调压对象名称不能相同,请修改！");
      //       this.edit = true
      //       return
      //     }
      //   }
      // })
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

  checkHandler = () => {
    const {stationId, ecode, areaId, equipmentUnitId, backupsData, data} = this.state;
    if (this.edit === true) {
      message.error('请先保存编辑的行信息。');
      return;
    }
    if(data.length === backupsData.length){
      let isChange = 0
      for (var i = 0; i < backupsData.length; i++) {
        if(data[i].name === backupsData[i].name && data[i].stationId === backupsData[i].stationId && data[i].areaId === backupsData[i].areaId && data[i].equipmentUnitId === backupsData[i].equipmentUnitId){
          isChange++
        }
      }
      if(isChange === backupsData.length){
        message.error('数据没有修改不用提交！');
        return;
      }
    }
    const params = [];
    data.map((item) => {
      return params.push({
        adjustPressureTargetId: !isNaN(Number(item.gid)) ? item.gid : null,
        stationId: item.stationId,
        ecode: item.ecode,
        areaId: item.areaId,
        equipmentUnitId: item.equipmentUnitId,
        name: item.name,
        stationName: item.stationName,
        areaName: item.areaName,
        equipmentUnitName: item.equipmentUnitName,
      })
    })
      console.log(params, "params,☆");
      this.props.dispatch({
        type: 'station/addObjManage',
        payload: params,
        callback: ({success, msg}) => {
          if(success){
            message.success('创建调压对象成功！')
            this.props.dispatch({
              type: 'station/queryObjManage',
              callback: (data) => {
                const arr = [];
                for (var i = 0; i < data.length; i++) {
                  arr.push(Object.assign({}, data[i]))
                }
                this.setState({
                  data: data,
                  backupsData: arr,
                })
              }
            });
          }else{
            message.warn(msg)
          }
        }
      })
      console.log(params, '★★');
  };

  pageChange = (current, pageSize) => {
    console.log(current, pageSize, 'current, pageSize');
    this.setState({
      pageno: current,
      pagesize: pageSize,
    })
  };

  render() {
  console.log(this.state.data, "state★");
  const {groups, eqUnit, stations} = this.props
  const {data, pageno, pagesize} = this.state
  const pagination = {
      total: data ? data.length : 0 ,
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
  const columns = [
    {
      title: '调压对象',
      dataIndex: 'name',
      key: 'name',
      width: '10%',
      render: (text, record, index) => {
        if (record.editable) {
          return (
            <Input
              value={text}
              onChange={
                e =>
                  this.handleFieldChange(e.target.value, 'name', record.gid)
              }
            />
          );
        }
        return text;
      },
    }, {
      title: '站点',
      dataIndex: 'stationName',
      key: 'stationName',
      width: '20%',
      render: (text, record) => {
        if (record.editable) {
          return (
            <Select
              style={{ width: 180 }}
              value={text}
              onSelect={
                (value, option) => {this.handleFieldChange(value, 'stationName', record.gid, option)}
              }
            >
              {
                stations && stations.map(item =>
                  <Option key={item.gid} value={item.name} dataRef={item}>{item.name}</Option>
                )
              }
            </Select>
          );
        }
        return text;
      },
    },{
      title: '区域',
      dataIndex: 'areaName',
      key: 'areaName',
      width: '20%',
      render: (text, record) => {
        if (record.editable) {
          return (
            <Select
              style={{ width: 180 }}
              value={text}
              onSelect={
                (value, option) => {this.handleFieldChange(value, 'areaName', record.gid, option)}
              }
            >
              {
                groups && groups.map(item =>
                  <Option key={item.gid} value={item.name} dataRef={item}>{item.name}</Option>
                )
              }
            </Select>
          );
        }
        return text;
      },
    },  {
      title: '设备单元',
      dataIndex: 'equipmentUnitName',
      key: 'equipmentUnitName',
      width: '20%',
      render: (text, record) => {
        if (record.editable) {
          return (
            <Select
              style={{ width: 180 }}
              value={text}
              onSelect={
                (value, option) => {this.handleFieldChange(value, 'equipmentUnitName', record.gid, option)}
              }
            >
              {
                eqUnit && eqUnit.map(item =>
                  <Option key={item.gid} value={item.name} dataRef={item}>{item.name}</Option>
                )
              }
            </Select>
          );
        }
        return text;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text, record, index) => {
        const val = text === 1 ? 
            (<span style={{"color": "red"}}><Icon type="close-circle-o"/>
              停用</span>)
            :
            (<span style={{"color": "#379FFF"}}><Icon type="check-circle-o"/>
              启用</span>)
        if (record.editable) {
          return (
            <Select 
              value={text}
              style={{ width: 75 }}
              onChange={(val) => this.handleFieldChange(val, 'status', record.gid, index)}
            >
              <Option value={0}>启用</Option>
              <Option value={1}>停用</Option>
            </Select>
          );
        }
        return val;
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
      <div>
        <div style={{display: 'inline-block', margin: '0 15px'}}>
          <Button
            style={{marginLeft: 20}}
            type='primary'
            onClick={this.newMember}
            icon="plus"
          >
            新增调压对象
          </Button>
        </div>
        <div style={{display: 'inline-block'}}><Button type='primary' style={{margin: '20px 50%'}} onClick={this.checkHandler}>提交</Button></div>
        <Table
          columns={columns}
          dataSource={this.state.data}
          pagination={pagination}
          rowKey={record => record.gid}
        />
      </div>
    </PageHeaderLayout>
  );
  }
}

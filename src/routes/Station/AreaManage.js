import React, {PureComponent} from 'react';
import {connect} from 'dva';
import _ from 'lodash';
import {Table, Button, Input, message, Select, Popconfirm, Divider, InputNumber, Col, Row, Icon} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {routerRedux} from 'dva/router';
import styles from './CheckData/style.less'

const {Option} = Select;

@connect(({station, login}) => ({
  // funcList: station.funcList,
  checkObj: station.checkObj,
  checkObjArr: station.checkObjArr,
  eqUnit: station.eqUnit,
  groups: station.groups,
  data: station.data,
  stations: station.stations,
  total: station.total,
  user: login.user,
  userDatas: login.datas ||[]
}))

export default class AreaManage extends PureComponent {
  constructor(props) {
    super(props);
    this.edit = false;
    this.isChangeS = false;
    this.state = {
      stationId: '',
      ecode: '',
      objData: [],
      backupsData: [],   //备份的原数据；
      areaData: '全部',
      submitting: false,
      stationName: '全部',
      pagesize: 20,
      pageno: 1,
    };
  }
  componentDidMount(){
    this.props.dispatch({
      type: 'station/getStationData',
      callback: (res) => {
        this.checkHandler()
      }
    });

  }
  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setState({
        objData: nextProps.value,
      });
      this.edit = false;
    }
  }

  getRowByKey(key) {
    return this.state.objData.filter(item => item.gid === key)[0];
  }

  index = 0;
  cacheOriginData = {};

  toggleEditable(e, key) {
    e.preventDefault && e.preventDefault();
    const target = this.getRowByKey(key);
    if(this.isChangeS){
      message.error('请先点击查询！');
      return
    }
    if (target) {

      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        this.cacheOriginData[key] = {...target};
      }
      target.editable = !target.editable;
      const newData = [...this.state.objData]
      this.setState({objData: newData});
      this.edit = !this.edit;
    }
  }

  newMember = () => {
    if(!this.state.stationId){
      message.error('请先选择站点并点击查询！');
      return
    }
    if (this.isChangeS === true) {
      message.error('请先点击查询！');
      return
    }
    if (this.edit === true) {
      message.error('请先保存编辑的行信息！');
      return;
    }
    this.pageChange(1, 20)
    // document.getElementById("current").focus();
    const newData = [...this.state.objData];
    newData.unshift({
      gid : `NEW_TEMP_ID_${this.index}`,
      name: '',                 // 名称
      stationId: '',
      ecode: '',
      editable: true,
      isNew: true,
      status: 1,                 //启停状态
    });
    this.setState({
      objData: newData,
      pageno: 1,
    });
    this.edit = true;
    this.index ++;
  };
  //冒泡排序；
  sortArr = (arr) => {
    for (var i = 0; i < arr.length; i++) {
      for (var j = 0; j < arr.length - 1 - i; j++) {
        if(Number(arr[j].findex) > Number(arr[j + 1].findex)){
          var temp = arr[j];      //两个元素交换顺序
          arr[j] = arr[j + 1];
          arr[j + 1] = temp
        }
      };
    };
    return arr
  };

  handleFieldChange = (value, fieldName, key, idx) => {
    const newData = [...this.state.objData];
    const target = this.getRowByKey(key)
    if (target) {
      if(isNaN(Number(target.gid))){
        target['stationId'] = this.state.stationId;
        target['ecode'] = this.state.ecode;
      }
      target[fieldName] = value;
      this.setState({
        objData: newData,
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

      const target = this.getRowByKey(key) || {};
      if (!target.name) {
        message.error('请填写完整反馈项信息！');
        return;
      };

      const nameUnique = _.sortBy(this.state.objData, 'name')
      for (var i = 0; i < nameUnique.length - 1; i++) {
          if (nameUnique[i].name === nameUnique[i + 1].name && nameUnique[i].stationId === nameUnique[i + 1].stationId) {
              message.error(`区域【${nameUnique[i].name}】名称重复,请修改！`);
              return
          }
      }
      delete target.isNew;
      this.toggleEditable(e, key);
      this.edit = false;
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
    this.setState({objData: [...this.state.objData]});
    this.edit = false;
  };

  changeAreaHandler = (val, node) => {
    const {dataRef} = node.props;
    if (val !== '') {
      this.isChangeS = true;
    }
    if (val === '') {
      this.isChangeS = false;
    }
  	this.props.dispatch({
      type: 'station/queryGroups',
      payload:{stationId:val},
    });
  	this.setState({
  	  stationId: val,
  	  areaData: '全部',
      stationName: dataRef.name,
      ecode: dataRef.ecode,
  	})
  };

  changeUnitHandler = (val, node) => {
  	const {dataRef} = node.props;
  	this.props.dispatch({
        type: 'station/queryCheckEq',
        payload:{areaId:val},
      });
  	this.setState({
  	 	areaId: val,
  	 	areaData: dataRef.name,
  	 })
  };

  checkHandler = () => {
   const {stationId, areaId} = this.state;
   const {stations} = this.props;
   this.edit = false;
   this.isChangeS = false;
   this.pageChange(1, 20)
   	this.props.dispatch({
      type: 'station/queryGroups',
      payload:{stationId},
      callback: (data) => {
        console.log(data,stations, '★★');
        const delArea = [];
        stations && stations.map(item =>
          delArea.push(item.gid)
        )
        const areaData = data && data.filter(item =>
          delArea.includes(item.stationId)
        )
        console.log(delArea, areaData, 'area');
      	const arr = [];
      	for (var i = 0; i < areaData.length; i++) {
      		arr.push(Object.assign({}, areaData[i]))
      	}
      	this.setState({
		  	objData: areaData,
        backupsData: arr,
      	})
      }
   })
  };

   remove(key) {
    const newData = this.state.objData.filter(item => item.gid !== key);
    this.setState({objData: newData});
    this.edit = false;
  };

  submitHandler = () => {
  	const {objData, stationId, backupsData, ecode} = this.state;
  	if (this.edit === true) {
      message.error('请先保存编辑的行信息。');
      return;
    }
    console.log(objData,backupsData, 'obj');
    if(objData.length === backupsData.length){
      let isChange = 0
      for (var i = 0; i < objData.length; i++) {
        if(objData[i].name === backupsData[i].name && objData[i].status === backupsData[i].status){
          isChange++
        }
      }
      if(isChange === objData.length){
        message.error('数据没有修改不用提交！');
        return;
      }
    }
  	const params = []
  	objData.map((item) => {
  		return params.push(
  			{
  			 areaId : !isNaN(Number(item.gid)) ? item.gid : null,
  			 name: item.name,
  			 stationId: item.stationId,
         ecode: item.ecode,
         status: item.status,
  		  }
  	)
  	})
  	this.setState({submitting: true})
  	console.log(params, "editAreaParams");
  	this.props.dispatch({
  		type: 'station/editAreaManage',
    	payload: params,
    	callback: ({success, msg}) => {
            this.setState({submitting: false})
    		if (success) {
              message.success('提交区域成功！');
              this.checkHandler()
            } else {
              message.warn(msg);
            }
    	}
  	})

  };

  pageChange = (current, pageSize) => {
    console.log(current, pageSize, 'current, pageSize');
    this.setState({
      pageno: current,
      pagesize: pageSize,
    })
  };

  render() {
    const { groups, eqUnit} = this.props;
    const {areaId, objData, backupsData, pageno, pagesize} = this.state;
    const stations = [...this.props.stations];
    stations.unshift({gid: '', name: '全部'})
    const pagination = {
      total: objData ? objData.length : 0 ,
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
      title: '站点',
      dataIndex: 'stationId',
      key: 'stationId',
      render: (text) => {
        const stationData = text ? stations.filter(item =>
          item.gid === text
        )
        :
        stations.filter(item =>
          item.gid === this.state.stationId
        )
        const stationName = stationData.length > 0 ? stationData[0].name : [];
        return <p>{stationName}</p>;
      },
      },
    	{
      title: '区域',
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => {
        if (record.editable) {
          return (
            <Input
              value={text}
              onChange={
                e =>
                  this.handleFieldChange(e.target.value, 'name', record.gid, index)
              }
              placeholder="名称"
              id='current'
            />
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
          const val = text === 2 ? 
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
                <Option value={1}>启用</Option>
                <Option value={2}>停用</Option>
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
              isNaN(Number(record.gid)) ?
                <span>
                  <a onClick={(e) => {
                    this.saveRow(e, record.gid)
                  }}>保存</a>
                  <Divider type="vertical"/>
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.gid)}>
                    <a>删除</a>
                  </Popconfirm>
                </span> :
                <span>
                  <a onClick={(e) => {
                    this.saveRow(e, record.gid)
                  }}>保存</a>
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
          isNaN(Number(record.gid)) ?
            <span>
              <a onClick={e => this.toggleEditable(e, record.gid)}>编辑</a>
              <Divider type="vertical"/>
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.gid)}>
                <a>删除</a>
              </Popconfirm>
            </span>:
            <span>
              <a onClick={e => this.toggleEditable(e, record.gid)}>编辑</a>
            </span>
        );
      },
    	}
    ];


    return (
    <PageHeaderLayout>
      <div>
      	<div style={{minWidth: 700, height: 40, margin: '20px 20px', padding: '20px 0'}} id='area'>
          <div className={styles['field-block']}>
          <label>站点：</label>
            <Select
            	defaultValue="全部"
            	style={{ width: 120 }}
              value={this.state.stationName}
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
          <div style={{dispaly: 'inline-block' , float: 'right'}}><Button type='primary' onClick={this.checkHandler}>重置</Button></div>
          <div style={{dispaly: 'inline-block' , float: 'right', marginRight: 20}}><Button type='primary' onClick={this.submitHandler} loading={this.state.submitting}>提交</Button></div>
          <div style={{dispaly: 'inline-block' , float: 'right', marginRight: 20}}>
            <Button
              type='primary'
              onClick={this.newMember}
              icon="plus"
            >
              新增区域
            </Button>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={objData}
          pagination={pagination}
        />
      </div>
      {/*<Row style={{textAlign: 'center', margin: '20px 0'}}>
        <Col span={2} offset={10}><Button type='primary' onClick={this.submitHandler} loading={this.state.submitting}>提交</Button></Col>
        <Col span={2}><Button type='primary' onClick={this.checkHandler}>重置</Button></Col>
      </Row>*/}
      </PageHeaderLayout>
    );
  }
}

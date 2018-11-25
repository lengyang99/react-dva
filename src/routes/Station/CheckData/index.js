import React, {PureComponent} from 'react';
import {connect} from 'dva';
import _ from 'lodash';
import {Table, Button, Input, message, Select, Popconfirm, Divider, InputNumber, Col, Row} from 'antd';
import {routerRedux} from 'dva/router';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import parseValues from '../../../utils/utils';
import styles from './style.less';

const {Option} = Select;

@connect(({station, login}) => ({
  // funcList: station.funcList,
  checkObj: station.checkObj,
  checkObjArr: station.checkObjArr,
  eqUnit: station.eqUnit,
  groups: station.groups,
  data: station.data,
  stations: station.stations,
}))

export default class CheckData extends PureComponent {
  constructor(props) {
    super(props);
    this.edit = false;
    this.isEdit = false; // 判断设备单元是否可编辑；
    this.isChangeS = false;
    this.isChangeA = false;
    this.initParams();
    this.state = {
      stationId: '',
      areaId: '',
      objData: [],
      backupsData: [], // 备份数据；
      areaData: '全部',
      stationName: '全部',
      submitting: false,
      filteredInfo: null,
      pageno: 1,
      pagesize: 20,
      checkObjTotal: 0,
    };
  }

  ecode = '';
  equipmentUnitId = '';
  index = 0;
  stationId = '';
  areaId = '';
  eqFilter = [];
  eqFilterTemp = [];

  componentDidMount() {
    if(!this.props.location.search){
      this.props.dispatch({
        type: 'station/getStationData',
      });
      this.props.dispatch({
        type: 'station/queryGroups',
      });
      this.checkHandler();
    }
    console.log(this.props, 'props');
    if (this.props.location.search) {
      const {stations, groups} = this.props;
      const areaName = groups.filter(item => item.gid === Number(this.areaId));
      console.log(this.state, areaName, 'state');
      const stationName = stations.filter(item => item.gid === Number(this.stationId));
      this.setState({
        stationId: this.stationId,
        areaId: this.areaId,
        areaData: areaName[0].name,
        stationName: stationName[0].name,
      }, () => {
        this.checkHandler();
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setState({
        objData: nextProps.value,
      });
      this.edit = false;
    }
  }

  initParams = () => {
    const { location: { search } } = this.props;
    const { stationId, areaId } = parseValues(search) || '';
    console.log(stationId, areaId, 'setState');
    this.stationId = stationId;
    this.areaId = areaId;
  };

  getRowByKey(key) {
    return this.state.objData.filter(item => item.checkTargetId === key)[0];
  }

  index = 0;
  cacheOriginData = {};

  toggleEditable(e, key) {
    e.preventDefault && e.preventDefault();
    const target = this.getRowByKey(key);
    if (this.isChangeS && this.isChangeS) {
      message.error('请先点击查询！');
      return;
    }
    if (target) {
      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        this.cacheOriginData[key] = {...target};
      }
      target.editable = !target.editable;
      const newData = [...this.state.objData];
      this.setState({objData: newData});
      this.edit = !this.edit;
      if (!isNaN(Number(target.checkTargetId))) {
        this.isEdit = true;
      }
    }
  }

  remove(key) {
    const newData = this.state.objData.filter(item => item.checkTargetId !== key);
    this.setState({objData: newData});
    this.edit = false;
  }

  newMember = () => {
    if (!this.state.stationId || !this.state.areaId) {
      message.error('请先选择站点及区域并点击查询！');
      return;
    }
    if (this.isChangeS || this.isChangeA) {
      message.error('请先点击查询！');
      return;
    }
    if (this.edit === true) {
      message.error('请先保存编辑的行信息。');
      return;
    }
    this.pageChange(1, 20);
    this.clearFilters();
    const newData = [...this.state.objData];
    newData.unshift({
      checkTargetId: `NEW_TEMP_ID_${this.index}`,
      name: '', // 名称
      equipmentUnitId: '', // 设备单元
      stationId: '',
      areaId: '',
      ecode: '',
      status: '', // 状态
      editable: true,
      isNew: true,
    });
    this.setState({objData: newData});
    this.edit = true;
    this.index++;
  };

  handleFieldChange = (value, fieldName, key, idx) => {
    console.log(value, 'val');
    const newData = [...this.state.objData];
    const target = this.getRowByKey(key);
    if (target) {
    	if (fieldName !== 'status' && target.status === '') {
    		target.status = 1;
    	}
      if (isNaN(Number(target.checkTargetId))) {
        target.stationId = this.state.stationId;
        target.areaId = this.state.areaId;
        target.ecode = this.state.ecode;
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
      }

      const target = this.getRowByKey(key) || {};
      if (!target.name || !target.equipmentUnitId) {
        message.error('请填写完整反馈项信息！');
        return;
      }

      const nameUnique = _.sortBy(this.state.objData, ['name', 'equipmentUnitId']);
      for (let i = 0; i < nameUnique.length - 1; i++) {
        if (nameUnique[i].name === nameUnique[i + 1].name && nameUnique[i].equipmentUnitId === nameUnique[i + 1].equipmentUnitId) {
          message.error(`检查对象【${nameUnique[i].name}】名称重复,请修改！`);
          return;
        }
      }
      delete target.isNew;
      this.toggleEditable(e, key);
      this.edit = false;
      this.isEdit = false;
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
    this.isEdit = false;
  }

  changeAreaHandler = (val, node) => {
    const {dataRef} = node.props;
    if (val !== '') {
      this.isChangeS = true;
    }
    if (val === '') {
      this.isChangeS = false;
    }
    this.eqFilter = [];
  	this.props.dispatch({
      type: 'station/queryGroups',
      payload: {stationId: val},
    });
  	this.setState({
  	  stationId: val,
  	  areaData: '全部',
      areaId: '',
      stationName: dataRef.name,
      ecode: dataRef.ecode,
  	});
  };

  changeUnitHandler = (val, node) => {
  	const {dataRef} = node.props;
    if (val !== '') {
      this.isChangeA = true;
    }
    if (val === '') {
      this.isChangeA = false;
    }
  	this.props.dispatch({
      type: 'station/queryCheckEq',
      payload: {areaId: val},
      callback: (data) => {
        console.log(data, 'unit');
        const temp = [];
        data && data.map(item => {
          temp.push({text: item.name, value: item.gid});
        });
        this.eqFilterTemp = temp;
      },
    });
  	this.setState({
  	 	areaId: val,
  	 	areaData: dataRef.name,
  	 });
  };

  checkHandler = () => {
    const {stationId, areaId, ecode, pageno, pagesize} = this.state;
    if (areaId && !stationId) {
      message.error('请选择站点！');
      return;
    }
    this.isChangeS = false;
    this.isChangeA = false;
    this.edit = false;
    this.pageChange(1, 20);
    this.clearFilters();
    this.eqFilter = this.eqFilterTemp;
    this.props.dispatch({
   	  type: 'station/queryCheckObjArr',
      payload: {
    	stationId,
    	ecode,
    	areaId,

      },
      callback: (res) => {
        console.log(res, 'ressss');
    	  const arr = [];
    	  for (let i = 0; i < res.data.length; i++) {
    		  arr.push(Object.assign({}, res.data[i]));
    	  }
    	  this.setState({
          objData: res.data,
          backupsData: arr,
          checkObjTotal: res.total,
    	  });
      },
    });
  };

  submitHandler = () => {
  	const {objData, stationId, ecode, areaId, backupsData} = this.state;
  	if (this.edit === true) {
      message.error('请先保存编辑的行信息。');
      return;
    }

    console.log(objData, backupsData, 'obj');
    if (objData.length === backupsData.length) {
      let isChange = 0;
      for (let i = 0; i < objData.length; i++) {
        if (objData[i].equipmentUnitId === backupsData[i].equipmentUnitId && objData[i].name === backupsData[i].name && objData[i].status === backupsData[i].status) {
          isChange++;
        }
      }
      if (isChange === objData.length) {
        message.error('数据没有修改不用提交！');
        return;
      }
    }
  	const editCheckTargetParams = [];
    const params = [];
  	objData.map((item, index) => {
  		editCheckTargetParams.push(
  			{
  			checkTargetId: !isNaN(Number(item.checkTargetId)) ? item.checkTargetId : null,
          formGid: item.formGid ? item.formGid : null,
  			name: item.name,
  			status: item.status,
  			stationId: item.stationId,
  			areaId: item.areaId,
  			ecode: item.ecode,
  			equipmentUnitId: item.equipmentUnitId,
  			equipmentId: item.equipmentId ? item.equipmentId : null,
  			formId: item.formId ? item.formId : null,
  		});

      if (!isNaN(Number(item.checkTargetId))) {
        params.push({
          ecode: item.ecode,
          stationId: item.stationId,
          areaId: item.areaId,
          equipmentUnitId: item.equipmentUnitId,
          checkTargetId: item.checkTargetId,
          checkTargetName: item.name,
          index: index + 1,
        });
      }
  	});
  	this.setState({submitting: true});
  	console.log(editCheckTargetParams, objData, 'editCheckTargetParams');
    // 排序；
    this.props.dispatch({
      type: 'station/checkObjSort',
      payload: {params},
    });
  	this.props.dispatch({
  		type: 'station/editCheckObjArr',
    	payload: editCheckTargetParams,
    	callback: ({success, msg, data}) => {
        this.setState({submitting: false});
    		if (success) {
          message.success('提交检查对象成功！');
          this.checkHandler();
        } else {
          message.warn(msg);
        }
    	},
  	});
  }
  formData = (record) => {
    const {checkObjArr } = this.props;
    const {stationId, areaId, objData, backupsData} = this.state;
    if (objData.length !== backupsData.length) {
      message.error('请先提交数据！');
      return;
    }
    if (objData.length === backupsData.length) {
      for (let i = 0; i < backupsData.length; i++) {
        if (objData[i].equipmentUnitId !== backupsData[i].equipmentUnitId || objData[i].name !== backupsData[i].name || objData[i].status !== backupsData[i].status) {
          message.error('请先提交数据！');
          return;
        }
      }
    }
    // for (var i = 0; i < objData.length; i++) {
    //   if(isNaN(Number(objData[i].checkTargetId))){
    //     message.error('请先提交数据！');
    //     return
    //   }
    //   if(objData[i].equipmentUnitId !== checkObjArr[i].equipmentUnitId || objData[i].name !== checkObjArr[i].name || objData[i].status !== checkObjArr[i].status){
    //     message.error('请先提交数据！');
    //     return
    //   }
    // }
    const path = {
      pathname: '/station/formSubmit',
      record,
    };
    this.props.dispatch(routerRedux.push(path));
  };

  filterHandler = (val) => {
    console.log(val, 'val');
    this.props.dispatch({
      type: 'station/queryCheckObj',
      payload: {eqUnitId: value},
      callback: (checkObj) => {
        this.setState({objData: checkObj});
      },
    });
  };
  handleChange = (pagination, filters, sorter) => {
    console.log('Various parameters', pagination, filters, sorter);
    this.setState({
      filteredInfo: filters,
    });
  }
  clearFilters = () => {
    this.setState({
      filteredInfo: null,
    });
  };

  pageChange = (current, pageSize) => {
    this.setState({
      pageno: current,
      pageSize,
    });
  };

  // 上移
  moveUp = (key) => {
    const {pageno, pagesize, objData} = this.state;
    const arr = [...objData];
    const KEY = (pageno - 1) * pagesize + key;
    if (KEY === 0) {
      return;
    }
    if (isNaN(Number(arr[KEY - 1].checkTargetId))) {
      return;
    }
    const temp = arr[KEY];
    arr[KEY] = arr[KEY - 1];
    arr[KEY - 1] = temp;
    this.setState({objData: arr});
  };
  // 下移
  moveDown = (key) => {
    const {pageno, pagesize, objData} = this.state;
    const arr = [...objData];
    const KEY = (pageno - 1) * pagesize + key;
    if (KEY === arr.length - 1) {
      return;
    }
    const temp = arr[KEY];
    arr[KEY] = arr[KEY + 1];
    arr[KEY + 1] = temp;
    this.setState({objData: arr});
  };

  render() {
    const { eqUnit } = this.props;
    const {areaId, objData, filteredInfo, checkObjTotal, pageno, pagesize} = this.state;
    // eqUnit && eqUnit.map(item =>
    //   this.eqFilter.push({text: item.name, value: item.name})
    // )
    console.log(this.edit, 'stratttttt');
    const stations = [...this.props.stations];
    stations.unshift({gid: '', name: '全部'});
    const groups = [...this.props.groups];
    groups.unshift({gid: '', name: '全部'});

    const statusArr = [
    	{gid: 1, name: '启用'},
    	{gid: 2, name: '停用'},
    ];
    const columns = [
      {
        title: '设备单元',
        dataIndex: 'equipmentUnitId',
        key: 'equipmentUnitId',
        filters: objData.length > 0 ? this.eqFilter : [],
        filterMultiple: true,
        filteredValue: filteredInfo ? filteredInfo.equipmentUnitId : null,
        onFilter: (value, record) => {
          return Number(record.equipmentUnitId) === Number(value);
        },
        render: (text, record) => {
      	const eq = eqUnit.filter((item) =>
			               item.gid === text
      	             );
      	const eqC = eq && eq.length > 0 ? eq[0].name : record.equipmentUnitName;
          if (record.editable) {
            return (
              <Select
              style={{ width: 150 }}
              disabled={this.isEdit}
              value={eqC}
              onChange={
                value => { this.handleFieldChange(value, 'equipmentUnitId', record.checkTargetId); }
              }
            >
              {
                eqUnit && eqUnit.map(item =>
                  <Option key={item.gid} value={item.gid}>{item.name}</Option>
                )
              }
            </Select>
            );
          }
          return eqC;
        },
    	}, {
        title: '检查对象',
        dataIndex: 'name',
        key: 'name',
        render: (text, record, index) => {
          if (record.editable) {
            return (
              <Input
              value={text}
              onChange={
                e =>
                  this.handleFieldChange(e.target.value, 'name', record.checkTargetId, index)
              }
              placeholder="名称"
            />
            );
          }
          return text;
        },
      }, {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => {
          const statusC = text === 1 ? '启用' : '停用';
          if (record.editable) {
            return (
            <Select
              style={{ width: 100 }}
              disabled={this.isEdit}
              value={statusC}
              onChange={value => { this.handleFieldChange(value, 'status', record.checkTargetId); }}
            >
              {
                statusArr.map(item =>
                  <Option key={item.gid} value={item.gid}>{item.name}</Option>
                )
              }
            </Select>
            );
          }
          return statusC;
      	},
    	}, {
        title: '操作',
        key: 'action',
        render: (text, record, index) => {
          if (record.editable) {
            if (record.isNew) {
              return (
                isNaN(Number(record.checkTargetId)) ?
                  <span>
                  <a onClick={(e) => {
                    this.saveRow(e, record.checkTargetId);
                  }}
                  >保存</a>
                  <Divider type="vertical" />
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.checkTargetId)}>
                    <a>删除</a>
                  </Popconfirm>
                  <Divider type="vertical" />
                  <a onClick={(e) => { this.formData(record); }}>修改检查项</a>
                </span> :
                <span>
                  <a onClick={(e) => {
                    this.saveRow(e, record.checkTargetId);
                  }}
                  >保存</a>
                  <Divider type="vertical" />
                  <a onClick={(e) => { this.formData(record); }}>修改检查项</a>
                </span>
              );
            }
            return (
              <span>
              <a onClick={(e) => {
                this.saveRow(e, record.checkTargetId);
              }}
              >保存</a>
              <Divider type="vertical" />
              <a onClick={e => this.cancel(e, record.checkTargetId)}>取消</a>
            </span>
            );
          }
          return (
            isNaN(Number(record.checkTargetId)) ?
              <span>
              <a onClick={e => this.toggleEditable(e, record.checkTargetId)}>编辑</a>
              <Divider type="vertical" />
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.checkTargetId)}>
                <a>删除</a>
              </Popconfirm>
              <Divider type="vertical" />
              <a onClick={(e) => { this.formData(record); }}>修改检查项</a>
            </span> :
            <span>
              <a onClick={e => this.toggleEditable(e, record.checkTargetId)}>编辑</a>
              <Divider type="vertical" />
              <a onClick={(e) => { this.formData(record); }}>修改检查项</a>
              <Divider type="vertical" />
              <Button
                style={{marginRight: 10}}
                onClick={() => this.moveUp(index)}
                icon="arrow-up"
              >上移</Button>
              <Button
                onClick={() => this.moveDown(index)}
                icon="arrow-down"
              >下移</Button>
            </span>
          );
        },
    	},
    ];
    // 表格分页
    const pagination = {
      total: checkObjTotal,
      current: pageno,
      pageSize: pagesize,
      showTotal: (total, range) => {
        return (<div>
          共 {total} 条记录 第{pageno}/{Math.ceil(total / pagesize)}页
        </div>);
      },
      onChange: (current, pageSize) => {
        this.pageChange(current, pageSize);
      },
    };

    return (
      <PageHeaderLayout>
        <div>
        <div style={{ height: 40, margin: '20px 20px', padding: '20px 0', minWidth: 700}} id="area">
          <div className={styles['field-block']}>
          <label>站点：</label>
          <Select
              defaultValue="全部"
              style={{ width: 120 }}
              onSelect={this.changeAreaHandler}
              value={this.state.stationName}
              getPopupContainer={() => document.getElementById('area')}
            >
              {
				        stations && stations.map((item) =>
  <Option key={item.gid} value={item.gid} dataRef={item}>{item.name}</Option>
				        )
              }
            </Select>
        </div>
          <div className={styles['field-block']}>
          <label>区域：</label>
          <Select defaultValue="全部" style={{ width: 180 }} value={this.state.areaData} onSelect={this.changeUnitHandler}>
              {
              	groups && groups.map((item) =>
                <Option key={item.gid} value={item.gid} dataRef={item}>{item.name}</Option>
              	)
              }
            </Select>
        </div>
          <div className={styles['field-block']}><Button type="primary" onClick={this.checkHandler}>查询</Button></div>
          <div style={{dispaly: 'inline-block', float: 'right'}}><Button type="primary" onClick={this.checkHandler}>重置</Button></div>
          <div style={{dispaly: 'inline-block', float: 'right', marginRight: 20}}><Button type="primary" onClick={this.submitHandler} loading={this.state.submitting}>提交</Button></div>
          <div style={{dispaly: 'inline-block', float: 'right', marginRight: 20}}>
          <Button
              type="primary"
              onClick={this.newMember}
              icon="plus"
            >
              新增检查对象
            </Button>
        </div>
        </div>
        <Table
          columns={columns}
          dataSource={objData}
          pagination={false}
          rowClassName={(record) => {
            return record.editable ? styles.editable : '';
          }}
          onChange={this.handleChange}
          pagination={pagination}
        />
      </div>
        {/* <Row style={{textAlign: 'center', margin: '20px 0'}}>
        <Col span={2} offset={10}><Button type='primary' onClick={this.submitHandler} loading={this.state.submitting}>提交</Button></Col>
        <Col span={2}><Button type='primary' onClick={this.checkHandler}>重置</Button></Col>
      </Row> */}
      </PageHeaderLayout>
    );
  }
}

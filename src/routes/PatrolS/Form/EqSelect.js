import React from 'react';
import styles from './index.less';
import {Form, Input, Button, Checkbox, Radio, Row, Col, Select, TreeSelect, message, Icon, InputNumber, Table, Tooltip } from 'antd';
import moment from 'moment';
import utils from '../../../utils/utils';
import EcityMap from '../../../components/Map/EcityMap';
import {DrawPolygonMapTool} from '../../../components/Map/common/maptool/DrawPolygonMapTool';
import {EditPolygonMapTool} from '../../../components/Map/common/maptool/EditPolygonMapTool';
import {DrawPolylineMapTool} from '../../../components/Map/common/maptool/DrawPolylineMapTool';
import {DrawPointMapTool} from '../../../components/Map/common/maptool/DrawPointMapTool';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';

const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;

import {connect} from 'dva';
import {routerRedux, Link} from 'dva/router';
import appEvent from '../../../utils/eventBus';

const keyPointId = 5;
//判断条件
const checkFilter = [
  {name: '模糊', value: '~'},
  {name: '等于', value: '='},
  {name: '不等于', value: '<>'},
  {name: '大于', value: '>'},
  {name: '小于', value: '<'},
  {name: '大于等于', value: '>='},
  {name: '为空', value: 'is null'},
]
@connect(state => ({
  user: state.login.user,
  areaData: state.patrolPlanList.areaData,
  usernamesData: state.patrolPlanList.usernamesData,
}))

export default class EqSelect extends React.Component {
  constructor(props) {
    super(props);
    this.map = null; // 类ArcGISMap的实例
    this.keydownEvent = null;
    this.state = {
      pageno: 1,
      pagesize: 10,

      gdFilter1: '',
      valueFilter1: '',
      checkFilter1: '',
      gdFilter2: '',
      valueFilter2: '',
      checkFilter2: '',
      gdFilter3: '',
      valueFilter3: '',
      checkFilter3: '=',
      showcheckInput1: '',
      showcheckInput2: '',
      showcheckInput3: '',
      isschedule1: 'and',
      isschedule2: 'and',
      eqType: '',
      eqTypeName: '',
      selectedRowKeys: [],
      eqfilter: '', //设备筛选条件
    };
  }
  componentDidMount = () => {
    this.props.onRef(this);
  };

   // 展示点
   showPoint = (taskPoints, key) => {
    let that = this;
    const {map} = this.props
    if (!taskPoints) {
      return;
    }
    for (let i = 0; i < taskPoints.length; i++) {
      let position = {};
      if (typeof taskPoints[i].geometry === 'string') {
        position = JSON.parse(taskPoints[i].geometry);
      } else {
        position = taskPoints[i].geometry;
      }

      const param = {
        id: taskPoints[i].attributes.gid,
        layerId: `layeridPoint_img`,
        layerIndex: 10,
        attr: taskPoints[i],
        markersize: 8,
        linecolor: [255, 0, 0],
        fillcolor: [255, 0, 0],
        x: position.x,
        y: position.y,
      };
      map.getMapDisplay().point(param);
    }
  };
  pageChange = (current, pageSize) => {
    this.setState({
      pageno: current,
      pageSize,
    });
  };
  changeFilterHandler = (value, name) => {
    this.setState({
      [name]: value
    })
  };
  changeFilterHandler1 = (value, name) => {
    if(name === 'checkFilter1' && value === 'is null'){
      this.setState({showcheckInput1: true})
    }else if(name === 'checkFilter1' && value !== 'is null'){
      this.setState({showcheckInput1: false})
    }
    if(name === 'gdFilter1' || name === 'checkFilter1'){
      this.setState({valueFilter1: ''})
    }
    if(name === 'gdFilter1' && value === 'eqpttype'){
      // this.setState({valueFilter1: '廊坊燃气'})
    }
    this.setState({
      [name]: value
    })
  };
  changeFilterHandler2 = (value, name) => {
    if(name === 'checkFilter2' && value === 'is null'){
      this.setState({showcheckInput2: true})
    }else if(name === 'checkFilter2' && value !== 'is null'){
      this.setState({showcheckInput2: false})
    }
    if(name === 'gdFilter2' || name === 'checkFilter2'){
      this.setState({valueFilter2: ''})
    }
    if(name === 'gdFilter2' && value === 'eqpttype'){
      // this.setState({valueFilter2: '廊坊燃气'})
    }
    this.setState({
      [name]: value
    })
  };
  changeFilterHandler3 = (value, name) => {
    if(name === 'checkFilter3' && value === 'is null'){
      this.setState({showcheckInput3: true})
    }else if(name === 'checkFilter3' && value !== 'is null'){
      this.setState({showcheckInput3: false})
    }
    if(name === 'gdFilter3' || name === 'checkFilter3'){
      this.setState({valueFilter3: ''})
    }
    if(name === 'gdFilter3' && value === 'eqpttype'){
      // this.setState({valueFilter3: '廊坊燃气'})
    }
    this.setState({
      [name]: value
    })
  };
  //提交的参数
  handokParams = () => {
    const {gdFilter1, valueFilter1, checkFilter1, gdFilter2, valueFilter2, checkFilter2, gdFilter3,
    valueFilter3, checkFilter3, showcheckInput1, showcheckInput2, showcheckInput3, isschedule1, isschedule2} = this.state;
    let where = '';
    let filter1 = ''
    let filter2 = ''
    let filter3 = ''
    if(valueFilter1 === ''){
      filter1 = '1=1' + ' ' + isschedule1
    }else{
      filter1 = gdFilter1 + ' ' + checkFilter1 + ' ' + `'${valueFilter1}'` + ' ' + isschedule1
    }
    if(valueFilter2 === ''){
      filter2 = '1=1' +  ' ' + isschedule2
    }else{
      filter2 = gdFilter2 + ' ' + checkFilter2 + ' ' + `'${valueFilter2}'` + ' ' + isschedule2
    }
    if(valueFilter3 === ''){
      filter3 = '1=1'
    }else{
      filter3 = gdFilter3 + ' ' + checkFilter3 + ' ' + `'${valueFilter3}'`
    }
    where = (filter1 + ' ' + filter2 + ' ' + filter3)
    return where
  };
  initState = (val, eq, layerid) => {
    this.setState({
      gdFilter1: val[0].name,
      checkFilter1: '~',
      valueFilter1: '',
      gdFilter2: val[1].name,
      checkFilter2: '~',
      valueFilter2: '',
      gdFilter3: val[2].name,
      checkFilter3: '=',
      valueFilter3: '',
      showcheckInput1: '',
      showcheckInput2: '',
      showcheckInput3: '',
      isschedule1: 'and',
      isschedule2: 'and',
    })
    if(!layerid && eq.length > 0){
      this.setState({
        eqType: eq[0].layerid,
        eqTypeName: eq[0].name,
        eqfilter: eq[0].filter,
        eqId: eq[0].id,
      })
    }
  };
  //全区查询
  checkData = () => {
    const {eqType, eqfilter, eqId} = this.state
    this.props.areaCheck(eqType, eqfilter, eqId)
  };
  //任意区域
  editArea = () => {
    const {eqType, eqfilter, eqId} = this.state
    this.props.editArea(eqType, eqfilter, eqId)
  };
  //拉框删除
  rectangleAreaEel = () => {
    const {eqTypeName} = this.state
    this.props.rectangleArea(eqTypeName)
  }
  eqFilterList = (gid, val, node) => {
    const {dataRef} = node.props;
    this.setState({
      eqType: dataRef.layerid,
      eqTypeName: val,
      selectedRowKeys: [],
      pageno: 1,
      pageSize: 10,
      eqfilter: dataRef.filter,
      eqId: dataRef.id,
    })
    this.props.map.getMapDisplay().removeLayer('layeridPoint_img');
    this.props.map.map.infoWindow.hide();
    this.props.changeMethodHandler(gid, dataRef.layerid, val);
  };
  onSelectChange = (selectedRowKeys) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys });
  }

  render() {
    const {pageno, pagesize,eqTypeName, selectedRowKeys} = this.state;
    const {gdFilter, eqList, eqData, eqSubmit, map} = this.props;
    const eqlength = eqSubmit[eqTypeName] ? eqSubmit[eqTypeName].length : 0;

    //选择框
    const rowSelection =  {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        map.getMapDisplay().removeLayer('layeridPoint_img');
        this.showPoint(selectedRows)
        this.setState({selectedRowKeys})
        this.props.submitRow(selectedRows, eqTypeName)
      },
      getCheckboxProps: record => {
        const that = this;
        const eq = that.props.eqSubmit[eqTypeName]
        return {defaultChecked : eq && eq.length > 0 && eq.some(item => Number(item.attributes.gid) === Number(record.attributes.gid))}
      },
      hideDefaultSelections: true,
      selections: [{
        key: 'all-data',
        text: '选择全部设备',
        onSelect: () => {
          const eqDataArr = [];
          eqData[eqTypeName] && eqData[eqTypeName].map(item => {
            eqDataArr.push(item.attributes.gid)
          })
          this.showPoint(eqData[eqTypeName])
          this.props.submitRow(eqData[eqTypeName], eqTypeName)
          this.setState({
            selectedRowKeys: eqDataArr,
          });
        },
      }, {
        key: 'none-data',
        text: '取消全部设备',
        onSelect: () => {
          map.getMapDisplay().removeLayer('layeridPoint_img');
          this.setState({ selectedRowKeys: [] });
          this.props.submitRow([], eqTypeName)
        },
      }],
    };

    const columns = [
      {
        title: '序号', dataIndex: 'findex', key: 'findex', width: '10%',
        render: (text, record, index) => {
          const findex = (index + 1) + pagesize * (pageno -1)
          return <span>{findex}</span>
        }
      }, {
        title: '设备编号', dataIndex: 'eqptcode', key: 'eqptcode', width: '30%',
        render: (text, record) => {
          const eqptcode = record.attributes ? (record.attributes.eqptcode ? record.attributes.eqptcode : record.attributes.eqptCode) : ''
          return (<div className={styles['textOverflowPipe']}>
                    <Tooltip placement="topLeft" title={eqptcode} >{eqptcode}</Tooltip>
                </div>);
        }
      }, {
        title: '设备名称', dataIndex: 'eqpttype', key: 'eqpttype', width: '25%',
        render: (text, record) => {
          const eqpttype = record.attributes ? (record.attributes.eqpttype ? record.attributes.eqpttype : record.attributes.eqptType) : ''
          return (<div className={styles['textOverflowPipe']}>
                    <Tooltip placement="topLeft" title={eqpttype} >{eqpttype}</Tooltip>
                </div>);
        }
      },{
        title: '设备位置', dataIndex: 'location', key: 'location', width: '30%',
        render: (text, record) => {
          const location = record.attributes ? record.attributes.location : ''
          return (<div className={styles['textOverflowPipe']}>
                    <Tooltip placement="topLeft" title={location} >{location}</Tooltip>
                </div>);
        }
      }
    ];
    // 表格分页
    const pagination = {
      total: eqData ? eqData.length : 0,
      current: pageno,
      size: 'small',
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
      <Row>
        <Row style={{marginBottom: 10 }}>
          <Col span={6} style={{textAlign: 'right' }}><label>设备点：</label></Col>
          <Col span={10}>{eqlength}个</Col>
          <Col span={5}>
            <Button type="primary" onClick={this.rectangleAreaEel}>框选删除</Button>
          </Col>
        </Row>
        <Row style={{marginBottom: 10 }}>
          <Col span={6} style={{textAlign: 'right' }}><label>选择设备：</label></Col>
          <Col span={15}>
            <Select style={{ width: '100%' }} value={this.state.eqTypeName} onSelect={(val, node) => this.eqFilterList('1', val, node)}>
                {
                  eqList && eqList.map((item, index) =>
                    <Option key={index} value={item.name} dataRef={item}>{item.name}</Option>
                  )
                }
            </Select>
          </Col>
        </Row>
        <Row style={{marginBottom: 10, marginLeft: 15}}>
          <Col span={6}>
            <Select style={{ width: '90%' }} value={this.state.gdFilter1}
              onSelect={(val) => this.changeFilterHandler1(val, 'gdFilter1')}>
                {
                  gdFilter && gdFilter.map((item) =>
                    <Option key={item.name} value={item.name} dataRef={item}>{item.alise}</Option>
                  )
                }
            </Select>
          </Col>
          <Col span={6}>
            <Select style={{ width: '90%' }} value={this.state.checkFilter1}
              onSelect={(val) => this.changeFilterHandler1(val, 'checkFilter1')}
            >
                {
                  checkFilter.map((item) =>
                    <Option key={item.name} value={item.value} dataRef={item}>{item.name}</Option>
                  )
                }
            </Select>
          </Col>
          <Col span={8}>
              <Input style={{ width: '100%' }} value={this.state.valueFilter1} disabled={this.state.showcheckInput1}
                onChange={(e) => this.changeFilterHandler1(e.target.value, 'valueFilter1')}
              />
          </Col>
        </Row>
        <Row style={{marginBottom: 10 }}>
          <Col span={6} style={{textAlign: 'right' }}><label>条件关系：</label></Col>
          <Col span={10}>
            <Radio.Group
              value={this.state.isschedule1}
              onChange={(e) => this.changeFilterHandler1(e.target.value, 'isschedule1')}
            >
              <Radio value="and">并且</Radio>
              <Radio value="or">或者</Radio>
            </Radio.Group>
          </Col>
        </Row>
        <Row style={{marginBottom: 10, marginLeft: 15 }}>
          <Col span={6}>
            <Select style={{ width: '90%' }} value={this.state.gdFilter2}
              onSelect={(val) => this.changeFilterHandler2(val, 'gdFilter2')}
            >
                {
                  gdFilter && gdFilter.map((item) =>
                    <Option key={item.name} value={item.name} dataRef={item}>{item.alise}</Option>
                  )
                }
            </Select>
          </Col>
          <Col span={6}>
            <Select style={{ width: '90%' }} value={this.state.checkFilter2}
              onSelect={(val) => this.changeFilterHandler2(val, 'checkFilter2')}
            >
                {
                  checkFilter.map((item) =>
                    <Option key={item.name} value={item.value} dataRef={item}>{item.name}</Option>
                  )
                }
            </Select>
          </Col>
          <Col span={8}>
              <Input style={{ width: '100%' }} value={this.state.valueFilter2} disabled={this.state.showcheckInput2}
                onChange={(e) => this.changeFilterHandler2(e.target.value, 'valueFilter2')}/>
          </Col>
        </Row>
        <Row style={{marginBottom: 10 }}>
          <Col span={6} style={{textAlign: 'right' }}><label>条件关系：</label></Col>
          <Col span={10}>
            <Radio.Group
              value={this.state.isschedule2}
              onChange={(e) => this.changeFilterHandler2(e.target.value, 'isschedule2')}
            >
              <Radio value="and">并且</Radio>
              <Radio value="or">或者</Radio>
            </Radio.Group>
          </Col>
        </Row>
        <Row style={{marginBottom: 10, marginLeft: 15 }}>
          <Col span={6}>
            <Select style={{ width: '90%' }} value={this.state.gdFilter3}
              onSelect={(val) => this.changeFilterHandler3(val, 'gdFilter3')}
            >
                {
                  gdFilter && gdFilter.map((item) =>
                    <Option key={item.name} value={item.name} dataRef={item}>{item.alise}</Option>
                  )
                }
            </Select>
          </Col>
          <Col span={6}>
            <Select style={{ width: '90%' }} value={this.state.checkFilter3}
              onSelect={(val) => this.changeFilterHandler3(val, 'checkFilter3')}
            >
                {
                  checkFilter.map((item) =>
                    <Option key={item.name} value={item.value} dataRef={item}>{item.name}</Option>
                  )
                }
            </Select>
          </Col>
          <Col span={8}>
              <Input style={{ width: '100%' }} value={this.state.valueFilter3} disabled={this.state.showcheckInput3}
                onChange={(e) => this.changeFilterHandler3(e.target.value, 'valueFilter3')}
              />
          </Col>
        </Row>
        <Row style={{marginBottom: 10, textAlign: 'center' }}>
          <Col span={10}>
            <div style={{cursor: 'pointer'}} onClick={this.checkData}>
              <div><img src="./images/全区.png" style={{width: 30, height: 30}}/></div>
              <div>全区范围</div>
            </div>
          </Col>
          <Col span={10}>
            <div style={{cursor: 'pointer'}} onClick={this.editArea}>
              <div><img src="./images/任意区域.png" style={{width: 30, height: 30}}/></div>
              <div>任意范围</div>
            </div>
          </Col>
        </Row>
        <Row style={{marginBottom: 10 }}>
          <Table
            rowKey={(record) => record.attributes.gid}
            columns={columns}
            dataSource={eqData[eqTypeName] || []}
            pagination={pagination}
            rowSelection={rowSelection}
          />
        </Row>
      </Row>
    )
  }
}

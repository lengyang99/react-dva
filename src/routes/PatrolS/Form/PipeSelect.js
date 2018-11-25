import React from 'react';
import styles from './index.less';
import { Input, Button, Checkbox, Radio, Row, Col, Select, TreeSelect, message, Icon, Table, Tooltip } from 'antd';
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

export default class planTemplate extends React.Component {
  constructor(props) {
    super(props);
    this.map = null; // 类ArcGISMap的实例
    this.keydownEvent = null;
    this.state = {
      pageno: 1,
      pagesize: 10,
      pipelength: 0,
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
      selectedRowKeys: [],
    };
  }
  componentDidMount = () => {
    this.props.onRef(this);
  };

  
  // 展示线
  showPath = (pathPolygon, ids) => {
    if (!pathPolygon) {
      return;
    }
    let lines = pathPolygon;
    const {map} = this.props
    const paramLine = {
      id: `paramLine_${ids}`,
      layerId: `testlayer_line`,
      color: [0, 0, 255],
      width: 5,
      layerIndex: 10,
      dots: lines,
    };
    map.getMapDisplay().polyline(paramLine);
  };

  pageChange = (current, pageSize) => {
    this.setState({
      pageno: current,
      pageSize,
    });
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
  initState = (val) => {
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
  };
  checkData = () => {
    this.props.areaCheck()
  };
  editArea = () => {
    this.props.editArea()
  };
  rectangleAreaEel = () => {
    this.props.rectangleArea()
  }
  

  onSelectChange = (selectedRowKeys) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys });
  }

  render() {
    const {pageno, pagesize, selectedRowKeys} = this.state;
    const {gdFilter, pipeData, pipelength, map} = this.props;

    //选择框
  const rowSelection =  {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      map.getMapDisplay().removeLayer('testlayer_line');
      if(selectedRows && selectedRows.length > 0){
        // for(let i = 0; i < selectedRows.length; i++){
        //   let docts = [
        //     {x: selectedRows[i].geometry.paths[0][0][0], y: selectedRows[i].geometry.paths[0][0][1]},
        //     {x: selectedRows[i].geometry.paths[0][1][0], y: selectedRows[i].geometry.paths[0][1][1]},
        //   ];
        //   const id = selectedRows[i].attributes.gid
        //   this.showPath(docts, id)
        // }
        for(let i = 0; i < selectedRows.length; i++){
          let paths = selectedRows[i].geometry.paths[0];
          if(paths.length >= 2){
            for(let j = 0; j < paths.length - 1; j++){
              let docts = [
                {x: paths[j][0], y: paths[j][1]},
                {x: paths[j+1][0], y: paths[j + 1][1]},
              ];
              const id = selectedRows[i].attributes.gid
              this.showPath(docts, id + '_' + j)
            }
          }
        }
      }
      this.props.submitRow(selectedRows)
      this.setState({ selectedRowKeys });
    },
    hideDefaultSelections: true,
    getCheckboxProps: record => {  
      const that = this;
      const pipe = that.props.pipeSubmit
      return {defaultChecked : pipe.length > 0 && pipe.some(item => Number(item.attributes.gid) === Number(record.attributes.gid))}
    }, 
    selections: [{
      key: 'all-data',
      text: '选择全部管段',
      onSelect: () => {
        const pipeDataArr = [];
        pipeData && pipeData.map(item => {
          pipeDataArr.push(item.attributes.gid)
        })
        // for(let i = 0; i < pipeData.length; i++){
        //   let docts = [
        //     {x: pipeData[i].geometry.paths[0][0][0], y: pipeData[i].geometry.paths[0][0][1]},
        //     {x: pipeData[i].geometry.paths[0][1][0], y: pipeData[i].geometry.paths[0][1][1]},
        //   ];
        //   const id = pipeData[i].attributes.gid
        //   this.showPath(docts, id)
        // }
        for(let i = 0; i < pipeData.length; i++){
          let paths = pipeData[i].geometry.paths[0];
          if(paths.length >= 2){
            for(let j = 0; j < paths.length - 1; j++){
              let docts = [
                {x: paths[j][0], y: paths[j][1]},
                {x: paths[j+1][0], y: paths[j + 1][1]},
              ];
              const id = pipeData[i].attributes.gid
              this.showPath(docts, id + '_' + j)

            }
          }
        }

        this.props.submitRow(pipeData)
        this.setState({
          selectedRowKeys: pipeDataArr,
        });
      },
    }, {
      key: 'none-data',
      text: '取消全部管段',
      onSelect: () => {
        map.getMapDisplay().removeLayer('testlayer_line');
        this.setState({ selectedRowKeys: [] });
        this.props.submitRow([])
      },
    }],
    onSelection: this.onSelection,
  };
    const columns = [
      {
        title: '序号', dataIndex: 'findex', key: 'findex', width: '10%', 
        render: (text, record, index) => {
          const findex = (index + 1) + pagesize * (pageno -1)
          return <span>{findex}</span>
        }
      }, {
        title: '管段编号', dataIndex: 'eqptcode', key: 'eqptcode', width: '40%',
        render: (text, record) => {
          const eqptcode = record.attributes ? (record.attributes.eqptcode ? record.attributes.eqptcode : record.attributes.eqptCode) : ''
          return (<div className={styles['textOverflowPipe']}>
                    <Tooltip placement="topLeft" title={eqptcode} >{eqptcode}</Tooltip>
                </div>);
        }
      }, {
        title: '压力级别', dataIndex: 'pressurerating', key: 'pressurerating', width: '20%',
        render: (text, record) => {
          const pressurerating = record.attributes ? (record.attributes.pressurerating ? record.attributes.pressurerating : record.attributes.pressureRating) : ''
          return <div>{pressurerating}</div>
        }
      },{
        title: '管材', dataIndex: 'pipematerial', key: 'pipematerial', width: '20%',
        render: (text, record) => {
          const pipematerial = record.attributes ? (record.attributes.pipematerial ? record.attributes.pipematerial : record.attributes.pipeMaterial) : ''
          return (<div className={styles['textOverflowPipe']}>
                    <Tooltip placement="topLeft" title={pipematerial} >{pipematerial}</Tooltip>
                </div>);
        }
      },{
        title: '口径', dataIndex: 'pipediam', key: 'pipediam', width: '10%',
        render: (text, record) => {
          const pipediam = record.attributes ? (record.attributes.pipediam ? record.attributes.pipediam : record.attributes.pipeDiam) : ''
          return <div>{pipediam}</div>
        }
      },
    ];
    // 表格分页
    const pagination = {
      total: pipeData ? pipeData.length : 0,
      size: 'small',
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
      <Row>
        <Row style={{marginBottom: 10 }}>
          <Col span={6} style={{textAlign: 'right' }}><label>管段长度：</label></Col>
          <Col span={10}>{pipelength}m</Col>
          <Col span={5}>
            <Button type="primary" onClick={this.rectangleAreaEel}>框选删除</Button>
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
            <div  style={{cursor: 'pointer'}} onClick={this.editArea}>
              <div><img src="./images/任意区域.png" style={{width: 30, height: 30}}/></div>
              <div>任意范围</div>
            </div >
          </Col>
        </Row>
          <Table
            rowKey={(record) => record.attributes.gid}
            columns={columns}
            dataSource={pipeData || []}
            pagination={pagination}
            rowSelection={rowSelection}
            scroll={{x: 500}}
          />
      </Row>
    )
  }
}

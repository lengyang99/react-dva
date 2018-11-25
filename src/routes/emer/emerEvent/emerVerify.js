import React from 'react';
import {connect} from 'dva';
import {routerRedux, Link} from 'dva/router';
import {Form, Input, Button, Checkbox, Radio, Row, Col, Select, DatePicker, TreeSelect, message, Icon} from 'antd';
import moment from 'moment';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';
import {DrawPointMapTool} from '../../../components/Map/common/maptool/DrawPointMapTool';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const createForm = Form.create;
const CheckboxGroup = Checkbox.Group;
const RangePicker = DatePicker.RangePicker;
const Search = Input.Search;
const emerCategoryInfo = ['高压管网', '场站', '中低压管网', '用户'];
const isEffectProductInfo = {
  '高压管网': ['可能导致停产', '不导致停产'],
  '场站': ['可能导致停产', '不导致停产'],
  '中低压管网': ['可能影响用户供气', '不影响用户供气'],
  '用户': ['可能影响用户供气', '不影响用户供气'],
};

@connect(state => ({
  user: state.login.user,
  map: state.emerLfMap.map,
}))

export default class emerVerify extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emerCategoryDatas: '', // 险情分类下拉数据
      isEffectProductDatas: '', // 是否影响生产下拉数
      emerEventTypeData: [],   //事件类型下拉数据；
      isErrorAppear: '1', // 是否错误上报
      emerCategory:'', // 险情分类
      isEffectProduct: '', // 是否影响生产
      emerClassify: '', // 事故类型
      emerClassifyName: '', //事故类型名称
      personCasualty: '', // 人员伤亡
      stopGasRange: '', // 停气范围
      emerGrade: 3, // 险情分级
      emerGradeList: [3, 3, 3], // 险情分级用以判断的临时表
      isOtherIntervene: '0', // 是否政府,媒体介入
      relevancePipeline: '', // 关联管道
      clickPipeData: null, // 保存点选的管段信息
    };
  }
  componentWillMount() {
    const {verityEvent, emerEventTypeData} = this.props
    this.props.dispatch({
      type: 'emer/getDangerType',
      payload: {
        ecode: this.props.user.ecode,
      },
      callback: (res) => {
        console.log(res, '险情分类')
        this.setState({
          emerCategoryDatas : res.data,
        })
      }
    })
    const clickPipeData = {
        GID: verityEvent.pipeGid,
        geom: verityEvent.pipeGeom
    };
    console.log(this.props.verityEvent, 'verityEvent,1')
    this.setState({
      emerEventTypeData: emerEventTypeData,   //事件类型下拉数据；
      emerCategory: verityEvent.dangerType, // 险情分类
      isEffectProductDatas: isEffectProductInfo[verityEvent.dangerType],  //是否影响生产下拉数据
      isEffectProduct: verityEvent.isAffectProduce, // 是否影响生产
      emerClassify: verityEvent.type, // 事故类型
      emerClassifyName: verityEvent.typeName, //事故类型名称
      personCasualty: verityEvent.casualtyStatistic, // 人员伤亡
      stopGasRange: verityEvent.influenceRange, // 停气范围
      emerGrade: verityEvent.level, // 险情分级
      emerGradeList: [3, 3, 3], // 险情分级用以判断的临时表
      isOtherIntervene: verityEvent.isIntervened, // 是否政府,媒体介入
      relevancePipeline: verityEvent.pipeId, // 关联管道
      clickPipeData,   // 保存点选的管段信息
    })
  }
  componentDidMount() {
    const {verityEvent, emerEventTypeData} = this.props
    console.log(this.props.verityEvent, 'verityEvent,2')
  }

  componentWillUnmount = () => {
    this.props.map.getMapDisplay().removeLayer('testlayer');
    this.setState = (state, callback) => {};
  };

  // 获取点击的管线
  getLine = (geometry, callback) => {
    let mapExtent = this.props.map.getMapDisplay().getExtend();
    this.props.dispatch({
      type: 'emerLfMap/identify',
      payload: {
        tolerance: 10,
        returnGeometry: true,
        imageDisplay: '1280,800,96',
        geometry: `${geometry.x},${geometry.y}`,
        geometryType: 'esriGeometryPoint',
        mapExtent: `${mapExtent.xmin},${mapExtent.ymin},${mapExtent.xmax},${mapExtent.ymax}`,
        layers: 'visible',
        f: 'json',
      },
      callback: (res) => {
        callback(res);
      },
    });
  };

  // 点选  选取管段
  OnClickLine = () => {
    let that = this;
    if (this.isClickLine) {
      that.mapTool.destroy();
      this.props.map.getMapDisplay().removeLayer('testlayer');
      this.isClickLine = false;
      return;
    }
    this.isClickLine = true;
    this.props.map.getMapDisplay().removeLayer('testlayer');
    this.mapTool = new DrawPointMapTool(this.props.map.getMapObj(), this.props.map.getApiUrl(), (geom) => {
      that.getLine(geom, (res) => {
        if (res.results && res.results.length === 0) {
          message.warn('管线或管点未找到');
          return;
        }
        if(res.results[0].attributes.编号 === 'Null'){
          message.warn('管线或管点未录入编号');
          return;
        }
        this.setState({
          relevancePipeline: res.results[0].attributes.编号,
        });
        if (res.results[0].geometryType === 'esriGeometryPoint') {
          let param = {
            x: geom.x,
            y: geom.y,
            info: {
              title: '管点信息',
              content: [{
                name: '编号', value: res.results[0].attributes.编号,
              }, {
                name: '种类', value: res.results[0].attributes.种类,
              }, {
                name: '施工单位', value: res.results[0].attributes.施工单位,
              }, {
                name: '埋深', value: `${res.results[0].attributes.埋深}米`,
              }, {
                name: '位置', value: res.results[0].attributes.位置,
              }],
            },
          };
          // that.props.map.popup(param);
        } else if (res.results[0].geometryType === 'esriGeometryPolyline') {
          let param = {
            x: geom.x,
            y: geom.y,
            info: {
              title: '管段信息',
              content: [{
                name: '编号', value: res.results[0].attributes.编号,
              }, {
                name: '管长', value: res.results[0].attributes.管长,
              }, {
                name: '管径', value: res.results[0].attributes.管径,
              }, {
                name: '管材', value: res.results[0].attributes.管材,
              }, {
                name: '压力级别', value: res.results[0].attributes.压力级别,
              }, {
                name: '敷设方式', value: res.results[0].attributes.敷设方法,
              }, {
                name: '防腐方法', value: res.results[0].attributes.防腐方法,
              }],
            },
          };
          // that.props.map.popup(param);
          // 画出被点击管线
          let paths = res.results[0].geometry.paths[0];
          that.props.map.getMapDisplay().polyline({
            id: 'paramLine',
            layerId: 'testlayer',
            width: 5,
            layerIndex: 10,
            dots: [{x: paths[0][0], y: paths[0][1]}, {x: paths[1][0], y: paths[1][1]}],
          });
          const pipeGeom = geom.x + ',' + geom.y
          // 保存点选管段信息
          this.setState({
            clickPipeData:{
              GID: res.results[0].attributes.GID,
              gid: res.results[0].attributes['编号'],
              pipe: res.results[0],
              geom: pipeGeom,
            }
          });
        }
      });
      that.mapTool.destroy();
      that.isClickLine = false;
    });
    this.props.map.switchMapTool(this.mapTool);
  };

  // 查询应急事件类型
  handleGetEmerEventType = () => {
    this.props.dispatch({
      type: 'emer/getEmerEventType',
      payload: {
        ecode: this.props.user.ecode,
      },
      callback: (res) => {
        this.setState({
          emerEventTypeData: res.data,
          emerClassify: `${this.props.verityEvent.type}`,
        });
      },
    });
  }

  onChangeField = (field, value, node) => {
    if (field === 'emerClassify') {
      const {dataRef} = node.props;
      this.setState({
        emerClassifyName: dataRef.name,
      });
    }
    this.setState({
      [field]: value,
    });
  };

  onChangeEmerCategory = (field, value) => {
    let emerGradeList = [...this.state.emerGradeList];
    // '高压管网', '场站', '中低压管网', '用户'
    let level = 1;
    if (value === '高压管网' || value === '场站') {
      level = 1;
    } else if (value === '中低压管网') {
      level = 2;
    } else {
      level = 3;
    }
    emerGradeList[0] = level;
    this.setState({
      [field]: value,
      isEffectProduct: isEffectProductInfo[value][0], // 是否影响生产
      isEffectProductDatas: isEffectProductInfo[value],
      emerGradeList,
      emerGrade: Math.min.apply(Math, emerGradeList),
    });
  };

  onChangeIsEffectProduct = (field, value) => {
    let emerGradeList = [...this.state.emerGradeList];
    let level = 1;
    if (value === '可能导致停产') {
      level = 1;
    } else if (value === '不导致停产' || (value === '可能影响用户供气' && this.state.emerCategory === '中低压管网')) {
      level = 2;
    } else {
      level = 3;
    }
    emerGradeList[0] = level;
    this.setState({
      [field]: value,
      emerGradeList,
      emerGrade: Math.min.apply(Math, emerGradeList),
    });
  };

  onChangePersonCasualty = (field, value) => {
    let emerGradeList = [...this.state.emerGradeList];
    let level = 1;
    if (value === '人员死亡' || value === '已经或预计造成人员重伤或轻伤4人或以上') {
      level = 1;
    } else if (value === '已经或预计无人员重伤或轻伤4人以下') {
      level = 2;
    } else {
      level = 3;
    }
    emerGradeList[1] = level;
    this.setState({
      [field]: value,
      emerGradeList,
      emerGrade: Math.min.apply(Math, emerGradeList),
    });
  };

  onChangeStopGasRange = (field, value) => {
    let emerGradeList = [...this.state.emerGradeList];
    let level = 1;
    if (value === '造成特大用户停气' || value === '造成50户以上工商户停气') {
      level = 1;
    } else if (value === '造成5个或以下居民小区停气') {
      level = 3;
    } else {
      level = 2;
    }
    emerGradeList[2] = level;
    this.setState({
      [field]: value,
      emerGradeList,
      emerGrade: Math.min.apply(Math, emerGradeList),
    });
  };

  confirm = () => {
    const formData = new FormData();
    const { isErrorAppear, emerCategory, isEffectProduct, emerClassify, personCasualty, emerClassifyName,
      stopGasRange, emerGrade, isOtherIntervene, relevancePipeline } = this.state;
    const { verityEvent, emerEventClick } = this.props;
    //事件名称
    const day = moment().format("LL");
    const hour = moment().format("HH");
    const eventName = day.slice(2) + ' ' + hour + '时' + emerCategory + emerClassifyName;
    console.log(eventName, 'eventName');
    if (isErrorAppear === '1') {
      let data = {
        gid: verityEvent.gid,
        isFalseReport: isErrorAppear,
        ecode: this.props.user.ecode,
        name: eventName,
      };
      formData.append('params', JSON.stringify(data));
      formData.append('userId', this.props.user.gid);
      formData.append('userName', this.props.user.trueName);
      this.props.dispatch({
        type: 'emerLfMap/emerVerify',
        payload: formData,
        callback: (res) => {
          this.props.map.getMapDisplay().removeGraphic(`${verityEvent.gid}`, 'currentEmerEvent');
          this.exit();
          this.props.handleGetEmerEvent();
        },
      });
      return;
    }
    if (this.state.emerClassify === '') {
      message.warning('事故类型不能为空');
      return;
    }
    if (this.state.emerGrade === '') {
      message.warning('险情分级不能为空');
      return;
    }
    if (this.state.relevancePipeline === '') {
      message.warning('关联管道不能为空');
      return;
    }
    const data = {
      gid: verityEvent.gid,
      alarmId: verityEvent.alarmId,
      isFalseReport: this.state.isErrorAppear, // 是否错误上报
      dangerType: this.state.emerCategory, // 险情分类
      isAffectProduce: this.state.isEffectProduct, // 是否影响生产
      type: this.state.emerClassify, // 事故类型
      personnelCasualties: this.state.personCasualty, // 人员伤亡
      influenceRange: this.state.stopGasRange, // 停气范围
      level: this.state.emerGrade, // 险情分级
      isIntervened: this.state.isOtherIntervene, // 是否政府,媒体介入
      pipeId: this.state.relevancePipeline, // 关联管道
      ecode: this.props.user.ecode,
      pipeGid: this.state.clickPipeData.GID,   //管道信息
      pipeGeom: this.state.clickPipeData.geom,   //管道坐标
    };
    formData.append('params', JSON.stringify(data));
    formData.append('userId', this.props.user.gid);
    formData.append('userName', this.props.user.trueName);
    this.props.dispatch({
      type: 'emerLfMap/emerVerify',
      payload: formData,
      callback: (res) => {
        const currentEmerEventParam = {
          id: `${verityEvent.gid}`,
          layerId: 'currentEmerEvent',
          src: './images/emer/alarm.gif',
          width: 40,
          height: 40,
          angle: 0,
          x: verityEvent.x,
          y: verityEvent.y,
          attr: {...verityEvent, ...data},
          click: (attr) => emerEventClick(attr.attributes),
        };
        this.props.map.getMapDisplay().image(currentEmerEventParam);
        if (this.mapTool) {
          this.mapTool.destroy(); 
        }
        this.exit();
        this.props.handleGetEmerEvent({...verityEvent, ...data});
        // 自动进行爆管分析
        this.props.dispatch({
          type: 'emer/getController',
          payload: {
            eventId: this.props.verityEvent.gid,
            ecode: this.props.user.ecode,
            pipeId: this.state.clickPipeData.GID,
          },
        });
      },
    });
  };

  exit = () => {
    this.props.onClose();
    this.props.map.getMapDisplay().removeLayer('testlayer');
    this.isClickLine = false;
  };

  render() {
    const { verityEvent, onClose } = this.props;
    const { emerCategoryDatas } = this.state;
    let eventTypeName = '';
    for (let i = 0, len = this.state.emerEventTypeData.length; i < len; i++) {
      if (this.state.emerEventTypeData[i].gid === verityEvent.type) {
        eventTypeName = this.state.emerEventTypeData[i].name;
      }
    }
    const formItemLayout = {
      labelCol: {span: 7},
      wrapperCol: {span: 16},
      style: {marginBottom: '10px'},
    };
    const extraFormItemLayout = {
      labelCol: {span: 7},
      wrapperCol: {span: 16},
      style: {marginBottom: '10px', display: this.state.isErrorAppear === '1' ? 'none' : 'block'},
    };
    return (
      <Dialog title="险情确认" width={400} onClose={this.exit} position={{top: 80, left: 400}}>
        <Form style={{marginTop: '20px'}}>
          <FormItem {...formItemLayout} label="事件名称：">
            <Input value={verityEvent.name} disabled />
          </FormItem>
          <FormItem {...formItemLayout} label="事发地点：">
            <Input value={verityEvent.incidentAddr} disabled />
          </FormItem>
          <FormItem {...formItemLayout} label="是否误报：">
            <Select value={this.state.isErrorAppear} onChange={this.onChangeField.bind(this, 'isErrorAppear')}>
              <Select.Option value="1">是</Select.Option>
              <Select.Option value="0">否</Select.Option>
            </Select>
          </FormItem>
          <FormItem
            {...extraFormItemLayout}
            label="险情分类："
          >
            <Select value={this.state.emerCategory} onChange={this.onChangeEmerCategory.bind(this, 'emerCategory')}>
              {
                emerCategoryDatas && emerCategoryDatas.map((v, i) => <Select.Option key={i} value={v.name}>{v.name}</Select.Option>)
              }
            </Select>
          </FormItem>
          <FormItem
            {...extraFormItemLayout}
            label="是否影响生产："
          >
            <Select value={this.state.isEffectProduct} onChange={this.onChangeIsEffectProduct.bind(this, 'isEffectProduct')}>
              {
                this.state.isEffectProductDatas.map((v, i) => <Select.Option key={i} value={v}>{v}</Select.Option>)
              }
            </Select>
          </FormItem>
          <FormItem
            {...extraFormItemLayout}
            label="事故类型："
          >
            <Select value={this.state.emerClassify} onSelect={(val, node) => this.onChangeField('emerClassify', val, node)}>
              {
                this.state.emerEventTypeData.map((item, index) => <Select.Option key={index} value={item.gid} dataRef={item}>{item.name}</Select.Option>)
              }
            </Select>
          </FormItem>
          <FormItem
            {...extraFormItemLayout}
            label="人员伤亡："
          >
            <Select value={this.state.personCasualty} onChange={this.onChangePersonCasualty.bind(this, 'personCasualty')}>
              <Select.Option value="人员死亡">人员死亡</Select.Option>
              <Select.Option value="已经或预计造成人员重伤或轻伤4人或以上">已经或预计造成人员重伤或轻伤4人或以上</Select.Option>
              <Select.Option value="已经或预计无人员重伤或轻伤4人以下">已经或预计无人员重伤或轻伤4人以下</Select.Option>
              <Select.Option value="无人员伤亡">无人员伤亡</Select.Option>
            </Select>
          </FormItem>
          <FormItem
            {...extraFormItemLayout}
            label="停气范围："
          >
            <Select value={this.state.stopGasRange} onChange={this.onChangeStopGasRange.bind(this, 'stopGasRange')}>
              <Select.Option value="造成特大用户停气">造成特大用户停气</Select.Option>
              <Select.Option value="造成50户以上工商户停气">造成50户以上工商户停气</Select.Option>
              <Select.Option value="造成50户或以下工商户停气">造成50户或以下工商户停气</Select.Option>
              <Select.Option value="造成5个以上居民小区停气">造成5个以上居民小区停气</Select.Option>
              <Select.Option value="造成5个或以下居民小区停气">造成5个或以下居民小区停气</Select.Option>
            </Select>
          </FormItem>
          <FormItem
            {...extraFormItemLayout}
            label="险情分级："
          >
            <Select value={this.state.emerGrade} onChange={this.onChangeField.bind(this, 'emerGrade')}>
              <Select.Option value={1}>一级</Select.Option>
              <Select.Option value={2}>二级</Select.Option>
              <Select.Option value={3}>三级</Select.Option>
            </Select>
          </FormItem>
          <FormItem
            {...extraFormItemLayout}
            label="有无政府,媒体介入："
          >
            <Select value={this.state.isOtherIntervene} onChange={this.onChangeField.bind(this, 'isOtherIntervene')}>
              <Select.Option value={0}>无</Select.Option>
              <Select.Option value={1}>有</Select.Option>
            </Select>
          </FormItem>
          <FormItem
            {...extraFormItemLayout}
            label="关联管道："
          >
            <Search
              value={this.state.relevancePipeline}
              placeholder="管段"
              onSearch={(value) => this.OnClickLine()}
              enterButton="地图选点"
            />
          </FormItem>
          <FormItem
            style={{margin: '20px 0px'}}
            wrapperCol={{span: 9, offset: 14}}
          >
            <Button type="primary" style={{width: '70px', height: '28px', marginRight: '8px'}} onClick={this.confirm}>确定</Button>
            <Button type="ghost" style={{width: '70px', height: '28px'}} onClick={this.exit}>取消</Button>
          </FormItem>
        </Form>
      </Dialog>
    );
  }
}

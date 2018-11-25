import React from 'react';
import {connect} from 'dva';
import {Select, Button, Input, DatePicker, message, Icon, AutoComplete} from 'antd';
import moment from 'moment';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';
import {DrawPointMapTool} from '../../../components/Map/common/maptool/DrawPointMapTool';
import styles from '../css/emerEventAdd.css';
import EmerUserList from '../resources/emerUserList';
import EmerReportW from './emerReportW';

const Option = Select.Option;
const Search = Input.Search;
// 应急事件等级
let emerEventLevel = ['1-一级紧急', '2-二级紧急', '3-三级紧急'];
let currentTimer = -1;
let region = '';
const output = 'json';
const ak = 'YNHIyHSShx4Q4MBwQLfh2Lb8HUBo9chm';

@connect(state => ({
  user: state.login.user,
  map: state.emerLfMap.map, // 地图
  users: state.emerLfMap.users,
  ecodePattern: state.emerLfMap.ecodePattern, // 企业模式配置
  isShowEmerRep: state.emerLfMap.isShowEmerRep, // 是否展示上报提醒(平时-右下)
}))

export default class EmerEventAdd extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emerCategory: '',
      emerClassify: '',
      emerEventTypeData: [],
      emerEventGid: '',
      emerEvent: {},
      emerEvent_name: '',
      emerEvent_type: 0,
      emerEvent_level: 0,
      emerEvent_levelName: '',
      emerEvent_incidentUnit: this.props.user.company,
      emerEvent_incidentTime: moment(),
      emerEvent_incidentAddr: '',
      emerEvent_incidentXY: {},
      emerEvent_sceneControllerId: '',
      emerEvent_sceneController: '',
      emerEvent_pipeId: '',
      emerEvent_reporterId: '',
      emerEvent_reporter: '',
      emerEvent_reporterTel: '',
      emerEvent_alarmReceiver: this.props.user.trueName,
      emerEvent_receiveTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      emerEvent_isDrill: '0',
      emerEvent_DrillProject: '',
      emerDrillCaseData: [],
      dataSource: [],
      dangerData: [],  //险情分类数据；
      lastEmerEvent: {},  //上报提示信息；
      isShowEmerWarn: false, //上报提醒框；
    };
    region = `${this.props.user.company.substring(0, 2)}市`;
    message.config({
      duration: 1.5,
    });
    this.handleGetEmerEventType();
  }

  componentWillMount(){
    this.props.dispatch({
      type: 'emer/getDangerType',
      payload: {
        ecode: this.props.user.ecode,
      },
      callback: (res) => {
        console.log(res, '险情分类')
        this.setState({
          dangerData : res.data,
          emerCategory: res.data[0].name,
        })
      }
    })
  }
  componentWillUnmount() {
    this.props.map.getMapDisplay().removeLayer('pickPoint');
    this.setState = (state, callback) => {};
  }

  // 新增应急事件
  handleAddEmerEvent = (e) => {
    // 表单验证
    let flag = this.handleCheckForm();
    let gid = 0;
    let reg = new RegExp('[\\u4E00-\\u9FFF]'); // 是有中文
    let caseData = this.state.emerDrillCaseData;
    if (reg.test(this.state.emerEvent_DrillProject)) {
      for (let [index, elem] of caseData.entries()) {
        if (elem.name === this.state.emerEvent_DrillProject) {
          gid = elem.gid;
        }
      }
    } else {
      gid = this.state.emerEvent_DrillProject;
    }
    // 验证通过，提交数据
    if (flag) {
      let fd = new FormData();
      fd.append('name', this.state.emerEvent_name);
      fd.append('incidentUnit', this.state.emerEvent_incidentUnit);
      fd.append('incidentTime', this.state.emerEvent_incidentTime.format('YYYY-MM-DD HH:mm:ss'));
      fd.append('incidentAddr', this.state.emerEvent_incidentAddr);
      fd.append('reporterId', this.state.emerEvent_reporterId);
      fd.append('reporter', this.state.emerEvent_reporter);
      fd.append('reporterTel', this.state.emerEvent_reporterTel);
      fd.append('alarmReceiverId', this.props.user.gid);
      fd.append('alarmReceiver', this.state.emerEvent_alarmReceiver);
      fd.append('alarmReceiverTel',this.props.user.phone);
      fd.append('receiveTime', this.state.emerEvent_receiveTime);
      fd.append('sceneController', this.state.emerEvent_sceneControllerId);
      fd.append('sceneControllerName', this.state.emerEvent_sceneController);
      fd.append('isDrill', this.state.emerEvent_isDrill);
      fd.append('dangerType', this.state.emerCategory);
      fd.append('type', this.state.emerClassify);
      fd.append('x', this.state.emerEvent_incidentXY.x);
      fd.append('y', this.state.emerEvent_incidentXY.y);
      if (this.state.emerEvent_isDrill === '1') {
        fd.append('drillScriptId', gid);
      }
      this.props.dispatch({
        type: 'emer/addEmerEvent',
        payload: fd,
        callback: (res) => {
          message.info(res.msg);
          let emerEventRepData = {};
          emerEventRepData.name = this.state.emerEvent_reporter;
          emerEventRepData.eventName = this.state.emerEvent_name;
          this.setState({
            emerEventGid: res.data.gid,
            isShowEmerWarn: true,
          });
          // 关闭接警弹框
          this.props.onCancel();
          this.props.getEmerRep(emerEventRepData);
          this.props.changeStatus();
          const params = {
            id: `emerPoint`,
            layerId: 'emerPoint',
            src: './images/emer/alarm.gif',
            width: 40,
            height: 40,
            angle: 0,
            x: this.state.emerEvent_incidentXY.x,
            y: this.state.emerEvent_incidentXY.y,
          };
          this.props.map.getMapDisplay().image(params);
        },
      });
    }
  }

  // 表单校验
  handleCheckForm = () => {
    if (this.state.emerEvent_name.trim() === '') {
      message.warning('事件名称不能为空');
      return false;
    }
    if (this.state.emerEvent_incidentUnit.trim() === '') {
      message.warning('事发单位不能为空');
      return false;
    }
    if (this.state.emerEvent_incidentAddr.trim() === '') {
      message.warning('事发地点不能为空');
      return false;
    }
    if (this.state.emerEvent_reporter.trim() === '') {
      message.warning('上报人不能为空');
      return false;
    }
    if (this.state.emerEvent_reporterTel.trim() === '') {
      message.warning('上报人电话不能为空');
      return false;
    }
    // 验证手机号码
    if (!/^1\d{10}$/.test(this.state.emerEvent_reporterTel) && !/^0\d{2,3}(－|-)?\d{7,8}$/.test(this.state.emerEvent_reporterTel)) {
      message.warning('上报人电话号码格式不正确');
      return false;
    }
    if (this.state.emerEvent_isDrill === '1' && this.state.emerEvent_DrillProject.trim() === '') { //
      message.warning('演练方案不能为空');
      return false;
    }
    return true;
  }

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
          emerClassify: `${res.data[0].gid}`,
          emerEvent_name: moment().format('YYYY年MM月DD日 HH时') + this.state.emerCategory + res.data[0].name,
        });
      },
    });
  }

  // 查询应急演练方案
  handleGetEmerDrillCase = () => {
    let data = {};
    data.ecode = this.props.user.ecode;
    this.props.dispatch({
      type: 'emer/getEmerDrillCase',
      payload: data,
      callback: (res) => {
        this.setState({
          emerDrillCaseData: res.data,
          emerEvent_DrillProject: res.data[0].name,
        });
      },
    });
  }

  // 设置新增应急事件的属性
  setEmerEventName = (e) => {
    this.setState({
      emerEvent_name: e.target.value,
    });
  }
  setEmerEventType = (value) => {
    this.setState({
      emerEvent_type: value,
    });
  }
  setEmerEventLevel = (value) => {
    this.setState({
      emerEvent_level: value,
    });
  }
  setEmerEventIncidentUnit = (e) => {
    this.setState({
      emerEvent_incidentUnit: e.target.value,
    });
  }
  setEmerEventIncidentTime = (date, dateString) => {
    this.setState({
      emerEvent_incidentTime: date,
      emerEvent_name: date.format('YYYY年MM月DD日 HH时') + this.state.emerCategory + this.state.emerEventTypeData.filter((v) => `${v.gid}` === this.state.emerClassify)[0].name,
    });
  }
  setEmerEventSceneController = (id, value) => {
    this.setState({
      emerEvent_sceneControllerId: id,
      emerEvent_sceneController: value,
    });
  }
  setEmerEventIncidentAddr = (e) => {
    this.setState({
      emerEvent_incidentAddr: e.target.value,
    });
  }
  setEmerEventPipeId = (e) => {
    this.setState({
      emerEvent_pipeId: e.target.value,
    });
  }
  setEmerEventReporter = (value, e) => {
    if (value === '') {
      this.setState({
        emerEvent_reporterTel: '',
      });
    }
    if (e && e.props && e.props.tel) {
      this.setState({
        emerEvent_reporterId: e.props.userid,
        emerEvent_reporter: e.props.children,
        emerEvent_reporterTel: e.props.tel,
  
      });
      return;
    }
    this.setState({
      emerEvent_reporter: e.props.children,
    });
  }
  setEmerEventReporterTel = (e) => {
    this.setState({
      emerEvent_reporterTel: e.target.value,
    });
  }

  setEmerDrillProject = (value) => {
    this.setState({
      emerEvent_DrillProject: value,
    });
  }

  setEmerEventIsDrill = (value) => {
    this.setState({
      emerEvent_isDrill: value,
    });
    if (value === '1') {
      this.handleGetEmerDrillCase();
    }
  }

  // 地图选点
  pickPoint = () => {
    this.pickPointInMap();
  }

  geomToName = (geom) => {
    this.props.dispatch({
      type: 'emerLfMap/v2',
      payload: {
        location: `${geom.y},${geom.x}`,
        output: 'json',
        pois: 1,
        ak: 'YNHIyHSShx4Q4MBwQLfh2Lb8HUBo9chm',
      },
      callback: (res) => {
        this.setState({
          accidenAddr: res.result,
          emerEvent_incidentAddr: `${res.result.formatted_address}(${res.result.sematic_description})`,
          emerEvent_incidentXY: geom,
        });
      },
    });
     // 事发地点确认后，查询现场控制人员：返回距事发点的距离
     this.getSceneController(geom);
  }

  pickPointInMap = () => {
    this.props.map.getMapDisplay().removeLayer('pickPoint');
    const mapTool = new DrawPointMapTool(this.props.map.getMapObj(), this.props.map.getApiUrl(), (geom) => {
      let startParams = {
        id: 'pickPoint',
        layerId: 'pickPoint',
        src: '../../images/emer/pickPoint.png',
        width: 19,
        height: 27,
        angle: 0,
        x: geom.x,
        y: geom.y,
      };
      this.props.map.getMapDisplay().image(startParams);
      mapTool.destroy();
      this.geomToName(geom);
    });
    this.props.map.switchMapTool(mapTool);
  };

  openOrCloseDialog = (field, flag) => {
    if (field === 'isShowUserList') {
      if (!this.state.emerEvent_incidentAddr) {
        message.warn('应急事件地点未指定');
        return;
      }
    }
    this.setState({
      [field]: flag,
    });
  };

  // 地点检索,初始化自动补全提示
  searchByLocation = (value) => {
    this.setState({
      emerEvent_incidentAddr: value,
    });
    this.props.dispatch({
      type: 'emer/searchByLocation',
      payload: {query: value, output, ak, region},
      callback: (res) => {
        let results = res.results;
        this.setState({dataSource: (res.results || []).map((r) => r.name + (r.address ? (`(${r.address})`) : ''))});
        let result = res.results[0] || null;
        if (result && result.location) {
          this.setState({
            emerEvent_incidentXY: {x: result.location.lng, y: result.location.lat},
          });
        }
      },
    });
  }

  search = () => {
    let str = document.getElementById('searchInfo').defaultValue;
    this.searchByLocation(str);
  }

  // 选择自动补全
  onSelect = (value) => {
    this.props.dispatch({
      type: 'emer/searchByLocation',
      payload: {query: value, region, output, ak},
      callback: (res) => {
        let result = res.results[0] || null;
        if (result) {
          if (this.props.map.getMapDisplay().getLayer('searchResult')) {
            this.props.map.getMapDisplay().removeLayer('searchResult');
          }
          this.props.map.centerAt({x: result.location.lng, y: result.location.lat});
          let param = {
            id: 'searchResult',
            layerId: 'searchResult',
            src: '../../images/emer/pickPoint.png',
            width: 19,
            height: 27,
            angle: 0,
            x: result.location.lng,
            y: result.location.lat,
          };
          this.props.map.getMapDisplay().image(param);
        }
      },
    });
  }

  onChangeEmerCategory = (field, value) => {
    this.setState({
      [field]: value,
      emerEvent_name: this.state.emerEvent_incidentTime.format('YYYY年MM月DD日 HH时') + value + this.state.emerEventTypeData.filter((v) => `${v.gid}` === this.state.emerClassify)[0].name,
    });
  };

  onChangeField = (field, value, e) => {
    this.setState({
      [field]: value,
      emerEvent_name: this.state.emerEvent_incidentTime.format('YYYY年MM月DD日 HH时') + this.state.emerCategory + e.props.children,
    });
  };

  openEmerWarning = () => {
    this.setState({
      isShowEmerWarn: false,
    });
  }
  searchByLocationBlur = () => {
    if (!this.state.emerEvent_incidentXY) {
      message.warn('应急事件地点未指定');
      this.setState({
        emerEvent_incidentAddr: '',
      });
      return;
    }
    // 事发地点确认后，查询现场控制人员：返回距事发点的距离
    this.getSceneController(this.state.emerEvent_incidentXY);
  }

  // 查询现场控制人员
  getSceneController = (eventXY) => {
    let data = {};
    data.ecode = this.props.user.ecode;
    data.eventX = eventXY.x;
    data.eventY = eventXY.y;
    this.props.dispatch({
      type: 'emerLfMap/getSceneController',
      payload: data,
    });
  }

  render = () => {
    const {onCancel} = this.props;
    const {dangerData, isShowEmerWarn} = this.state;
    console.log(this.props.isShowEmerRep, '☆')
    const modalStyle = {
      marginLeft: 530,
      marginTop: 45,
    };
    return (
      <div>
        <Dialog
          title="新增应急事件"
          width={440}
          onClose={onCancel}
          position={{
            top: 100,
            left: 460,
          }}
        >
          <div className={styles.emerEventAddForm}>
            <form>
              <div className={styles.emerEventAddItem}>
                <span className={styles.emerEventAddLabel}>险情分类：</span>
                <Select
                  value={this.state.emerCategory}
                  onChange={this.onChangeEmerCategory.bind(this, 'emerCategory')}
                  style={{width: 300, display: 'inline-block'}}
                >
                  {
                    dangerData && dangerData.map((v, i) => <Select.Option key={v.gid} value={v.name}>{v.name}</Select.Option>)
                  }
                </Select>
              </div>
              <div className={styles.emerEventAddItem}>
                <span className={styles.emerEventAddLabel}>事件类型：</span>
                <Select
                  value={this.state.emerClassify}
                  style={{width: 300, display: 'inline-block'}}
                  onChange={this.onChangeField.bind(this, 'emerClassify')}
                >
                  {
                    this.state.emerEventTypeData.map((item, index) => <Select.Option key={index} value={item.gid + ''}>{item.name}</Select.Option>)
                  }
                </Select>
              </div>
              <div className={styles.emerEventAddItem}>
                <span className={styles.emerEventAddLabel}>事件名称：</span>
                <Input value={this.state.emerEvent_name} onChange={this.setEmerEventName} style={{width: 300}}/>
              </div>
              <div className={styles.emerEventAddItem}>
                <span className={styles.emerEventAddLabel}>事发单位：</span>
                <Input type="text" value={this.state.emerEvent_incidentUnit} disabled style={{width: 300}}/>
              </div>
              <div className={styles.emerEventAddItem}>
                <span className={styles.emerEventAddLabel}>事发时间：</span>
                <DatePicker
                  style={{width: 300}}
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="请选择时间"
                  onChange={this.setEmerEventIncidentTime}
                  value={this.state.emerEvent_incidentTime}
                />
              </div>
              <div className={styles.emerEventAddItem}>
                <span className={styles.emerEventAddLabel}>事发地点：</span>
                <span className="ant-input-search ant-input-search-enter-button ant-input-affix-wrapper" style={{width: 300}}>
                  <AutoComplete
                    className="global-search"
                    value={this.state.emerEvent_incidentAddr}
                    dataSource={this.state.dataSource}
                    style={{width: 255}}
                    onChange={this.searchByLocation}
                    onSelect={this.onSelect}
                    onBlur={this.searchByLocationBlur}
                    placeholder="请输入地址"
                  />
                  <span className="ant-input-suffix">
                    <button onClick={this.pickPoint} type="button" className="ant-btn ant-input-search-button ant-btn-default">
                      <i className="anticon anticon-environment" />
                    </button>
                  </span>
                </span>
              </div>
              <div className={styles.emerEventAddItem}>
                <span className={styles.emerEventAddLabel}>上报人：</span>
                <Select
                  mode={"combobox"}
                  style={{ width: 300 }}
                  placeholder="上报人"
                  optionFilterProp="children"
                  onChange={this.setEmerEventReporter}
                >
                  {
                    this.props.users.map((v, i) => <Option key={v.userid} value={v.truename} tel={v.phone} userid={v.userid}>{v.truename}</Option>)
                  }
                </Select>
              </div>
              <div className={styles.emerEventAddItem}>
                <span className={styles.emerEventAddLabel}>上报人电话：</span>
                <Input value={this.state.emerEvent_reporterTel} onChange={this.setEmerEventReporterTel} style={{width: 300}}/>
              </div>
              <div className={styles.emerEventAddItem}>
                <span className={styles.emerEventAddLabel}>接警人：</span>
                <Input type="text" value={this.state.emerEvent_alarmReceiver} disabled style={{width: 300}}/>
              </div>
              <div className={styles.emerEventAddItem}>
                <span className={styles.emerEventAddLabel}>接警时间：</span>
                <DatePicker
                  style={{width: 300}}
                  format="YYYY-MM-DD HH:mm:ss"
                  allowClear={false}
                  disabled
                  value={moment(this.state.emerEvent_receiveTime, 'YYYY-MM-DD HH:mm:ss')}
                />
              </div>
              {
                this.props.ecodePattern.emerEventAdd.isHasController ? <div className={styles.emerEventAddItem}>
                  <span className={styles.emerEventAddLabel}>控制人员：</span>
                  <Search
                    value={this.state.emerEvent_sceneController}
                    style={{width: 300}}
                    placeholder="现场控制人员"
                    onSearch={(value) => this.openOrCloseDialog('isShowUserList', true)}
                    enterButton="选择"
                  />
              </div> : ''
              }
              <div className={styles.emerEventAddItem}>
                <span className={styles.emerEventAddLabel}>是否演练：</span>
                <Select
                  onChange={this.setEmerEventIsDrill}
                  value={this.state.emerEvent_isDrill}
                  style={{
                    width: 100,
                    display: 'inline-block',
                  }}
                >
                  <Option value="0">否</Option>
                  <Option value="1">是</Option>
                </Select>
              </div>
              {
                this.state.emerEvent_isDrill === '0' ? null :
                  <div className={styles.emerEventAddItem}>
                    <span className={styles.emerEventAddLabel}>演练方案：</span>
                    <Select
                      onChange={this.setEmerDrillProject}
                      style={{
                        width: 300,
                        display: 'inline-block',
                      }}
                      value={this.state.emerEvent_DrillProject}
                    >
                      {
                        this.state.emerDrillCaseData.map((item, index) => {
                          return (<Option key={item.gid} value={item.name}>{item.name}</Option>);
                        })
                      }
                    </Select>
                  </div>
              }
              <div className={styles.emerEventAddBtn}>
                <Button id="saveBtn" type="primary" size="small" onClick={this.handleAddEmerEvent}>保存</Button>&nbsp;&nbsp;&nbsp;
              </div>
            </form>
          </div>
        </Dialog>
        {
          this.state.isShowUserList ? <EmerUserList
            setEmerEventSceneController={this.setEmerEventSceneController}
            getBaiduWay={this.props.getBaiduWay}
            geom={this.state.emerEvent_incidentXY}
            onCancel={() => this.openOrCloseDialog('isShowUserList', false)}
          /> : ''
        }
      </div>
    );
  }
}

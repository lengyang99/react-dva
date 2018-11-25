import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Select, Tree, Checkbox, message, Modal, Button, Input, Tooltip, Icon, TreeSelect } from 'antd';
import EditAreaDilog from './EditAreaDialog.js';
import Dialog from '../../components/yd-gis/Dialog/Dialog';
import ContactModal from '../../components/ContactModal//ContactModal';
import EcityMap from '../../components/Map/EcityMap';
import styles from './RegionalManage.less';

const TreeNode = Tree.TreeNode;
const SHOW_CHILD = TreeSelect.SHOW_CHILD;
const Option = Select.Option;
const confirm = Modal.confirm;
const inspect_bustype = 1; // 默认业务类型：巡视

const showMapColor = [{ polygon: [247, 198, 198, 0.6], polyline: [238, 140, 141, 0.8] },
{ polygon: [255, 252, 186, 0.6], polyline: [255, 249, 117, 0.8] },
{ polygon: [198, 229, 204, 0.6], polyline: [140, 202, 153, 0.8] },
{ polygon: [252, 230, 209, 0.6], polyline: [248, 205, 162, 0.8] },
{ polygon: [249, 210, 226, 0.6], polyline: [242, 165, 197, 0.8] }];

const AddBustypeDialog = ({ onSure, onCancel, onSetNewBustype }) => {
  return (<Dialog
    title={'新增区域分组'}
    width={260}
    position={{ top: 95, left: 565 }}
    onClose={onCancel}
  >
    <div style={{ marginTop: 8, marginLeft: 14, marginBottom: 8 }}>
      <span>区域分组:</span>
      <Input type={'text'} style={{ width: 160, marginLeft: 8 }} onBlur={onSetNewBustype} />
    </div>
    <div style={{ marginLeft: 138 }}>
      <Button size={'small'} onClick={onCancel}>取消</Button>
      <Button size={'small'} onClick={onSure} style={{ marginLeft: 8 }}>确定</Button>
    </div>
  </Dialog>);
}

@connect(state => ({
  bustypeList: state.regionalManage.bustypeList,
  stationList: state.regionalManage.stationList,
  areaStationList: state.regionalManage.areaStationList,
  stationListNoInspect: state.regionalManage.stationListNoInspect,
  areaTree: state.regionalManage.areaTree,
  areaTreeNoInspect: state.regionalManage.areaTreeNoInspect,
  stationData: state.regionalManage.stationData,
  personTree: state.regionalManage.personTree,
  user: state.login.user,
}))

export default class RegionalManage extends Component {
  constructor(props) {
    super(props);
    this.managePageType = 0; // 记录当前巡检区域管理是新增（1），还是编辑（0）
    this.deleteAreaId = '';
    this.showExecuteArea = true; // 记录当前地图是否显示执行区域
    this.showExecuteTopArea = false; // 是否显示一级区域
    this.showKeypoints = false; // 是否显示关键点
    this.areaDataList = [];
    this.selectArea = [];
    this.selectedAreaParentid = '';

    this.state = {
      showExecuteArea: true, // 记录当前地图是否显示执行区域
      edititem: {},
      personTree: [],
      showEditRegional: false,
      editstation: {

      },
      showBustypeAdd: false,
      currentBustype: inspect_bustype, // 默认的业务类型是巡视
      stationDefaultValue: '', // 记录当前选择的站点，默认的站点是‘全部’
      newBustype: '',
      showCopy: false, //区域复制
      areaData: [], // 区域数据
      areaid: '', //区域id
      copyArea: '',
      copyAreaGroup: '',
      copyName: '',
      copyUserid: '',
      copyUsername: [],
      copyDefaultOrgUserid: '',
      preUserid: false, //记录有没有切换用户
      showContactModal: false,
      isParentRegional: false,
      copyAreas:[],
    };

    this.map = null; // 类ArcGISMap的实例
  }

  componentWillMount() {
    this.props.dispatch({
      type: 'regionalManage/getBustypeInfo',
    });

    this.props.dispatch({
      type: 'regionalManage/getStationInfo',
    });
    this.props.dispatch({
      type: 'regionalManage/getAreaStationInfo',
    });

    this.props.dispatch({
      type: 'regionalManage/getAreaByStationid',
      stationid: '',
      code: this.state.currentBustype, // 默认查询巡检业务下所有的区域
      callback: this.dealAreaInfo,
    });
    //查询站点
    this.props.dispatch({
      type: 'regionalManage/queryStation',
      payload: { stationType: 'A' }
    });
    this.setState({ preUserid: true })
  }

  componentDidMount() {

  }

  componentWillUnmount() {
    this.changeStationClearLayer();
    this.onCloseEditDialoddClearLayer();
  }

  // 站点改变时清除下列图层
  changeStationClearLayer = () => {
    if (!this.map) {
      return;
    }
    const mapDisplay = this.map.getMapDisplay();
    if (mapDisplay) {
      mapDisplay.removeLayer('show_all_station_polygon');
      mapDisplay.removeLayer('show_station_polygon');
      mapDisplay.removeLayer('add_regional_layer_polyline');
      mapDisplay.removeLayer('add_regional_layer_point');
      mapDisplay.removeLayer('show_all_station_polygon_child');
      mapDisplay.removeLayer('regional_layer_areaname_user');
    }
  }

  // 关闭编辑按钮清除相应的图层
  onCloseEditDialoddClearLayer = () => {
    if (!this.map) {
      return;
    }
    const mapDisplay = this.map.getMapDisplay();
    if (mapDisplay) {
      mapDisplay.removeLayer('show_all_station_polygon_edit');
      mapDisplay.removeLayer('show_station_polygon');
      mapDisplay.removeLayer('add_regional_layer_polyline_edit');
      mapDisplay.removeLayer('add_regional_layer_point_edit');
    }
  }

  onMapCreated = (arcGISMap) => {
    this.map = arcGISMap;
  }

  /*
   * 获取区域之后将返回结果格式化成数组
   * list --- 服务返回的数据
   * treeData --- 转换后的数组
   */
  dealAreaInfo = (list, treeData) => {
    this.areaDataList = list;
    this.dealAreaData(list, treeData);
    this.onCheckStation('showArea');
  }

  // 站点信息返回结果处理
  dealAreaData = (areaTree, data) => {
    areaTree.forEach((item) => {
      const tmp = {
        name: item.name,
        value: `${item.gid}`,
        key: item.gid,
        attr: { stationid: item.stationid, station: item.station, ecode: item.ecode, username: item.usernames },
        type: item.parentid ? 2 : 1,
        orgcode: item.orgCode,
        orgUserid: item.userid,
        areaPolygon: item.areaPolygon,
        parentid: item.parentid,
      };
      data.push(tmp);
      if (item.children && item.children.length > 0) {
        tmp.children = [];
        this.dealAreaData(item.children, tmp.children);
      }
    });
  }

  /*
   * 选中不同区域的点击事件
   * type  当前选择的类型
   * value 当前选中的站点信息
   */
  onCheckStation = (type, value) => {
    if (type === 'showArea') {
      value = this.selectArea;
    }

    this.changeStationClearLayer();
    this.setState({
      copyAreas:value,
    })
    // console.log('type', type);
    // console.log('value', value);
    // 获取选择区域
    this.selectArea = value;
    if (value.length === 0) {
      return;
    }

    // 根据显示的value匹配所选的区域
    let selectinfo = [];
    let stationList = this.areaDataList;
    this.getAreainfobyChecked(stationList, value, selectinfo);
    let areaIsCenterAt = false;
    for (let i = 0; i < selectinfo.length; i++) {
      if (this.showExecuteArea) {
        if (selectinfo[i].areaPolygon) {
          // 定位到一级区域或执行区域
          if (!areaIsCenterAt) {
            let xy = (typeof selectinfo[i].areaPolygon) === 'string' ? JSON.parse(selectinfo[i].areaPolygon) : selectinfo[i].areaPolygon;
            if (xy && xy[0]) {
              this.map.centerAt({ x: xy[0].x, y: xy[0].y });
              areaIsCenterAt = true;
            }
          }
          if (selectinfo[i].parentid === 0) {
            if (this.showExecuteTopArea) {
              this.showAreaMap(selectinfo[i].areaPolygon, true, 'show_all_station_polygon', selectinfo[i].gid, selectinfo[i], 1);
              if (this.showKeypoints) {
                this.showPathMap(selectinfo[i].pathPolygon, selectinfo[i].gid, 20);
                this.showPointMap(selectinfo[i].keypoints, selectinfo[i].gid, 20);
              }
            }
          } else {
            this.showAreaMap(selectinfo[i].areaPolygon, false, 'show_all_station_polygon_child', selectinfo[i].gid, selectinfo[i], 2);
            if (this.showKeypoints) {
              this.showPathMap(selectinfo[i].pathPolygon, selectinfo[i].gid, 20);
              this.showPointMap(selectinfo[i].keypoints, selectinfo[i].gid, 20);
            }
          }
        }
      } else {
        if (selectinfo[i].parentid === 0 && selectinfo[i].areaPolygon && this.showExecuteTopArea) {
          this.showAreaMap(selectinfo[i].areaPolygon, true, 'show_all_station_polygon', selectinfo[i].gid, selectinfo[i], 1);
        }
      }
    }
  }

  // 通过所选的节点筛选具体的区域信息
  getAreainfobyChecked = (stationList, value, selectinfo) => {
    for (let i = 0; i < stationList.length; i++) {
      for (let j = 0; j < value.length; j++) {
        if (value[j] === (stationList[i].gid + '')) {
          selectinfo.push({
            gid: stationList[i].gid,
            areaPolygon: stationList[i].areaPolygon,
            keypoints: stationList[i].keypoints,
            name: stationList[i].name,
            parentid: stationList[i].parentid,
            pathPolygon: stationList[i].pathPolygon,
            remark: stationList[i].remark,
            station: stationList[i].station,
            stationid: stationList[i].stationid,
            userid: stationList[i].userid,
            usernames: stationList[i].usernames,
          });
          break;
        }
      }
      if (stationList[i].children && stationList[i].children.length) {
        this.getAreainfobyChecked(stationList[i].children, value, selectinfo);
      }
    }
  }

  /*
   * 地图区域信息显示的显示
   * areainfo --- 通过服务查询返回的区域信息（坐标信息）
   * flag --- 不同区域之前是否显示不同的颜色
   *layername --- 区域图层名称
   * layerid --- Graphic的id的末尾标识
   * selectinfo --- 选中的区域信息（名称、责任人等）
   * layerIndex --- 图层显示的顺序
   */
  showAreaMap = (areainfo, flag, layername, layerid, selectinfo, layerIndex) => {
    if (!this.map) {
      return;
    }

    if (typeof areainfo === 'string') {
      areainfo = JSON.parse(areainfo);
    }
    if (areainfo === '' || areainfo === null) {
      return;
    }

    let paramPloy = {
      id: 'show_all_station_polygon_area_' + layerid,
      layerId: layername,
      layerIndex: layerIndex,
      dots: areainfo,
    };

    if (!flag) {
      let index = layerid % 5;
      paramPloy.fillcolor = showMapColor[index].polygon;
      paramPloy.linecolor = showMapColor[index].polyline;
    } else {
      paramPloy.linecolor = [100, 100, 100];
      paramPloy.fillcolor = [236, 236, 236, 0.4];
    }

    const mapDisplay = this.map.getMapDisplay();
    const graphic = mapDisplay.polygon(paramPloy);
    const extent = graphic.geometry.getExtent();
    if (!extent) {
      return;
    }
    const paramsarea = {
      x: (extent.xmax + extent.xmin) / 2,
      y: (extent.ymax + extent.ymin) / 2,
      id: `regional_layer_areaname${layerid}`,
      layerId: 'regional_layer_areaname_user',
      layerIndex: 1000,
      offsetX: 0,
      offsetY: 10,
      text: {
        text: `区域:${selectinfo.name}`,
        font: '14px',
      },
    };
    mapDisplay.text(paramsarea);

    let paramsuser = {
      x: (extent.xmax + extent.xmin) / 2,
      y: (extent.ymax + extent.ymin) / 2,
      id: `regional_layer_username${layerid}`,
      layerId: 'regional_layer_areaname_user',
      layerIndex: 1000,
      offsetX: 0,
      offsetY: -10,
      text: {
        text: `责任人:${selectinfo.usernames}`,
        font: '14px',
      },
    };
    mapDisplay.text(paramsuser);
  }

  /*
   * 地图区域中线路的显示
   * pathinfo --- 通过服务查询返回的线路信息（坐标信息）
   * gid --- 当前查询的区域gid
   * layerIndex --- 图层显示的顺序
   */
  showPathMap = (pathinfo, gid, layerIndex) => {
    if (!this.map) {
      return;
    }

    if (pathinfo === '' || pathinfo === null) {
      return;
    }

    if (typeof pathinfo === 'string') {
      pathinfo = JSON.parse(pathinfo);
    }

    for (let i = 0; i < pathinfo.length; i++) {
      let paramPloy = {
        id: 'regional_layer_ployline_edit_' + gid + '_' + i,
        layerId: 'add_regional_layer_polyline',
        layerIndex: layerIndex,
        dots: pathinfo[i],
      };
      this.map.getMapDisplay().polyline(paramPloy);
    }
  }

  /*
   * 地图区域中关键点的显示
   * pointinfo --- 通过服务查询返回的关键点信息（坐标信息）
   * gid --- 当前查询的区域gid
   * layerIndex --- 图层显示的顺序
   */
  showPointMap = (pointinfo, gid, layerIndex) => {
    if (!this.map) {
      return;
    }

    if (pointinfo === '' || pointinfo === null) {
      return;
    }
    if (typeof pointinfo === 'string') {
      pointinfo = JSON.parse(pointinfo);
    }

    for (let i = 0; i < pointinfo.length; i++) {
      let geometry = JSON.parse(pointinfo[i].geometry);
      let addParams = {
        id: 'add_regional_layer_edit' + gid + '_' + i,    // 使用gid便于之后进行地图点的删除
        layerId: 'add_regional_layer_point',
        layerIndex: layerIndex,
        markersize: 8,
        linewidth: 2,
        linecolor: [226, 130, 34],
        fillcolor: [255, 255, 255, 0.4],
        x: geometry.x,
        y: geometry.y,
      };
      const mapDisplay = this.map.getMapDisplay();
      mapDisplay.point(addParams);
    }
  }

  onCloseEditRegional = (val) => {
    // console.log(val, 'vallllll')
    if (!this.map) {
      return;
    }
    this.onCloseEditDialoddClearLayer();
    this.map.resetToDefaultMapTool();
    if (val !== 'back') {
      this.props.dispatch({
        type: 'regionalManage/getAreaByStationid',
        stationid: this.state.areaid,
        code: this.state.currentBustype,
        callback: this.dealAreaInfo,
      });
    }

    this.setState({
      showEditRegional: false
    });
  }

  onAddRegional = (item, e) => {
    // console.log(item);
    // console.log(e);
    let that = this;

    this.managePageType = 1;
    let value = item.key;
    let stationid = item.attr.stationid;
    let station = item.attr.station;
    let ecode = item.attr.ecode;
    let bustype = this.state.currentBustype;
    let defaultBustype = inspect_bustype;
    let areaManagerList = [];

    // 当编辑弹框存在时先关闭再打开
    if (this.state.showEditRegional) {
      this.setState({
        showEditRegional: false,
      }, () => {
        this.setState({
          edititem: {},
          showEditRegional: true,
          editstation: {
            stationid: stationid,
            station: station,
            ecode: ecode,
            bustype: bustype,
            defaultBustype: defaultBustype,
          },
          areaParentid: `${value}`,
        });
      });
    } else {
      this.setState({
        edititem: {},
        showEditRegional: true,
        editstation: {
          stationid: stationid,
          station: station,
          ecode: ecode,
          bustype: bustype,
          defaultBustype: defaultBustype,
        },
        areaParentid: `${value}`,
      });
    }
  }

  onEditRegional = (item, e) => {
    this.managePageType = 0;
    let bustype = this.state.currentBustype;
    let defaultBustype = inspect_bustype;
    //负责人去重
    let userArr = item.orgUserid.split(',');
    const stationid = item.attr && item.attr.stationid ? item.attr.stationid : '';
    userArr.map((item, index) => {
      if (item) {
        userArr[index] = item + '_' + stationid;
      } else {
        userArr[index] = '';
      }
    })
    // 编辑界面存在时先关闭
    if (this.state.showEditRegional) {
      this.setState({
        showEditRegional: false,
      }, () => {
        this.setState({
          edititem: item,
          showEditRegional: true,
          editstation: {
            stationid: item.attr.stationid,
            station: item.attr.station,
            ecode: item.attr.stationecode,
            bustype: bustype,
            defaultBustype: defaultBustype,
            orgcode: item.orgcode,
            orgname: item.name,
            orgUserid: item.orgUserid,
            sUserid: userArr.toString(),
          },
        });
      });
    } else {
      this.setState({
        edititem: item,
        showEditRegional: true,
        editstation: {
          stationid: item.attr.stationid,
          station: item.attr.station,
          ecode: item.attr.stationecode,
          bustype: bustype,
          defaultBustype: defaultBustype,
          orgcode: item.orgcode,
          orgname: item.name,
          orgUserid: item.orgUserid,
          sUserid: userArr.toString(),
        },
      });
    }
  }

  onDelRegional = (item) => {
    if (item.children && item.children.length > 0) {
      message.info('该节点下还有下级区域，无法删除！');
      return;
    }
    this.deleteAreaId = item.value;
    this.selectedAreaParentid = item.parentid;
    this.showConfirm();
  }

  showConfirm = () => {
    let that = this;
    confirm({
      title: '提示',
      content: '是否删除当前区域',
      onOk() {
        that.handleConfirmOkClick();
      },
      onCancel() {

      },
    });
  };

  onCopyRegional = (val) => {
    // console.log('val', val);
    this.currentId = val.value;
    const userArr = [];
    (val.orgUserid.split(",")).map(item => {
      userArr.push(`${item}_${val.attr.stationid}`)
    })

    // console.log(val, userArr, 'copy')
    // 获取责任人信息
    this.props.dispatch({
      type: 'regionalManage/getAllUserInfo',
      stationCode: val.attr.stationid,
      dealStationPerson: this.dealStationPerson,
      showUser: () => {
        this.setState({ copyDefaultOrgUserid: userArr, })
      }
    });
    //查询区域
    this.props.dispatch({
      type: 'regionalManage/getStationByBustype',
      code: this.state.currentBustype,
    });
    try {
      this.setState({
        showCopy: true,
        copyName: val.name,
        copyArea: val.parentid,
        copyAreaGroup: this.state.currentBustype,
        copyUserid: val.orgUserid,
        copyUsername: val.attr.username.split(','),
        isParentRegional: val.parentid === 0 ? true : false,
      })
    } catch (e) {
      console.log(e);
    }

    // this.setState({preUserid: false})

  }

  //两个数组选出相同部分
  findSameData=(arr1,arr2)=>{
    const sameData=[];
    for(let i=0;i<arr1.length;i++){
      for(let j=0;j<arr2.length;j++){
        if(arr1[i]===arr2[j]){
          sameData.push(arr1[i]);
        }
      }
    }
    return sameData;
  }

  onCopyParentRegional=(val)=>{
    if(this.state.showCopy){
      this.onAddBustype(false, 'copy');
    }
    // console.log('val', val);
    const areas=[];
    if(val.children && val.children.length !== 0 ){
      const {copyAreas}=this.state;
      for(let i=0;i<val.children.length;i++){
        areas.push(val.children[i].value);
      }
      const sameData=this.findSameData(copyAreas,areas);
      this.setState({
        copyAreas:sameData,
      })
    }else{
      this.setState({
        copyAreas:areas,
      })
    }
    this.currentId = val.value;
    const userArr = [];
    (val.orgUserid.split(",")).map(item => {
      userArr.push(`${item}_${val.attr.stationid}`)
    })

    // 获取责任人信息
    this.props.dispatch({
      type: 'regionalManage/getAllUserInfo',
      stationCode: val.attr.stationid,
      dealStationPerson: this.dealStationPerson,
      showUser: () => {
        this.setState({ copyDefaultOrgUserid: userArr, })
      }
    });
    //查询区域
    this.props.dispatch({
      type: 'regionalManage/getStationByBustype',
      code: this.state.currentBustype,
    });

    try {
      this.setState({
        showCopy: true,
        copyName: val.name,
        copyArea: val.parentid,
        copyAreaGroup: this.state.currentBustype,
        copyUserid: val.orgUserid,
        copyUsername: val.attr.username.split(','),
        isParentRegional: val.parentid === 0 ? true : false,
      })
    } catch (e) {
      console.log(e);
    }
  }

  dealStationPerson = (personTree) => {
    let data = [];
    for (let i = 0; i < personTree.length; i++) {
      data.push({
        label: personTree[i].name,
        value: `d${personTree[i].gid}`,
        key: `d${personTree[i].gid}`,
      });
      if (personTree[i].users && personTree[i].users.length > 0) {
        data[i].children = [];
        for (let j = 0; j < personTree[i].users.length; j++) {
          data[i].children.push({
            label: personTree[i].users[j].truename,
            value: personTree[i].users[j].filter,
            userid: personTree[i].users[j].userid,
            key: personTree[i].users[j].userid,
            geoupid: personTree[i].users[j].groupid
          });
        }
      }
    }
    return data;
  }

  handleConfirmOkClick = () => {
    const gid = this.deleteAreaId;
    const parentid = this.selectedAreaParentid;
    const code = this.state.currentBustype;
    let isInspect = this.state.currentBustype === inspect_bustype;
    if (parentid === 0) {
      this.props.dispatch({
        type: 'regionalManage/deleteAreaForBusType',
        params: {
          gid: gid,
          code: code,
        },
        callback: () => {
          this.props.dispatch({
            type: 'regionalManage/getStationInfo',
          });
          this.props.dispatch({
            type: 'regionalManage/getAreaByStationid',
            stationid: this.state.areaid,
            code: code,
            callback: this.dealAreaInfo,
          });
        },
      });
    } else {
      this.props.dispatch({
        type: 'regionalManage/deleteArea',
        areaid: gid,
        callback: () => {
          this.props.dispatch({
            type: 'regionalManage/getAreaByStationid',
            stationid: this.state.areaid,
            code: code,
            callback: this.dealAreaInfo,
          });
        },
      });
    }
  }

  onChangeStation = (value) => {
    const { stationData } = this.props;
    let areaData = stationData.length > 0 && stationData.filter(item => item.gid === value);
    let stationidArr = [];
    areaData.length > 0 && areaData[0].children.map(item => {
      stationidArr.push(item.stationCode)
    })
    // console.log(stationidArr, 'stationid')
    this.setState({
      stationDefaultValue: value,
      areaData: areaData && areaData.length > 0 ? areaData[0].children : [],
      areaid: ''
    });

    this.props.dispatch({
      type: 'regionalManage/getAreaByStationid',
      stationid: stationidArr.join(','),
      code: this.state.currentBustype,
      callback: this.dealAreaInfo,
    });

  }
  //区域选择
  onChangeArea = (value, node) => {
    // const {dataRef} = node.props;
    // console.log(dataRef, 'dataRef')
    this.setState({
      areaid: value,
    })

    this.props.dispatch({
      type: 'regionalManage/getAreaByStationid',
      stationid: value,
      code: this.state.currentBustype,
      callback: this.dealAreaInfo,
    });
  }

  // 是否显示执行区域
  onChangeShowExecuteArea = (e) => {
    this.showExecuteArea = e.target.checked;
    this.setState({
      showExecuteArea: e.target.checked
    });
    this.onCheckStation('showArea');
  }

  // 是否显示一级区域
  onChangeShowTopArea = (e) => {
    this.showExecuteTopArea = e.target.checked;
    this.onCheckStation('showArea');
  }

  // 是否显示关键点
  onChangeShowKeypoints = (e) => {
    this.showKeypoints = e.target.checked;
    this.onCheckStation('showArea');
  }

  onCloseDialog = () => {
    this.props.history.goBack();
  }

  loop = (data) => {
    return data.map((item) => {
      const nameLen = item.name ? item.name.length : 0;
      const usernameLen = item.attr.username ? item.attr.username.length : 0;
      const nameStyle = nameLen + usernameLen < 8;
      const usernameStr = item.attr.username && item.attr.username.split(',').length > 1 ? `${item.attr.username.split(',')[0]}...` : item.attr.username;
      const username = item.key ? usernameStr : item.attr.username;
      if (item.children) {
        return (
          <TreeNode key={item.key}
            title={
              <span>
                <div className={styles.inline}>
                  <Tooltip title={item.name}>
                    <span style={{ marginLeft: '5px' }}>{item.name.length > 6 ? item.name.slice(0, 5) + '...' : item.name}</span>
                  </Tooltip>
                  <Tooltip title={item.attr.username} >
                    <span  style={{ marginLeft: '10px' }}>{username}</span>
                  </Tooltip>
                </div>
                <div className={styles.position}>
                  <span style={{ marginLeft: '5px' }} onClick={this.onAddRegional.bind(this, item)}><Icon type="plus" style={{ color: '#288EF0' }} /></span>
                  <span style={{ marginLeft: '5px' }} className={item.type === 1 ? styles.show_div_css_style : styles.hide_div_css_style} onClick={this.onCopyParentRegional.bind(this, item)}><Icon type="copy" style={{ color: '#1890FF' }} /></span>
                  <span style={{ marginLeft: '5px' }} className={item.type === 0 ? styles.hide_div_css_style : styles.show_div_css_style} onClick={this.onEditRegional.bind(this, item)}><Icon type="edit" style={{ color: '#FF8004' }} /></span>
                  <span style={{ marginLeft: '5px' }} className={item.type === 0 ? styles.hide_div_css_style : styles.show_div_css_style}  onClick={this.onDelRegional.bind(this, item)}><Icon type="delete" style={{ color: '#FF4A0E' }} /></span>
                </div>
              </span>
            }>
            {this.loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key}
        title={
          <span>
            <div className={styles.inline}>
              <Tooltip title={item.name}>
                <span style={{ marginLeft: '5px' }}>{item.name.length > 6 ? item.name.slice(0, 5) + '...' : item.name}</span>
              </Tooltip>
              <Tooltip title={item.attr.username}>
                <span style={{ marginLeft: '10px' }}>{username}</span>
              </Tooltip>
            </div>

            <div className={styles.position}>
              <span style={{ marginLeft: '5px' }} className={item.type === 2 ? styles.hide_div_css_style : styles.show_div_css_style} onClick={this.onAddRegional.bind(this, item)}><Icon type="plus" style={{ color: '#288EF0' }} /></span>
              <span style={{ marginLeft: '5px' }} className={item.type === 2 || item.type === 1 ? styles.show_div_css_style : styles.hide_div_css_style} onClick={item.type === 1 ?this.onCopyParentRegional.bind(this,item) : this.onCopyRegional.bind(this, item)}><Icon type="copy" style={{ color: '#1890FF' }} /></span>
              <span style={{ marginLeft: '5px' }} onClick={this.onEditRegional.bind(this, item)} ><Icon type="edit" style={{ color: '#FF8004' }} /></span>
              <span style={{ marginLeft: '5px' }} onClick={this.onDelRegional.bind(this, item)} ><Icon type="delete" style={{ color: '#FF4A0E' }} /></span>
            </div>
          </span>
        }>
      </TreeNode>;
    });
  }

  onAddBustype = (open, copy) => {
    if (copy === 'copy') {
      if (open) {
        this.setState({ showCopy: true });
      } else {
        this.setState({
          showCopy: false,
          copyAreaGroup: this.state.currentBustype,
          copyArea: '',
          copyAreas:[],

        });
        this.userid = '';
        this.usernames = '';
      }
    } else {
      if (open) {
        this.setState({ showBustypeAdd: true });
      } else {
        this.setState({ showBustypeAdd: false });
      }
    }
  }

  addBustype = () => {
    if (!this.state.newBustype) {
      message.warn('区域分组名称不能为空！');
      return;
    }
    if (this.state.newBustype.length > 50) {
      message.warn('区域分组名称长度不能超过50！');
      return;
    }
    const tmpBusinessname = this.state.newBustype.replace(/(^\s*)|(\s*$)/g, "");
    this.props.dispatch({
      type: 'regionalManage/insertBustype',
      payload: {
        businessname: tmpBusinessname,
      },
      callback: () => {
        this.setState({ showBustypeAdd: false });
        this.props.dispatch({
          type: 'regionalManage/getBustypeInfo',
        });
        this.onAddBustype(false);
      }
    });
  }

  onChangeBustype = (value) => {
    // console.log('value', value);
    const { areaid, stationDefaultValue } = this.state
    // if(!areaid || !stationDefaultValue){
    //   message.warn('请先选择区域和站点！')
    //   return;
    // }
    this.setState({
      currentBustype: value,
      copyAreaGroup: value,
    });
    this.props.dispatch({
      type: 'regionalManage/getAreaByStationid',
      stationid: this.state.areaid,
      code: value,
      callback: this.dealAreaInfo,
    });
  }

  onSetNewBustype = (e) => {
    this.setState({
      newBustype: e.target.value,
    });
  };
  //跳转设备管理
  toEqManage = () => {
    this.props.dispatch(routerRedux.push('/equipment/location'));
  };
  //复制数据
  onChangeCopy = (val, fileName, node) => {
    if (fileName === 'copyAreaGroup') {
      this.props.dispatch({
        type: 'regionalManage/getStationByBustype',
        code: val,
      });
      this.setState({ copyArea: '' })
    } else if (fileName === 'copyArea') {
      const { dataRef } = node.props;
      // 获取责任人信息
      this.props.dispatch({
        type: 'regionalManage/getAllUserInfo',
        stationCode: dataRef.stationid,
        dealStationPerson: this.dealStationPerson,
      });
      this.setState({
        copyUserid: [],
        copyUsername: [],
        copyDefaultOrgUserid: [],
      })
    }
    this.setState({ [fileName]: val })
  };
  //选择执行人
  onChangePersonTree = (data) => {
    const userid = [];
    const username = [];
    const values = [];
    for (const elem of data.values()) {
      userid.push(elem.userid);
      username.push(elem.name);
      values.push(elem.id);
    }
    // let checknode = e.allCheckedNodes;
    // let userid = [];
    // let username = [];
    // this.getSelectPersonData(checknode, userid, username);

    this.setState({
      copyUserid: userid,
      copyUsername: username,
      copyDefaultOrgUserid: values,
    });
    this.onCloseContactModal();
  };

  getSelectPersonData = (checknode, userid, username, stationids) => {
    for (let i = 0; i < checknode.length; i++) {
      if (checknode[i].node && checknode[i].node.key.indexOf('s') < 0) {
        userid.push(checknode[i].node.key);
        username.push(checknode[i].node.props.title);
      } else if (!checknode[i] && checknode[i].key.indexOf('s') < 0) {
        userid.push(checknode[i].key);
        username.push(checknode[i].props.title);
      }
      if (checknode[i].children && checknode[i].children.length > 0) {
        this.getSelectPersonData(checknode[i].children, userid, username);
      }
    }
  }

  //区域复制
  onCopySure = () => {
    // console.log('复制')
    const { copyArea, copyAreaGroup, copyName } = this.state;
    if (copyArea === '') {
      message.warn('请选择区域！')
    }
    try {
      this.props.dispatch({
        type: 'regionalManage/copeArea',
        payload: {
          regionid: copyArea,
          code: copyAreaGroup.toString(),
          areaname: copyName,
          gid: this.currentId,
          userids: this.state.copyUserid.includes(',') ? this.state.copyUserid.join(',') : this.state.copyUserid,
          usernames: this.state.copyUsername.includes(',') ? this.state.copyUsername.join(',') : this.state.copyUsername,
        },
        callback: (res) => {
          if (res.success) {
            message.success('区域复制成功');
            this.props.dispatch({
              type: 'regionalManage/getAreaByStationid',
              stationid: this.state.areaid,
              code: inspect_bustype,// 默认查询巡检业务下站点里的区域
              callback: this.dealAreaInfo,
            });
            // console.log('this.props.newAreaTree', this.props.areaTree);
            this.setState({
              showCopy: false,
              copyAreaGroup: this.state.currentBustype,
              copyArea: '',
            })
            this.userid = '',
              this.usernames = ''
          }
        }
      });
    } catch (e) {
      console.log(e);
    }
  };

  onCopyParent=()=>{
    // console.log('复制一级区域');
    const {copyAreas, copyName, copyAreaGroup } = this.state;
    // console.log('copyAreas', copyAreas);
    // console.log('copyName', copyName);
    const {stationListNoInspect}=this.props;
    const copyAeraData = stationListNoInspect.filter(item => item.name !== '全部');
    // console.log('copyAreaData',copyAeraData);
    if(copyAeraData&&copyAeraData.length!==0){
      for(let i=0;i<copyAeraData.length;i++){
        if(copyName === copyAeraData[i].name){
          message.warn('此一级区域已存在！');
          return;
        }
      }
    }
    try {

      this.props.dispatch({
        type: 'regionalManage/copyParentArea',
        payload: {
          copyArea: copyAreas.join(','),
          code: copyAreaGroup.toString(),
          gid: Number(this.currentId),
        },
        callback: (res) => {
          if (res.success) {
            message.success('区域复制成功');
            this.props.dispatch({
              type: 'regionalManage/getAreaByStationid',
              stationid: this.state.areaid,
              code: inspect_bustype,// 默认查询巡检业务下站点里的区域
              callback: this.dealAreaInfo,
            });
            this.setState({
              showCopy: false,
              copyAreaGroup: this.state.currentBustype,
            })
          }
        }
      });
    } catch (e) {
      console.log(e);
    }
  }


  changeUser = () => {
    this.setState({ preUserid: false });
  }

  onCloseContactModal = () => {
    this.setState({
      showContactModal: false,
    });
  }
  onShowContactModal = () => {
    this.setState({
      showContactModal: true,
    });
  }
  contactModalData = (data) => {
    const arr = [];
    if (data.length > 0) {
      for (const elem of data[0].children.values()) {
        arr.push({
          name: elem.label,
          id: elem.value,
          key: elem.key,
          userid: elem.userid,
          geoupid: elem.geoupid,
        });
      }
    }
    return arr;
  }

  render() {
    const { stationData, stationListNoInspect } = this.props;
    const { areaData, editstation, preUserid, isParentRegional } = this.state;

    //站点
    let stationEle = [];
    stationData.length > 0 && stationData.map(item => {
      stationEle.push(
        <Option key={item.gid} value={item.gid} dataRef={item}>{item.name}</Option>
      )
    })
    //区域
    let areaEle = [];
    areaData.length > 0 && areaData.map(item => {
      areaEle.push(
        <Option key={item.gid} value={item.stationCode} dataRef={item}>{item.name}</Option>
      )
    })
    // 区域分组
    let bustypeListPot = [];
    for (let i = 0; i < this.props.bustypeList.length; i++) {
      bustypeListPot.push(
        <Option key={this.props.bustypeList[i].gid} value={this.props.bustypeList[i].gid}>
          {this.props.bustypeList[i].businessname}
        </Option>
      );
    }

    //去掉当前区域的的区域分组，用于区域复制
    let AreaGroupList=[];
    for (let i = 0; i < this.props.bustypeList.length; i++) {
      AreaGroupList.push(
        <Option key={this.props.bustypeList[i].gid} value={this.props.bustypeList[i].gid}>
          {this.props.bustypeList[i].businessname}
        </Option>
      );

    }
    // console.log('AreaGroupList', AreaGroupList);

    const copyAeraData = stationListNoInspect.filter(item => item.name !== '全部');

    // console.log('this.props.areaTree', this.props.areaTree);
    return (
      <div style={{ width: '100%', height: 'calc(100vh - 120px)' }}>
        <div style={{ width: '100%', height: 'calc(100vh - 120px)' }}>
          <EcityMap mapId="regionalManage" onMapCreated={this.onMapCreated} />
        </div>
        <Dialog
          title="区域管理"
          width={380}
          position={
            { top: 50 }
          }
          onClose={this.onCloseDialog}
        >
          <div className={styles.regional_manage_body_div}>
            <div style={{ marginLeft: 28 }}>
              <span>站点:</span>
              <Select
                defaultValue={['']}
                value={this.state.stationDefaultValue}
                className={styles.regional_manage_select_bustype}
                onChange={this.onChangeStation}
              >
                <Option key='all_1' value=''>全部</Option>
                {stationEle}
              </Select>
              <Button size={'small'} type={'primary'} shape={'circle'} icon={'plus'} onClick={this.toEqManage} />
            </div>
            <div style={{ marginTop: 10, marginLeft: 28 }}>
              <span>区域:</span>
              <Select
                defaultValue={['']}
                value={this.state.areaid}
                className={styles.regional_manage_select_bustype}
                onChange={this.onChangeArea}
              >
                <Option key='all_2' value=''>全部</Option>
                {areaEle}
              </Select>
              <Button size={'small'} type={'primary'} shape={'circle'} icon={'plus'} onClick={this.toEqManage} />
            </div>
            <div style={{ marginTop: 10 }}>
              <span>区域分组:</span>
              <Select
                value={this.state.currentBustype}
                className={styles.regional_manage_select_bustype}
                onChange={this.onChangeBustype}
              >
                {bustypeListPot}
              </Select>
              <Button size={'small'} type={'primary'} shape={'circle'} icon={'plus'} onClick={() => this.onAddBustype(true)} />
            </div>
            <div>
              <div className={styles.regional_manage_area_tree_div}>
                <Tree
                  checkable
                  defaultExpandedKeys={['0']}
                  defaultCheckedKeys={['']}
                  onCheck={this.onCheckStation.bind(this, '')}
                >
                  {this.loop(this.props.areaTree)}
                </Tree>
              </div>
            </div>
            <div className={styles.regional_manage_show_area_checkbox}>
              <Checkbox onChange={this.onChangeShowTopArea}>区域</Checkbox>
              <Checkbox onChange={this.onChangeShowExecuteArea} checked={this.state.showExecuteArea}>执行区域</Checkbox>
              <Checkbox onChange={this.onChangeShowKeypoints}>关键点</Checkbox>
            </div>
          </div>
        </Dialog>
        {this.state.showEditRegional ?
          <EditAreaDilog
            ref="showEditDialog"
            areaParentid={this.state.areaParentid}
            edititem={this.state.edititem}
            showdialog={this.state.showEditRegional}
            pageType={this.managePageType}
            areaTree={this.props.areaTree}
            areaTreeNoInspect={this.props.areaTreeNoInspect}
            editStation={this.state.editstation}
            stationList={this.props.stationList}
            preUserid={preUserid}
            map={this.map}
            onClose={(val) => this.onCloseEditRegional(val)}
            changeUser={this.changeUser}
          /> : null}
        {this.state.showBustypeAdd ?
          <AddBustypeDialog
            onSure={this.addBustype}
            onCancel={() => this.onAddBustype(false)}
            onSetNewBustype={(e) => this.onSetNewBustype(e)}
          /> : null}
        {this.state.showCopy ?
          <Dialog
            title='复制区域'
            width={350}
            position={{ top: 95, left: 565 }}
            onClose={() => this.onAddBustype(false, 'copy')}
          >
            <div style={{ marginTop: 8, marginLeft: 14, marginBottom: 8 }}>
              <span>区域分组:</span>
              <Select
                value={this.state.copyAreaGroup}
                className={styles.regional_manage_select_bustype}
                onChange={(val) => this.onChangeCopy(val, 'copyAreaGroup')}
              >
                {isParentRegional ? AreaGroupList : bustypeListPot}

              </Select>
            </div>
            <div style={{ marginTop: 8, marginLeft: 41, marginBottom: 8 , display: isParentRegional ? 'none' : 'block'}}>
              <span>区域:</span>
              <Select
                className={styles.regional_manage_select_bustype}
                onChange={(val, node) => this.onChangeCopy(val, 'copyArea', node)}
                value={this.state.copyArea}
              >
                {copyAeraData.map(item =>
                  <Option key={item.id} value={item.id} dataRef={item}>{item.name}</Option>
                )}
              </Select>
            </div>
            <div style={{ marginTop: 8, marginLeft: 14, marginBottom: 8 }}>
              <span>执行区域:</span>
              <Input disabled= {isParentRegional} className={styles.regional_manage_select_bustype} value={this.state.copyName} onChange={(e) => this.onChangeCopy(e.target.value, 'copyName')} />
            </div>
            <div style={{ marginTop: 8, marginLeft: 28, marginBottom: 8 }}>
              <span>执行人:</span>
              {/* <TreeSelect
                showSearch
                className={styles.regional_manage_select_bustype}
                dropdownStyle={{ maxHeight: 200, overflow: 'auto' }}
                treeData={this.props.personTree}
                multiple={true}
                treeCheckable={true}
                value={this.state.copyDefaultOrgUserid}
                searchPlaceholder={this.state.searchPlaceholder}
                showCheckedStrategy={SHOW_CHILD}
                onChange={this.onChangePersonTree}
                filterTreeNode={(inputValue, treeNode) => {
                  if (treeNode.props.title.indexOf(inputValue) >= 0) {
                    return true;
                  } else {
                    return false;
                  }
                }}
              /> */}
              <Input disabled= {isParentRegional}
                className={styles.regional_manage_select_bustype}
                onClick={this.onShowContactModal}
                value={this.state.copyUsername.join(',')}
              />
            </div>
            <div style={{ marginLeft: 138 }}>
              <Button size={'small'} onClick={() => this.onAddBustype(false, 'copy')}>取消</Button>
              <Button size={'small'} onClick={isParentRegional ? () => this.onCopyParent() : () => this.onCopySure()} style={{ marginLeft: 8 }}>确定</Button>
            </div>
          </Dialog> : null}
        <ContactModal
          onCancel={this.onCloseContactModal}
          onOK={this.onChangePersonTree}
          data={this.contactModalData(this.props.personTree)}
          isRadio={false}
          visible={this.state.showContactModal}
          defaultValue={this.state.copyDefaultOrgUserid}
        />
      </div>
    );
  }
}

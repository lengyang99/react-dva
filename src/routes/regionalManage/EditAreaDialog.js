import React, { Component } from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { Select, Tree, Button, Input, Table, TreeSelect, message, Modal } from 'antd';
import Dialog from '../../components/yd-gis/Dialog/Dialog';
import ContactModal from '../../components/ContactModal/ContactModal';
import { DrawPolygonMapTool } from '../../components/Map/common/maptool/DrawPolygonMapTool';
import { EditPolygonMapTool } from '../../components/Map/common/maptool/EditPolygonMapTool';
import { DrawPolylineMapTool } from '../../components/Map/common/maptool/DrawPolylineMapTool';
import { EditPolylineMapTool } from '../../components/Map/common/maptool/EditPolylineMapTool';
import { DrawPointMapTool } from '../../components/Map/common/maptool/DrawPointMapTool';
import { EditPointMapTool } from '../../components/Map/common/maptool/EditPointMapTool';
import styles from './EditAreaDialog.less';
import TraceInfo from '../positionAndTrace/TraceInfo.js';
import SeeMedia from '../../components/SeeMedia/SeeMedia';
import { RSA_NO_PADDING } from 'constants';

const SHOW_CHILD = TreeSelect.SHOW_CHILD;
const Option = Select.Option;
const confirm = Modal.confirm;

const showMapColor = [{ polygon: [247, 198, 198, 0.6], polyline: [238, 140, 141, 0.8] },
{ polygon: [255, 252, 186, 0.6], polyline: [255, 249, 117, 0.8] },
{ polygon: [198, 229, 204, 0.6], polyline: [140, 202, 153, 0.8] },
{ polygon: [252, 230, 209, 0.6], polyline: [248, 205, 162, 0.8] },
{ polygon: [249, 210, 226, 0.6], polyline: [242, 165, 197, 0.8] }];

@connect(state => ({
  personTree: state.regionalManage.personTree,
  user: state.login.user,
  userByGroupId: state.regionalManage.userByGroupId,
}))

export default class EditAreaDialog extends Component {
  constructor(props) {
    super(props);
    this.drawIndex = 0;
    this.editInfo = {
      areaPolygon: [],
      pathPolygon: [],
      keypoints: [],
      stationid: props.editStation.stationid,
      station: props.editStation.station,
      stationecode: props.editStation.ecode,
      bustype: props.editStation.bustype,
      defaultBustype: props.editStation.defaultBustype,
      orgcode: props.editStation.orgcode,
      orgname: props.editStation.orgname,
      orgUserid: props.editStation.orgUserid,
      sUserid: props.editStation.sUserid,
      areaManagerList: props.editStation.areaManagerList,
      stationgid: 0,
    }; // 记录当前巡检区域管理的编辑信息
    this.editTableColumns = [
      {
        title: '序号',
        dataIndex: 'index',
        width: '40px',
        render: (text, record, index) => {
          return (index + 1);
        },
      },
      {
        title: '级别',
        dataIndex: 'type',
        width: '130px',
        render: (text, record, index) => {
          let optData = [{ id: '0', name: '仅到位' }, { id: '1', name: '需反馈' }];
          let opt = optData.map((item) => {
            return <Option key={item.id} value={item.id}>{item.name}</Option>;
          });
          return (
            <Select
              // style={{margin: '-20px 0'}}
              className={styles.edit_area_dialog_table_inupt}
              size="small"
              defaultValue={`${text}`}
              onChange={this.onchangePointData.bind(this, record, 'type', index)}
            >
              {opt}
            </Select>
          );
        },
      },
      {
        title: '横坐标',
        dataIndex: 'x',
        width: '120px',
        render: (text, record, index) => {
          return parseFloat(text).toFixed(5);
        },
      },
      {
        title: '纵坐标',
        dataIndex: 'y',
        width: '120px',
        render: (text, record, index) => {
          return parseFloat(text).toFixed(5);
        },
      },
      {
        title: '备注',
        dataIndex: 'remark',
        width: '100px',
        render: (text, record, index) => {
          return (
            <Input
              type="text"
              size="small"
              defaultValue={text}
              className={styles.edit_area_dialog_table_inupt}
              onChange={this.onChangeRemarkInput.bind(this, record, 'remark', index)}
            />
          );
        },
      },
      {
        title: '删除',
        dataIndex: 'delete',
        width: '50px',
        render: (text, record, index) => {
          return (
            <img
              alt=""
              src="../../images/regionalManage/deleteEle.png"
              style={{ cursor: 'pointer' }}
              onClick={this.showConfirm.bind(this, record)}
            />
          );
        },
      }];
    this.state = {
      showRegionInput: 0, // 0隐藏，1可见，2可见可编辑
      showEditRegional: false,
      showEditPointTable: false,
      editTableData: [],
      editPageData: {}, // 记录服务返回的巡检管理信息（用于编辑页面）
      selectPersonid: '', // 记录当前选择的责任人信息
      areaname: '', // 记录当前编辑区域名称
      showOptionImgIndex: 0,
      searchPlaceholder: '',
      showTraceInfo: false, // 是否显示人员轨迹
      selectedOrg: '', // 记录当前选择的组织机构code
      selectedOrgName: '', // 记录当前选择的组织机构名称
      selectedOrgUserId: '', // 记录当前选择的组织下的责任人编号
      stationManager: '', // 记录所选择的区域负责人
      isExistFirstLevelArea: false, // 记录所选择的站点是否有一级区域
      defaultOrgUserid: [],
      isResponserDisable: false,
      isShowTool: true,  //是否展示工具栏
      showContactModal: false,
      defaultOrgLabel: [], // 默认的laber值
    };
  }

  componentWillMount() {
    this.initRegionalInfo();
  }

  componentDidMount() {
    this.setState({ defaultOrgUserid: this.props.editStation.sUserid ? this.props.editStation.sUserid.split(',') : [] });
  }

  // 初始化区域信息
  initRegionalInfo = () => {
    if (this.props.pageType === 1) {
      if (this.editInfo.station) {
        this.getAllUserInfo(null, () => this.showUser(), this.editInfo.stationid);
      }

      this.editInfo.parentid = this.props.areaParentid;

      let showRegionInput = 0;
      if (this.props.areaParentid !== '0') {
        showRegionInput = 1;
      }

      this.setState({
        showRegionInput: showRegionInput,
      });
    } else {
      this.editInfo.gid = this.props.edititem.value;
      // if(this.props.personTree.length === 0 || this.props.preUserid){
      this.getAllUserInfo(() => {
        this.queryAreaInfo(this.editInfo.gid);
      }, () => this.showUser(), this.editInfo.stationid);
      // }else{
      //   this.queryAreaInfo(this.editInfo.gid);
      // }

      this.setState({
        selectedOrg: this.editInfo.orgcode,
        selectedOrgName: this.editInfo.orgname,
        selectedOrgUserId: this.editInfo.orgUserid,
      });
    }
  }

  // 获取责任人信息
  getAllUserInfo = (callback, showUser, stationid) => {
    this.props.dispatch({
      type: 'regionalManage/getAllUserInfo',
      stationCode: stationid,
      callback: callback,
      showUser: showUser,
      dealStationPerson: this.dealStationPerson
    });
    this.props.changeUser()
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

  showUser = () => {
    const personTree = this.props.personTree;
    const sUserid = this.props.editStation.sUserid;
    const nameArr = [];
    try {
      for (const e of personTree[0].children.values()) {
        for (const elem of sUserid.split(',').values()) {
          if (e.value === elem) {
            nameArr.push(e.label);
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
    this.setState({ defaultOrgLabel: nameArr, defaultOrgUserid: this.props.editStation.sUserid ? this.props.editStation.sUserid.split(',') : [] });
  }

  // 查询区域下面的管理信息（编辑信息）
  queryAreaInfo = (areaid) => {
    let that = this;
    this.props.dispatch({
      type: 'regionalManage/getAreaInfoByGid',
      gid: areaid,
      callback: (res) => {
        that.editInfo = res.data[0];
        that.editInfo.bustype = that.props.editStation.bustype;
        that.editInfo.defaultBustype = that.props.editStation.defaultBustype;
        that.editInfo.orgcode = that.props.editStation.orgcode;
        that.editInfo.orgname = that.props.editStation.orgname;
        that.editInfo.orgUserid = that.props.editStation.orgUserid;

        if (typeof that.editInfo.keypoints === 'string') {
          try {
            this.editInfo.keypoints = JSON.parse(this.editInfo.keypoints);
          } catch (e) {
            this.editInfo.keypoints = [];
          }
        }
        if (typeof that.editInfo.pathPolygon === 'string') {
          try {
            this.editInfo.pathPolygon = JSON.parse(this.editInfo.pathPolygon);
          } catch (e) {
            this.editInfo.pathPolygon = [];
          }
        }
        if (typeof that.editInfo.areaPolygon === 'string') {
          try {
            this.editInfo.areaPolygon = JSON.parse(this.editInfo.areaPolygon);
          } catch (e) {
            this.editInfo.areaPolygon = [];
          }
        }
        that.showEditInfo();

        let showEditPointTable = false;
        let keypointsinfo = [];
        for (let i = 0; i < res.data[0].keypoints.length; i++) {
          let tmp = res.data[0].keypoints[i];
          let geometry = JSON.parse(tmp.geometry);
          tmp.x = Number(geometry.x);
          tmp.y = Number(geometry.y);
          tmp.type = `${tmp.type}`;
          keypointsinfo.push(tmp);
        }

        if (keypointsinfo.length > 0) {
          showEditPointTable = true;
        }

        let showRegionInput = 2;
        if (this.editInfo.parentid === 0) {
          showRegionInput = 0;
        }

        this.defaultParentid = res.data[0].parentid;
        console.log('res', res);
        that.setState({
          editPageData: res.data[0],
          selectPersonid: `${res.data[0].userid}`,
          showEditRegional: true,
          showRegionInput: showRegionInput,
          editTableData: keypointsinfo,
          showEditPointTable: showEditPointTable,
        });
      },
    });
  }

  editAreaMapInfo = () => {
    if (!this.props.map) {
      return;
    }

    let that = this;
    this.setState({
      showOptionImgIndex: 1,
    });

    let mapTool = null;
    if (this.props.pageType === 1) { // 新增
      mapTool = new DrawPolygonMapTool(this.props.map.getMapObj(), this.props.map.getApiUrl(),
        (geom) => {
          let dots = [];
          for (let i = 0; i < geom.rings[0].length; i++) {
            dots.push({ x: geom.rings[0][i][0], y: geom.rings[0][i][1] });
          }
          that.editInfo.areaPolygon = dots;
          // that.drawIndex++;
          let addParams = {
            id: 'show_all_station_polygon_edit', // + that.drawIndex,
            layerId: 'show_all_station_polygon_edit',
            // linecolor: [100, 100, 100],
            // fillcolor: [236, 236, 236, 0.4],
            dots,
          };
          that.props.map.getMapDisplay().polygon(addParams);
        });
    } else if (this.props.pageType === 0) { // 编辑
      mapTool = new EditPolygonMapTool(this.props.map.getMapObj(),
        this.props.map.getApiUrl(),
        'show_all_station_polygon_edit',
        (geom) => {
          // 编辑完成后的回调
          let dots = [];
          for (let i = 0; i < geom.geometry.rings[0].length; i++) {
            dots.push({ x: geom.geometry.rings[0][i][0], y: geom.geometry.rings[0][i][1] });
          }
          that.editInfo.areaPolygon = dots;
        });
    }
    if (mapTool) {
      this.props.map.switchMapTool(mapTool);
    }
  }

  showEditInfo = () => {
    let areainfo = this.editInfo.areaPolygon;
    let pathinfo = this.editInfo.pathPolygon;
    let pointinfo = this.editInfo.keypoints;

    this.showAreaMap(areainfo);
    this.showPathMap(pathinfo);
    this.showPointMap(pointinfo);
  }

  showAreaMap = (areainfo) => {
    if (areainfo === '' || areainfo === null) {
      return;
    }

    if (typeof areainfo === 'string') {
      areainfo = JSON.parse(areainfo);
    }
    let paramPloy = {
      id: 'show_all_station_polygon_edit',
      layerId: 'show_all_station_polygon_edit',
      dots: areainfo,
    };

    if (this.editInfo.parentid !== 0) {
      let index = this.editInfo.gid % 5;
      paramPloy.fillcolor = showMapColor[index].polygon;
      paramPloy.linecolor = showMapColor[index].polyline;
    } else {
      paramPloy.linecolor = [100, 100, 100];
      paramPloy.fillcolor = [236, 236, 236, 0.4];
    }
    paramPloy.layerIndex = 100;

    this.props.map.getMapDisplay().polygon(paramPloy);
  }

  showPathMap = (pathinfo) => {
    if (pathinfo === '' || pathinfo === null) {
      return;
    }
    if (typeof pathinfo === 'string') {
      pathinfo = JSON.parse(pathinfo);
    }

    for (let i = 0; i < pathinfo.length; i++) {
      this.drawIndex++;
      let paramPloy = {
        id: `regional_layer_ployline_edit${this.drawIndex}`,
        layerId: 'add_regional_layer_polyline_edit',
        attr: { id: `regional_layer_ployline_edit${this.drawIndex}` },
        layerIndex: 10,
        dots: pathinfo[i],
      };
      this.props.map.getMapDisplay().polyline(paramPloy);
    }
  }

  showPointMap = (pointinfo) => {
    if (pointinfo === '' || pointinfo === null) {
      return;
    }
    if (typeof pointinfo === 'string') {
      pointinfo = JSON.parse(pointinfo);
    }
    for (let i = 0; i < pointinfo.length; i++) {
      let geometry = JSON.parse(pointinfo[i].geometry);
      let addParams = {
        id: `add_regional_layer_edit${pointinfo[i].gid}`, // 使用gid便于之后进行地图点的删除
        layerId: 'add_regional_layer_point_edit',
        layerIndex: 10,
        markersize: 8,
        linewidth: 2,
        linecolor: [226, 130, 34],
        fillcolor: [255, 255, 255, 0.4],
        attr: { layerid: `add_regional_layer_edit${pointinfo[i].gid}`, gid: pointinfo[i].gid },
        x: Number(geometry.x),
        y: Number(geometry.y),
      };
      this.props.map.getMapDisplay().point(addParams);
    }
  }

  addPloyline = () => {
    if (!this.props.map) {
      return;
    }

    let that = this;
    this.setState({
      showOptionImgIndex: 2,
    });

    let mapTool = null;
    mapTool = new DrawPolylineMapTool(this.props.map.getMapObj(), this.props.map.getApiUrl(), (geom) => {
      let dots = [];
      for (let i = 0; i < geom.paths[0].length; i++) {
        dots.push({ x: geom.paths[0][i][0], y: geom.paths[0][i][1] });
      }
      that.drawIndex++;
      let addParams = {
        id: `add_regional_layer_${that.drawIndex}`,
        layerId: 'add_regional_layer_polyline_edit',
        attr: { id: `add_regional_layer_${that.drawIndex}` },
        layerIndex: 10,
        dots: dots,
      };
      that.editInfo.pathPolygon.push(dots);
      that.props.map.getMapDisplay().polyline(addParams);
    });
    if (mapTool) {
      this.props.map.switchMapTool(mapTool);
    }
  }

  editPolyline = () => {
    if (!this.props.map) {
      return;
    }

    let that = this;
    this.setState({
      showOptionImgIndex: 3,
    });

    let mapTool = null;
    mapTool = new EditPolylineMapTool(this.props.map.getMapObj(),
      this.props.map.getApiUrl(),
      'add_regional_layer_polyline_edit',
      (graphic) => {
        that.editInfo.pathPolygon = [];
        let layerInfo = that.props.map.getMapDisplay().getLayer('add_regional_layer_polyline_edit');
        for (let i = 0; i < layerInfo.graphics.length; i++) {
          let tmpGeom = layerInfo.graphics[i].geometry.paths[0];
          let dots = [];
          for (let j = 0; j < tmpGeom.length; j++) {
            dots.push({ x: tmpGeom[j][0], y: tmpGeom[j][1] });
          }
          that.editInfo.pathPolygon.push(dots);
        }
      },
      (graphic) => {
        that.editInfo.pathPolygon = [];
        that.props.map.getMapDisplay().removeGraphic(graphic.attributes.id, graphic._layer.id);
        let layerInfo = that.props.map.getMapDisplay().getLayer('add_regional_layer_polyline_edit');
        for (let i = 0; i < layerInfo.graphics.length; i++) {
          let tmpGeom = layerInfo.graphics[i].geometry.paths[0];
          let dots = [];
          for (let j = 0; j < tmpGeom.length; j++) {
            dots.push({ x: tmpGeom[j][0], y: tmpGeom[j][1] });
          }
          that.editInfo.pathPolygon.push(dots);
        }
        // 删除图形触发的回调
        // 参数graphic为arcgis的"esri/graphic"，graphic.geometry为图形坐标串，graphic.attributes为存储的属性
        //
        // 由于MapDisplay里面保存有状态，通过MapDisplay添加的图形，要通过MapDisplay的removeGraphic方法去删除图形
        //
        // 在用MapDisplay添加图形时，请指定attr属性，attr为一个对象字面量，attr里面要有个id属性来唯一指定图形所代表的
        // 实际实体，这样在本回调方法里面通过graphic.attributes.id才能知道用户删除的图形代表什么（编辑同理），从而进行
        // 进一步操作。attr里面的id和传给MapDisplay画点线等的id要是同一个值
        // 通过MapDisplay画点线多边形等时的代码示例(注意：两个id的取值要是一样的)：
        // let paramPloy = {
        //   id: 123,
        //   layerId: 'add_regional_layer_polyline_edit',
        //   layerIndex: 10,
        //   dots: pathinfo[i],
        //   attr: {
        //     id: 123,
        //     ... 其他自定义属性
        //   }
        // };
        // this.props.map.getMapDisplay().polyline(paramPloy);

        // 流程示例：
        // const id = graphic.attributes.id;
        // 调用服务端接口，删除或修改数据库中id关联的实际实体
        // 其他清理操作（如果有的话）
        // 以上成功后，再调用下述代码删除图层中的图形
        // this.props.map.getMapDisplay().removeGraphic(id, 'add_regional_layer_polyline_edit');
      });
    if (mapTool) {
      this.props.map.switchMapTool(mapTool);
    }
  }

  addPoint = () => {
    if (!this.props.map) {
      return;
    }

    let that = this;
    that.setState({
      showOptionImgIndex: 4,
    });
    let mapTool = null;
    mapTool = new DrawPointMapTool(this.props.map.getMapObj(), this.props.map.getApiUrl(), (geom) => {
      that.drawIndex++;

      let addPoint = {
        gid: `add_${that.drawIndex}`,
        type: '0',
        remark: '',
        x: geom.x,
        y: geom.y,
        geometry: JSON.stringify({ x: geom.x, y: geom.y }),
        pointtype: 'query',
        //  delete: ''
      };

      let addParams = {
        id: `add_regional_layer_${addPoint.gid}`,
        layerId: 'add_regional_layer_point_edit',
        layerIndex: 10,
        markersize: 8,
        linewidth: 2,
        linecolor: [226, 130, 34],
        fillcolor: [255, 255, 255, 0.4],
        attr: {
          gid: `add_${that.drawIndex}`,
          layerid: `add_regional_layer_${addPoint.gid}`,
        },
        x: geom.x,
        y: geom.y,
      };
      that.props.map.getMapDisplay().point(addParams);
      that.editInfo.keypoints.push(addPoint);

      let tmp = that.state.editTableData.filter((item) => { return item.gid !== addPoint.gid });
      tmp.push(addPoint);

      if (that.state.showEditPointTable === false) {
        that.setState({
          showEditPointTable: true,
          editTableData: tmp,
        });
      } else {
        that.setState({
          editTableData: tmp,
        });
      }
    });
    if (mapTool) {
      this.props.map.switchMapTool(mapTool);
    }
  }

  editPoint = () => {
    if (!this.props.map) {
      return;
    }

    let that = this;
    that.setState({
      showOptionImgIndex: 5,
    });

    let mapTool = null;
    mapTool = new EditPointMapTool(this.props.map.getMapObj(),
      this.props.map.getApiUrl(),
      'add_regional_layer_point_edit',
      (graphic) => {
        let tmpInfo = Object.assign([], that.editInfo.keypoints);
        for (let i = 0; i < tmpInfo.length; i++) {
          if (tmpInfo[i].gid === graphic.attributes.gid) {
            tmpInfo[i].x = graphic.geometry.x;
            tmpInfo[i].y = graphic.geometry.y;
            tmpInfo[i].geometry = JSON.stringify({ x: tmpInfo[i].x, y: tmpInfo[i].y });
          }
        }
        that.editInfo.keypoints = tmpInfo;
        that.setState({
          editTableData: tmpInfo,
        });
      },
      (graphic) => {
        let tmpdata = [];
        let tmpInfo = that.editInfo.keypoints;
        for (let i = 0; i < tmpInfo.length; i++) {
          if (tmpInfo[i].gid !== graphic.attributes.gid) {
            tmpdata.push(tmpInfo[i]);
          } else {
            that.props.map.getMapDisplay().removeGraphic(graphic.attributes.layerid, graphic._layer.id);
          }
        }
        that.editInfo.keypoints = tmpdata;
        that.setState({
          editTableData: tmpdata,
        });
        // 删除图形触发的回调
      });
    if (mapTool) {
      this.props.map.switchMapTool(mapTool);
    }
  }

  onSubmitEditRegional = () => {
    if (this.props.pageType === 0) {
      this.editArea();
    } else if (this.props.pageType === 1) {
      this.addArea();
    }
  }

  addArea = () => {
    let areaname = this.editInfo.name;
    let userid = this.editInfo.userid;
    let username = this.editInfo.usernames;
    let ecode = this.editInfo.stationecode ? this.editInfo.stationecode : this.props.user.ecode;
    let area = this.editInfo.existAreaPolygon ? this.editInfo.existAreaPolygon : (this.editInfo.areaPolygon ? this.editInfo.areaPolygon : []);
    let line = this.editInfo.pathPolygon ? this.editInfo.pathPolygon : [];
    let point = this.editInfo.keypoints ? this.editInfo.keypoints : [];

    if (point.length > 0) {
      for (let i = 0; i < point.length; i++) {
        point[i].geometry = { x: point[i].x, y: point[i].y };
        delete point[i].gid;
      }
    }
    // 添加其他业务类型下的区域
    let orgCode = this.editInfo.orgCode;
    let code = this.editInfo.bustype;

    let params = {
      parentid: this.editInfo.parentid,
      userid: userid,
      usernames: username,
      name: areaname,
      ecode: ecode,
      areaPolygon: area,
      pathPolygon: line,
      stationid: this.editInfo.stationid,
      station: this.editInfo.station,
      keypoints: point,
      orgCode: orgCode,
      code: code,
    };

    let flag = this.validateSubmitData(params);
    if (!flag) {
      return;
    }

    // 插入站点刷新站点列表
    this.props.dispatch({
      type: 'regionalManage/insertArea',
      params: {
        area: params,
      },
      callback: this.onCloseEditRegional,
    });
    this.props.dispatch({
      type: 'regionalManage/getStationInfo',
    });
  }

  editArea = () => {
    let gid = this.editInfo.gid;
    let areaname = this.editInfo.name;
    let userid = this.editInfo.userid;
    let username = this.editInfo.usernames;
    let ecode = this.editInfo.stationecode ? this.editInfo.stationecode : this.props.user.ecode;
    let area = this.editInfo.areaPolygon ? this.editInfo.areaPolygon : [];
    let line = this.editInfo.pathPolygon ? this.editInfo.pathPolygon : [];
    let points = this.editInfo.keypoints ? this.editInfo.keypoints : [];
    let code = this.editInfo.bustype;

    if (typeof area === 'string') {
      area = JSON.parse(area);
    }

    if (typeof line === 'string') {
      line = JSON.parse(line);
    }

    if (typeof points === 'string') {
      let tmpPoints = [];
      points = JSON.parse(points);
    }
    for (let i = 0; i < points.length; i++) {
      delete points[i].gid;
    }

    let params = {
      gid: gid,
      parentid: this.editInfo.parentid,
      userid: userid,
      usernames: username,
      ecode: ecode,
      name: areaname,
      areaPolygon: area,
      pathPolygon: line,
      stationid: this.editInfo.stationid,
      station: this.editInfo.station,
      keypoints: points,
      code: code,
    };

    let flag = this.validateSubmitData(params);
    if (!flag) {
      return;
    }
    this.props.dispatch({
      type: 'regionalManage/updateArea',
      params: {
        area: params,
      },
      callback: this.onCloseEditRegional,
    });
  }

  validateSubmitData = (params) => {
    let areaTree = this.props.areaTree[0].children;
    if (!params.name) {
      message.info('请输入执行区域！');
      return false;
    }

    // if (!params.userid) {
    //   message.info('请关联责任人！');
    //   return false;
    // }

    if (params.areaPolygon.length === 0 && this.state.isShowTool) {
      message.info('请绘制区域！');
      return false;
    }
    return true;
  }

  onChangeAreaName = (e) => {
    this.editInfo.name = e.target.value;
    let editdata = this.state.editPageData;
    editdata.name = e.target.value;
    this.setState({
      editPageData: editdata,
    });
  }

  onSelectAreaName = (value, option) => {
    const { areaTree } = this.props;
    console.log(areaTree);
    console.log(value);
    console.log(option);
    console.log(this.editInfo);
    // 检查该一级区域是否已经创建
    this.props.dispatch({
      type: 'regionalManage/areaIsExist',
      payload: { stationid: option.props['data-stationid'] },
      callback: (res) => {
        if (res.data && res.data.length > 0) {
          const userids = [];
          const orgLabels = [];
          for (let i = 0; i < res.data.length; i++) {
            userids.push(`${res.data[i].userid}_${res.data[i].stationid}`);
            orgLabels.push(res.data[i].usernames);
          }
          this.setState({ isShowTool: false, defaultOrgUserid: userids, defaultOrgLabel: orgLabels });
        } else {
          this.setState({ isShowTool: true });
        }
      }
    });
    this.getAllUserInfo(null, null, option.props["data-stationid"])
    if (this.editInfo.bustype !== this.editInfo.defaultBustype) {
      areaTree[0].children.map((item) => {
        if (item.attr.station === value) {
          this.editInfo.userid = item.orgUserid;
          this.editInfo.usernames = item.attr.username;
          this.editInfo.stationgid = option.key;
          this.setState({
            stationManager: item.attr.username,
            isResponserDisable: true,
          });
          if (item.areaPolygon) {
            // 所选站点已经存在一级区域
            this.editInfo.existAreaPolygon = item.areaPolygon;
            this.setState({
              isExistFirstLevelArea: true,
            });
          }
        } else {
          this.editInfo.userid = '';
          this.editInfo.usernames = '';
          this.editInfo.stationgid = option.key;
          this.setState({
            stationManager: '',
          });
          this.editInfo.existAreaPolygon = '';
          this.setState({
            isExistFirstLevelArea: false,
            isResponserDisable: false,
          });
        }
      });
    }
    this.editInfo.stationid = option.props['data-stationid'];
    this.editInfo.stationecode = option.props['data-stationecode'];
    this.editInfo.station = value;
    this.editInfo.name = option.props.children;
    let editdata = this.state.editPageData;
    editdata.name = option.props.children;
    this.setState({
      editPageData: editdata,
    });
    console.log(this.editInfo);
  }

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
    // this.getSelectPersonData(checknode, userid, username);


    // this.editInfo.userid = userid.join(',');
    // this.editInfo.usernames = username.join(',');

    // this.editInfo.userid = '';
    // this.editInfo.usernames = '';
    // if (!e.clear) {
    //   let selectNode = e.triggerNode;
    //   if (selectNode.props && selectNode.props.children) {
    //     return;
    //   }
    //   if (e.checked) {
    //     this.editInfo.userid = selectNode.props.value;
    //     this.editInfo.usernames = selectNode.props.title;
    //   }
    // }
    // this.setState({
    //   selectPersonid: this.editInfo.userid,
    // });
    this.editInfo.userid = userid.toString();
    this.editInfo.usernames = username.join(',');
    this.setState({
      defaultOrgUserid: values,
      defaultOrgLabel: username,
    });
    this.onCloseContactModal();
  }

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

  onchangePointData = (record, field, index, value, e) => {
    record[field] = value;
    this.editInfo.keypoints[index] = record;
  }

  onChangeRemarkInput = (record, field, index, e) => {
    let value = e.target.value;
    record[field] = value;

    this.editInfo.keypoints[index] = record;
  }

  showConfirm = (record, e) => {
    let that = this;
    confirm({
      title: '提示',
      content: '是否删除当前关键点',
      onOk() {
        that.handleConfirmOkClick(record);
      },
      onCancel() {

      },
    });
  }

  handleConfirmOkClick = (record) => {
    let tmpData = [];
    let keypoints = this.editInfo.keypoints;
    for (let i = 0; i < keypoints.length; i++) {
      if (keypoints[i].gid === record.gid) {
        continue;
      }
      tmpData.push(keypoints[i]);
    }
    this.editInfo.keypoints = tmpData;
    let tmpEditTableData = Object.assign([], tmpData);
    let layername = (record.pointtype === 'query' ? (`add_regional_layer_${record.gid}`) : (`add_regional_layer_edit${record.gid}`));
    this.props.map.getMapDisplay().removeGraphic(layername, 'add_regional_layer_point_edit');
    this.setState({
      editTableData: tmpEditTableData,
    });
  }

  onSelectEditArea = (value, v) => {
    this.editInfo.parentid = value;
    this.editInfo.stationid = v.props['data-stationid'];
    this.editInfo.stationecode = v.props['data-stationecode'];
    this.editInfo.station = v.props.children;
    let tmpdata = this.state.editPageData;
    tmpdata.parentid = value;
    this.setState({
      editPageData: tmpdata,
    });
  }

  onCloseEditRegional = (val) => {
    this.props.onClose(val);
    // this.props.dispatch({
    //   type: 'regionalManage/getAreaStationInfo',
    // });
  }

  onResetValue = () => {
    let editPageData = this.state.editPageData;
    editPageData.parentid = `${this.defaultParentid}`;

    if (this.props.pageType !== 0 || this.state.showRegionInput !== 0) {
      this.editInfo.name = '';
      editPageData.name = '';
    }

    this.editInfo.userid = '';
    this.editInfo.usernames = '';
    this.editInfo.areaPolygon = [];
    this.editInfo.pathPolygon = [];
    this.editInfo.keypoints = [];
    this.props.map.getMapDisplay().removeLayer('show_all_station_polygon_edit');
    this.props.map.getMapDisplay().removeLayer('add_regional_layer_polyline_edit');
    this.props.map.getMapDisplay().removeLayer('add_regional_layer_point_edit');

    this.setState({
      editTableData: [],
      selectPersonid: '', // 记录当前选择的责任人信息
      areaname: '', // 记录当前编辑区域名称
      editPageData: editPageData,
      stationManager: '',
      isExistFirstLevelArea: false,
      isResponserDisable: false,
    });
  }

  onDBClickTable = (data, index, e) => {
    this.props.map.centerAt(data);
    this.props.map.popup({
      x: data.x,
      y: data.y,
      info: {
        title: '关键点信息',
        content: [{ name: '级别', value: (data.type === '0' ? '仅到位' : '需反馈') },
        { name: '横坐标', value: data.x },
        { name: '纵坐标', value: data.y },
        { name: '备注', value: data.remark },
        ],
      },
    });
  }

  // 显示当前责任人轨迹
  onShowPersonTrack = () => {
    if(!this.editInfo.userid){
      message.warn("请先选择责任人再查询轨迹！");
      return
    }
    this.setState({
      showTraceInfo: true,
    });
  }

  // 关闭轨迹弹框
  closeHostryTrace = () => {
    this.setState({
      showTraceInfo: false,
    });
  }

  onChangeOrg = (value, label, e) => {
    if (!value) {
      this.setState({
        selectedOrgName: '',
      });
      return;
    }
    if (!e.clear) {
      let selectNode = e.triggerNode;
      if (selectNode.props && selectNode.props.children) {
        return;
      }
      if (e.selected) {
        this.editInfo.orgCode = selectNode.props.value;
        this.editInfo.orgName = selectNode.props.title;
        this.editInfo.orgId = selectNode.props.eventKey;
        this.editInfo.name = selectNode.props.title;
      }
    }
    this.getUserByGroupId(this.editInfo.orgId);
    this.setState({
      selectedOrg: this.editInfo.orgCode,
      selectedOrgName: this.editInfo.orgName,
    });
  }

  onChangeOrgName = (e) => {
    this.editInfo.name = e.target.value;
    this.setState({ selectedOrgName: this.editInfo.name });
  }

  getUserByGroupId = (groupid) => {
    this.props.dispatch({
      type: 'regionalManage/getUserByGroupId',
      payload: {
        groupid: groupid,
      },
    });
  }

  onChangeOrgManager = (value, option) => {
    this.editInfo.tempUsernames = [];
    option.map((item) => {
      this.editInfo.tempUsernames.push(item.props.children);
    });
    this.editInfo.userid = value.join(',');
    this.editInfo.usernames = this.editInfo.tempUsernames.join(',');
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
    const { isResponserDisable } = this.state;
    const bustypeIsInspect = this.editInfo.bustype === this.editInfo.defaultBustype;
    let areaTreePot = [];
    // let tmpareaTree = bustypeIsInspect ? this.props.areaTree[0].children : this.props.areaTreeNoInspect[0].children;
    let tmpareaTree = this.props.areaTree[0].children;

    for (let i = 0; i < tmpareaTree.length; i++) {
      areaTreePot.push(
        <Option
          key={tmpareaTree[i].value}
          data-stationid={tmpareaTree[i].attr.stationid}
          data-stationecode={tmpareaTree[i].attr.ecode}
          value={tmpareaTree[i].value}
        >
          {tmpareaTree[i].name}
        </Option>
      );
    }

    let defaultparentid = `${this.state.editPageData.parentid}`;
    if (this.props.pageType === 1) {
      defaultparentid = `${this.props.areaParentid}`;
    }

    let stationOptList = this.props.stationList.map((item) => {
      let flag = false;
      // tmpareaTree.map((tmparea)=>{
      //   if (tmparea.name === item.name) {
      //     flag = true;
      //   }
      // });

      if (!flag && item.id !== '') {
        return (
          <Option
            key={item.gid}
            value={item.name}
            data-stationid={item.id}
            data-stationecode={item.ecode}
          >{item.name}</Option>);
      }
    });

    let title = '巡检区域管理';
    if (this.props.pageType === 1) { // 新增
      title = `${title} - 新增`;
    } else if (this.props.pageType === 0) { // 编辑
      title = `${title} - 编辑`;
    }

    let userByGroupIdInfo = [];
    this.props.userByGroupId.map((item) => {
      userByGroupIdInfo.push(<Option key={`${item.userid}`} value={`${item.userid}`}>{item.truename}</Option>);
    });

    let personInfo = [];
    if(this.editInfo.userid){
      const userIdArr = this.editInfo.userid.split(",");
      const userNameArr = this.editInfo.usernames.split(",");
      userIdArr.map((item, index) => {
        personInfo.push({id: item, name: userNameArr[index], online: 1});
      })
    }

    console.log('this.state.stationManager', this.state.stationManager);
    return (
      this.props.showdialog ?
        <div>
          <Dialog
            width={480}
            height={250}
            title={title}
            position={{
              left: 210,
              top: 100,
            }}
            onClose={() => this.onCloseEditRegional('back')}
          >
            <table className={styles.edit_area_dialog_table_layout}>
              <tbody>
                <tr className={this.state.showRegionInput !== 0 ? '' : styles.hide_div_css_style}>
                  <td>所属管理区域:</td>
                  <td className={styles.edit_area_dialog_table_td_layout}>
                    <Select
                      className={styles.edit_area_dialog_table_select_input_layout}
                      onSelect={this.onSelectEditArea}
                      value={defaultparentid}
                      disabled={this.state.showRegionInput !== 2}
                    >
                      {areaTreePot}
                    </Select>
                  </td>
                </tr>
                <tr className={this.state.showRegionInput !== 0 ? '' : styles.hide_div_css_style}>
                  <td>执行区域名称:</td>
                  <td className={styles.edit_area_dialog_table_td_layout}>
                    <Input
                      type="text"
                      className={styles.edit_area_dialog_table_select_input_layout}
                      value={this.state.editPageData.name}
                      onChange={this.onChangeAreaName}
                    />
                  </td>
                </tr>
                <tr className={this.state.showRegionInput === 0 ? '' : styles.hide_div_css_style}>
                  <td>一级区域名称:</td>
                  <td className={styles.edit_area_dialog_table_td_layout}>
                    <Select
                      className={styles.edit_area_dialog_table_select_input_layout}
                      value={this.state.editPageData.name}
                      disabled={this.props.pageType === 0}
                      onSelect={this.onSelectAreaName.bind(this)}
                    >
                      {stationOptList}
                    </Select>
                  </td>
                </tr>
                <tr>
                  <td>所关联责任人:</td>
                  <td className={styles.edit_area_dialog_table_td_layout}>
                    {
                      isResponserDisable && this.state.showRegionInput === 0 && this.props.pageType === 1 ?
                        <Input
                          className={styles.edit_area_dialog_table_select_input_layout}
                          value={this.state.stationManager}
                          disabled="true"
                        /> :
                        (this.props.pageType === 1 ?
                          /* <TreeSelect
                            showSearch
                            className={styles.edit_area_dialog_table_select_input_layout}
                            dropdownStyle={{ maxHeight: 200, overflow: 'auto' }}
                            treeData={this.props.personTree}
                            multiple={true}
                            treeCheckable={true}
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
                          />  */
                          <Input
                            onClick={this.onShowContactModal}
                            value={this.state.defaultOrgLabel.join(',')}
                          />
                          :
                          <Input
                            onClick={this.onShowContactModal}
                            value={this.state.defaultOrgLabel.join(',')}
                          />
                          /* <TreeSelect
                            showSearch
                            className={styles.edit_area_dialog_table_select_input_layout}
                            dropdownStyle={{ maxHeight: 200, overflow: 'auto' }}
                            treeData={this.props.personTree}
                            multiple={true}
                            treeCheckable={true}
                            searchPlaceholder={this.state.searchPlaceholder}
                            showCheckedStrategy={SHOW_CHILD}
                            value={this.state.defaultOrgUserid}
                            onChange={this.onChangePersonTree}
                            filterTreeNode={(inputValue, treeNode) => {
                              if (treeNode.props.title.indexOf(inputValue) >= 0) {
                                return true;
                              } else {
                                return false;
                              }
                            }}
                          /> */
                        )
                    }
                  </td>
                </tr>
              </tbody>
            </table>
            {this.state.isShowTool ?
              <div className={!bustypeIsInspect && this.state.isExistFirstLevelArea ? styles.hide_div_css_style : styles.edit_area_dialog_editmap_div}>
                <img
                  className={`${styles.edit_area_dialog_editmap_img} ${(this.state.showOptionImgIndex === 1 ? styles.show_img : styles.hide_img)}`}
                  src="../../images/regionalManage/addArea.png"
                  alt=""
                  title="操作区域"
                  onClick={this.editAreaMapInfo}
                />
                <img
                  className={`${styles.edit_area_dialog_editmap_img} ${(this.state.showOptionImgIndex === 2 ? styles.show_img : styles.hide_img)}`}
                  src="../../images/regionalManage/addLine.png"
                  alt=""
                  title="添加线路"
                  onClick={this.addPloyline}
                />
                <img
                  className={`${styles.edit_area_dialog_editmap_img} ${(this.state.showOptionImgIndex === 3 ? styles.show_img : styles.hide_img)}`}
                  src="../../images/regionalManage/editLine.png"
                  alt=""
                  title="编辑线路"
                  onClick={this.editPolyline}
                />
                <img
                  className={`${styles.edit_area_dialog_editmap_img} ${(this.state.showOptionImgIndex === 4 ? styles.show_img : styles.hide_img)}`}
                  src="../../images/regionalManage/addPnt.png"
                  alt=""
                  title="添加关键点"
                  onClick={this.addPoint}
                />
                <img
                  className={`${styles.edit_area_dialog_editmap_img} ${(this.state.showOptionImgIndex === 5 ? styles.show_img : styles.hide_img)}`}
                  src="../../images/regionalManage/editPnt.png"
                  alt=""
                  title="编辑关键点"
                  onClick={this.editPoint}
                />
              </div> : null
            }

            <Table
              id="keypoint_table"
              className={this.state.showEditPointTable ? styles.show_div_css_style : `${styles.hide_div_css_style} ${styles.table_data_class_style}`}
              columns={this.editTableColumns}
              dataSource={this.state.editTableData}
              pagination={false}
              scroll={{ y: 250, x: 650 }}
              onChange={this.onChangeTableData}
              onRowDoubleClick={this.onDBClickTable.bind(this)}
              size="small"
              bordered
            />
            <div className={styles.edit_area_dialog_submit_div}>
              <Button className={styles.edit_area_dialog_submit_div_button} onClick={this.onShowPersonTrack}>轨迹</Button>
              <Button className={styles.edit_area_dialog_submit_div_button} onClick={this.onResetValue}>重置</Button>
              <Button className={styles.edit_area_dialog_submit_div_button} onClick={this.onSubmitEditRegional}>确定</Button>
              <Button className={styles.edit_area_dialog_submit_div_button} onClick={() => this.onCloseEditRegional('back')}>返回</Button>
              {/* <Button className={styles.edit_area_dialog_submit_div_button}>导入点详情</Button> */}
            </div>
          </Dialog>
          <ContactModal
            onCancel={this.onCloseContactModal}
            onOK={this.onChangePersonTree}
            data={this.contactModalData(this.props.personTree)}
            isRadio={false}
            visible={this.state.showContactModal}
            defaultValue={this.state.defaultOrgUserid}
          />
          {this.state.showTraceInfo ? <TraceInfo
            persons={personInfo}
            map={this.props.map}
            onClose={this.closeHostryTrace}
          /> : null}
        </div> : null
    );
  }
}

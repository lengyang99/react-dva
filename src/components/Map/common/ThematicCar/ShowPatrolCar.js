import React, {Component} from 'react';
import { connect } from 'dva';
import { Select, Tree, Button, message, Checkbox } from 'antd';
import Dialog from '../../../yd-gis/Dialog/Dialog';
import styles from './ShowPatrolCar.less';
import Traceinfo from './TraceInfo.js';
import { getPersonTree,getEmerTempCar} from '../../../../services/patrolTrace';

const TreeNode = Tree.TreeNode;
const Option = Select.Option;

@connect(state => ({
  user: state.login.user,
  funs: state.login.funs,
}))

class showPatrolCar extends Component {
  constructor(props) {
    super(props);
    this.interval = {
      valobj: {},
    }
    this.queryIndex = 0;
    this.showTypeList = {1: true, 0: false}; // 记录当前选中的人员类型(key为在线状态，value为是否选中)

    // 过滤查询所有人员的按钮，有查看权限的人才能看
    let trailBtn = false;
    for (let i = 0; i < this.props.funs.length; i++) {
      if (this.props.funs[i].code === 'query_all_trail') {
        trailBtn = true;
        break;
      }
    }

    this.state = {
      // expandedKeys: [],
      defaultPerson: [], // 设置当前选中的人员(checkbox)
      // checkedPerson: [], // 设置点击选中的人员(checkbox)
      queryTracePserson: [],
      showTraceDialog: false,
      personTreeData: [],
      personList: [],
      showTrailBtn: trailBtn,
      onlineNum: 0,
      carList:[],// 车辆信息
    };

    this.map = props.map;
    this.selectMapPerson = {}; // 记录当前地图查看的popup框显示的人员信息
  }

  componentDidMount() {
    this.queryPersonData();
    window.showPersonTrack = this.onClickTabTrack;
  }

  componentWillUnmount() {
    clearInterval(this.interval.valobj);
    this.map.getMapDisplay().removeLayer('patrol_man_info_layer_car');
  }

  queryPersonData = () => {
    this.getPersonTrees();
    this.interval.valobj = setInterval(() => {
      this.getPersonTrees('noLoading');
    }, 60000);
  }

  // 获取当前车辆信息
  getPersonTrees = (loadType) => {
    getEmerTempCar({}).then((res) => {
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      const carList = res.data || [];
      this.setState({carList});
    });
  }


  queryPersonCall = (treeData, personTree, personList, depart) => {
    this.dealPersonInfo(treeData, personTree, personList, depart);
    this.map.getMapDisplay().removeLayer('patrol_man_info_layer_car');
    let tmpIdList = [];
    let tmpDataList = [];

    if (this.queryIndex === 0) {
      for (let i = 0; i < personList.length; i++) {
        if (personList[i].online === 1) {
          tmpIdList.push(personList[i].id);
          tmpDataList.push(personList[i]);
        }
      }
      this.setState({
        defaultPerson: tmpIdList,
      });
    } else {
      for (let i = 0; i < personList.length; i++) {
        let ckeckedPerson = this.state.defaultPerson;
        ckeckedPerson.map((tmpCheckPerson) => {
          if (tmpCheckPerson === personList[i].id) {
            tmpDataList.push(personList[i]);
          }
        });
      }
    }

    this.queryIndex = 1;
    this.drawMapPoint(tmpDataList)
  }

  dealPersonInfo = (treeData, personTree, personList, depart) => {
    for (let i = 0; i < treeData.length; i++) {
      let temp = {
        name: treeData[i].label,
        value: treeData[i].value,
        // key: treeData[i].key,
        type: treeData[i].type || treeData[i].attributes.type,
        attr: treeData[i].attributes,
      };
      personTree.push(temp);

      if (temp.type === '1') {
        if (treeData[i].children && treeData[i].children.length > 0) {
          temp.children = [];
          let tmpOnlinePerson = [];
          let allPerson = [];
          this.countOnlinePerson(treeData[i].children, tmpOnlinePerson, allPerson);
          temp.onLinePerson = `${tmpOnlinePerson.length}/${allPerson.length}`;
          this.dealPersonInfo(treeData[i].children, temp.children, personList, temp);
        }
      } else {
        personList.push({
          id: treeData[i].value,
          online: treeData[i].attributes.state,
          name: `${treeData[i].label}(${depart.name})`,
          departname: depart.name,
          departid: depart.value,
          attr: treeData[i].attributes,
        });
      }
    }
    return personList;
  }

  onClickTabTrack = () => {
    let personInfo = this.selectMapPerson;
    this.setState({
      showTraceDialog: true,
      queryTracePserson: [{vehicleId: personInfo.vehicleId, driver: personInfo.driver, grid: personInfo.grid}],
    });
  }
    //  选中全部车辆
  onCheckAll = (e) =>{
    if (!this.map) {
      return;
    }
    const checked = e.target.checked;
    this.map.getMapDisplay().removeLayer('patrol_man_info_layer_car');
    const carList = this.state.carList;
    const defaultPerson =this.state.defaultPerson;
    const vehicleIdList = [];
    for (let i = 0; i < carList.length; i++) {
        if(checked){
          vehicleIdList.push(carList[i].vehicleId);
        }
    }
    if(checked){
      this.drawMapPoint(carList);
    }else{
      this.drawMapPoint([]);
    }
    this.setState({defaultPerson:vehicleIdList});
  }
  //画出车辆的位置
  drawMapPoint = (data) => {
    if (!this.map) {
      return;
    }
    let that = this;
    for (let i = 0; i < data.length; i++) {
      if (data[i].merX <= 0 && data[i].merY <= 0) {
        continue;
      }
      //显示的车辆信息
      let attrInfo = {
        id: data[i].gid,
        vehicleId: data[i].vehicleId,
        driverTel : data[i].driverTel,
        driver: data[i].driver,
        grid: data[i].grid,
        geometry: {
          x: data[i].merX,
          y: data[i].merY,
        },
      };
      // let img = data[i].attr.state === 1 ? 'patrol_on.png' : 'patrol_off.png';
      let param = {
        id: `patrol_man_${data[i].gid}`,
        layerId: 'patrol_man_info_layer_car',
        src: `../../images/map/graphic/car.gif`,
        width: 30,
        height: 30,
        x: data[i].merX,
        y: data[i].merY,
        attr: attrInfo,
        click: (pointData) => {
          that.selectMapPerson = pointData.attributes;//暂时不知何用
          that.map.popup({
            x: pointData.geometry.x,
            y: pointData.geometry.y,
            info: {
              title: '车辆信息',
              link: [{linkText: '轨迹',
                click: () => {
                  window.showPersonTrack();
                },
              }],
              content: [
                {name: '网格', value: pointData.attributes.grid},
                {name: '车牌号', value: pointData.attributes.vehicleId},
                {name: '司机', value: pointData.attributes.driver},
                {name: '电话', value: pointData.attributes.driverTel},
              ],
            },
          });
        },
      }
      this.map.getMapDisplay().image(param);
      let paramtext = {
        id: `patrol_man_text_${data[i].gid}`,
        layerId: 'patrol_man_info_layer_car',
        x: data[i].merX,
        y: data[i].merY,
        offsetX: 0,
        offsetY: 20,
        text: data[i].vehicleId,
      };
      this.map.getMapDisplay().text(paramtext);
    }
  };

  cententPoint = (data) => {
    if (data.merX <= 0 && data.merY <= 0) {
      return;
    }
    let geometry = {x: data.merX, y: data.merY};
    this.map.centerAt(geometry);
    this.map.popup({
      x: geometry.x,
      y: geometry.y,
      info: {
        title: '车辆信息',
        content: [
          {name: '网格', value: data.grid},
          {name: '车牌号', value: data.vehicleId},
          {name: '司机', value: data.driver},
          {name: '电话', value: data.driverTel},
        ],
      },
    });
  }
  //点击车辆
  onClickPerson = (value, target) => {
    let carList = this.state.carList;
    let checkPerson = this.state.defaultPerson;

    for (let i = 0; i < checkPerson.length; i++) {
      if (value[0] === checkPerson[i]) {
        for (let j = 0; j < carList.length; j++) {
          if (carList[j].vehicleId === value[0]) {
            this.cententPoint(carList[j]);
            break;
          }
        }
      }
    }
  }
  //勾选 车辆
  onCheckPerson = (value, target) => {
    if (!this.map) {
      return;
    }
    this.map.getMapDisplay().removeLayer('patrol_man_info_layer_car');
    let showPointData = [];
    for (let i = 0; i < value.length; i++) {
      for (let j = 0; j < this.state.carList.length; j++) {
        if (value[i] === this.state.carList[j].vehicleId) {
          showPointData.push(this.state.carList[j]);
        }
      }
    }
    this.drawMapPoint(showPointData);
    this.setState({
      defaultPerson: value,
    });
  }
  // 查看轨迹
  showTrace = (e) => {
    if (this.state.defaultPerson.length === 0) {
      message.info('请勾选车辆');
      return;
    }

    let selectPersons = [];
    for (let i = 0; i < this.state.defaultPerson.length; i++) {
      for (let j = 0; j < this.state.carList.length; j++) {
        if (this.state.defaultPerson[i] === this.state.carList[j].vehicleId) {
          let tmpperson = Object.assign({}, this.state.carList[j]);
          tmpperson.vehicleId = tmpperson.vehicleId.substring(1);
          selectPersons.push(tmpperson);
          break;
        }
      }
    }

    this.setState({
      showTraceDialog: true,
      queryTracePserson: selectPersons,
    });
  }
  // 点击图标查看车辆轨迹
  showPersonTrace = (value, e) => {
    e.stopPropagation(); // 阻止事件冒泡
    let showTracePerson = {};
    let showPointData = [];
    for (let i = 0; i < this.state.carList.length; i++) {
      if (value === this.state.carList[i].vehicleId) {
        showTracePerson = Object.assign({}, this.state.carList[i]);
        showPointData.push(this.state.carList[i]);
        // showTracePerson.vehicleId = value.substring(1);
        break;
      }
    }
    this.drawMapPoint(showPointData);
    this.setState({
      showTraceDialog: true,
      queryTracePserson: [showTracePerson],
    });
  }
  //选中下拉框中的 车辆
  selectChangePerson = (e, v) => {
    let value = v.props['data-value'];
    let showPointData = [];
    for (let j = 0; j < this.state.carList.length; j++) {
      if (value === this.state.carList[j].vehicleId) {
        showPointData.push(this.state.carList[j]);
      }
    }

    this.map.getMapDisplay().removeLayer('patrol_man_info_layer_car');
    this.drawMapPoint(showPointData);
    // let expandedKeys = [value].concat(this.state.expandedKeys);
    this.setState({
      // expandedKeys: expandedKeys,n
      defaultPerson: [value],
    });
  }

  closeHostryTrace = () => {
    this.setState({
      showTraceDialog: false,
    });
  }

  closePersonTrace = () => {
    this.props.onClose();
  }

  loop = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode
            key={item.vehicleId}
            title={
              <div style={{width: '320px'}}>
                <div className={`${styles.show_patrol_person_treenode_style} ${styles.show_patrol_person_treenode_depart}`} />
                <div className={styles.show_patrol_person_treenode_style}>{item.vehicleId}</div>
                <div className={styles.show_online_style}>{item.vehicleId || ''}</div>
              </div>
            }
          >
          </TreeNode>
        );
      }

      let styleName = 'show_patrol_person_treenode_depart';
      if (item.type === 'u') {
        if (item.attr.state === 1) {
          styleName = 'show_patrol_person_treenode_user_online';
        } else {
          styleName = 'show_patrol_person_treenode_user_offline';
        }
      }

      return (
        <TreeNode
          key={item.vehicleId}
          isLeaf={true}
          title={
            <div>
              <div className={`${styles.show_patrol_person_treenode_style} ${styles[styleName]}`} />
              <div className={styles.show_patrol_person_treenode_style}>{item.vehicleId}</div>
              <div
                className={styles.show_patrol_person_treenode_showtrace}
                onClick={this.showPersonTrace.bind(this, item.vehicleId)}
              />
            </div>}
        />);
    });
  }

  render() {
    let carList = [];
    for (let i = 0; i < this.state.carList.length; i++) {
      carList.push(
        <Option
          key={this.state.carList[i].vehicleId}
          value={this.state.carList[i].vehicleId}
          data-value={this.state.carList[i].vehicleId}
        >
          {this.state.carList[i].vehicleId}{`(${this.state.carList[i].grid})`}
        </Option>
      );
    }

    let allCarNum = this.state.carList.length;
    return (
      <div>
        <Dialog
          title="车辆监控"
          width={320}
          position={{
            left: 210,
            top: 50,
          }}
          onClose={this.closePersonTrace}
        >
          <div style={{height: 400}}>
            <Select
              showSearch
              placeholder="输入车牌号搜索"
              className={styles.show_patrol_person_search_person}
              // defaultValue={['a10', 'c12']}
              onSelect={this.selectChangePerson}
              filterOption={(inputValue, option) => {
                 if (option.props.value.indexOf(inputValue) >= 0) {
                   return true;
                 } else {
                   return false;
                 }
              }}
            >
              {carList}
            </Select>
            <div className={styles.show_dialog_person_tree_div}>
            <div className={styles.show_dialog_person_tree_total}>
                <Checkbox onChange={this.onCheckAll}>{`全部车辆(${allCarNum})`}</Checkbox>
              </div>
              <hr className={styles.show_patrol_person_hr} />
              <div className={styles.show_dialog_person_tree_data_tree}>
                {
                  this.state.carList.length > 0 ?
                    <Tree
                      checkable
                      onSelect={this.onClickPerson}
                      onCheck={this.onCheckPerson}
                      checkedKeys={(this.state.defaultPerson.length > 0 ? this.state.defaultPerson : [''])}
                    >
                      {this.loop(this.state.carList)}
                    </Tree> : null
                }
              </div>
            </div>
          </div>
        </Dialog>
        {this.state.showTraceDialog ?
          <Traceinfo
            persons={this.state.queryTracePserson}
            map={this.map}
            onClose={this.closeHostryTrace}
          /> : null}
      </div>
    );
  }
}

export default showPatrolCar;

import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Select, Tree, Button, message, Checkbox } from 'antd';
import Dialog from '../../components/yd-gis/Dialog/Dialog';
import EcityMap from '../../components/Map/EcityMap';
import styles from './ShowPatrolPerson.less';
import Traceinfo from './TraceInfo.js';

const TreeNode = Tree.TreeNode;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;

@connect(state => ({
  personTreeData: state.patrolTrace.personTreeData,
  personList: state.patrolTrace.personList,
  onlineNum: state.patrolTrace.onlineNum,
  userInfo: state.login.user,
  funs: state.login.funs,
}))

class showPatrolPerson extends Component {
  constructor(props) {
    super(props);
    this.interval = {
      valobj: {},
    }
    this.queryIndex = 0;
    this.showTypeList = { 1: true, 0: false }; // 记录当前选中的人员类型(key为在线状态，value为是否选中)

    // 过滤查询所有人员的按钮，有查看权限的人才能看
    let trailBtn = false;
    for (let i = 0; i < this.props.funs.length; i++) {
      if (this.props.funs[i].code === 'query_all_trail') {
        trailBtn = true;
        break;
      }
    }
    this.state = {
      expandedKeys: [],
      defaultPerson: [], // 设置当前选中的人员(checkbox)
      // checkedPerson: [], // 设置点击选中的人员(checkbox)
      queryTracePserson: [],
      showTraceDialog: false,
      showTrailBtn: trailBtn,
      switch: [1],
      autoExpandParent: true,
      queryTime:{
        stime:moment((moment().format('YYYY-MM-DD') + ' 07:00:00'), 'YYYY-MM-DD HH:mm:ss').format('YYYYMMDDHHmmss'),
        etime:moment((moment().format('YYYY-MM-DD') + ' 23:59:59'), 'YYYY-MM-DD HH:mm:ss').format('YYYYMMDDHHmmss'),
      }
    };

    // 地图加载好后，存储此值
    this.map = null;

    this.selectMapPerson = {}; // 记录当前地图查看的popup框显示的人员信息

    this.queryPersonData = this.queryPersonData.bind(this);
  }

  componentWillMount() {

  }

  componentDidMount() {
    this.getPersonTree();
    window.showPersonTrack = this.onClickTabTrack;
  }

  componentWillUnmount() {
    clearInterval(this.interval.valobj);
    if(this.map){
      this.map.getMapDisplay().removeLayer('patrol_man_info_layer');
      this.map.getMapObj().infoWindow.hide();
    }
  }

  queryPersonData = (arcGISMap) => {
    this.map = arcGISMap;
    this.getPersonTree();
    this.interval.valobj = setInterval(() => {
      this.getPersonTree('noLoading');
    }, 60000);
  };
  mapSwitcherOnchange = () => { // 切换地图类型 电子地图/地形地图
    this.getPersonTree('noLoading');
  };
  // 获取当前人员TREE结构
  getPersonTree = (loadType) => {
    let gid = this.props.userInfo.gid;
    this.props.dispatch({
      type: 'patrolTrace/getPersonTree',
      poyload: {
        userid: gid,
        loadType: loadType,
      },
      callback: (treeData, personTree, personList, depart) => {
        console.log(treeData, personTree, personList, depart, 'treeData, personTree, personList, depart')
        this.dealPersonInfo(treeData, personTree, personList, depart);
        const mapDisplay = this.map ? this.map.getMapDisplay() : '';
        if(this.map){
          mapDisplay.removeLayer('patrol_man_info_layer');
        }
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
        this.drawMapPoint(tmpDataList);
      },
    });
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
          temp.onLineLength = tmpOnlinePerson.length;
          temp.allPersonLength = allPerson.length;
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

  // 统计部门在线人员个数
  countOnlinePerson = (treeData, tmpOnlinePerson, allPerson) => {
    for (let i = 0; i < treeData.length; i++) {
      if ((treeData[i].type || treeData[i].attributes.type) === '1') {
        if (treeData[i].children && treeData[i].children.length > 0) {
          this.countOnlinePerson(treeData[i].children, tmpOnlinePerson, allPerson);
        }
      } else {
        if (treeData[i].attributes.state === 1) {
          tmpOnlinePerson.push(treeData[i]);
        }
        allPerson.push(treeData[i]);
      }
    }
    return;
  }

  onClickTabTrack = () => {
    console.log('haha');
    let personInfo = this.selectMapPerson;
    if (this.state.showTraceDialog === true) {
      message.info('请关闭其他人员轨迹窗口！');
      return;
    }
    this.setState({
      showTraceDialog: true,
      queryTracePserson: [{ id: personInfo.id, name: personInfo.name, online: personInfo.online }],
    });
  }


  drawMapPoint = (data) => {
    if (!this.map) {
      return;
    }
    let that = this;
    for (let i = 0; i < data.length; i++) {
      if (data[i].attr.x <= 0 && data[i].attr.y <= 0) {
        continue;
      }

      let attrInfo = {
        id: data[i].attr.userid,
        name: data[i].attr.username,
        phone: data[i].attr.phone,
        depart: data[i].departname,
        online: data[i].attr.state,
        state: data[i].attr.state === 1 ? '在线' : '离线',
        geometry: {
          x: data[i].attr.x,
          y: data[i].attr.y,
        },
        time: data[i].attr.time,
        mileage: data[i].attr.mileage,
      };
      let img = data[i].attr.state === 1 ? 'patrol_on.png' : 'patrol_off.png';

      let param = {
        id: `patrol_man_${data[i].id}`,
        layerId: 'patrol_man_info_layer',
        src: `../../images/positionTraceImage/${img}`,
        width: 33,
        height: 40,
        angle: 0,
        x: data[i].attr.x,
        y: data[i].attr.y,
        attr: attrInfo,
        click: (pointData) => {
          // 请求轨迹点
          this.props.dispatch({
            type: 'patrolTrace/queryPatrolPosition',
            data: {
              userIds: pointData.attributes.id,
              startTime: this.state.queryTime.stime,
              endTime: this.state.queryTime.etime,
            },
            callback: (res) => {
              console.log('res', res);
              let ltDots = [[]];
              let resultList = res.upList;
              for (let k = 0; k < resultList[i].points.length; k++) {
                let forlength = resultList[i].points[k].length;
                ltDots[k] = [];
                for (let j = 0; j < forlength; j++) {
                  ltDots[k].push({ x: resultList[i].points[k][j].lon, y: resultList[i].points[k][j].lat });
                }
              }
              let pIndex = 0;
              res.upList.map((person, index) => {
                if (person.userid === pointData.attributes.id) {
                  pIndex = index;
                }
              });
              that.selectMapPerson = pointData.attributes;
              //里程数
              const resMileage = res.upList[pIndex].userMileage;
              let startMileage = Number(resMileage.mileage) > 1000 ? (Number(resMileage.mileage) / 1000).toFixed(2) + '公里' : Number(resMileage.mileage).toFixed(2) + '米';
              let endtMileage = Number(resMileage.effectiveMileage) > 1000 ? (Number(resMileage.effectiveMileage) / 1000).toFixed(2) + '公里' : Number(resMileage.effectiveMileage).toFixed(2) + '米';


              that.map.popup({
                x: pointData.geometry.x,
                y: pointData.geometry.y,
                info: {
                  title: '巡检员信息',
                  link: [{
                    linkText: '轨迹',
                    click: () => {
                      window.showPersonTrack();
                    },
                  }],
                  content: [
                    { name: '姓名', value: pointData.attributes.name },
                    { name: '电话', value: pointData.attributes.phone },
                    { name: '部门', value: pointData.attributes.depart },
                    { name: '状态', value: pointData.attributes.state },
                    { name: '开始时间', value: res.upList[pIndex].points.length ? res.upList[pIndex].points[0][0].time : 0 },
                    { name: '结束时间', value: res.upList[pIndex].points.length ? res.upList[pIndex].points[0][res.upList[pIndex].points[0].length - 1].time : 0 },
                    { name: '今日里程', value: startMileage },
                    { name: '有效里程', value: endtMileage },
                  ],
                },
              });
              // that.map.getPolylineLen(ltDots, (lens) => {
              //   let mileage = parseFloat(lens / 1000).toFixed(3);
              //   that.selectMapPerson = pointData.attributes;
              //   that.map.popup({
              //     x: pointData.geometry.x,
              //     y: pointData.geometry.y,
              //     info: {
              //       title: '巡检员信息',
              //       link: [{
              //         linkText: '轨迹',
              //         click: () => {
              //           window.showPersonTrack();
              //         },
              //       }],
              //       content: [
              //         { name: '姓名', value: pointData.attributes.name },
              //         { name: '电话', value: pointData.attributes.phone },
              //         { name: '部门', value: pointData.attributes.depart },
              //         { name: '状态', value: pointData.attributes.state },
              //         { name: '开始时间', value: res.upList[0].points.length ? res.upList[0].points[0][0].time : 0 },
              //         { name: '结束时间', value: res.upList[0].points.length ? res.upList[0].points[0][res.upList[0].points[0].length - 1].time : 0 },
              //         { name: '今日里程', value: mileage },
              //       ],
              //     },
              //   });
              // });
            },
          });
        },
      }
      this.map.getMapDisplay().image(param);
      let paramtext = {
        id: `patrol_man_text_${data[i].id}`,
        layerId: 'patrol_man_info_layer',
        x: data[i].attr.x,
        y: data[i].attr.y,
        offsetX: 0,
        offsetY: 20,
        text: `${data[i].attr.username}${data[i].attr.isOff === '1' ? '(休息)' : ''}`,
      };
      this.map.getMapDisplay().text(paramtext);
    }
  };

  cententPoint = (personList) => {
    let that = this;
    if (personList.attr.x <= 0 && personList.attr.y <= 0) {
      return;
    }
    let geometry = { x: personList.attr.x, y: personList.attr.y };
    this.map.centerAt(geometry);
    // 请求轨迹点
    this.props.dispatch({
      type: 'patrolTrace/queryPatrolPosition',
      data: {
        userIds: personList.attr.userid,
        startTime: moment((moment().format('YYYY-MM-DD') + ' 08:00:00'), 'YYYY-MM-DD HH:mm:ss').format('YYYYMMDDHHmmss'),
        endTime: moment((moment().format('YYYY-MM-DD') + ' 18:00:00'), 'YYYYMMDDHHmmss').format('YYYYMMDDHHmmss'),
      },
      callback: (res) => {
        let attrInfo = {
          id: personList.attr.userid,
          name: personList.attr.username,
          phone: personList.attr.phone,
          depart: personList.departname,
          online: personList.attr.state,
          state: personList.attr.state === 1 ? '在线' : '离线',
          geometry: {
            x: personList.attr.x,
            y: personList.attr.y,
          },
          time: personList.attr.time,
          mileage: personList.attr.mileage,
        };
        this.selectMapPerson = attrInfo;
        let ltDots = [[]];
        let resultList = res.upList;
        for (let k = 0; k < resultList[0].points.length; k++) {
          let forlength = resultList[0].points[k].length;
          ltDots[k] = [];
          for (let j = 0; j < forlength; j++) {
            ltDots[k].push({ x: resultList[0].points[k][j].lon, y: resultList[0].points[k][j].lat });
          }
        }
        let pIndex = 0;
        res.upList.map((person, index) => {
          if (person.userid === personList.attr.userid) {
            pIndex = index;
          }
        });
        this.map.popup({
          x: geometry.x,
          y: geometry.y,
          info: {
            title: '巡检员信息',
            link: [{
              linkText: '轨迹',
              click: () => {
                window.showPersonTrack();
              },
            }],
            content: [
              { name: '姓名', value: personList.name },
              { name: '电话', value: personList.attr.phone },
              { name: '部门', value: personList.departname },
              { name: '状态', value: personList.attr.state === 1 ? '在线' : '离线' },
              { name: '开始时间', value: res.upList[pIndex].points.length ? res.upList[pIndex].points[0][0].time : 0 },
              { name: '结束时间', value: res.upList[pIndex].points.length ? res.upList[pIndex].points[0][res.upList[pIndex].points[0].length - 1].time : 0 },
              { name: '今日里程', value: res.upList[pIndex].userMileage.mileage },
              { name: '有效里程', value: res.upList[pIndex].userMileage.effectiveMileage },
            ],
          },
        });
        // that.map.getPolylineLen(ltDots, (lens) => {
        //   let mileage = parseFloat(lens / 1000).toFixed(3);
        //   this.map.popup({
        //     x: geometry.x,
        //     y: geometry.y,
        //     info: {
        //       title: '巡检员信息',
        //       link: [{
        //         linkText: '轨迹',
        //         click: () => {
        //           window.showPersonTrack();
        //         },
        //       }],
        //       content: [
        //         { name: '姓名', value: personList.name },
        //         { name: '电话', value: personList.attr.phone },
        //         { name: '部门', value: personList.departname },
        //         { name: '状态', value: personList.attr.state === 1 ? '在线' : '离线' },
        //         { name: '开始时间', value: res.upList[0].points.length ? res.upList[0].points[0][0].time : 0 },
        //         { name: '今日里程', value: mileage },
        //       ],
        //     },
        //   });
        // });
      },
    });
  }

  onClickPerson = (value, target) => {
    let personList = this.props.personList;
    let checkPerson = this.state.defaultPerson;
    for (let i = 0; i < checkPerson.length; i++) {
      if (value[0] === checkPerson[i]) {
        for (let j = 0; j < personList.length; j++) {
          if (personList[j].id === value[0]) {
            this.cententPoint(personList[j]);
            break;
          }
        }
      }
    }
  }

  onCheckPerson = (value, target) => {
    if (!this.map) {
      return;
    }
    this.map.getMapDisplay().removeLayer('patrol_man_info_layer');
    let showPointData = [];
    for (let i = 0; i < value.length; i++) {
      for (let j = 0; j < this.props.personList.length; j++) {
        if (value[i] === this.props.personList[j].id) {
          showPointData.push(this.props.personList[j]);
        }
      }
    }


    this.drawMapPoint(showPointData);
    this.setState({
      defaultPerson: value,
    });
  }

  showOnlinePerson = (type, e) => {
    if (!this.map) {
      return;
    }
    this.map.getMapDisplay().removeLayer('patrol_man_info_layer');
    // let checked = e.target.checked;
    if(type.includes(0)){
      this.showTypeList[0] = true;
    }else{
      this.showTypeList[0] = false;
    }
    if(type.includes(1)){
      this.showTypeList[1] = true;
    }else{
      this.showTypeList[1] = false;
    }
    // this.showTypeList[type] = true;

    let tmpIdList = [];
    let tmpDataList = [];
    let tmpList = this.props.personList;
    for (let i = 0; i < tmpList.length; i++) {
      if (this.showTypeList[tmpList[i].online]) {
        tmpIdList.push(tmpList[i].id);
        tmpDataList.push(tmpList[i]);
      }
    }
    this.drawMapPoint(tmpDataList);

    this.setState({
      // expandedKeys: tmpIdList,
      defaultPerson: tmpIdList,
    });
  };

  showPersonTrace = (value, e) => {
    e.stopPropagation(); // 阻止事件冒泡
    let showTracePerson = {};
    for (let i = 0; i < this.props.personList.length; i++) {
      if (value === this.props.personList[i].id) {
        showTracePerson = Object.assign({}, this.props.personList[i]);
        showTracePerson.id = value.substring(1);
        break;
      }
    }
    this.setState({
      showTraceDialog: true,
      queryTracePserson: [showTracePerson],
    });
  }

  selectChangePerson = (e, v) => {
    let value = v.props['data-value'];
    let showPointData = [];
    for (let j = 0; j < this.props.personList.length; j++) {
      if (value === this.props.personList[j].id) {
        showPointData.push(this.props.personList[j]);
      }
    }

    this.map.getMapObj().infoWindow.hide();
    this.map.getMapDisplay().removeLayer('patrol_man_info_layer');
    this.drawMapPoint(showPointData);
    // this.switchStatus([0,1])
    // let expandedKeys = [value].concat(this.state.expandedKeys);
    this.setState({
      expandedKeys: [value],
      defaultPerson: [value],
      autoExpandParent: true,
      switch: [0,1]
    });
  }

  closeHostryTrace = () => {
    this.setState({
      showTraceDialog: false,
    });
  }

  closePersonTrace = () => {
    this.props.history.goBack();
  }

  showTrace = (e) => {
    if (this.state.defaultPerson.length === 0) {
      message.info('请勾选巡检人员');
      return;
    }
    let selectPersons = [];
    for (let i = 0; i < this.state.defaultPerson.length; i++) {
      for (let j = 0; j < this.props.personList.length; j++) {
        if (this.state.defaultPerson[i] === this.props.personList[j].id) {
          let tmpperson = Object.assign({}, this.props.personList[j]);
          tmpperson.id = tmpperson.id.substring(1);
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

  loop = (data, checkedValues) => {
    // if(this.props.onlineNum === 0 && this.state.switch.length === 0 && this.state.switch[0] === 1){
    //   return
    // }
    return data.map((item) => {
      if (item.children) {
        if(checkedValues.length === 1 && checkedValues.includes(1)){
          if(item.onLineLength > 0){
            return (
              <TreeNode
                key={item.value}
                title={
                  <div style={{ width: '320px' }}>
                    <div className={`${styles.show_patrol_person_treenode_style} ${styles.show_patrol_person_treenode_depart}`} />
                    <div className={styles.show_patrol_person_treenode_style}>{item.name}</div>
                    <div className={styles.show_online_style}>{item.onLinePerson || ''}</div>
                  </div>
                }
              >
                {this.loop(item.children, checkedValues)}
              </TreeNode>
            );
          }else{ return }
        }else if(checkedValues.length === 1 && checkedValues.includes(0)){
          if(item.onLineLength !== item.allPersonLength){
            return (
              <TreeNode
                key={item.value}
                title={
                  <div style={{ width: '320px' }}>
                    <div className={`${styles.show_patrol_person_treenode_style} ${styles.show_patrol_person_treenode_depart}`} />
                    <div className={styles.show_patrol_person_treenode_style}>{item.name}</div>
                    <div className={styles.show_online_style}>{item.onLinePerson || ''}</div>
                  </div>
                }
              >
                {this.loop(item.children, checkedValues)}
              </TreeNode>
            );
          }else{ return }
        }else if(checkedValues.length === 2){
          return (
            <TreeNode
              key={item.value}
              title={
                <div style={{ width: '320px' }}>
                  <div className={`${styles.show_patrol_person_treenode_style} ${styles.show_patrol_person_treenode_depart}`} />
                  <div className={styles.show_patrol_person_treenode_style}>{item.name}</div>
                  <div className={styles.show_online_style}>{item.onLinePerson || ''}</div>
                </div>
              }
            >
              {this.loop(item.children, checkedValues)}
            </TreeNode>
          );
        }
      }

      let styleName = 'show_patrol_person_treenode_depart';
      if (item.type === 'u') {
        if (item.attr.state === 1) {
          styleName = 'show_patrol_person_treenode_user_online';
        } else {
          styleName = 'show_patrol_person_treenode_user_offline';
        }
      }

      if(checkedValues.length === 1 && checkedValues.includes(1)){
        if((item.type === 'u' && item.attr.state === 1  ) || item.type !== 'u'){
          return (
            <TreeNode
              key={item.value}
              isLeaf={true}
              title={
                <div style={{ width: '320px' }}>
                  <div className={`${styles.show_patrol_person_treenode_style} ${styles[styleName]}`} />
                  <div className={styles.show_patrol_person_treenode_style}>{item.name}<span>{item.attr.isOff === '1' ? '(休息)' : ''}</span></div>
                  <div className={styles.show_online_style}>{item.onLinePerson || ''}</div>
                  <div
                    className={item.type === 'u' ? styles.show_patrol_person_treenode_showtrace : ''}
                    onClick={this.showPersonTrace.bind(this, item.value)}
                  />
                </div>}
            />);
        }
      }else if(checkedValues.length === 1 && checkedValues.includes(0)){
        if((item.type === 'u' && item.attr.state === 0 ) || item.type !== 'u'){
          return (
            <TreeNode
              key={item.value}
              isLeaf={true}
              title={
                <div style={{ width: '320px' }}>
                  <div className={`${styles.show_patrol_person_treenode_style} ${styles[styleName]}`} />
                  <div className={styles.show_patrol_person_treenode_style}>{item.name}<span>{item.attr.isOff === '1' ? '(休息)' : ''}</span></div>
                  <div className={styles.show_online_style}>{item.onLinePerson || ''}</div>
                  <div
                    className={item.type === 'u' ? styles.show_patrol_person_treenode_showtrace : ''}
                    onClick={this.showPersonTrace.bind(this, item.value)}
                  />
                </div>}
            />);
        }
      }else if(checkedValues.length === 2){
        return (
          <TreeNode
            key={item.value}
            isLeaf={true}
            title={
              <div style={{ width: '320px' }}>
                <div className={`${styles.show_patrol_person_treenode_style} ${styles[styleName]}`} />
                <div className={styles.show_patrol_person_treenode_style}>{item.name}<span>{item.attr.isOff === '1' ? '(休息)' : ''}</span></div>
                <div className={styles.show_online_style}>{item.onLinePerson || ''}</div>
                <div
                  className={item.type === 'u' ? styles.show_patrol_person_treenode_showtrace : ''}
                  onClick={this.showPersonTrace.bind(this, item.value)}
                />
              </div>}
          />);
      }
    });
  };

  switchStatus = (checkedValues) => {
    this.showOnlinePerson(checkedValues)
    this.setState({
      switch: checkedValues
    })
  };

  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }

  getQueryTime=(value)=>{
    console.log('value', value);
    this.setState({
      queryTime:value,
    })
  }

  render() {
    let personList = [];
    for (let i = 0; i < this.props.personList.length; i++) {
      const value = `${this.props.personList[i].name}${this.props.personList[i].id}`;
      personList.push(
        <Option
          key={this.props.personList[i].id}
          value={value}
          data-value={this.props.personList[i].id}
        >
          {this.props.personList[i].name}
        </Option>
      );
    }
    // for (let j = 0; j < personList.length; j++) {
    //   for (let k = j + 1; k < personList.length - j - 1; k++) {
    //     if (personList[j].key === personList[k].key) {
    //       console.log(j, k);
    //     }
    //   }
    // }
    // console.log('personList', personList);
    let allPersonNum = this.props.personList.length;
    return (
      <div style={{ position: 'relative' }}>
        <div style={{ width: '100%', height: 'calc(100vh - 120px)' }}>
          <EcityMap mapSwitcherOnchange={this.mapSwitcherOnchange} mapId="patrolTrace" onMapLoad={this.queryPersonData} />
        </div>
        <Dialog
          title="人员位置"
          width={320}
          position={{
            position: 'absolute',
            left: 210,
            top: 50,
          }}
          onClose={this.closePersonTrace}
        >
          <div style={{ height: 400 }}>
            <Select
              showSearch
              placeholder="输入巡检员名称搜索"
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
              {personList}
            </Select>
            <div className={styles.show_dialog_person_tree_div}>
              <div className={styles.show_dialog_person_tree_total}>
                在线人数： {this.props.onlineNum} / {allPersonNum}
              </div>
              <hr className={styles.show_patrol_person_hr} />
              <div className={styles.show_dialog_person_tree_data_tree}>
                {
                  this.props.personTreeData.length > 0 && this.state.switch.length > 0 ?
                    (this.props.onlineNum === 0 && this.state.switch.length === 1 && this.state.switch[0] === 1 ? null :
                    <Tree
                      checkable
                      expandedKeys={(this.state.expandedKeys.length > 0 ? this.state.expandedKeys : [])}
                      onExpand={this.onExpand}
                      // defaultExpandAll={false}
                      autoExpandParent={this.state.autoExpandParent}
                      checkedKeys={(this.state.defaultPerson.length > 0 ? this.state.defaultPerson : [])}
                      onSelect={this.onClickPerson}
                      onCheck={this.onCheckPerson}
                    >
                      {this.loop(this.props.personTreeData, this.state.switch)}
                  </Tree>) : null
                }
              </div>
            </div>
            <div className={styles.show_patrol_person_screen_div}>
              <span>显示类型：</span>
              <Checkbox.Group onChange={this.switchStatus} value={this.state.switch}>
                <Checkbox style={{ marginLeft: '10px' }} value={1}>在线</Checkbox>
                <Checkbox value={0}>离线</Checkbox>
              </Checkbox.Group>

              {/* <Checkbox style={{ marginLeft: '10px' }} defaultChecked={true} onChange={this.showOnlinePerson.bind(this, 1)}>在线</Checkbox>
              <Checkbox onChange={this.showOnlinePerson.bind(this, 0)}>离线</Checkbox> */}
              {this.state.showTrailBtn ? <Button className={styles.show_trace_btn} type="primary" size="small" onClick={this.showTrace}>查看轨迹</Button> : null}
            </div>
          </div>
        </Dialog>
        {this.state.showTraceDialog ?
          <Traceinfo
            persons={this.state.queryTracePserson}
            map={this.map}
            onClose={this.closeHostryTrace}
            getQueryTime={this.getQueryTime}
          /> : null}
      </div>
    );
  }
}

export default showPatrolPerson;

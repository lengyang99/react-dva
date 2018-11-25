import React, { Component } from 'react';
import { connect } from 'dva';
import { Tree, Radio, DatePicker, Button, Table, Slider, message, Checkbox, Row, Col } from 'antd';
import moment from 'moment';
import { stringify } from 'qs';
import { getCurrTk } from '../../utils/utils.js';
import Dialog from '../../components/yd-gis/Dialog/Dialog';
import styles from './TraceInfo.less';

const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const lineColor = ['#3C763D', '#00CD66', '#EC3842', '#D738EC', '#3871EC',
  '#EC9138', '#ECD438', '#98EC38', '#3DEC38', '#38EC86', '#67DDEF'];
const showTraceListColumns = [
  { title: '时间', dataIndex: 'time', width: 120 },
  {
    title: '坐标', dataIndex: 'value', width: 180, render: (text, record, index) => {
      return record.x + ',' + record.y;
    }
  }
];

const showTraceDetailListColumns = [
  { title: '时间', dataIndex: 'time', width: 80 },
  {
    title: '坐标', dataIndex: 'x', width: 110, render: (text, record, index) => {
      return parseFloat(record.x).toFixed(3) + ',' + parseFloat(record.y).toFixed(3);
    }
  },
  {
    title: '精度(米)', dataIndex: 'accuracy', width: 50, render: (text, record, index) => {
      return parseFloat(text).toFixed(2);
    }
  },
  // {title: '来源', dataIndex: '', width: 135},
  {
    title: '经度', dataIndex: 'lon', width: 40, render: (text, record, index) => {
      return parseFloat(text).toFixed(2);
    }
  },
  {
    title: '纬度', dataIndex: 'lat', width: 40, render: (text, record, index) => {
      return parseFloat(text).toFixed(2);
    }
  },
  {
    title: '速度(km/h)', dataIndex: 'speed', width: 50, render: (text, record, index) => {
      return parseFloat(text).toFixed(3);
    }
  },
  { title: '电量', dataIndex: 'battery', width: 40 },
  // {title: 'CPU', dataIndex: 'time', width: 135},
  // {title: '内存', dataIndex: 'time', width: 135}
];

@connect(state => ({
  queryData: state.patrolTrace.queryData,
}))

class TraceInfo extends Component {
  constructor(props) {
    super(props);

    this.interval = {
      lineIndex: 0, // 记录当前播放点的位于哪段轨迹
      index: 0, // 记录当前播放点的个数
      playtime: 25,
      valobj: null, // 计时器
      playSpeed: 30, // 轨迹播放速度（根据地图的缩放级别设置播放速度）
      sliderIndex: null, // 记录鼠标移动播放时间的延时方法下标
    };

    this.persons = Object.assign([], props.persons);
    this.playPoint = {}; // 记录当前的播放点

    this.selectPersonTraceInfo = {
      points: [],
    }; // 当前选中的人员轨迹信息

    let queryIndex = 0;
    this.queryTime = {
      stime: moment((moment().format('YYYY-MM-DD') + ' 07:00:00'), 'YYYY-MM-DD HH:mm:ss'),
      etime: moment((moment().format('YYYY-MM-DD') + ' 23:59:59'), 'YYYY-MM-DD HH:mm:ss'),
    }
    if (this.props.queryDate) {
      queryIndex = 2;
      this.queryTime = {
        stime: moment(this.props.queryDate.startTime, 'YYYY-MM-DD HH:mm:ss'),
        etime: moment(this.props.queryDate.endTime, 'YYYY-MM-DD HH:mm:ss'),
      };
    }

    this.queryTrackTime = {
      stime: '',
      etime: '',
    }; // 记录当前查询得到的轨迹点的开始时间及结束时间

    this.state = {
      queryTime: queryIndex,
      showTraceClick: false,
      showTracePlay: false,
      showpause: false,
      showDetail: false,
      showClickStyleIndex: '',
      showStagnate: true,
      queryTimeValue: this.queryTime,
      markValue: 0, // 记录当前时间轴时间的位置
      markLine: {}, // 记录播放轴的刻度
      markLineMax: 0, // 记录播放轴的最大刻度
      personTrackInfo: [],
      checkPerson: [], //勾选的人
    };
  }

  componentWillMount() {
    this.queryPatrolPosition();
  }
  componentWillUnmount = () => {
    clearInterval(this.interval.valobj);
    this.onClearMap();
  }

  onClearMap = () => {
    this.props.map.getMapDisplay().removeLayer('show_trace_point');
    this.props.map.getMapDisplay().removeLayer('show_trace_line');
    this.props.map.getMapDisplay().removeLayer('play_trace_layer');
    this.props.map.getMapDisplay().removeLayer('show_stagnate_point_layer');
  }

  queryPatrolPosition = () => {
    this.setState({
      personTrackInfo: [],
    });
    let that = this;
    let stime = this.queryTime.stime.format('YYYYMMDDHHmmss');
    let etime = this.queryTime.etime.format('YYYYMMDDHHmmss');
    let adddays = moment(stime, 'YYYYMMDDHHmmss').add(7, 'days').format('YYYYMMDDHHmmss');

    if (stime > etime) {
      message.info('开始时间不得大于结束时间');
      this.props.onClose();
      return;
    }

    if (adddays < etime) {
      message.info('查询时间不得大于7天');
      // 如果查询事件超过7天，则默认查询当天的轨迹
      stime = moment().hours(7).minutes(0).seconds(0).format('YYYYMMDDHHmmss');
      etime = moment().hours(23).minutes(59).seconds(59).format('YYYYMMDDHHmmss');
      this.setState({
        queryTimeValue: {
          stime: moment().hours(7).minutes(0).seconds(0),
          etime: moment().hours(23).minutes(59).seconds(59),
        },
      });
    }

    // 每次查询之前清空图层
    this.onClearMap();

    let userids = [];
    const subUserids = [];
    for (let i = 0; i < this.persons.length; i++) {
      // userids.push(this.persons[i].id);
      const item = this.persons[i].id.toString();
      const position = item.indexOf('_');
      if (position > -1) {
        userids.push(item.substring(0, position))
      } else {
        userids.push(item)
      }
    }
    this.props.dispatch({
      type: 'patrolTrace/queryPatrolPosition',
      data: {
        userIds: userids.join(','),
        startTime: stime,
        endTime: etime,
      },
      callback: (res) => {
        // this.stagnatePointList = [];
        let showTraceClick = false; // 查询之后默认隐藏轨迹播放按钮
        let resultList = res.upList;
        for (let i = 0; i < resultList.length; i++) {
          let length = 0; // 记录人员巡检的里程

          let tmpPerson = {};
          for (let k = 0; k < this.persons.length; k++) {
            if (this.persons[k].attr && (this.persons[k].attr.userid + '') === resultList[i].userid) {
              tmpPerson = this.persons[k].attr;
              tmpPerson.online = this.persons[k].online;
              tmpPerson.mileage = resultList[i].userMileage.mileage;
              tmpPerson.effectiveMileage = resultList[i].userMileage.effectiveMileage;
              break;
            }
            if (this.persons[k].id && (this.persons[k].id + '') === resultList[i].userid) {
              tmpPerson.userid = this.persons[k].id;
              tmpPerson.username = this.persons[k].name;
              tmpPerson.online = this.persons[k].online;
              tmpPerson.mileage = resultList[i].userMileage.mileage;
              tmpPerson.effectiveMileage = resultList[i].userMileage.effectiveMileage;
              break;
            }
          }

          let ltDots = [[]];
          for (let k = 0; k < resultList[i].points.length; k++) {
            let dots = [];
            let forlength = resultList[i].points[k].length;
            ltDots[k] = [];
            for (let j = 0; j < forlength; j++) {
              let id = resultList[i].userid + '_' + k + '_' + j;
              this.showPointMap(resultList[i].points[k][j], tmpPerson, id);
              dots.push({ x: resultList[i].points[k][j].x, y: resultList[i].points[k][j].y });
              ltDots[k].push({ x: resultList[i].points[k][j].lon, y: resultList[i].points[k][j].lat });
            }
            // 画出轨迹线
            let color = '';
            if (i < lineColor.length) {
              color = lineColor[i];
            } else {
              color = lineColor[i % lineColor.length];
            }
            this.showPolylineMap(dots, resultList[i].userid + '_' + k, color, i, k);
          }
          // 计算轨迹长度
          that.state.personTrackInfo.push({ id: tmpPerson.userid, name: tmpPerson.username, online: tmpPerson.online, mileage: tmpPerson.mileage, effectiveMileage: tmpPerson.effectiveMileage });
          that.setState({
            personTrackInfo: that.state.personTrackInfo,
            checkPerson: that.state.personTrackInfo,
          });
          // that.props.map.getPolylineLen(ltDots, (lens, person) => {
          //   const patrollength = parseFloat(lens / 1000).toFixed(3);
          //   that.state.personTrackInfo.push({ id: person.userid, name: person.username, online: person.online, patrollength: patrollength });
          //   that.setState({
          //     personTrackInfo: that.state.personTrackInfo,
          //   });
          // }, tmpPerson);

          // 当查询选中人员之后再查询，默认更新查询信息
          if (this.state.showClickStyleIndex !== '' && resultList[i].userid === that.selectPersonTraceInfo.userid) {
            that.selectPersonTraceInfo = Object.assign({}, resultList[i]);
            if (that.selectPersonTraceInfo.points.length > 0) {
              showTraceClick = true;
            }
          }
          that.selectPersonTraceInfo.online = tmpPerson.online;
          that.selectPersonTraceInfo.username = tmpPerson.name;
          // this.stagnatePointList.push(resultList[i].stagnatePoint);
        }

        // 当当前查询人员只有一个时，默认选中
        if (this.persons.length === 1) {
          that.selectPersonTraceInfo = Object.assign({}, resultList[0]);
          if (that.selectPersonTraceInfo.points.length === 0) {
            showTraceClick = false;
            message.info('未查询到轨迹信息！');
            this.setState({
              showTracePlay: false,
            });
            return
          } else {
            showTraceClick = true;

            // 设置当前时间轨迹播放的时间段
            this.setTimeLine();
          }
          that.selectPersonTraceInfo.online = this.persons[0].online;
          that.selectPersonTraceInfo.username = this.persons[0].name;
          //this.queryStagnatePoints(userids[0]);
        }

        this.setState({
          showTraceClick: showTraceClick
        });
      }
    });


    //调用父组件的传入的方法为父组件提供查询时间
    if(this.props.getQueryTime){
      this.props.getQueryTime({etime,stime});
    }
  }

  setTimeLine = () => {
    let stime = moment(this.selectPersonTraceInfo.points[0][0].time, 'YYYY-MM-DD HH:mm:ss');
    let pointLength = this.selectPersonTraceInfo.points.length;
    let lastpointLength = this.selectPersonTraceInfo.points[pointLength - 1].length;
    let etime = moment(this.selectPersonTraceInfo.points[pointLength - 1][lastpointLength - 1].time, 'YYYY-MM-DD HH:mm:ss');
    this.queryTrackTime = {
      stime: stime,
      etime: etime,
    };

    let etimeStr = etime.format('YYYYMMDDHHmmss');
    let stimeStr = stime.format('YYYYMMDDHHmmss');
    let adddays = moment(stimeStr, 'YYYYMMDDHHmmss').add(1, 'days').format('YYYYMMDDHHmmss');

    let tmpTime = moment(stimeStr, 'YYYYMMDDHHmmss');
    let tmpFormatTime = '';
    let index = 0; // 记录当前时间轴的刻度
    let whileIndex = 0; // 记录当前循环的次数
    let markLine = {};

    let stimeTime = stime.valueOf() / 1000;
    let etimeTime = etime.valueOf() / 1000;

    let markLineMax = parseInt((etimeTime - stimeTime) / 60);

    let intervalLength = Math.ceil(((markLineMax / 60) - 10) / 5) > 0 ? (Math.ceil(((markLineMax / 60) - 10) / 5) + 2) : 2;

    if (etimeStr < adddays) {
      markLine[0] = tmpTime.format('HH:mm');
      let tmpTime2 = moment(stimeStr, 'YYYYMMDDHH').add(1, 'hours');
      let addIndex = (tmpTime2.valueOf() / 1000) - stimeTime;
      if (addIndex > 0) {
        index += addIndex / 60;
        if (index > 10) {
          whileIndex++;
          markLine[index] = '';
        }
        tmpTime = tmpTime2;
      }
      while (etimeStr > tmpFormatTime) {
        tmpTime = tmpTime.add(1, 'hours');
        tmpFormatTime = tmpTime.format('YYYYMMDDHHmmss');
        index += 60;
        if (tmpFormatTime < etimeStr) {
          whileIndex++;
          if ((whileIndex % intervalLength === 0) && (index + 60 * intervalLength / 4) < markLineMax) {
            markLine[index] = tmpTime.format('HH:mm');
          } else {
            markLine[index] = '';
          }
        } else {
          markLine[markLineMax] = etime.format('HH:mm');
        }
      }
    } else {
      markLine[0] = tmpTime.format('DD/HH');
      while (etimeStr > tmpFormatTime) {
        tmpTime = tmpTime.add(1, 'days');
        tmpFormatTime = tmpTime.format('YYYYMMDDHHmmss');
        index += 24 * 60;
        if (tmpFormatTime < etimeStr && (index + (24 * 60 / 2)) < markLineMax) {
          markLine[index] = tmpTime.format('DD/HH');
        } else {
          markLine[markLineMax] = etime.format('DD/HH');
        }
      }
    }

    this.setState({
      markLine: markLine,
      markLineMax: markLineMax,
    });
  }

  formatSliderTime = (value) => {
    let stime = this.queryTrackTime.stime;
    if (!stime) {
      return '';
    }

    let playtime = moment(stime.format('YYYYMMDDHHmmss'), 'YYYYMMDDHHmmss').add(value, 'minutes');
    return playtime.format('MM月DD日 HH:mm');
  }

  onChangeSliderValue = (value) => {
    let that = this;
    clearInterval(this.interval.valobj);
    clearTimeout(this.interval.sliderIndex);
    this.setState({
      markValue: value,
    });

    let stime = moment(this.queryTrackTime.stime.format('YYYY-MM-DD HH:mm:ss'), 'YYYY-MM-DD HH:mm:ss');
    let thisTimeValue = stime.add(value, 'minutes').valueOf();

    let data = this.selectPersonTraceInfo.points;
    let beforeData = data[0][0];
    let beforeIndex = 0;
    let beforeLineIndex = 0;
    let flag = false; // 判断当前是否有匹配到的播放点的信息
    forData: for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        let timeBeforeValue = moment(beforeData.time, 'YYYY-MM-DD HH:mm:ss').valueOf();
        let timeAfterValue = moment(data[i][j].time, 'YYYY-MM-DD HH:mm:ss').valueOf();
        if (thisTimeValue >= timeBeforeValue && thisTimeValue <= timeAfterValue) {
          if (thisTimeValue > (timeAfterValue - timeBeforeValue) / 2) {
            this.interval.index = j;
            this.interval.lineIndex = i;
            this.playPoint = Object.assign({}, data[i][j]);
          } else {
            this.interval.index = beforeIndex;
            this.interval.lineIndex = beforeLineIndex;
            this.playPoint = Object.assign({}, beforeData);
          }
          flag = true;
          break forData;
        }

        beforeIndex = j;
        beforeData = data[i][j];
      }

      beforeLineIndex = i;
    }
    if (flag === false) {
      that.onStopPlayTrace();
      return;
    }

    // 判断是否处于播放状态
    if (!this.state.showpause) {
      this.onPauseTrace();
      let src = '../../images/positionTraceImage/patrol_on.png';
      if (beforeData.online === 0) {
        src = '../../images/positionTraceImage/patrol_off.png';
      }
      // 重新绘制人员位置
      let param = {
        id: 'play_trace_layer',
        layerId: 'play_trace_layer',
        layerIndex: 15,
        src: src,
        width: 30,
        height: 30,
        angle: 0,
        x: beforeData.x,
        y: beforeData.y
      };
      this.props.map.getMapDisplay().image(param);

      let paramtext = {
        id: 'play_trace_layer_text',
        layerId: 'play_trace_layer',
        x: beforeData.x,
        y: beforeData.y,
        offsetX: 0,
        offsetY: 20,
        text: beforeData.username
      }
      this.props.map.getMapDisplay().text(paramtext);
      return;
    } else {
      this.setState({
        showpause: true,
      });
    }

    this.interval.sliderIndex = setTimeout(() => {
      if (that.interval.index === 0 && that.interval.lineIndex === 0) {
        that.playPoint = Object.assign({}, that.selectPersonTraceInfo.points[0][0]);
      }
      that.setInter();
      that.setTimer();
    }, 1000);
  }

  showPointMap = (data, pserson, id) => {
    let that = this;
    if (data.x <= 0 || data.y <= 0) {
      return;
    }
    data.username = pserson.username;
    let param = {
      id: 'show_trace_point_' + id,
      layerId: 'show_trace_point',
      src: '../../images/positionTraceImage/point.png',
      x: data.x,
      y: data.y,
      width: 12,
      height: 12,
      angle: 0,
      attr: data,
      layerIndex: 1001,
      click: (attr) => {
        this.props.map.popup({
          x: attr.attributes.x,
          y: attr.attributes.y,
          info: {
            title: '轨迹点信息',
            content: [{ name: '用户', value: attr.attributes.username },
            { name: '时间', value: attr.attributes.time },
            { name: '速度', value: parseFloat(attr.attributes.speed).toFixed(3) + '公里/时' },
            { name: 'x值', value: attr.attributes.x },
            { name: 'y值', value: attr.attributes.y },
            { name: '经度', value: attr.attributes.lon },
            { name: '纬度', value: attr.attributes.lat },
            { name: '精度', value: parseFloat(attr.attributes.accuracy).toFixed(2) },
            { name: '电量', value: attr.attributes.battery },
            ],
          },
        });
      },
    };
    this.props.map.getMapDisplay().image(param);
  }

  showPolylineMap = (dots, id, color, indexP, indexM) => {
    if (dots.length === 0) {
      return;
    }
    if (indexP === 0 && indexM === 0) {
      this.props.map.centerAt(dots[0]);
    }
    let paramLine = {
      id: `show_trace_line_${id}`,
      layerId: 'show_trace_line',
      layerIndex: 2,
      color: color,
      width: 4,
      dots: dots,
    };
    this.props.map.getMapDisplay().polyline(paramLine);
  }

  onChangetimeSelect = (e) => {
    let selectValue = e.target.value;

    let stime = this.queryTime.stime;
    let etime = this.queryTime.etime;

    if (selectValue === 0) {
      stime = moment((moment().format('YYYY-MM-DD') + ' 07:00:00'), 'YYYY-MM-DD HH:mm:ss');
      etime = moment((moment().format('YYYY-MM-DD') + ' 23:59:59'), 'YYYY-MM-DD HH:mm:ss');
    } else if (selectValue === 1) {
      stime = moment((moment().add(-1, 'days').format('YYYY-MM-DD') + ' 07:00:00'), 'YYYY-MM-DD HH:mm:ss');
      etime = moment((moment().add(-1, 'days').format('YYYY-MM-DD') + ' 23:59:59'), 'YYYY-MM-DD HH:mm:ss');
    }

    this.setState({
      queryTime: selectValue,
      queryTimeValue: {
        stime: stime,
        etime: etime
      },
    });

    this.queryTime = {
      stime: stime,
      etime: etime
    };

    if (selectValue != 2) {
      this.queryPatrolPosition();
    }
  };

  onChangeQuerySTime = (moment, value) => {
    let queryTimeValue = this.state.queryTimeValue;
    queryTimeValue.stime = moment;
    this.queryTime.stime = moment;
    this.setState({
      queryTimeValue: queryTimeValue,
    });
  }

  onChangeQueryETime = (moment, value) => {
    let queryTimeValue = this.state.queryTimeValue;
    queryTimeValue.etime = moment;
    this.queryTime.etime = moment;
    this.setState({
      queryTimeValue: queryTimeValue,
    });
  }

  onShowTracePlayClick = () => {
    let flag = !this.state.showTracePlay;
    this.setState({
      showTracePlay: flag,
    });
  }

  onPauseTrace = () => {
    this.setState({
      showpause: false,
    });
    clearInterval(this.interval.valobj);
  }

  onPlayTrace = () => {
    this.setState({
      showpause: true,
    });
    if (this.interval.index === 0 && this.interval.lineIndex === 0) {
      this.playPoint = Object.assign({}, this.selectPersonTraceInfo.points[0][0]);
    }
    this.setInter();
    this.setTimer();
  }

  setTimer = () => {
    let that = this;
    this.interval.valobj = setInterval(() => {
      //let level = this.props.map.getMapObj().getZoom();
      this.setInter();
    }, that.interval.playtime);
  }

  setInter = () => {
    let data = this.selectPersonTraceInfo;
    let flag = true;
    let sumLength = 0;
    let index = 0; // 记录while循环次数
    while (flag) {
      let i = this.interval.index;
      if (i < data.points[this.interval.lineIndex].length) {
        // 计算点的距离
        let xlength = Math.abs(data.points[this.interval.lineIndex][i].x - this.playPoint.x);
        let ylnegth = Math.abs(data.points[this.interval.lineIndex][i].y - this.playPoint.y);
        let tmpLength = Math.sqrt(xlength * xlength + ylnegth * ylnegth);

        index++;
        sumLength += tmpLength;
        if (sumLength > this.interval.playSpeed) {
          this.playPoint.x = (data.points[this.interval.lineIndex][i].x - this.playPoint.x) * (this.interval.playSpeed / tmpLength) + this.playPoint.x;
          this.playPoint.y = (data.points[this.interval.lineIndex][i].y - this.playPoint.y) * (this.interval.playSpeed / tmpLength) + this.playPoint.y;
          flag = false;
        } else {
          this.playPoint = data.points[this.interval.lineIndex][i];
          this.interval.index++;
          continue;
        }
        let src = '../../images/positionTraceImage/patrol_on.png';
        if (data.online === 0) {
          src = '../../images/positionTraceImage/patrol_off.png';
        }
        let param = {
          id: 'play_trace_layer',
          layerId: 'play_trace_layer',
          layerIndex: 15,
          src: src,
          width: 30,
          height: 30,
          angle: 0,
          x: this.playPoint.x,
          y: this.playPoint.y
        };
        this.props.map.getMapDisplay().image(param);

        let paramtext = {
          id: 'play_trace_layer_text',
          layerId: 'play_trace_layer',
          x: this.playPoint.x,
          y: this.playPoint.y,
          offsetX: 0,
          offsetY: 20,
          text: data.username
        }
        this.props.map.getMapDisplay().text(paramtext);
        if (i === 0) {
          this.props.map.centerAt(paramtext);
        }
        if (this.interval.lineIndex === (data.points.length - 1) && i === data.points[this.interval.lineIndex].length - 1) {
          this.setState({
            showpause: false
          });
        }

        // 设置时间轴的值
        let nextTime = moment(data.points[this.interval.lineIndex][i].time, 'YYYY-MM-DD HH:mm:ss');
        let nowTime = moment(this.playPoint.time, 'YYYY-MM-DD HH:mm:ss');
        let diffTime = (nextTime.valueOf() - nowTime.valueOf()) / 1000;
        let playTime = nowTime.add(diffTime, 'seconds').valueOf();

        let stimeStr = this.queryTrackTime.stime.format('YYYYMMDDHHmmss');
        let stime = moment(stimeStr, 'YYYYMMDDHHmmss').valueOf();

        this.setState({
          markValue: parseInt((playTime - stime) / (1000 * 60)),
        });

      } else {
        if (this.interval.lineIndex === (data.points.length - 1)) {
          this.onStopPlayTrace();
        } else {
          this.interval.lineIndex++;
          this.interval.index = 0;
          this.playPoint = Object.assign({}, this.selectPersonTraceInfo.points[this.interval.lineIndex][0]);
        }
      }
    }
  }

  setIntervalTime = (value) => {
    switch (value) {
      case 0:
        this.interval.playtime = 200;
        this.interval.playSpeed = 20;
        break;
      case 25:
        this.interval.playtime = 100;
        this.interval.playSpeed = 25;
        break;
      case 50:
        this.interval.playtime = 50;
        this.interval.playSpeed = 30;
        break;
      case 75:
        this.interval.playtime = 25;
        this.interval.playSpeed = 40;
        break;
      case 100:
        this.interval.playtime = 10;
        this.interval.playSpeed = 50;
        break;
      default:
        break;
    }
    clearInterval(this.interval.valobj);
    if (this.state.showpause) {
      this.setTimer();
    }
  }

  onStopPlayTrace = () => {
    clearInterval(this.interval.valobj);
    clearTimeout(this.interval.sliderIndex);
    this.interval.index = 0;
    this.interval.lineIndex = 0;
    this.playPoint = Object.assign({}, this.selectPersonTraceInfo.points[0][0]);
    this.props.map.getMapDisplay().removeLayer('play_trace_layer');
    this.props.map.getScale();
    this.setState({
      markValue: 0,
      showpause: false,
    });
  }

  onReplayTrace = () => {
    clearInterval(this.interval.valobj);
    this.interval.index = 0;
    this.interval.lineIndex = 0;
    this.playPoint = Object.assign({}, this.selectPersonTraceInfo.points[0][0]);
    this.setState({
      showpause: true,
      markValue: 0,
    });
    this.setInter();
    this.setTimer();
  }

  onShowDetail = () => {
    this.setState({
      showDetail: true
    });
  }

  onCloseDetailDialog = () => {
    this.setState({
      showDetail: false
    });
  }

  onSelectPeronTrace = (person, index, e) => {
    if (!this.props.queryData || this.props.queryData.length == 0) {
      return;
    }
    let selectTrace = {};
    let points = [];
    for (let i = 0; i < this.props.queryData.length; i++) {
      if (person.id == this.props.queryData[i].userid && this.props.queryData[i].points.length > 0) {
        points = this.props.queryData[i].points;
        selectTrace = this.props.queryData[i];
        this.props.map.centerAt(this.props.queryData[i].points[0][0]);
        break;
      }
    }

    clearInterval(this.interval.valobj);
    this.interval.index = 0;
    if (points.length > 0) {
      this.playPoint = Object.assign({}, points[0]);
      this.selectPersonTraceInfo = selectTrace;
      this.selectPersonTraceInfo.online = person.online;
      this.selectPersonTraceInfo.username = person.name;
      this.setTimeLine(); // 每次选中人员之后重置时间轴
      this.setState({
        // showTraceClick: true,
        showClickStyleIndex: index,
      });
    } else {
      this.setState({
        // showTraceClick: false,
        showClickStyleIndex: index,
      });
    }
  }

  onShowStagnate = () => {
    let queryPerson = this.selectPersonTraceInfo;
    let userid = queryPerson.userid;

    if (this.state.showStagnate) {
      this.queryStagnatePoints(userid);
    } else {
      this.hideStagnatePoints();
    }

    this.setState({
      showStagnate: !this.state.showStagnate
    });
  }

  //  查询停滞点信息
  queryStagnatePoints = (userid) => {
    let stime = this.queryTime.stime.format('YYYYMMDDHHmmss');
    let etime = this.queryTime.etime.format('YYYYMMDDHHmmss');

    this.props.dispatch({
      type: 'patrolTrace/queryStagnatePoints',
      data: {
        userid: userid,
        startTime: stime,
        endTime: etime
      },
      callback: (res) => {
        if (res.data.length === 0) {
          this.setState({
            showStagnate: true
          });
          message.info('未查询到停滞点信息！');
          return;
        }

        for (let i = 0; i < res.data.length; i++) {
          this.showCircleMap(res.data[i]);
        }
      }
    });
  }

  hideStagnatePoints = () => {
    this.props.map.getMapDisplay().removeLayer('show_stagnate_point_layer');
  }

  showCircleMap = (pointInfo) => {
    let parmas = {
      id: 'show_stagnate_point_' + pointInfo.userid,
      layerId: 'show_stagnate_point_layer',
      layerIndex: 10,
      x: pointInfo.cycleCenterX,
      y: pointInfo.cycleCenterY,
      radius: pointInfo.cycleRadius,
      attr: pointInfo,
      click: function (attr) {
        let popupparams = {
          x: attr.attributes.cycleCenterX,
          y: attr.attributes.cycleCenterY,
          info: {
            title: '轨迹点信息',
            content: [
              { name: '轨迹点数', value: attr.attributes.count },
              { name: '聚集半径', value: attr.attributes.cycleRadius + '米' },
              { name: '停滞时长', value: attr.attributes.timeLen + '分钟' },
              { name: '开始时间', value: attr.attributes.startTime },
              { name: '结束时间', value: attr.attributes.endTime }
            ]
          }
        };
        this.props.map.popup(popupparams);
      }
    };
    this.props.map.getMapDisplay().circle(parmas);
  }

  onClosePage = () => {
    this.props.onClose();
  }

  dealPersonData = () => {
    let personsTr = [];
    let persons = this.state.personTrackInfo;
    let imgOff = '../../images/positionTraceImage/patrol_off.png';
    let imgOn = '../../images/positionTraceImage/patrol_on.png';
    let personCheck = (
      <Checkbox.Group style={{ width: '100%' }} onChange={this.onChangeTrajectory} value={this.state.checkPerson}>
        {persons.length > 0 && persons.map((item, index) => {
          let src = imgOff;
          if (item.online === 1) {
            src = imgOn;
          }
    
          let divcolor = '';
          if (index >= lineColor.length) {
            divcolor = lineColor[(index % lineColor.length)];
          } else {
            divcolor = lineColor[index];
          }

          //里程数
          
          let startMileage = Number(item.mileage) > 1000 ? (Number(item.mileage) / 1000).toFixed(2) + '公里' : Number(item.mileage).toFixed(2) + '米';
          let endtMileage = Number(item.effectiveMileage) > 1000 ? (Number(item.effectiveMileage) / 1000).toFixed(2) + '公里' : Number(item.effectiveMileage).toFixed(2) + '米';
          return <Row style={{margin: '3px 6px'}}><Col span={24}>
            <Checkbox value={item}>
              <div style={{ display: 'inline-block' }}>
                <span><img src={src} className={styles.show_traceinfo_img_style} /></span>
                <span style={{ display: 'inline-block', marginTop: '5px' }}>{item.name}</span>
              </div>
              <div style={{  float: 'right', display: 'inline-block' }}>
                <div>
                  {/* <span style={{ float: 'right', marginRight: '20px' }}>公里</span> */}
                  <span style={{ float: 'right', marginRight: '5px' }}>{`巡视里程   ${startMileage}`}</span>
                </div>
                <div>
                  {/* <span style={{ float: 'right', marginRight: '20px' }}>公里</span> */}
                  <span style={{ float: 'right', marginRight: '5px' }}>{`有效里程   ${endtMileage}`}</span>
                </div>
              </div>
          </Checkbox>
          </Col></Row>
        }
        )}
      </Checkbox.Group>
    )
    for (let i = 0; i < persons.length; i++) {
      let src = imgOff;
      if (persons[i].online === 1) {
        src = imgOn;
      }

      let divcolor = '';
      if (i >= lineColor.length) {
        divcolor = lineColor[(i % lineColor.length)];
      } else {
        divcolor = lineColor[i];
      }

      let styleColor = {
        float: 'left',
        marginTop: '5px',
        marginLeft: '15px',
        backgroundColor: divcolor,
        width: '25px',
        height: '8px'
      }
      //里程数
      
      let startMileage = Number(persons[i].mileage) > 1000 ? (Number(persons[i].mileage) / 1000).toFixed(2) + '公里' : Number(persons[i].mileage).toFixed(2) + '米';
      let endtMileage = Number(persons[i].effectiveMileage) > 1000 ? (Number(persons[i].effectiveMileage) / 1000).toFixed(2) + '公里' : Number(persons[i].effectiveMileage).toFixed(2) + '米';
      let tmpTr = (<tr
        className={styles.show_play_trace_tr + ' ' + (this.state.showClickStyleIndex === i ? styles.show_play_trace_tr_selected : '')}
        onClick={this.onSelectPeronTrace.bind(this, persons[i], i)}
        key={persons[i].id}>
        <td style={{ textAlign: 'center' }}>
          {this.props.mark === 'task_detail' ?
            // <Checkbox onChange={this.onChangeTrajectory} defaultChecked={true} /> : null
            <CheckboxGroup options={[{label: '', value: persons[i]}]} defaultValue={[persons[i]]} onChange={this.onChangeTrajectory} /> : null
          }
        </td>
        <td>
          {/*<div style={styleColor}></div>*/}
          <img src={src} className={styles.show_traceinfo_img_style} />
          <span style={{ display: 'inline-block', marginTop: '5px' }}>{persons[i].name}</span>
          <div style={{ display: 'inline-block', float: 'right' }}>
            <div>
              {/* <span style={{ float: 'right', marginRight: '20px' }}>公里</span> */}
              <span style={{ float: 'right', marginRight: '5px' }}>{`巡视里程   ${startMileage}`}</span>
            </div>
            <div>
              {/* <span style={{ float: 'right', marginRight: '20px' }}>公里</span> */}
              <span style={{ float: 'right', marginRight: '5px' }}>{`有效里程   ${endtMileage}`}</span>
            </div>
          </div>
        </td>
      </tr>);


      personsTr.push(tmpTr);
    }

    return personCheck;
  }

  onChangeTrajectory = (person) => {
    console.log(person, 'renyuanguiji')
    this.setState({checkPerson: person})
    if (!this.props.queryData || this.props.queryData.length == 0) {
      return;
    }
    if(person.length >= 2 || person.length === 0){
      this.setState({showTraceClick: false})
    }else{
      this.setState({showTraceClick: true})
    }
    let selectTrace = {};
    let points = [];
    this.onClearMap();
    for (let i = 0; i < this.props.queryData.length; i++) {
      for(let j = 0; j < person.length; j++){
        if (person[j].id == this.props.queryData[i].userid && this.props.queryData[i].points.length > 0) {
          this.onSelectPeronTrace(person[j], j)
          let tmpPerson = {
            online: person[j].online,
            mileage: person[j].mileage,
            effectiveMileage: person[j].effectiveMileage,
            userid: person[j].id,
            username: person[j].name,
          };
          points = this.props.queryData[i].points;
          let ltDots = [[]];
          for (let k = 0; k < points.length; k++) {
            let dots = [];
            let forlength = points[k].length;
            ltDots[k] = [];
            for (let m = 0; m < forlength; m++) {
              let id = points[k][m].userid+ '_' + k + '_' + m;
              this.showPointMap(points[k][m], tmpPerson, id);
              dots.push({ x: points[k][m].x, y: points[k][m].y });
              ltDots[k].push({ x: points[k][m].lon, y: points[k][m].lat });
            }
            // 画出轨迹线
            let color = '';
            if (j < lineColor.length) {
              color = lineColor[j];
            } else {
              color = lineColor[j % lineColor.length];
            }
            this.showPolylineMap(dots, person[j].id + '_' + k, color, i, k);
          }
        }

      }
    }


    // if (val) {
    //   this.queryPatrolPosition();
    // } else {
    //   this.onClearMap();
    // }
  }

  // 获取轨迹报表导出url
  getExcelUrl = () => {
    let stime = this.queryTime.stime.format('YYYYMMDDHHmmss');
    let etime = this.queryTime.etime.format('YYYYMMDDHHmmss');

    let params = {
      userIds: this.selectPersonTraceInfo.userid,
      startTime: stime,
      endTime: etime,
      token: getCurrTk(),
    };
    let url = window.location.origin + `/proxy/position/trajectoryExportExcel?${stringify(params)}`;
    return url;
  }

  render() {
    let showPointTable = [];
    for (let i = 0; i < this.selectPersonTraceInfo.points.length; i++) {
      showPointTable = showPointTable.concat(this.selectPersonTraceInfo.points[i]);
    }

    const dialogComp = this.state.showDetail ?
      <Dialog width={900} height={500} title="轨迹详情"
        onClose={this.onCloseDetailDialog}>
        <div><a href={this.getExcelUrl()}>导出</a></div>
        <Table
          columns={showTraceDetailListColumns}
          dataSource={showPointTable}
          pagination={{
            showTotal: (total, range) => `共 ${total} 条数据`,
            showSizeChanger: true,
            showQuickJumper: true
          }}
          scroll={{ x: 760, y: 400 }}
          size="small"
          bordered
        />
      </Dialog> : null;

    let trData = this.dealPersonData();

    return (
      <div>
        <Dialog
          title="历史轨迹"
          onClose={this.onClosePage}
          width={350}
          height={435}
          position={{
            left: 10,
            top: 10,
          }}
        >
          <div className={styles.show_traceinfo_personlist_div}>
            {/* <table className={styles.show_traceinfo_personlist_table}>
              <tbody>
                {trData}
              </tbody>
            </table> */}
            {trData}
          </div>
          <hr />
          <div style={{ height: 115, width: 280, marginLeft: '10px', marginTop: '5px' }}>
            <div>
              <span style={{ marginRight: '10px' }}>日期选择:</span>
              <Radio.Group onChange={this.onChangetimeSelect} value={this.state.queryTime}>
                <Radio.Button value={0}>今日</Radio.Button>
                <Radio.Button value={1}>昨日</Radio.Button>
                <Radio.Button value={2}>自定义</Radio.Button>
              </Radio.Group>
            </div>
            <div style={{ marginTop: '5px', marginRight: '10px' }}>
              <span style={{ marginRight: '10px' }}>开始时间:</span>
              <DatePicker
                value={this.state.queryTimeValue.stime}
                onChange={this.onChangeQuerySTime}
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: 192 }} />
            </div>
            <div style={{ marginTop: '5px', marginRight: '10px' }}>
              <span style={{ marginRight: '10px' }}>结束时间:</span>
              <DatePicker
                value={this.state.queryTimeValue.etime}
                onChange={this.onChangeQueryETime}
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: 192 }} />
              <div style={{ float: 'right', marginRight: '-60px' }}>
                <Button onClick={this.queryPatrolPosition} >确定</Button>
              </div>
            </div>
          </div>
          {this.state.showTraceClick ?
            <div>
              <div style={{ marginTop: '5px', height: 25 }}>
                <span className={styles.trace_play_and_showlist_sapn} onClick={this.onShowTracePlayClick}>轨迹回放</span>
                <a style={{ float: 'right', marginRight: '10px' }} href="javascript:void(0)"
                  onClick={this.onShowDetail}>详情</a>
                <a style={{ float: 'right', marginRight: '10px' }}
                  href="javascript:void(0)" onClick={this.onShowStagnate}>
                  <span
                    className={this.state.showStagnate ? styles.show_div_css_style : styles.hide_div_css_style}>显示停滞点</span>
                  <span
                    className={!this.state.showStagnate ? styles.show_div_css_style : styles.hide_div_css_style}>隐藏停滞点</span>
                </a>
              </div>
              <div
                className={(this.state.showTracePlay ? styles.show_div_css_style : styles.hide_div_css_style) + ' ' + styles.show_play_trace_div}>
                <Slider
                  style={{ marginLeft: '40px', width: '250px' }}
                  marks={this.state.markLine}
                  max={this.state.markLineMax}
                  min={0}
                  dots={false}
                  value={this.state.markValue}
                  onChange={this.onChangeSliderValue.bind(this)}
                  tipFormatter={this.formatSliderTime.bind(this)}
                />
                <img src="../../images/positionTraceImage/bpause.png" title="暂停"
                  style={{ marginTop: '10px' }}
                  className={this.state.showpause ? styles.show_div_css_style : styles.hide_div_css_style}
                  onClick={this.onPauseTrace.bind(this)} />
                <img src="../../images/positionTraceImage/bplay.png" title="播放"
                  style={{ marginTop: '10px' }}
                  className={!this.state.showpause ? styles.show_div_css_style : styles.hide_div_css_style}
                  onClick={this.onPlayTrace.bind(this)} />
                <img style={{ marginTop: '10px' }} src="../../images/positionTraceImage/bstop.png"
                  onClick={this.onStopPlayTrace.bind(this)} title="停止" />
                <img style={{ marginTop: '10px' }} src="../../images/positionTraceImage/breplay.png"
                  onClick={this.onReplayTrace.bind(this)} title="重放" />
                <div style={{ float: 'right', width: '150px', marginRight: '10px' }}>
                  <Slider marks={{ 0: '慢', 25: '较慢', 50: '一般', 75: '较快', 100: '快' }}
                    step={null} defaultValue={50}
                    tipFormatter={null}
                    onChange={this.setIntervalTime.bind(this)} />
                </div>
              </div>
            </div> : null
          }
        </Dialog>
        {dialogComp}
      </div>
    );
  }
}

export default TraceInfo;

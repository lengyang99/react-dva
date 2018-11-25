import React from 'react';
import {connect} from 'dva';
import {AutoComplete, Input, Button, Icon} from 'antd';
import styles from '../css/emerTop.css';

let currentTimer = -1;
let region = '';
const output = 'json';
const ak = 'YNHIyHSShx4Q4MBwQLfh2Lb8HUBo9chm';

@connect(state => ({
  user: state.login.user,
  map: state.emerLfMap.map, // 地图
}))

export default class EmerTop extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTime: '',
      dataSource: [],
      weather: [],
    };
  }

  componentDidMount = () => {
    currentTimer = setInterval(this.handleGetCurrentTime, 1000);
    region = `${this.props.user.company.substring(0, 2)}市`;
  }

  componentWillUnmount = () => {
    clearInterval(currentTimer);
    this.setState = (state, callback) => {};
  }

  // 修正时间
  handleFixTheTime = (t) => {
    let time = t;
    if (t >= 0 && t <= 9) {
      time = `0${t}`;
    }
    return time;
  }

  // 获取天气
  handleWeather = () => {
    let data = {};
    // let date = new Date();
    // let month = this.handleFixTheTime(date.getMonth() + 1);
    // let strDate = this.handleFixTheTime(date.getDate());
    // data.countyId = '54515';
    // data.data = date.getFullYear() + '' + month + '' + strDate;
    data.county = this.props.user.company.substring(0, 2);
    this.props.dispatch({
      type: 'emer/getWeatherInfo',
      payload: data,
      callback: (res) => {
        this.setState({
          weather: res.data[0].day0.split('&'),
        });
      },
    });
  }


  // 获取当前时间
  handleGetCurrentTime = () => {
    let date = new Date();
    let month = this.handleFixTheTime(date.getMonth() + 1);
    let strDate = this.handleFixTheTime(date.getDate());
    let hour = this.handleFixTheTime(date.getHours());
    let minutes = this.handleFixTheTime(date.getMinutes());
    let second = this.handleFixTheTime(date.getSeconds());
    let currentdate = `${date.getFullYear()}年${month}月${strDate}日${hour}:${minutes}:${second}`;
    this.setState({
      currentTime: currentdate,
    });
  }

  // 地点检索,初始化自动补全提示
  searchByLocation = (value) => {
    this.props.dispatch({
      type: 'emer/searchByLocation',
      payload: {query: value, output, ak, region},
      callback: (res) => {
        let results = res.results;
        this.setState({dataSource: (res.results || []).map((r) => r.name + (r.address ? (`(${r.address})`) : ''))});
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

  render = () => {
    return (
      <div id={styles.top}>
        <img alt="logo-normal" src="../../images/emer/logo-normal.png" />
        <span id={styles.info}>
          <span style={{paddingRight: 30}}>
            <AutoComplete
              className="global-search"
              dataSource={this.state.dataSource}
              style={{width: 300}}
              onChange={this.searchByLocation}
              onSelect={this.onSelect}
              placeholder="请输入地址"
            >
              <Input
                id="searchInfo"
                suffix={<Button
                  onClick={this.search}
                  className="search-btn"
                  style={{
                    width: 45,
                    height: 20,
                    border: 'none',
                    marginRight: -10,
                  }}
                  type="default"
                >
                  <Icon type="search" />
                </Button>}
              />
            </AutoComplete>
          </span>
          <span id={styles.date}>{this.state.currentTime}</span>
          <span>{this.state.weather[2]}&nbsp;&nbsp;&nbsp;{this.state.weather[3]}&nbsp;&nbsp;微风</span>
          <span style={{padding: '0 19px'}}>
            <img alt="收缩" onClick={this.props.handleShowRightNav} style={{cursor: 'pointer'}} src="../../images/emer/收缩.png" />
          </span>
        </span>
      </div>
    );
  }
}

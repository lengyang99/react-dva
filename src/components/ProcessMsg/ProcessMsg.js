import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styless from './ProcessMsg.less'

/**
 * 顶部进度信息展示
 */
export default class ProcessMsg extends Component {
  constructor(props) {
    super(props);
    this.prevDatas = [];
  }

  componentDidUnmount() {
    this.prevDatas = [];
  }

  clickdown = (event) => {
    let obig = document.getElementById("big");
    let osmall = document.getElementById("small");
    let e = event || window.event;
    /*用于保存小的div拖拽前的坐标*/
    osmall.startX = e.clientX - osmall.offsetLeft;
    /*鼠标的移动事件*/
    document.onmousemove = function(event) {
      let e = event || window.event;
      osmall.style.left = e.clientX - osmall.startX + "px";
      /*对于大的DIV四个边界的判断*/
      if (e.clientX - osmall.startX >= 0) {
        osmall.style.left = 0 + "px";
      }
      if (e.clientX - osmall.startX <= obig.offsetWidth - osmall.offsetWidth) {
        osmall.style.left = obig.offsetWidth - osmall.offsetWidth + "px";
      }
    };
    /*鼠标的抬起事件,终止拖动*/
    document.onmouseup = function() {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };

  handleDatas = (datas, boolField, boolValue) => {
    if (datas.length === 0) {
      return;
    }
    datas.reduce((acc,val,i) => {
      datas[i].processLength = acc;
      return acc + val.process.length * 16 + 27;
    },0);
    if (this.prevDatas.length === 0) {
      this.prevDatas = datas;
    } else {
      for (let i = 0; i < this.prevDatas.length; i += 1) {
        if(!this.handleStatus(this.prevDatas[i], boolField, boolValue) &&
          this.handleStatus(datas[i], boolField, boolValue)){
          let bigLength = parseInt(document.getElementById('big').style.width, 10);
          let smallLength = parseInt(document.getElementById('small').style.width, 10);
          if(datas[i].processLength < bigLength/2){
            document.getElementById('small').style.left = '0px';
          } else if (datas[i].processLength > smallLength - bigLength) {
            document.getElementById('small').style.left = '-200px';
          } else {
            document.getElementById('small').style.left = `-${datas[i].processLength + 175}px`;
          }
          this.prevDatas = datas;
        }
      }
    }
    // document.getElementById('small').style.paddingLeft = `-${e.processLength}px`;
  };

  handleStatus = (v, boolField, boolValue) => {
    let status = '';
    if (typeof(v[boolField]) === 'boolean') {
      status = v[boolField];
    } else {
      if(typeof(boolValue) === 'undefined'){
        status = !!v[boolField];
      } else {
        status = v[boolField] === boolValue;
      }
    }
    return status;
  };

  render() {
    const { width, datas, boolField, boolValue, msgField} = this.props;
    const newDatas = this.handleDatas(datas, boolField, boolValue);
    const datasDivs = datas.map((v, i) => {
      let imageUrl = this.handleStatus(v, boolField, boolValue) ? './images/绿点.png' : './images/红点.png';
      return (<span key={i} style={{color: '#fff'}}>
      <img style={{margin: '2px 4px 0 15px'}} src={imageUrl}/>
        {v[msgField]}
      </span>)
    });
    return (
      <div id="big" className={styless.ParentDiv} style={{width: width}}>
        <div id="small" className={styless.ChildrenDiv} style={{width: 1550}} onMouseDown={this.clickdown}>
          {datasDivs}
        </div>
      </div>
    );
  }

  static propTypes = {
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // 组件的宽度
    datas: PropTypes.array, // 数据
    boolField: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]), // 判断状态的字段
    boolValue: PropTypes.string, // 判断字段的值
    msgField: PropTypes.string, // 用于展示的字段
  };

  static defaultProps = {
    width: '100%',
    datas: [],
  };
}

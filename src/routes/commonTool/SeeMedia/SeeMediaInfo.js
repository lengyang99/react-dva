/**
 * Created by hexi on 2017/11/28.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import QueryMediaInfo from './QueryMediaInfo.js';

export default class SeeMediaInfo extends Component {

  constructor(props) {
    super(props);

    let showAttBtn = true;
    let attactInfo = this.props.attactInfo;
    let attUid = '';
    let attData = [];

    if (typeof attactInfo === 'object') {
      attData = attactInfo;
    } else {
      // 转换服务返回数组字符串的可能
      try {
        attData = JSON.parse(attactInfo);
      } catch (e) {
        attUid = attactInfo;
      }
    }

    if (attUid === '' && attData.length === 0) {
      showAttBtn = false;
    }
    this.state = {
      showAttInfo: false,
      showAttBtn: showAttBtn,
      attUid: attUid,
      attData: attData,
    };
  }

  componentWillReceiveProps(nextProps, nextState) {
    let attactInfo = nextProps.attactInfo;
    let attUid = '';
    let attData = [];

    if (typeof attactInfo === 'object') {
      attData = attactInfo;
    } else {
      // 转换服务返回数组字符串的可能
      try {
        attData = JSON.parse(attactInfo);
      } catch (e) {
        attUid = attactInfo;
      }
    }

    let showAttBtn = true;
    if (attUid === '' && attData.length === 0) {
      showAttBtn = false;
    }
    this.setState({
      showAttBtn: showAttBtn,
      attUid: attUid,
      attData: attData,
    });
  }

  onCloseMediaInfo = () => {
    this.setState({
      showAttInfo: false,
    });
  }

  showAttachInfo = () => {
    this.setState({
      showAttInfo: true,
    });
  }

  render() {
    let attNum = this.state.attUid.split(',').length;
    let attNumInfo = this.state.showAttBtn ? <span>附件个数:{attNum}</span> : null;
    let showAttBtn = this.state.showAttBtn ? <Button style={{marginLeft: '10px'}} onClick={this.showAttachInfo}>查看附件</Button> : null;
    let seemedia = this.state.showAttInfo ? <QueryMediaInfo attactInfo={this.state.attUid} attactData={this.state.attData} onClose={this.onCloseMediaInfo} /> : null;
    return (
      <div style={{marginTop: '-5px'}}>
        {attNumInfo}
        {showAttBtn}
        <div>
          {seemedia}
        </div>
      </div>
    );
  }
}

SeeMediaInfo.propTypes = {
  attactInfo: PropTypes.oneOfType([PropTypes.string, PropTypes.array])
};

//调用该组件功能时需在nav.js引入models下的seeMedia

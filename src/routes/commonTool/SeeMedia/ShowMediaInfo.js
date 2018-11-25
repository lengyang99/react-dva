/**
 * Created by hexi on 2017/11/28.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import SeeMedia from '../../../components/SeeMedia/SeeMedia.js';
import { getCurrTk } from '../../../utils/utils.js';
import QueryMediaInfo from './QueryMediaInfo.js';

export default class SeeMediaInfo extends Component {
  constructor(props) {
    super(props);

    let showAttBtn = true;
    const attactInfo = this.props.attactInfo;
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
    this.attachList = [];
    this.state = {
      showAttInfo: false,
      showAttBtn,
      attUid,
      attData,
    };
    this.indexShow = '';
    this.getAttInfo(attUid, attData);
  }

  componentWillUnmount() {
  }
  // componentWillReceiveProps(nextProps, nextState) {
  //   let showAttBtn = true;
  //   let attactInfo = nextProps.attactInfo;
  //   let attUid = '';
  //   let attData = [];

  //   if (typeof attactInfo === 'object') {
  //     attData = attactInfo;
  //   } else {
  //     // 转换服务返回数组字符串的可能
  //     try {
  //       attData = JSON.parse(attactInfo);
  //     } catch (e) {
  //       attUid = attactInfo;
  //     }
  //   }

  //   if (attUid === '' && attData.length === 0) {
  //     showAttBtn = false;
  //   }
  //   this.setState({
  //     showAttBtn,
  //     attUid,
  //     attData,
  //   });
  //   this.indexShow = '';
  //   this.getAttInfo(attUid, attData);
  // }

  getAttInfo = (aInfo, aData) => {
    const attUid = aInfo;
    const attactData = aData;
    const resultData = [];
    if (attUid !== '') {
      for (const elem of attUid.split(',').values()) {
        resultData.push(`${window.location.origin}/proxy/attach/downloadFile?id=${elem}&token=${getCurrTk()}`);
      }
    } else {
      for (let i = 0; i < attactData.length; i++) {
        resultData.push({
          name: attactData[i].fileName,
          type: attactData[i].fileName.split('.')[1],
          url: attactData[i].fileUrl,
        });
      }
    }
    this.attachList = resultData;
  }

  onCloseMediaInfo = () => {
    this.indexShow = '';
    this.setState({
      showAttInfo: false,
    });
  }

  showAttachInfo = (indexShow) => {
    this.indexShow = indexShow;
    this.setState({
      showAttInfo: true,
    });
  }

  render() {
    let attachList = [];
    if (this.attachList.length > 0) {
      attachList = this.attachList;
    }
    let attNumInfo = null;
    let attImgInfo = null;
    let showAttBtn = null;
    if (this.props.type === 'IMG') {
      attImgInfo = attachList.map((item, index) => {
        return this.state.showAttBtn ? <img src={item} onClick={this.showAttachInfo.bind(this, index)} style={{ width: '65px', height: '65px', cursor: 'pointer', marginLeft: '3px' }} alt="非图片资源" /> : null;
      });
    } else {
      attNumInfo = this.state.showAttBtn ? <span>附件个数:{attachList.length}</span> : null;
      showAttBtn = this.state.showAttBtn ? <Button style={{ marginLeft: '10px' }} onClick={this.showAttachInfo.bind(this, 0)}>查看附件</Button> : null;
    }
    const seemedia = this.state.showAttInfo ? <QueryMediaInfo indexShow={this.indexShow} attactInfo={this.state.attUid} attactData={this.state.attData} onClose={this.onCloseMediaInfo} /> : null;
    return (
      <div style={{ display: 'inline-block' }}>
        {attImgInfo}
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
// 调用该组件功能时需在nav.js引入models下的seeMedia

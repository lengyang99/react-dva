/**
 * Created by hexi on 2017/11/28.
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import {getCurrTk} from '../../../utils/utils.js';
import SeeMedia from '../../../components/SeeMedia/SeeMedia.js';

@connect(state => ({
  attachInfoQuery: state.seeMedia.attachInfoQuery,
}))

export default class QueryMediaInfo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      attachList: [],
    };
    this.getAttInfo();
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'seeMedia/resetState',
      payload: {
        attachInfoQuery: [],
      },
    });
  }

  getAttInfo = () => {
    let attUid = this.props.attactInfo;
    let attactData = this.props.attactData;
    let token = getCurrTk();

    if (attUid !== '') {
      this.props.dispatch({
        type: 'seeMedia/getAttachInfo',
        payload: {
          ids: attUid,
          token: token,
        },
      });
    } else {
      let resultData = [];
      for (let i = 0; i < attactData.length; i++) {
        resultData.push({
          name: attactData[i].fileName,
          type: attactData[i].fileName.split('.')[1],
          url: attactData[i].fileUrl,
        });
      }
      this.setState({
        attachList: resultData,
      });
    }
  }

  render() {
    let attachList = [];
    if (this.props.attachInfoQuery.length > 0) {
      attachList = this.props.attachInfoQuery;
    }
    if (this.state.attachList.length > 0) {
      attachList = this.props.attachList;
    }
    return (
      <SeeMedia indexShow={this.props.indexShow} attaches={attachList} onClose={this.props.onClose} />
    );
  }
}

QueryMediaInfo.propTypes = {
  attactInfo: PropTypes.string,
  attactData: PropTypes.array,
  onClose: PropTypes.func,
};

// 调用该组件功能时需在nav.js引入models下的seeMedia


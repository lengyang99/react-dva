/**
 * Created by hexi on 2018/4/12.
 */
import React, { PureComponent } from 'react';
import { message } from 'antd';
import request from '../../../utils/request';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import PropTypes from 'prop-types';
// import styles from './index.less';
import EsriMap from '../EsriMap';
import MapSearcher from '../MapSearcher';
import MapToolbar from '../MapToolbar';
import QueryResult from '../QueryResult';
import Coordinate from '../Coordinate';
import ThematicStatistics from '../ThematicStatistics';
import MapSwitcher from '../MapSwitcher';
import SeeMedia from '../../../routes/commonTool/SeeMedia/QueryMediaInfo';

@connect(state => ({
}))

export default class ThematicContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      seeMedia: false,
      attachInfo: '',
      params: {
      },
    };
    this.closeMedia = this.closeMedia.bind(this);

    window.seeMedia = this.seeMedia;
    window.seeWoDetail = this.seeWoDetail;
    window.LinkOrderList = this.LinkOrderList;
  }

  seeMedia = (attach) => {
    if (attach.attach) {
      const res = attach.attach.split(',').some((item) => {
        return item !== '';
      });
      if (res) {
        this.setState({
          seeMedia: true,
          attachInfo: attach.attach,
        });
      } else {
        message.info('未上传照片！');
      }
    } else {
      message.info('未上传照片！');
    }
  }

  closeMedia = () => {
    this.setState({
      seeMedia: false,
    });
  }
  LinkOrderList = (params) => {
    let path = {
      pathname: '/order/workOrder-list-detail',
      processInstanceId: params.processInstancedId,
      formid: params.formid,
      workOrderNum: params.eventid,
      params: this.state.params,
      boolea: true,
      historyPageName: '/third-workOrder-list',
    };
    this.props.dispatch(routerRedux.push(path));
  }
  seeWoDetail = (params) => {
    let eventId = params.eventid;
    request(`/proxy/event/getEventAllTypeList?ext=${eventId}&ishistoryreport=-1`, {
      method: 'get',
      dataType: 'json',
      headers: {
        'Content-Type': 'application/text;charset=UTF-8',
      },
    }).then((res) => {
      // if (!res.success) {
      //   message.info(res.msg);
      //   return;
      // }
      // if (res.total === 0) {
      //   return;
      // }
      let eventInfo = {};
      for (let i = 0; i < res.total; i++) {
        if (res.eventlist[i].eventid === eventId) {
          eventInfo = res.eventlist[i];
          break;
        }
      }
      if (eventInfo.processinstanceid) {
        let path = {
          pathname: '/order/workOrder-list-detail',
          processInstanceId: eventInfo.processinstanceid,
          formid: eventInfo.formid,
          workOrderNum: eventInfo.wocode,
          params: this.state.params,
        };
        this.props.dispatch(routerRedux.push(path));
      } else {
        let path = {
          pathname: '/event-list-detail',
          eventid: eventInfo.eventid,
          eventtype: eventInfo.typeid,
          params: this.state.params,
        };
        this.props.dispatch(routerRedux.push(path));
      }
    });
  }

  render() {
    return (
      <div>
        {this.state.seeMedia ? <SeeMedia onClose={this.closeMedia} attactInfo={this.state.attachInfo} /> : null}
      </div>
    );
  }
}

ThematicContainer.propTypes = {};

ThematicContainer.defaultProps = {};

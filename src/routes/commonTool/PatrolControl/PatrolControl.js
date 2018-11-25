/**
 * Created by hexi on 2018/7/17.
 */
// 东莞日常监管界面
import React from 'react';
import {connect} from 'dva';
import {routerRedux, Link} from 'dva/router';
import PropTypes from 'prop-types';
import {Modal, Button, Spin, Select, Input, Icon, DatePicker, Dropdown, Menu, message, Tooltip, Table } from 'antd';
import styles from './index.less';

@connect(state => ({
}))
export default class PatrolControl extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      detailInfo: null,
      showDetail: false,
      gid: '',
    };
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  componentWillReceiveProps(newProps) {
    if (newProps.refreshIndex != this.props.refreshIndex) {
      if (this.state.gid) {
        this.getApproiseDetail(this.state.gid);
      }
    }
  }

  getApproiseDetail = (gid) => {
    this.props.dispatch({
      type: 'workOrder/getApproiseDetail',
      payload: {gid: gid},
      callback: (res) => {
        this.setState({
          detailInfo: res,
        });
      },
    });
  }

  dealData = () => {
    const {patrol, control, controlNames, patrolNames} = this.props.data;
    if (!patrol || !control) {
      return {
        patrolName: '',
        controlName: '',
        patrol: [],
        control: [],
      };
    }
    const patrolData = [];
    const controlData = [];
    patrol.features.forEach((item) => {
      patrolData.push(item.attributes);
    });
    control.features.forEach((item) => {
      controlData.push(item.attributes);
    });
    return {
      patrolName: patrolNames,
      controlName: controlNames,
      patrol: patrolData,
      control: controlData,
    };
  }

  showDetail = (gid) => {
    this.getApproiseDetail(gid);
    this.setState({
      showDetail: true,
      gid: gid,
    });
  }

  back = () => {
    this.setState({
      showDetail: false,
      gid: '',
    });
  }

  render() {
    const { patrol, control, patrolName, controlName } = this.dealData();
    const cols = [
      {
        title: '序号',
        dataIndex: 'index',
        key: 'address',
        render: (text, record, index) => {
          return <span>{index+1}</span>;
        },
      },
      {
        title: '施工进度',
        dataIndex: 'sg_process',
        key: 'sg_process',
      },
      // {
      //   title: '施工是否正常',
      //   width: 140,
      //   fixed: 'left',
      //   dataIndex: 'eventid',
      //   key: 'eventid',
      // },
      {
        title: '施工点与管道距离(m)',
        dataIndex: 'sg_distance',
        key: 'sg_distance',
      },
      {
        title: '施工动态',
        dataIndex: 'sg_dynamic',
        key: 'sg_dynamic',
      },
      {
        title: '上报人',
        dataIndex: 'create_userid',
        key: 'create_userid',
      },
      {
        title: '上报时间',
        dataIndex: 'create_time',
        key: 'create_time',
      },
      {
        title: '操作',
        dataIndex: 'opt',
        render: (text, record) => {
          return <Button onClick={this.showDetail.bind(this, record.gid)}>详情</Button>;
        },
      },
    ];
    if (this.props.showApproise) {
      cols.push({
        title: '领导评价',
        dataIndex: 'approise',
        render: (text, record) => {
          return <Button onClick={this.props.approiseBtn.click.bind(this, record.gid)}>评价</Button>;
        },
      });
    }
    return (
      <div>
        {!this.state.showDetail ?
          <div>
            <div>
              <span>巡视日报-{patrolName}</span>
            </div>
            <Table
              style={{ width: '100%' }}
              rowKey={(record, text, index) => index}
              dataSource={patrol}
              columns={cols}
            />
            <div>
              <span>管控日报-{controlName}</span>
            </div>
            <Table
              style={{ width: '100%' }}
              rowKey={(record, text, index) => index}
              dataSource={control}
              columns={cols}
            />
          </div> : null }
        {this.state.showDetail ? <div>
          <div><a href="javascript:void(0);" style={{ float: 'right', marginRight: '100px', textDecoration: 'none' }} onClick={this.back.bind(this)}>返回</a></div>
          {this.state.detailInfo ? this.props.showApproiseDetail(this.state.detailInfo, true) : null}
        </div> : null}
      </div>
    );
  }
}


PatrolControl.propTypes = {
  data: PropTypes.object,
  showApproise: PropTypes.bool,
  showApproiseClick: PropTypes.func,
  showApproiseDetail: PropTypes.func,
  refreshIndex: PropTypes.string,
};

PatrolControl.defaultProps = {
  data: {},
  showApproise: false,
  showApproiseClick: () => {},
  showApproiseDetail: PropTypes.func,
  refreshIndex: PropTypes.string,
}


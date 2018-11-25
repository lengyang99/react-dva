import React, { PureComponent } from 'react';
import { Tabs } from 'antd';
import { connect } from 'dva';
import {routerRedux} from 'dva/router';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import TaskDetaile from './TaskDetaile';
import Picking from './Picking';
import Purchase from './Purchase';
import PickingDetaile from './PickingDetaile';

const TabPane = Tabs.TabPane;
@connect(({ device, login }) => ({
  userInfo: login.user,
  detailinfo: device.detailinfo,
  formData: device.formData,
  mtInfo: device.mtInfo,
  placeInfo: device.placeInfo,
  materialInfo: device.materialInfo,
  mlDetaile: device.mlDetaile,

}))
class TaskDetaileTab extends PureComponent {
  constructor(props) {
    super(props);
    this.pathVariable = this.props.location;
    if (this.pathVariable.data) {
      localStorage.setItem('taskDetaile', JSON.stringify(this.pathVariable));
    } else {
      this.pathVariable = JSON.parse(localStorage.getItem('taskDetaile'));
    }
    this.initParams();
  }
    needFeed=false;// 是否反馈领料
    componentDidMount() {
      const { dispatch, mtInfo, placeInfo} = this.props;
      if (mtInfo && mtInfo.length === 0) {
        dispatch({
          type: 'device/queryMtInfo',
        });
      }
      if (placeInfo && placeInfo.length === 0) {
        dispatch({
          type: 'device/queryPlaceInfo',
        });
      }
    }
    // 根据工单号查询领料反馈信息
    queryMaterialDetaile=() => {
      this.props.dispatch({
        type: 'device/queryMaterialDetaile',
        payload: { workOrderNum: `WEMPF_${this.taskId}` },
        callback: (data) => {
          // 是否反馈
          this.needFeed = this.pathVariable.data.action !== 'read' || (data && data.length) === 0;
        },
      });
    }
    // 查询任务详情
    getDetailInfo=() => {
      this.props.dispatch({
        type: 'device/getDetailinfo',
        payload: { taskId: this.pathVariable.data.taskId, userId: this.props.userInfo.gid },
      });
    }
    // 初始化查询任务信息、领料反馈信息、
    initParams = () => {
      this.queryMaterialDetaile();
      this.getDetailInfo();
    }
    // 返回信息
    handleBack = () => {
      this.props.dispatch(routerRedux.push(this.pathVariable.historyPageName));
    }
    render() {
      return (
        <PageHeaderLayout showBack={this.handleBack}>
          <Tabs
            defaultActiveKey="taskDetails"
          >
            <TabPane
              tab="任务详情"
              key="taskDetails"
            >
              {Object.keys(this.props.detailinfo).length !== 0 ? <TaskDetaile
                {...this.props}
                columnsType={1}
                handleBack={this.handleBack}
              /> : null }
            </TabPane>
            {!this.needFeed ?
              <TabPane
                tab="领料"
                key="picking"
              >
                <PickingDetaile
                  {...this.props}
                  handleBack={this.handleBack}
                />
              </TabPane>
                :
              <TabPane
                tab="领料"
                key="picking"
              >
                <Picking
                  {...this.props}
                  taskId={this.pathVariable.data.taskId}
                />
              </TabPane>
                }
            <TabPane
              tab="采购订单"
              key="purchase"
            >
              <Purchase taskId={this.pathVariable.data.taskId} placeInfo={this.props.placeInfo} />
            </TabPane>
          </Tabs>
        </PageHeaderLayout>
      );
    }
}
export default TaskDetaileTab;

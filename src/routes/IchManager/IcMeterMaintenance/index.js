import React, { Component } from 'react';
import { Button, Tabs, Icon} from 'antd';
import { connect } from 'dva';
import styles from '../../Device/DeviceMaintenance/index.less';
import WithFunctionGroup from '../../Device/DeviceMaintenance/WithFunctionGroup';
import SearchPanel from '../../Device/DeviceMaintenance/SearchPanel';
import TablePlan from '../../Device/DeviceMaintenance/TablePlan';
import UploadModal from '../../Device/DeviceMaintenance/UploadModal';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

const TabPane = Tabs.TabPane;

@connect(({ device, login}) => ({
  user: login.user, // 用户登录信息
  vaLoading: device.vaLoading, // 导入前验证格式
  impLoading: device.impLoading, // 导入计划验证
  planTotal: device.planTotal, // 计划总数
  paginations: device.paginations, // 计划分页
  functionData: device.functionData, // 作业类型列表(二级)
  planData: device.planData, // 计划列表
  stationData: device.stationData, // 所属站点列表(一级)
  stationList: device.stationList, // 站点列表 二级
  activeKey: device.activeKey, // 计划tab页key
  functionKey: device.functionKey, // 作业类型key
  funcList: device.funcList, // 作业类型对象
  searchPlanParams: device.searchPlanParams, // 搜索條件
}))
@WithFunctionGroup('household')
export default class IcMeterMaintenance extends Component {
  modal = null;
  // 是否显示导入计划弹框
  showModal = () => {
    if (this.modal) {
      this.modal.handleChangeVisible();
    }
  }
  render() {
    const {planData, activeKey, functionKey, funcList, functionData, pagination} = this.props;
    const {allowRoutineTask, allowTempTask, gid} = funcList[`${activeKey}_${functionKey}`] || {};
    const State = ({datas, value, onChange}) => {
      const items = datas.map(item =>
        (<label
          className={styles['state-item']}
          style={{color: item.functionKey === value ? '#1C8DF5' : 'default' }}
          onClick={() => { onChange(item); }}
          key={item.functionKey}
        >
          <span>{item.functionName}</span></label>));
      return (
        <div style={{display: 'inline-block'}}>
          {items}
        </div>
      );
    };
    const pans = (functionData || []).map(ele => (
      <TabPane tab={ele.functionName} key={ele.functionKey}>
        {ele.children && ele.children.length !== 0 ?
          <div>
            <div className={styles['field-block']}>
              <label><b>作业类型：</b></label>
              <State
                datas={ele.children}
                value={functionKey}
                onChange={(item) => {
            this.props.onFunctionChange(item);
          }}
              />
            </div>
            <div style={{display: 'inline-block', float: 'right', marginRight: 30}}>
              {allowRoutineTask === 1 ? <Button type="primary" style={{marginLeft: 20, marginRight: 10}} onClick={() => this.props.handleNewPlan(1)}>
          +常规
              </Button> : null}
              {allowTempTask === 1 ? <Button type="primary" style={{marginLeft: 10, marginRight: 20}} onClick={() => this.props.handleNewPlan(2)}>
          +临时
              </Button> : null }
              <Button type="primary" style={{marginLeft: 20, marginRight: 10}} onClick={this.showModal} >导入计划</Button>
            </div>
            <SearchPanel
              stationData={this.props.stationData}
              searchPlanParams={this.props.searchPlanParams}
              handleSearchParamsChange={this.props.handleSearchParamsChange}
              queryPrePlanList={this.props.queryPrePlanList}
            />
            <TablePlan
              planHandler={this.props.planHandler}
              dataSource={planData || []}
              pagination={pagination}
              handleTableChange={this.props.handleTableChange}
              operationPlan={this.props.operationPlan}
            />
          </div> : <div className={styles.noData}>
            <Icon type="frown-o" />
            暂无数据
          </div>}
      </TabPane>));
    return (
      <PageHeaderLayout>
        <Tabs
          activeKey={activeKey}
          onChange={(key) => { this.props.onTabsChange(key); }}
        >
          {pans}
        </Tabs>
        <UploadModal
          {...this.props}
          ref={(ref) => { this.modal = ref; }}
          functionId={gid}
          queryPrePlanList={this.props.queryPrePlanList}
        />
      </PageHeaderLayout>
    );
  }
}

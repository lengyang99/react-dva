import React, { PureComponent } from 'react';
import moment from 'moment';
import { Button, Input, Table, Row, Col, Tabs, Icon, message} from 'antd';
import styles from './index.less';
import TaskFeedModal from '../NewModalForm/TaskFeedModal';
import Taskfeedback from '../../../components/Taskdetail/Taskfeedback';

const TabPane = Tabs.TabPane;
message.config({
  top: 300,
  duration: 2,
});

export default class TaskDetaile extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      isShowInfo: true, // 是否显示任务反馈详情
      eqInfo: {},
    };
  }
  showModal = (msg) => {
    if (msg) {
      message.warn(msg);
      return;
    }
    this.setState({ visible: true, startTime: moment()});
  }
  handleVisibleChange = () => {
    this.setState({ visible: !this.state.visible });
  }

  // 双击查看任务反馈详情
  dbClickRow = (record) => {
    // if (!this.props.finshed) {
    //   message.info('任务还未反馈！');
    //   return;
    // }
    // 操作之前先进行备份
    // const copy = cloneDeep(this.props.detailinfo.others[0]);
    const tempEqInfo = {
      alias: '设备信息',
      items: [],
    };
    const items = this.props.detailinfo.others[0].items;
    let tempItem = {};
    if (items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        // 将行记录对应的item取出
        items[i].forEach(item => {
          if (item.name === 'eq_code' && item.value === record.eqCode) {
            tempItem = items[i];
          }
        });
      }
    } else {
      message.info('设备信息为空！');
      return;
    }
    // tempEqInfo = Object.assign(tempEqInfo, { items: tempItem });
    // this.props.detailinfo.others[0] = copy.__wrapped__;
    tempEqInfo.items = tempItem;
    this.setState({
      isShowInfo: true,
      eqInfo: tempEqInfo,
    });
  };
  // 任务详情tab页关闭
  delHandler = () => {
    this.setState({
      isShowInfo: false,
    });
  };
  render() {
    const {detailinfo, handleBack, columnsType } = this.props;
    const {taskInfo, equipmentInfo, others, feedbackForm} = detailinfo || {};
    const eqDatas = detailinfo.others && detailinfo.others.length > 0 ? detailinfo.others[0] : {};
    const eqList = {};
    if (Object.keys(eqDatas).length !== 0) {
      eqList.items = eqDatas.items && eqDatas.items.length > 0 ? eqDatas.items[0] : [];
    }
    const equInfo = equipmentInfo || [];
    equInfo.forEach((item, index) => {
      Object.assign(item, { findex: index + 1 });
    });
    const feedbackInfo = others && others.length > 1 ? others[1] : feedbackForm && feedbackForm.length > 0 ? feedbackForm[0] : {};
    const eqData = Object.keys(this.state.eqInfo).length !== 0 ? this.state.eqInfo : eqList;
    const {createTime, endTime, startTime, name, gid, status, delayExecute, isArriveRequired, isArrive} = taskInfo || {};
    const canStart = startTime ? moment(startTime).valueOf() <= moment().valueOf() : true;
    // 要求到位却未到位 超期不能反馈   已经反馈了  不要求反馈  未到反馈时间 五种种情况不能反馈
    let msg = null;
    if (isArriveRequired === 1 && isArrive !== 1) {
      msg = '请先到位再进行反馈';
    }
    if (status === 2 && delayExecute !== 1) {
      msg = '任务已超期';
    }
    if (!canStart) {
      msg = '未到任务开始执行时间';
    }
    const disableFeed = (isArriveRequired === 1 && isArrive !== 1) || (status === 2 && delayExecute !== 1) || status === 1 || status === 3 || !canStart;
    let feedData = [];
    if (!disableFeed) {
      feedData = feedbackForm && feedbackForm.length > 0 && feedbackForm[0].items ? feedbackForm[0].items : [];
    }
    const equData = [
      { alias: '任务编号', value: gid || '' },
      { alias: '任务名称', value: name || '' },
      { alias: '生成时间', value: createTime || '' },
      { alias: '要求完成时间', value: endTime || '' },
    ];
    const showModal = !(disableFeed) && this.state.visible;
    const showInfo = this.state.isShowInfo;
    const devColumns = [
      {
        key: 'findex',
        title: '序号',
        dataIndex: 'findex',

      },
      {
        key: 'eqCode',
        title: '设备编号',
        dataIndex: 'eqCode',
      },
      {
        key: 'eqCode',
        title: '设备名称',
        dataIndex: 'eqName',
      },
      {
        key: 'eqStatus',
        title: '设备状态',
        dataIndex: 'eqStatus',
      },
      {
        key: 'posDesc',
        title: '地址',
        dataIndex: 'posDesc',
      },
    ];
    const ichColumns = [
      {
        key: 'findex',
        title: '序号',
        dataIndex: 'findex',
        width: '5%',
      },
      {
        key: 'houseHoldName',
        title: '用户名称',
        dataIndex: 'houseHoldName',
        width: '15%',
      }, {
        key: 'houseHoldCode',
        title: '客户号',
        dataIndex: 'houseHoldCode',
        width: '10%',
      },
      {
        title: '合同号',
        dataIndex: 'contractNum',
        key: 'contractNum',
        width: '10%',
      },
      {
        key: 'eqCode',
        title: '设备编号',
        dataIndex: 'eqCode',
        width: '15%',
      },
      {
        key: 'eqName',
        title: '表钢号',
        dataIndex: 'eqName',
        width: '15%',
      },
      {
        key: 'posDesc',
        title: '地址',
        dataIndex: 'posDesc',
        width: '30%',
      },
    ];
    const columns = columnsType === 1 ? devColumns : ichColumns;
    return (
      <div >
        <div>
          <div className={styles.block}>
            <div className={styles.order2} />
            <div className={styles.title}><span>任务基本信息</span></div>
            {equData.map(item => {
              return (<div key={`${item.alias}_${item.value}`} className={styles['field-block']}>
                <label>{`${item.alias}:`}</label>
                <Input
                  disabled
                  className={styles.input}
                  value={item.value}
                />
              </div>);
            })}
          </div>
          <div className={styles.block}>
            <div className={styles.order2} />
            <div className={styles.title}><span>关联设备</span></div>
            <Row key="table_row">
              <Col span={showInfo ? 16 : 24}>
                <Table
                  columns={columns}
                  dataSource={equInfo || []}
                  rowKey={record => record.gid}
                  onRow={(record) => {
                    return {
                      onDoubleClick: () => { this.dbClickRow(record); }, // 双击行查看详情
                    };
                  }}
                />
              </Col>
              <Col span={showInfo ? 8 : 0}>
                <Tabs defaultActiveKey="1" size="small">
                  <TabPane
                    tab={
                      <span>反馈详情</span>}
                    key="1"
                  >
                    <Taskfeedback hideValue={status === 0 || status === 2} detaildata={feedbackInfo} />
                  </TabPane>
                  <TabPane
                    tab={
                      <span>
                      设备详情
                        <Icon
                          type="close"
                          style={{width: 60, color: '#000'}}
                          onClick={() => {
                            this.delHandler();
                          }}
                        />
                      </span>}
                    key="2"
                  >
                    <Taskfeedback detaildata={eqData} />
                  </TabPane>
                </Tabs>
              </Col>
            </Row>
          </div>
        </div>
        {!disableFeed ? <TaskFeedModal
          {...this.props}
          handleBack={handleBack}
          taskId={gid}
          feedData={feedData}
          startTime={this.state.startTime}
          visible={showModal}
          handleVisibleChange={this.handleVisibleChange}
        /> : null}
        <Button
          style={status === 1 || status === 3 ? { display: 'none' } : { left: '45%' }}
          type="primary"
          htmlType="submit"
          onClick={() => { this.showModal(msg); }}
        >反馈</Button>
      </div>
    );
  }
}

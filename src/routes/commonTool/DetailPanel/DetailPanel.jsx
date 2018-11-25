import React from 'react';
import { Tabs, Tooltip, Icon } from 'antd';
import PropTypes from 'prop-types';
const TabPane = Tabs.TabPane;

export default class DetailPanel extends React.Component {
  constructor(props) {
    super(props);
    this.showLoading = true;
  }

  // 处理任务详情数据
  dealTaskDetailInfo = (taskDetailInfo) => {
    let classifyTaskPoint = {
      noPipeInfo: [],
      totalNum: taskDetailInfo.totalNum,
      arriveNum: taskDetailInfo.arriveNum,
      feedbackNum: taskDetailInfo.feedbackNum,
    };
    if (taskDetailInfo.taskInfoArrive && taskDetailInfo.taskInfoArrive.length > 0) {
    //   // 设备和关键点
    //   let tmp = [];
    //   tmp.push(...taskDetailInfo.layertypes.equipment);
    //   tmp.push(...taskDetailInfo.layertypes.keypoint);
    //   tmp.map((noPipe) => {
    //     let arriveNum = 0;
    //     let feedbackNum = 0;
    //     let needFeedback = noPipe.datas[0].type;
    //     classifyTaskPoint.arriveTotalNum += noPipe.datas.length;
    //     noPipe.datas.map((d) => {
    //       if (d.type) {
    //         classifyTaskPoint.feedbackTotalNum += 1;
    //       }
    //       if (d.isArrive) {
    //         arriveNum += 1;
    //         classifyTaskPoint.arriveNum += 1;
    //       }
    //       if (d.isFeedback) {
    //         feedbackNum += 1;
    //         classifyTaskPoint.feedbackNum += 1;
    //       }
    //     });
    //     classifyTaskPoint.noPipeInfo.push({ name: noPipe.name, totalNum: noPipe.datas.length, arriveNum: arriveNum, feedbackNum: feedbackNum, needFeedback: needFeedback });
    //   });
    //   tmp = null;

      taskDetailInfo.taskInfoArrive.map(item => {
        if(!item.name.includes("管段")){
          classifyTaskPoint.noPipeInfo.push({ name: item.name, totalNum: item.totalNum, arriveNum: item.arriveNum, feedbackNum: item.feedbackNum, needFeedback: Number(item.feedbackNum) > 0 ? true : false });
        }
      })
    }
    this.showLoading = false;
    return classifyTaskPoint;
  }

  render() {
    const { taskTypeList, patrolTaskDetailData, field, fieldList, taskInfoArrive, toolNum } = this.props;
    const taskUsernames = field.object.usernames.length > 6 ? `${field.object.usernames.split(',').join('、').substring(0, 6)}...` : field.object.usernames.length;
    const planName = field.object.name.length > 16 ? `${field.object.name.substring(0, 16)}...` : field.object.name.length;
    // 需要展示的统计面板
    const showArriveRate = taskTypeList.showArriveRate;
    const showFeedbackRate = taskTypeList.showFeedbackRate;
    const showOverRate = taskTypeList.showOverRate;
    // 统计面板里的统计项
    const classifyTaskInfo = this.dealTaskDetailInfo(taskInfoArrive);
    const arrivePanel = [];
    const feedbackPanel = [];
    classifyTaskInfo.noPipeInfo.map((item) => {
      arrivePanel.push(
        <div>
          <span>{item.name}:</span><span>{`${item.arriveNum}/${item.totalNum}`}</span>
        </div>
      );
      if (item.needFeedback) {
        feedbackPanel.push(
          <div>
            <span>{item.name}:</span><span>{`${item.feedbackNum}/${item.totalNum}`}</span>
          </div>
        );
      }
    });

    const taskTabList = (
      <Tabs onChange={(key) => this.props.onChangeTabs(key)}>
        {
          this.props.tabList.map((item, index) => {
            // let o = fieldList.filter((ii) => { return ii.layerType === item; });
            return fieldList.length > 0 && <TabPane tab={`${item.name}`} key={`${item.name}`}>{fieldList[0].table}</TabPane>;
          })
        }
      </Tabs>
    );

    let totalLine = field.object.totalLine || 0;
    let totalCoverLine = field.object.arriveLine || 0;
    totalCoverLine = totalCoverLine >= totalLine ? totalLine : totalCoverLine;
    let totalKeyline = field.object.totalKeyline || 0;
    let totalCoverKeyline = field.object.arriveKeyline || 0;
    totalCoverKeyline = totalCoverKeyline >= totalKeyline ? totalKeyline : totalCoverKeyline;

    return (
      <div style={{ minWidth: '900px', overflow: 'hidden', width: '99.5%', position: 'relative' }}>
        <div style={{ width: 'auto', height: '100px', margin: '-5px 20px', display: 'flex', flexDirection: 'row' }}>
          <div style={{ marginTop: '46px' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '300px' }}>
              <div style={{ height: 'auto', marginRight: '10px', width: '45px' }}>
                <img height='32px' width='32px' src='../images/task-detail/person.png' />
              </div>
              <div style={{ height: 'auto', marginRight: '15px', width: '60px' }}>
                {
                  this.props.field.object.usernames.length > 6 ?
                    <Tooltip
                      title={this.props.field.object.usernames}
                      placement='top'
                    >
                      {taskUsernames}
                    </Tooltip> :
                    this.props.field.object.usernames
                }
              </div>
              <div style={{ height: 'auto', marginRight: '15px', width: '160px' }}>
                <div style={{ margin: '4px', fontWeight: 'bold' }}>
                  {
                    this.props.field.object.name.length > 16 ?
                      <Tooltip
                        title={this.props.field.object.name}
                        placement='top'
                      >
                        {planName}
                      </Tooltip> :
                      this.props.field.object.name
                  }
                </div>
                <div style={{ margin: '4px' }}>{field.object.startTime && field.object.startTime.substring(0, 10)} 至 {field.object.endTime && field.object.endTime.substring(0, 10)}</div>
              </div>
              <div style={{ height: 'auto', marginRight: '25px', width: '50px', cursor: 'pointer' }}>
                <img height='32px' width='32px' src='../images/task-detail/location.png' onClick={field.location} />
              </div>
            </div>
          </div>
          <div style={{ marginTop: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
              <div style={{ height: '120px', display: showArriveRate ? 'flex' : 'none', flexDirection: 'row', alignItems: 'center', marginRight: '10px', border: '3px solid #eee', padding: '0 15px 0 0' }}>
                <div style={{ marginLeft: '15px' }}>
                  <img height='32px' width='32px' src='../images/task-detail/edit.png' />
                </div>
                <div style={{ marginLeft: '10px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ margin: '4px', fontSize: '16px' }}>
                    <span style={{ color: '#1890ff' }}>{classifyTaskInfo.totalNum ? `${(Math.round(100 * 100 * classifyTaskInfo.arriveNum / classifyTaskInfo.totalNum) / 100).toFixed(0)}%` : '0%'}</span>
                  </div>
                  <div style={{ margin: '4px' }}>到位率</div>
                </div>
                <div style={{ marginLeft: '15px', display: 'flex', flexDirection: 'column' }}>
                  {arrivePanel}
                </div>
              </div>
              <div style={{ height: '120px', display: showFeedbackRate ? 'flex' : 'none', flexDirection: 'row', alignItems: 'center', marginRight: '10px', border: '3px solid #eee', padding: '0 15px 0 0' }}>
                <div style={{ marginLeft: '15px' }}>
                  <img height='32px' width='32px' src='../images/task-detail/rili.png' />
                </div>
                <div style={{ marginLeft: '10px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ margin: '4px', fontSize: '16px' }}>
                    <span style={{ color: '#1890ff' }}>{classifyTaskInfo.feedbackNum ? `${(Math.round(100 * 100 * classifyTaskInfo.feedbackNum / classifyTaskInfo.totalNum).toFixed(0)) / 100}%` : '0%'}</span>
                  </div>
                  <div style={{ margin: '4px' }}>反馈率</div>
                </div>
                <div style={{ marginLeft: '15px', display: 'flex', flexDirection: 'column' }}>
                  {feedbackPanel}
                </div>
              </div>
              <div style={{ height: '120px', display: showOverRate ? 'flex' : 'none', flexDirection: 'column', alignItems: 'center', border: '3px solid #eee', padding: '0 35px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', marginTop: '10px' }}>
                  <div style={{ marginTop: '15px' }}>
                    <img height='32px' width='32px' src='../images/task-detail/rili.png' />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '15px' }}>
                    <div style={{ fontSize: '16px', marginTop: '5px' }}>
                      <span>{`${totalLine || totalKeyline ? (Math.round(100 * 100 * (totalCoverLine + totalCoverKeyline) / (totalLine + totalKeyline)) / 100).toFixed(0) : 0}%`}</span>
                    </div>
                    <div>覆盖率</div>
                  </div>
                </div>
                <div style={{ display: totalLine ? 'flex' : 'none', flexDirection: 'row', marginTop: '5px' }}>
                  <div>管线:</div>
                  <div>{`${parseFloat(totalCoverLine / 1000).toFixed(2)}/${parseFloat(totalLine / 1000).toFixed(2)}km`}</div>
                </div>
                <div style={{ display: totalKeyline ? 'flex' : 'none', flexDirection: 'row', marginTop: '5px' }}>
                  <div>关键线:</div>
                  <div>{`${parseFloat(totalCoverKeyline / 1000).toFixed(2)}/${parseFloat(totalKeyline / 1000).toFixed(2)}km`}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="tabtable" style={{ height: 'auto', width: 'calc(100% - 40px)', margin: '55px 20px' }}>
          {taskTabList}
        </div>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 10000,
          backgroundColor: 'rgba(252,252,252,0.5)',
          display: this.showLoading ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Icon type="loading" style={{ color: "#2592fc", fontSize: "35px" }} />
        </div>
      </div>
    );
  }
}
DetailPanel.propTypes = {
  field: PropTypes.object,
};

DetailPanel.defaultProps = {
  field: {},
};

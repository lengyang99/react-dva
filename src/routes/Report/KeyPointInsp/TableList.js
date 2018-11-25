import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import { Table } from 'antd';
import styles from './index.less';
import { isMoment } from '../../../../node_modules/moment';
import moment from 'moment';

@connect(({ patrolTaskList }) => ({

}))
export default class TableList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentTaskId: '',
    };
    this.xv = 0;
  }
  // 跳转到任务详情页
  gotoPatrolTaskDetailsPage = (task) => {
    // this.setState({
    //   currentTaskId: task.planid,
    // });
    this.props.dispatch({
      type: 'patrolTaskList/getPatrolTaskData',
      payload: { planid: task.planid },
      callback: (res) => {
        console.log(res, 'ppppppp')
        if (res.data && res.data.length > 0) {
          const record = res.data[0];
          const { patrolLayerInfo } = this.props;
          let patrolLayerList = []; // 记录任务点类型
          if (record.layerids) {
            record.layerids.split(',').map((ids) => {
              patrolLayerInfo.map((layers) => {
                if (ids === `${layers.gid}`) {
                  if (patrolLayerList.toString().indexOf(layers.type) === -1) {
                    patrolLayerList.push(layers.type);
                  }
                }
              });
            });
          }
          let path = {
            pathname: '/query/patrol-task-detail',
            data: {
              gid: record.gid,
              usernames: record.usernames,
              name: record.name,
              startTime: record.startTime,
              endTime: record.endTime,
              arriveNum: record.arriveNum,
              totalNum: record.totalNum,
              feedbackNum: record.feedbackNum,
              totalLine: record.totalLine,
              arriveLine: record.arriveLine,
              totalKeyline: record.totalKeyline,
              arriveKeyline: record.arriveKeyline,
              layerids: record.layerids,
              taskInfoArrive: record.taskInfoArrive,
            },
            state: { test: 'test' },
            params: {
              pageno: 1,
              pagesize: 9,
            },
            isExpand: true,
            taskStateInfo: {
              showArriveRate: record.totalNum > 0, // 是否显示到位率
              showFeedbackRate: record.totalFeedbackNum > 0, // 是否显示反馈率
              showOverRate: record.totalLine > 0 || record.totalKeyline > 0, // 是否显示覆盖率
              tabList: patrolLayerList,
            },
            patrolLayerInfo,
            isOverview: true,
          };
          this.props.dispatch(routerRedux.push(path));
        }

      }
    });

  }

  // 计算表格横向滚动值
  calcXscroll = (tColums = []) => {
    for (let i = 0; i < tColums.length; i++) {
      if (tColums[i].children) {
        this.calcXscroll(tColums[i].children);
      } else {
        this.xv += tColums[i].width;
      }
    }
    return this.xv;
  }

  render() {
    let that = this;
    const { handleTableChange, pagination, patrolTaskStatisticInfo, patrolLayerInfo, patrolLayer } = this.props;
    const newData = patrolTaskStatisticInfo || [];
    newData.forEach((item, index) => {
      Object.assign(item, { index: index + 1 });
    });
    const deviceChildren = [];
    const keypointChildren = [];
    const pipelineChildren = [];
    const keylineChildren = [];
    (patrolLayerInfo || []).map((item) => {
      let name = item.name;
      if (item.type === '设备') {
        if (!patrolLayer || `${item.gid}` === `${patrolLayer}`) {
          deviceChildren.push(
            {
              title: name,
              children: [
                {
                  title: <span className={styles.table_list_title}>总数(个)</span>,
                  dataIndex: `${name}totalNum`,
                  render: (text) => {
                    return text ? text : 0;
                  },
                  width: 120,
                },
                {
                  title: <span className={styles.table_list_title}>到位数(个)</span>,
                  dataIndex: `${name}arriveNum`,
                  render: (text) => {
                    return text ? text : 0;
                  },
                  width: 120,
                },
                {
                  title: <span className={styles.table_list_title}>到位率(%)</span>,
                  dataIndex: `${name}arriveRate`,
                  render: (text, record) => {
                    return record[`${name}totalNum`] ? `${Math.round(100 * 100 * record[`${name}arriveNum`] / record[`${name}totalNum`]) / 100}%` : `0%`;
                  },
                  width: 120,
                },
                {
                  title: <span className={styles.table_list_title}>反馈数(个)</span>,
                  dataIndex: `${name}feedbackNum`,
                  render: (text) => {
                    return text ? text : 0;
                  },
                  width: 120,
                },
                {
                  title: <span className={styles.table_list_title}>反馈率(%)</span>,
                  dataIndex: `${name}feedbackRate`,
                  render: (text, record) => {
                    return record[`${name}totalNum`] ? `${Math.round(100 * 100 * record[`${name}feedbackNum`] / record[`${name}totalNum`]) / 100}%` : `0%`;
                  },
                  width: 120,
                },
              ],
            }
          );
        }
      } else if (item.type === '关键点') {
        if (!patrolLayer || `${item.gid}` === `${patrolLayer}`) {
          keypointChildren.push(
            {
              title: '关键点',
              children: [
                {
                  title: <span className={styles.table_list_title}>总数(个)</span>,
                  dataIndex: '关键点totalNum',
                  render: (text) => {
                    return text ? text : 0;
                  },
                  width: 120,
                },
                {
                  title: <span className={styles.table_list_title}>到位数(个)</span>,
                  dataIndex: '关键点arriveNum',
                  render: (text) => {
                    return text ? text : 0;
                  },
                  width: 120,
                },
                {
                  title: <span className={styles.table_list_title}>到位率(%)</span>,
                  dataIndex: '关键点arriveRate',
                  render: (text, record) => {
                    return record['关键点totalNum'] ? `${Math.round(100 * 100 * record['关键点arriveNum'] / record['关键点totalNum']) / 100}%` : `0%`;
                  },
                  width: 120,
                },
              ],
            }
          );
        }
      } else if (item.type === '管段') {
        if (!patrolLayer || `${item.gid}` === `${patrolLayer}`) {
          let title = '';
          let totalName = '';
          let overName = '';
          let rateName = '';
          if (name && name.indexOf('管段') > -1) {
            if (name.indexOf('低压') > -1) {
              title = '低压';
              totalName = 'lowTotalLen';
              overName = 'lowCoverLen';
              rateName = 'lowCoverRate';
            } else if (name.indexOf('中压') > -1) {
              title = '中压';
              totalName = 'middleTotalLen';
              overName = 'middleCoverLen';
              rateName = 'middleCoverRate';
            } else if (name.indexOf('高压') > -1) {
              title = '高压';
              totalName = 'highTotalLen';
              overName = 'highCoverLen';
              rateName = 'highCoverRate';
            }
            pipelineChildren.push(
              {
                title: title,
                children: [
                  {
                    title: <span className={styles.table_list_title}>总长(米)</span>,
                    dataIndex: totalName,
                    render: (text) => {
                      return text ? text : 0;
                    },
                    width: 120,
                  },
                  {
                    title: <span className={styles.table_list_title}>覆盖总长(米)</span>,
                    dataIndex: overName,
                    render: (text, record) => {
                      let totalLen = record[totalName] || 0;
                      let coverLen = record[overName] || 0;
                      coverLen = coverLen >= totalLen ? totalLen : coverLen;
                      return coverLen;
                    },
                    width: 120,
                  },
                  {
                    title: <span className={styles.table_list_title}>覆盖率(%)</span>,
                    dataIndex: rateName,
                    render: (text, record) => {
                      let totalLen = record[totalName] || 0;
                      let coverLen = record[overName] || 0;
                      coverLen = coverLen >= totalLen ? totalLen : coverLen;
                      return coverLen ? `${Math.round(100 * 100 * coverLen / totalLen) / 100}%` : `0%`;
                    },
                    width: 120,
                  },
                ],
              }
            );
          }
        }
      } else if (item.type === '关键线') {
        if (!patrolLayer || `${item.gid}` === `${patrolLayer}`) {
          keylineChildren.push(
            {
              title: '关键线',
              children: [
                {
                  title: <span className={styles.table_list_title}>总长(米)</span>,
                  dataIndex: 'totalKeyline',
                  render: (text) => {
                    let totalKeyline = text || 0;
                    return `${Math.round(100 * (totalKeyline)) / 100}`
                  },
                  width: 120,
                },
                {
                  title: <span className={styles.table_list_title}>覆盖总长(米)</span>,
                  dataIndex: 'arriveKeyline',
                  render: (text, record) => {
                    let totalKeyline = record['totalKeyline'] || 0;
                    let arriveKeyline = record['arriveKeyline'] || 0;
                    arriveKeyline = arriveKeyline >= totalKeyline ? totalKeyline : arriveKeyline;
                    return `${Math.round(100 * (arriveKeyline)) / 100}`
                  },
                  width: 120,
                },
                {
                  title: <span className={styles.table_list_title}>覆盖率(%)</span>,
                  dataIndex: 'keylineCoverRate',
                  render: (text, record) => {
                    let totalKeyline = record['totalKeyline'] || 0;
                    let arriveKeyline = record['arriveKeyline'] || 0;
                    arriveKeyline = arriveKeyline >= totalKeyline ? totalKeyline : arriveKeyline;
                    return `${totalKeyline ? Math.round(100 * 100 * arriveKeyline / totalKeyline) / 100 : 0}%`;
                  },
                  width: 120,
                }
              ],
            }
          );
        }
      }
    });
    const columns = [
      {
        title: <span className={styles.table_list_title}>序号</span>,
        dataIndex: 'index',
        width: 40,
      },
      {
        title: <span className={styles.table_list_title}>任务名称</span>,
        dataIndex: 'name',
        width: 240,
      },
      {
        title: <span className={styles.table_list_title}>站点</span>,
        dataIndex: 'station',
        width: 120,
      },
      {
        title: <span className={styles.table_list_title}>区域</span>,
        dataIndex: 'areaname',
        width: 120,
      },
      {
        title: <span className={styles.table_list_title}>执行人</span>,
        dataIndex: 'usernames',
        width: 160,
      },
      {
        title: <span className={styles.table_list_title}>执行时间</span>,
        dataIndex: 'taskTime',
        width: 250,
        render: (text, record) => {
          if (record.stime && record.etime) {
            const stime = moment(record.stime).format('YYYY-MM-DD');
            const etime = moment(record.etime).format('YYYY-MM-DD');
            return `${stime} ~ ${etime}`;
          } else {
            return '';
          }
        },
      },
      {
        title: <span className={styles.table_list_title}>巡视周期</span>,
        dataIndex: 'cycle',
        width: 120,
      },
      {
        title: <span className={styles.table_list_title}>任务总数(个)</span>,
        dataIndex: 'totalNum',
        render: (text) => {
          return text ? text : 0;
        },
        width: 120,
      },
      {
        title: <span className={styles.table_list_title}>已到位数(个)</span>,
        dataIndex: 'arriveNum',
        render: (text) => {
          return text ? text : 0;
        },
        width: 120,
      },
      {
        title: <span className={styles.table_list_title}>到位率(%)</span>,
        dataIndex: 'arriveRate',
        render: (text, record) => {
          return record['totalNum'] ? `${Math.round(100 * 100 * record['arriveNum'] / record['totalNum']) / 100}%` : `0%`;
        },
        width: 120,
      },
      {
        title: <span className={styles.table_list_title}>已反馈数(个)</span>,
        dataIndex: 'feedbackNum',
        render: (text) => {
          return text ? text : 0;
        },
        width: 120,
      },
      {
        title: <span className={styles.table_list_title}>反馈率(%)</span>,
        dataIndex: 'feedbackRate',
        render: (text, record) => {
          return record['feedbackTotalNum'] ? `${Math.round(100 * 100 * record['feedbackNum'] / record['feedbackTotalNum']) / 100}%` : `0%`;
        },
        width: 120,
      },
      {
        title: <span className={styles.table_list_title}>管线总长(米)</span>,
        dataIndex: 'pipeTotalLen',
        render: (text, record) => {
          let lowTotalLen = record['lowTotalLen'] || 0;
          let middleTotalLen = record['middleTotalLen'] || 0;
          let highTotalLen = record['highTotalLen'] || 0;
          return `${Math.round(100 * (lowTotalLen + middleTotalLen + highTotalLen)) / 100}`;
        },
        width: 120,
      },
      {
        title: <span className={styles.table_list_title}>管线覆盖总长(米)</span>,
        dataIndex: 'pipeCoverLen',
        render: (text, record) => {
          let lowTotalLen = record['lowTotalLen'] || 0;
          let middleTotalLen = record['middleTotalLen'] || 0;
          let highTotalLen = record['highTotalLen'] || 0;
          let totalLen = lowTotalLen + middleTotalLen + highTotalLen;
          let lowCoverLen = record['lowCoverLen'] || 0;
          let middleCoverLen = record['middleCoverLen'] || 0;
          let highCoverLen = record['highCoverLen'] || 0;
          let coverTotalLen = lowCoverLen + middleCoverLen + highCoverLen;
          coverTotalLen = coverTotalLen >= totalLen ? totalLen : coverTotalLen;
          return `${Math.round(100 * coverTotalLen) / 100}`;
        },
        width: 130,
      },
      {
        title: <span className={styles.table_list_title}>管线覆盖率(%)</span>,
        dataIndex: 'pipeCoverRate',
        render: (text, record) => {
          let lowTotalLen = record['lowTotalLen'] || 0;
          let middleTotalLen = record['middleTotalLen'] || 0;
          let highTotalLen = record['highTotalLen'] || 0;
          let totalLen = lowTotalLen + middleTotalLen + highTotalLen;
          let lowCoverLen = record['lowCoverLen'] || 0;
          let middleCoverLen = record['middleCoverLen'] || 0;
          let highCoverLen = record['highCoverLen'] || 0;
          let coverTotalLen = lowCoverLen + middleCoverLen + highCoverLen;
          coverTotalLen = coverTotalLen >= totalLen ? totalLen : coverTotalLen;
          return `${totalLen ? Math.round(100 * 100 * coverTotalLen / totalLen) / 100 : 0}%`;
        },
        width: 120,
      },
      {
        title: <span className={styles.table_list_title}>备注</span>,
        key: 'notes',
        render: (text, record) => {
          if (record && record.notes) {
            const tmpNotes = [];
            const notes = record.notes.split(',');
            notes.map((note, index) => {
              const tmpNote = note.split('/');
              tmpNotes.push(`（${index + 1}）时间：${tmpNote[0]}，内容：${tmpNote[1]};`);
            });
            return tmpNotes.join('');
          } else {
            return '';
          }
        },
        width: 200,
      },
      {
        title: <span className={styles.table_list_title}>更多操作</span>,
        key: 'moreAction',
        render: (text, record) => {
          const path = {
            pathname: '/query/patrol-task-list',
            planid: record.planid,
            name: record.name,
            stime: moment(record.stime),
            etime: moment(record.etime),
          }
          return (
            <span style={{ cursor: 'pointer', color: '#1890ff' }} onClick={that.gotoPatrolTaskDetailsPage.bind(that, record)} >详情</span>
          );
        },
        width: 80,
      }
    ];
    if (keypointChildren && keypointChildren.length > 0) {
      columns.splice(columns.length - 2, 0, keypointChildren[0]);
    }
    if (keylineChildren && keylineChildren.length > 0) {
      columns.splice(columns.length - 2, 0, keylineChildren[0]);
    }
    if (deviceChildren && deviceChildren.length > 0) {
      columns.splice(columns.length - 2, 0, { title: '设备', children: deviceChildren });
    }
    if (pipelineChildren && pipelineChildren.length > 0) {
      columns.splice(columns.length - 2, 0, { title: '管段', children: pipelineChildren });
    }
    // 计算表格横向滚动值
    this.xv = 0;
    this.calcXscroll(columns);
    return (
      <div>
        <Table
          dataSource={newData || []}
          columns={columns}
          pagination={pagination}
          onChange={handleTableChange}
          rowKey={record => record.gid}
          scroll={{ x: this.xv }}
          bordered={true}
          rowClassName={styles.table_list}
        />
      </div>
    );
  }
}


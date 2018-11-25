import React, { PureComponent } from 'react';
import { Table, Tooltip, Tabs, Icon} from 'antd';
import Taskfeedback from '../../../components/Taskdetail/Taskfeedback';
import styles from './index.less';

const TabPane = Tabs.TabPane;
class TablePlan extends PureComponent {
    state={
      showMore: false,
    }
    // 历史记录
    readMaintainHistory = (record) => {
      if (!this.state.showMore) {
        this.props.getDetailinfo({taskId: record.gid});
      }
      this.setState({showMore: !this.state.showMore});
    }
    delHandler = () => {
      this.setState({showMore: !this.state.showMore});
    }
    render() {
      const { dataSource, pagination, handleTableChange, detailinfo} = this.props;
      const {showMore} = this.state;
      const {current, pageSize} = pagination;
      dataSource.forEach((item, index) => {
        Object.assign(item, {findex: (current - 1) * pageSize + index + 1});
      });
      const {taskInfo, others, feedbackForm} = detailinfo || {};
      const {status} = taskInfo || {};
      const eqDatas = detailinfo.others && detailinfo.others.length > 0 ? detailinfo.others[0] : {};
      const eqList = {};
      if (Object.keys(eqDatas).length !== 0) {
        eqList.items = eqDatas.items && eqDatas.items.length > 0 ? eqDatas.items[0] : [];
      }
      const feedbackInfo = others && others.length > 1 ? others[1] : feedbackForm && feedbackForm.length > 0 ? feedbackForm[0] : {};
      const columns = [
        {
          title: '设备编码',
          dataIndex: 'gid',
        }, {
          title: '设备名称',
          dataIndex: 'eqName',
          key: 'eqName',
          render: (text, record) => {
            const eqNames = [];
            (record.eqList || []).forEach(item => {
              eqNames.push(item.eqName);
            });
            const eqName = eqNames.length !== 0 ? eqNames[0] : '';
            return <Tooltip title={eqName}><span>{eqName}</span></Tooltip>;
          },
        },
        {
          title: '作业类型',
          dataIndex: 'functionName',
        },
        {
          title: '处理时长',
          dataIndex: 'timecost',
        },
        {
          title: '维护人',
          dataIndex: 'assigneeNames',
        },
        {
          title: '维护状态',
          dataIndex: 'status',
          render: (text) => {
            switch (text) {
              case 0: return <span style={{textAlign: 'center', 'color': 'red', cursor: 'pointer'}}>未完成</span>;
              case 1: return <span style={{textAlign: 'center', 'color': '#379FFF', cursor: 'pointer'}}>已完成</span>;
              case 2: return <span style={{textAlign: 'center', 'color': 'red', cursor: 'pointer'}}>已超期</span>;
              default: return <span style={{textAlign: 'center', 'color': '#379FFF', cursor: 'pointer'}}>超期已完成</span>;
            }
          },
        },
        {
          title: '操作',
          dataIndex: 'actions',
          render: (text, record) => (
            <span>
              <a onClick={() => { this.readMaintainHistory({ ...record, action: 'edit' }); }}>详情</a>
            </span>
          ),
        },
      ];
      return (
        <div>
          <div style={{width: showMore ? '70%' : '100%', display: 'inline-block'}}>
            <Table
              className={styles.table}
              columns={columns}
              dataSource={dataSource}
              pagination={pagination}
              onChange={handleTableChange}
              rowKey={record => `${record.gid}`}
            />
          </div>
          <div style={{width: showMore ? '30%' : 0, display: showMore ? 'inline-block' : 'none', float: 'right'}}>
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
                <Taskfeedback detaildata={eqList} />
              </TabPane>
            </Tabs>
          </div>
        </div>

      );
    }
}
export default TablePlan;

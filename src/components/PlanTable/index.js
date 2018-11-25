import React, {PureComponent} from 'react';
import {Link, routerRedux} from 'dva/router';
import moment from 'moment';
import {Table, Dropdown, Menu, Icon, message, Popconfirm} from 'antd';
import {Modal, Button, Divider } from 'antd';
import {connect} from 'dva';
const confirm = Modal.confirm;

import styles from './index.less';
// @connect(({station}) => ({
//   planDetaileData:station.planDetaileData,
// }))
class PlanTable extends PureComponent {
  state = {};

  delHandler(record) {
    const that = this;
    this.props.dispatch({
      // type: 'station/queryTasks',
      // payload: {
      //   stationId: record.stationId,
      //   areaId: record.areaId,
      //   equipmentUnitId: record.equipmentUnitId,
      //   startTime: record.startTime,
      //   endTime: moment().add(1,'year').format('YYYY-MM-DD 23:59:59')
      // },
      type: 'station/queryHasTasks',
      payload: {
        planId: record.gid,
      },
      callback: (data) => {
        console.log(123, data);
        if(data && data.length > 0){
          message.warning('此计划下已生成任务不能删除！')
        }else{
          confirm({
            title: '是否删除计划？',
            onOk() {
              that.props.dispatch({
                type: 'station/delStationPlan',
                payload: {
                  planId: record.gid,
                },
                callback: (res) => {
                  if (res.success) {
                    message.info(res.msg);
                    that.props.expOnChange()
                  }
                }
              });
            },
            onCancel() {
            },
          });
        }
      }
    });
  };

  /**
   * st===1 开启状态停用操作
   * */
  tranceState = (st,planId) => {
    let act = st === 1 ? 'stop' : 'start';
    let md = st === 1 ? '停止' : '启用';
    const {dispatch, refreshData} = this.props;
    confirm({
      title: `确定要${md}计划？`,
      onOk() {
        dispatch({
          type: 'station/tranceState',
          payload:planId,
          act:act,
          callback: ({success, msg}) => {
            if (success === true) {
              message.info(msg);
              refreshData && refreshData();
            } else {
              message.error(msg);
            }
          }
        })
      },
      onCancel() {
      },
    });
  };

  editHandler = (p) => {
    console.log(p, "ppp");
    this.props.dispatch({
      type:'station/queryPlanDetaile',
      payload:{planId: p.gid},
      callback:(planDetaileData)=>{
        // <Link to={`plan-detail?planId=${record.planId}`} ></Link>
        console.log(planDetaileData, "planDetaileData");
        this.props.dispatch(routerRedux.push(`plan-detail?planId=${p.gid}&groupId=${p.areaId}`))
      }
    })
  };

  render() {
    let that = this;
    const {data: {list, pagination}, loading, stateValues, onTableChange} = this.props;
    const moreAction = (record) => (
      <Menu>
        <Menu.Item key="1">
          <a onClick={() => {
            that.delHandler.bind(that, record)
          }}>删除</a>
        </Menu.Item>
      </Menu>
    );
    const status = {};
    stateValues.forEach((it) => {
      status[it.name] = it.alias;
    });
    const columns = [
      {
        title: '计划名称',
        dataIndex: 'name',
      },
      {
        title: '站点',
        dataIndex: 'stationName',
      },
      {
        title: '生效时间',
        dataIndex: 'startTime',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (val,rec) => {
          let is = val === 2;
          return <a className={is ? styles.stop : ''} onClick={() => {
            this.tranceState(val,rec.gid);
          }}>
            <Icon type={`${is ? 'close' : 'check'}-circle-o`}/>
            {status[val]}</a>;
        },
      },
      {
        title: '操作',

        render(val, record) {
          // const data = {
          //   planId: record.planId,
          //   pageno: pagination.current,
          //   pagesize: pagination.pageSize,
          //   groupName:record.groupName
          // };
          // const path = {
          //   pathname: '/station/task',
          //   state: data,
          // }
          const menu = (
                <Menu>
                  <Menu.Item key="2">
                    <a onClick={that.editHandler.bind(that,record)}>编辑</a>
                  </Menu.Item>
                  <Menu.Item key="1">
                    <a onClick={that.delHandler.bind(that, record)}>删除</a>
                  </Menu.Item>
                </Menu>
          );

          return (
            <div>
            <span><Link to={`task?equipmentUnitId=${record.equipmentUnitId}&groupName=${record.areaId}&stationId=${record.stationId}&stationName=${record.stationName}`}>任务</Link></span>
            <Divider type="vertical" />
            <Dropdown overlay={menu} trigger={['click']}>
              <a className="ant-dropdown-link" href="#">
                更多 <Icon type="down"/>
              </a>
            </Dropdown>
            </div>
          )
        },
      },
    ];
    return (
      <div>
        <Table
          //loading={loading}
          rowKey={record => record.gid}
          dataSource={list}
          columns={columns}
          pagination={pagination}
          onChange={onTableChange}
        />
      </div>
    );
  }
}

export default connect(
  ({station}) => {
    return {
      station
    }
  }
)
(PlanTable);

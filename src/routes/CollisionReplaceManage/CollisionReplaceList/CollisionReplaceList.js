import React from 'react';
import {connect} from 'dva';
import {routerRedux, Link} from 'dva/router';
import {Modal, Button, DatePicker, message, Tooltip, Table} from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import SelectPanel from '../../commonTool/SelectPanelTool/SelectPanel';
import SearchPanel from '../../commonTool/SelectPanelTool/SearchPanel';
import SearchTablePanel from '../../commonTool/SearchTablePanel/SearchTablePanel';
import styles from './CollisionReplaceList.less';
import EcityMap from '../../../components/Map/EcityMap';
import SubmitForm from '../../../components/SubmitForm/SubmitForm';
import { DrawPointMapTool } from '../../../components/Map/common/maptool/DrawPointMapTool';

const {RangePicker} = DatePicker;

const defaultParams = {
  eventState: '', // 事件状态
  stime: null, // 开始时间
  etime: null, // 结束时间
  condition: '', // 快速索引
  pageno: 1,
  pagesize: 10,
};

@connect(state => ({
  user: state.login.user,
  collisionReplaceList: state.collisionReplace.collisionReplaceList,
  collisionReplaceTotal: state.collisionReplace.collisionReplaceTotal,
}))

export default class CollisionReplaceList extends React.Component {
  constructor(props) {
    super(props);
    this.tool = this.props.location;
    let params = this.tool.params ? {...this.tool.params} : {...defaultParams};
    this.map = null;
    this.state = {
      // 参数
      params: {...params},
      isShowMap: false, // 是否展示地图
      showModal: false, // 是否展示模态框
      ModelData: {}, // 相关按钮内的值
      loading: false,
    };
  }

  componentDidMount() {
    this.getCollisionReplaceData();
  }

  componentWillUnmount() {

  }

  // 获取事件数据
  getCollisionReplaceData = () => {
    let data = {};
    let params = this.state.params;
    if (params.eventState) {
      data.eventstate = params.eventState;
    }
    if (params.stime) {
      data.startTime = params.stime.format('YYYY-MM-DD') + ' 00:00:00';
    }
    if (params.etime) {
      data.endTime = params.etime.format('YYYY-MM-DD') + ' 23:59:59';
    }
    if (params.condition) {
      data.condition = params.condition.replace(/(^\s*)|(\s*$)/g, '');
    }
    if (params.pageno) {
      data.pageno = params.pageno;
    }
    if (params.pagesize) {
      data.pagesize = params.pagesize;
    }
    data.userid = this.props.user.gid;
    data.plat = 'web';
    this.props.dispatch({
      type: 'collisionReplace/selectCollisionReplaceList',
      payload: data,
    });
  };

  getTaskFormData = (data) => {
    this.props.dispatch({
      type: 'workOrder/getTaskFormData',
      payload: {
        taskId: data.taskId,
        taskType: data.taskType,
        taskCode: '',
        userid: this.props.user.gid,
      },
      callback: () => {
        this.setState({
          ModelData: data,
          showModal: true,
        });
      },
    });
  };

  handleCancel = () => {
    this.clearFormData();
  };

  handleOk = () => {
    let paramsObj = {};
    let paramsAttArray = [];
    let validate = this.refs['formRef_1'].validateRequired();
    if (validate) {
      message.warning(`字段【${validate}】为空！`);
      return;
    }
    let params = this.refs['formRef_1'].getValues();
    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        paramsObj[key] = params[key];
      }
    }
    paramsObj = {...paramsObj, ...this.geom};

    let paramsAtt = this.refs['formRef_1'].getAttValues();
    for (let key in paramsAtt) {
      if (paramsAtt.hasOwnProperty(key)) {
        paramsAttArray.push({name: key, value: paramsAtt[key]});
      }
    }
    this.setState({
      loading: true,
    });
    this.props.dispatch({
      type: 'workOrder/submitTaskFormData',
      payload: {
        taskId: this.state.ModelData.taskId,
        taskType: this.state.ModelData.taskType,
        taskCode: '',
        userid: this.props.user.gid,
        user: this.props.user.trueName,
        properties: JSON.stringify(paramsObj),
        isSave: 0,
      },
      callback: (res) => {
        if (paramsAttArray.length > 0) {
          this.props.dispatch({
            type: 'workOrder/submitAttach',
            formData: paramsAttArray,
            attInfo: res,
            user: this.props.user,
            callback: (resAtt) => {
              if (resAtt) {
                message.info('提交成功');
                this.clearFormData();
              }
            },
          });
        } else {
          message.info('提交成功');
          this.clearFormData();
        }
      },
    });
  };

  clearFormData = () => {
    this.setState({showModal: false, loading: false});
    this.getCollisionReplaceData();
    this.geom = {};
    this.props.dispatch({
      type: 'workOrder/changeTaskFormData',
      payload: {
        params: [],
      },
    });
  };

  onClickGeomBtn = (name) => {
    let that = this;
    this.map.getMapDisplay().clear();
    that.geom = {};
    const mapTool = new DrawPointMapTool(that.map.getMapObj(), that.map.getApiUrl(), (geom) => {
      let pointParams = {
        id: 'reportPoint',
        layerId: 'report_point_layer',
        markersize: 8,
        linecolor: [226, 130, 34],
        fillcolor: [255, 255, 255, 0.4],
        x: geom.x,
        y: geom.y,
      };
      this.map.getMapDisplay().point(pointParams);
      that.geom[`${name}_geom`] = `${geom.x},${geom.y}`;
      setTimeout(() => {
        that.setState({
          isShowMap: false,
        });
      }, 500);
    });
    this.map.switchMapTool(mapTool);
    this.setState({
      isShowMap: true,
    });
  };

  // onChangeIsShowMap = () => {
  //   this.setState({
  //     isShowMap: !this.state.isShowMap,
  //   });
  // }

  onChangeQuery = (type, valueObj) => {
    let params = this.state.params;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;

    switch (type) {
      case 'state':
        params.eventState = valueObj.value;
        break;
      case 'time':
        params.stime = valueObj[0];
        params.etime = valueObj[1];
        break;
      default:
        break;
    }

    this.setState({
      params: params,
    });
    this.getCollisionReplaceData();
  }

  // 查询改变
  onChangeCondition = (searchObj) => {
    let params = this.state.params;
    params.condition = searchObj.condition;
    this.setState({
      params: params,
    });
  };

  // 页码改变
  onPageChange = (page, pageSize) => {
    let params = this.state.params;
    params.pageno = page;
    params.pagesize = pageSize;
    this.setState({
      params: params,
    });
    this.getCollisionReplaceData();
  }

  // 重置
  reset = () => {
    let params = this.state.params;
    params.eventState = '';
    params.stime = null;
    params.etime = null;
    params.condition = '';
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
    this.getCollisionReplaceData();
  };

  render() {
    const that = this;
    // 事件状态配置
    const eventStateData = [
      {name: '全部', value: '', showDot: true},
      {name: '申请待审批', value: '0', showDot: true},
      {name: '方案待制定', value: '1', showDot: true},
      {name: '碰接执行中', value: '2', showDot: true},
      {name: '碰接已完成', value: '3', showDot: true},
      {name: '待置换', value: '4', showDot: true},
      {name: '置换完成', value: '5', showDot: true},
    ];

    // 查询配置
    const queryData = [{
      name: 'condition',
      alias: '查询',
      value: this.state.params.condition,
      placeholder: '上报人/描述/地址/工单编号',
      valueType: 'input',
      width: '210px',
    }];

    const action = (dd) => {
      let btns = (dd.items || []).map((btn, i) => (
        <span
          key={i}
          style={{marginRight: 20, cursor: 'pointer', color: '#1890ff'}}
          onClick={that.getTaskFormData.bind(that, btn)}
        >
          {btn.taskName}
        </span>
      ));
      return (<span style={{float: 'right', marginRight: 20}}>
        {btns}
      </span>);
    };

    const columns = [{
      key: '1',
      width: '7%',
      render: (text, record) => {
        return (<div className={styles.metaAvatar}>
          <span className={styles.avatarImage} style={{backgroundColor: '#abd275'}}>
            <img alt="" src="../images/eventOverview/碰接置换.png" />
          </span>
        </div>);
      },
    }, {
      key: '2',
      width: '40%',
      render: (text, record) => {
        return (
          <span>
            <div style={{fontWeight: 'bold'}}>
              {record.proName === '' ?
                <span>
                  <span style={{marginRight: 20}} />
                  {record.zyName}
                </span> :
                <span>
                  <span style={{marginRight: 20}}>{record.proCode}</span>
                  {record.proName}
                </span>}
            </div>
            <div>类型:&nbsp;{record.text}</div>
            <div className={styles.textOverflow}>地址:&nbsp;
              <Tooltip placement="topLeft" title={record.pjCollisionPosition}>{record.pjCollisionPosition}</Tooltip>
            </div>
          </span>
        );
      },
    }, {
      key: '3',
      width: '28%',
      render: (text, record) => {
        return (
          <span>
            <span>工单编号:&nbsp;{record.baseCode || ''}</span>
            <br />
            <span>处理环节:&nbsp;{record.statename}</span>
            <br />
            <span>更新时间:&nbsp;{(record.baseUpdatetime || '').toString().substring(0, 16)}</span>
          </span>);
      },
    }, {
      key: '4',
      render: (text, record) => {
        return <span>{action(record)}</span>;
      },
    }];

    // 表格分页
    const pagination = {
      total: that.props.collisionReplaceTotal,
      current: that.state.params.pageno,
      pageSize: that.state.params.pagesize,
      showSizeChanger: true,
      showQuickJumper: true,
      onChange(page, pageSize) {
        that.onPageChange(page, pageSize);
      },
      onShowSizeChange(page, pageSize) {
        that.onPageChange(page, pageSize);
      },
      showTotal: (total, pageInfo) => { // 设置显示一共几条数据
        return `共${total}条数据`;
      },
    };

    const field = {
      searchWidth: '600px',
      search: [
        <SelectPanel
          fieldName="状态"
          value={this.state.params.eventState}
          dataType="ddl"
          data={eventStateData}
          onclick={this.onChangeQuery.bind(this, 'state')}
        />,
      ],
      extra: [
        <div>
          <span style={{marginRight: '15px'}}>更新时间 :</span>
          <RangePicker
            style={{width: 200, marginTop: 2}}
            value={[this.state.params.stime, this.state.params.etime]}
            onChange={this.onChangeQuery.bind(this, 'time')}
          />
        </div>,
        <SearchPanel
          ref="searchpanel"
          field={queryData}
          onclick={this.onChangeCondition}
        />,
      ],
      table: <Table
        rowKey="baseCode"
        dataSource={this.props.collisionReplaceList}
        columns={columns}
        pagination={pagination}
        showHeader={false}
        onRow={(record, index) => ({
            onDoubleClick: () => {
              let path = {
                pathname: '/order/workOrder-list-detail',
                processInstanceId: record.processinstanceid,
                formid: record.formid,
                workOrderNum: record.wocode,
                params: this.state.params,
              };
              this.props.dispatch(routerRedux.push(path));
            },
        })}
      />,
    };

    return (
      <PageHeaderLayout>
        <div style={{width: '100%', height: 'calc(100% - 175px)', minHeight: 'calc(100vh - 175px)', position: 'relative'}}>
          <SearchTablePanel field={field} onSearch={this.onChangeQuery.bind(this, '')} onReset={this.reset} />
          <div style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  display: this.state.isShowMap ? 'block' : 'none',
                  backgroundColor: '#fff',
                  zIndex: 10000,
                }}
          >
            <EcityMap mapId="workOrderOverview" onMapLoad={(aMap) => { this.map = aMap; }} />
          </div>
          <Modal
            width="770px"
            visible={this.state.showModal}
            onCancel={this.handleCancel}
            wrapClassName="web"
            footer={null}
            // onOk={this.handleOk}
            title={this.state.ModelData.taskName}
          >
            <div style={{display: 'block'}}>
              {this.state.showModal ?
                <SubmitForm
                  data={this.props.taskFormData.params}
                  cascade={this.props.taskFormData.cascade}
                  geomHandleClick={this.onClickGeomBtn}
                  column={2}
                  ref="formRef_1"
                /> : ''}
            </div>
            <div style={{height: '30px', marginTop: '25px'}}>
              <Button style={{float: 'right', marginLeft: '15px', marginRight: '30px'}} onClick={this.handleCancel.bind(this)}>取消</Button>
              <Button type="primary" style={{float: 'right'}} loading={this.state.loading} onClick={this.handleOk.bind(this)}>确定</Button>
            </div>
          </Modal>
        </div>
      </PageHeaderLayout>
    );
  }
}

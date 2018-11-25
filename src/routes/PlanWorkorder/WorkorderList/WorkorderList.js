import React from 'react';
import {routerRedux} from 'dva/router';
import {connect} from 'dva';
import {Modal, Button, message, Table} from 'antd';
import SearchPanel from '../../commonTool/SelectPanelTool/SearchPanel';
import EcityMap from '../../../components/Map/EcityMap';
import { DrawPointMapTool } from '../../../components/Map/common/maptool/DrawPointMapTool';
import styles from './WorkorderList.less';
import SubmitForm from '../../commonTool/SubmitFormModal/SubmitFormModal.js';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

const defaultParams = {
  eventType: '', // 事件类型
  department: '', // 上报部门
  stime: null, // 开始时间
  etime: null, // 结束时间
  condition: '', // 快速索引
  pageno: 1, //
  pagesize: 10,
};

@connect(state => ({
  user: state.login.user,
  woData: state.woPlanManage.woData,
  taskFormData: state.woPlanManage.taskFormData,
  stratFormData: state.submitFormManage.formData,
}))

export default class WorkorderList extends React.Component {
  constructor(props) {
    super(props);
    this._tool = this.props.location;
    let params = this._tool.params ? {...this._tool.params} : {...defaultParams};
    this.processinstanceKey = '';
    this.map = null;
    this.geom = '';
    this.setAddrTitle = null;
    this.state = {
      // 参数
      params: {...params},
      // 状态值
      isShowMap: false, // 是否展示地图
      showModal: false, // 是否展示模态框
      ModelData: {}, // 相关按钮内的值
      loading: false,
    };
  }

  componentDidMount() {
    this.getWorkOrderData();
  }

  componentWillUnmount() {

  }

  // 获取事件数据
  getWorkOrderData = () => {
    let data = {};
    let params = this.state.params;
    if (this.props.user.gid) {
      data.userid = this.props.user.gid;
    }
    if (params.woname) {
      data.woname = params.woname.replace(/(^\s*)|(\s*$)/g, '');
    }
    if (params.woType) {
      data.woType = params.woType;
    }
    if (params.planType) {
      data.planType = params.planType;
    }
    if (params.baseSubstate) {
      data.baseSubstate = params.baseSubstate;
    }
    if (params.pageno) {
      data.pageno = params.pageno;
    }
    if (params.pagesize) {
      data.pagesize = params.pagesize;
    }
    data.plat = 'web';
    this.props.dispatch({
      type: 'woPlanManage/getWoPlanWorkorderList',
      payload: data,
    });
  };

  // 获取新建工单表单
  getFormWoData = () => {
    this.processinstanceKey = 'woPlan';
    this.modalTitle = '新建工单';
    this.props.dispatch({
      type: 'submitFormManage/getWoFormData',
      params: {
        processDefinitionKey: this.processinstanceKey,
        userid: this.props.user.gid,
      },
      callback: (res) => {
        this.setState({
          loading: false,
        });
      },
    });
  }

  getTaskFormData = (data) => {
    this.props.dispatch({
      type: 'woPlanManage/getTaskFormData',
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
    let validate = this.refs.formRef_1.validateRequired();
    if (validate) {
      message.warning(`字段【${validate}】为空！`);
      return;
    }
    let params = this.refs.formRef_1.getValues();
    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        paramsObj[key] = params[key];
      }
    }

    let paramsAtt = this.refs.formRef_1.getAttValues();
    for (let key in paramsAtt) {
      if (paramsAtt.hasOwnProperty(key)) {
        paramsAttArray.push({name: key, value: paramsAtt[key]});
      }
    }
    this.setState({
      loading: true,
    }, () => {
      if (!this.processinstanceKey) {
        this.submitTaskFormData(paramsObj, (res) => {
          this.submitAttach(res, paramsAttArray);
        });
      } else {
        this.submitStartFormData(paramsObj, (res) => {
          this.submitAttach(res, paramsAttArray);
        });
      }
    });
  };

  submitTaskFormData = (paramsObj, callback) => {
    this.props.dispatch({
      type: 'woPlanManage/submitTaskFormData',
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
        if (!res.success) {
          message.error(res.msg);
          this.setState({loading: false});
          return;
        }
        callback && callback(res);
      },
    });
  }

  submitStartFormData = (params, callback) => {
    const tmpParams = {
      properties: JSON.stringify(params),
      userid: this.props.user.gid,
      user: this.props.user.trueName,
      username: this.props.user.trueName,
      processDefinitionKey: 'woPlan',
    };

    this.props.dispatch({
      type: 'submitFormManage/submitWoPlanForm',
      params: tmpParams,
      callback: (res) => {
        this.processinstanceKey = '';
        this.modalTitle = '';
        if (!res.success) {
          message.error(res.msg);
          this.setState({loading: false});
          return;
        }
        callback && callback(res);
      },
    });
  }

  submitAttach = (res, paramsAttArray) => {
    if (paramsAttArray.length > 0) {
      this.props.dispatch({
        type: 'woPlanManage/submitAttach',
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
  }

  clearFormData = () => {
    this.setState({showModal: false, loading: false});
    this.getWorkOrderData();
    this.props.dispatch({
      type: 'workOrder/changeTaskFormData',
      payload: {
        params: [],
      },
    });
  };

  onClickGeomBtn = (callback) => {
    this.map.getMapDisplay().clear();
    this.setAddrTitle = callback;
    this.geom = '';
    this.setState({
      isShowMap: true,
    });
  };

  geomSelectedPoint = (name, geom) => {
    this.geom[`${name}_geom`] = `${geom.x},${geom.y}`;
    this.setState({
      isShowMap: false,
    });
  }

  mapLoad = (aMap) => {
    this.map = aMap;
    if (this.geom) {
      this.showPoint();
    }
    this.drawPoint();
  }

  showPoint = () => {
    let onePoint = this.geom.split(',');
    this.map.getMapDisplay().clear();
    const param = {
      id: 'testlayerid0',
      layerId: 'testlayer0',
      src: '../../images/woPoint.png',
      width: 19,
      height: 27,
      angle: 0,
      // attr: onePoint,
      x: parseFloat(onePoint[0]),
      y: parseFloat(onePoint[1]),
    };
    this.map.getMapDisplay().image(param);
    this.map.centerAt(param);
  }

  drawPoint = () => {
    let that = this;
    const mapTool = new DrawPointMapTool(this.map.getMapObj(), this.map.getApiUrl(), (geom) => {
      let pointParams = {
        id: 'address_point',
        layerId: 'query_address_point_layer',
        src: '../images/woPoint.png',
        width: 19,
        height: 27,
        angle: 0,
        x: geom.x,
        y: geom.y,
      };
      this.map.getMapDisplay().image(pointParams);

      this.geom[`${name}_geom`] = `${geom.x},${geom.y}`;
      this.setAddrTitle(geom);
      this.setState({
        isShowMap: false,
      });
    });
    this.map.switchMapTool(mapTool);
  }

  changePanelData = (value) => {
    let params = this.state.params;
    params = {...params, ...value};
    this.setState({
      params: params,
    });
  }

  // 查询
  search = () => {
    let params = this.state.params;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
    this.getWorkOrderData();
  };

  // 重置
  reset = () => {
    let params = this.state.params;
    // params.eventState = '';
    params.woname = '';
    params.woType = '';
    params.planType = '';
    params.baseSubstate = '';
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
    this.getWorkOrderData();
  };

  getFieldList = (fields) => {
    let that = this;
    const fieldList = [];
    if (fields.length === 0) {
      return fieldList;
    }

    fields.forEach((item) => {
      if (item.visible) {
        let tmp = {
          title: item.alias,
          dataIndex: item.name,
          // width: 100,
          // fixed: 'left',
          key: item.name,
        };

        if (item.name === 'relevance_equipment') {
          tmp.render = (text, record, index) => {
            try {
              let jsonTxt = JSON.parse(text);
              return jsonTxt.dname;
            } catch(e) {
              return text;
            }
          };
        }
        if (item.name === 'equip_addr') {
          tmp.render = (text, record, index) => {
            try {
              let jsonTxt = JSON.parse(text);
              return jsonTxt.name;
            } catch(e) {
              return text;
            }
          };
        }
        fieldList.push(tmp);
      }
    });

    const action = (dd) => {
      let btns = (dd.items || []).map((btn, i) => (
        <span
          key={i}
          style={{ marginLeft: `${i === 0 ? 0 : 20}`, cursor: 'pointer', color: '#1890ff'}}
          onClick={that.getTaskFormData.bind(that, btn)}
        >
          {btn.taskName}
        </span>
      ));
      let leftWidth = (btns.length === 0 ? 0 : 20);
      btns.push(
        <span
          key={btns.length + 1}
          style={{ marginLeft: leftWidth, cursor: 'pointer', color: '#1890ff'}}
          onClick={that.showWoDetail.bind(that, dd)}
        >详情</span>
      );
      return <span style={{float: 'left'}}>{btns}</span>;
    };

    let opt = {
      title: '操作',
      width: 150,
      // fixed: 'left',
      // dataIndex: 'opt',
      key: 'opt',
      render: (text, record) => {
        let tmpspan = action(record);
        return <span>{tmpspan}</span>;
      },
    }
    fieldList.push(opt);
    return fieldList;
  }

  showWoDetail = (record) => {
    let path = {
      pathname: '/order/workOrder-list-detail',
      processInstanceId: record.processinstanceid,
      formid: '11000001',
      workOrderNum: record.base_code,
      params: this.state.params,
      historyPageName: '/equipment/wo-list',
    };
    this.props.dispatch(routerRedux.push(path));
  }

  showWorkorderModal = () => {
    this.getFormWoData();
    this.setState({
      showModal: true,
    });
  }

  dealWoData = (features) => {
    const woDataList = [];
    features.forEach((item) => {
      woDataList.push({...item.attributes, ...{items: item.items}});
    });
    return woDataList;
  }

  dealPanelData = (fields) => {
    // 事件类型配置
    const woNameSelect = [{
      name: 'woname',
      alias: '工单编号',
      valueType: 'input',
      value: this.state.params.woname,
      width: '120px',
    }];

    const woType = [{name: '全部', value: ''}];
    const planType = [{name: '全部', value: ''}];
    const woState = [{name: '全部', value: ''}];

    fields.forEach((item) => {
      if (item.name === 'wo_type') {
        item.selectValues.forEach((tmpWo) => {
          woType.push({name: tmpWo.alias, value: tmpWo.name});
        });
      }
      if (item.name === 'plan_type') {
        item.selectValues.forEach((tmpWo) => {
          planType.push({name: tmpWo.alias, value: tmpWo.name});
        });
      }
      if (item.name === 'base_substate') {
        item.selectValues.forEach((tmpWo) => {
          woState.push({name: tmpWo.alias, value: tmpWo.name});
        });
      }
    });

    const woTypeSelect = [{
      name: 'woType',
      alias: '工单类型',
      valueType: 'ddl',
      selectValues: woType,
      value: this.state.params.woType || woType[0].value,
      width: '140px',
    }];

    const planTypeSelect = [{
      name: 'planType',
      alias: '小类',
      valueType: 'ddl',
      selectValues: planType,
      value: this.state.params.planType || planType[0].value,
      // selectValues: this.props.stationData,
      width: '120px',
    }];

    const woStateSelect = [{
      name: 'baseSubstate',
      alias: '状态',
      valueType: 'ddl',
      selectValues: woState,
      value: this.state.params.baseSubstate || woState[0].value,
      // selectValues: this.props.stationData,
      width: '120px',
    }];
    return {woNameConfig: woNameSelect,woTypeConfig: woTypeSelect, planTypeConfig: planTypeSelect, woStateConfig: woStateSelect};
  }

  render() {
    const that = this;
    const {features, fields, total} = this.props.woData;
    const {woNameConfig, woTypeConfig, planTypeConfig, woStateConfig} = this.dealPanelData(fields);
    const woList = this.dealWoData(features);
    const cols = this.getFieldList(fields);
    // 表格分页
    const pagination = {
      total: parseInt(total, 10),
      current: that.state.params.pageno,
      pageSize: that.state.params.pagesize,
      showSizeChanger: true,
      showQuickJumper: true,
      onChange(page, pageSize) {
        let params = that.state.params;
        params.pageno = page;
        params.pagesize = pageSize;
        that.setState({
          params: params,
        });
        that.getWorkOrderData();
      },
      onShowSizeChange(current, pageSize) {
        let params = that.state.params;
        params.pageno = current;
        params.pagesize = pageSize;
        that.setState({
          params: params,
        });
        that.getWorkOrderData();
      },
      showTotal: function () {
        // 设置显示一共几条数据
        return <div style={{marginRight: this.width}}>共 {this.total} 条数据</div>;
      },
    };

    return (
      <PageHeaderLayout>
        <div className={styles.borderDiv}>
          <div className={styles.searchPanel}>
            <SearchPanel field={woNameConfig} onclick={this.changePanelData.bind(this)} />
            <div className={styles.btnMergin}><SearchPanel field={woTypeConfig} onclick={this.changePanelData.bind(this)} /></div>
            <div className={styles.btnMergin}><SearchPanel field={planTypeConfig} onclick={this.changePanelData.bind(this)} /></div>
            <div className={styles.btnMergin}><SearchPanel field={woStateConfig} onclick={this.changePanelData.bind(this)} /></div>
            <Button type="primary" className={styles.btnMergin} onClick={this.getWorkOrderData}>查询</Button>
            <Button className={styles.btnMergin} onClick={this.reset}>重置</Button>
            <Button type="primary" className={styles.btnMergin} onClick={this.showWorkorderModal}>新增工单</Button>
          </div>
          <Table
            rowKey={(record) => record.processinstanceid}
            dataSource={woList}
            columns={cols}
            // scroll={{ x: 1200}}
            pagination={pagination}
            onRow={(record, index) => ({
                onDoubleClick: () => {
                  let path = {
                    pathname: '/order/workOrder-list-detail',
                    processInstanceId: record.processinstanceid,
                    formid: '11000001',
                    workOrderNum: record.base_code,
                    params: this.state.params,
                    historyPageName: '/equipment/wo-list',
                  };
                  this.props.dispatch(routerRedux.push(path));
                },
            })}
          />
          <div className={styles.mapDiv} style={{display: this.state.isShowMap ? 'block' : 'none'}}>
            <EcityMap mapId="workOrderOverview" onMapLoad={this.mapLoad} />
          </div>
          <Modal
            width="770px"
            visible={this.state.showModal}
            onCancel={this.handleCancel}
            wrapClassName="web"
            footer={null}
            title={this.modalTitle || this.state.ModelData.taskName}
          >
            <div style={{display: 'block'}}>
              {this.state.showModal ?
                <SubmitForm
                  data={this.processinstanceKey ? this.props.stratFormData.params[0].items : this.props.taskFormData.params}
                  cascade={this.processinstanceKey ? this.props.stratFormData.cascade : this.props.taskFormData.cascade}
                  column={2}
                  ref='formRef_1'
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

import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Table, Dropdown, Menu, Icon,Modal, message} from 'antd';
import {Link} from 'dva/router';
import moment from 'moment';
const FormatStr = 'YYYY-MM-DD';
import NormalPlanForm from '../ModalForm/NormalPlanForm';
import TempPlanForm from '../ModalForm/TempPlanForm';
const confirm =Modal.confirm;
const COL_FUNS={
  valve:'养护',
  regulator_a:'养护',
  regulator_b:'养护',
  regulator_c:'养护',
  regulator_debug_qieduan:'养护',
  regulator_debug_fangsan:'养护',
  regulator:'养护',
  safety_check:'安检',
  meter_read:'抄表',
  meter_check:'检定',
  negative_stub_check:'检测',
};




class MaintainTable extends PureComponent {
  constructor(){
    super();

    this.state = {
      normal: false,
      temp: false,
      loading: false,
      oldInfo: "",
      hasPlanName: false,
    }
    this.form = null;
  }

  changeHandler(record) {
    let that = this;
    let src = record.status === 2 ? 'start' : 'stop';
    let mt = record.status === 2 ? '启动' : '停止';
    confirm({
      title: `是否${mt}计划?`,
      onOk() {
        that.props.dispatch({
          type: 'maintain/startplan',
          planId: record.planId,
          src,
          callback: ({success, msg}) => {
            if(success){
              message.success(msg)
              const {queryFilter} = that.props
              const params = {
                pageno: that.props.data.pagination.current,
                pagesize: that.props.data.pagination.pageSize,
                ...queryFilter
              };
              that.queryMaintainPlan(params);
            }else{
              message.err(msg)
            }
          }
        });
      },
      onCancel() {
      }
    });
  };
  delHandler(record) {
    let that = this;
    confirm({
      title: '是否删除计划?',
      onOk() {
        that.props.dispatch({
          type: 'maintain/delplan',
          payload: record.planId,
          callback: ({success, msg}) => {
            if(success){
              message.success(msg);
               const {queryFilter} = that.props
              const params = {
                pageno: that.props.data.pagination.current,
                pagesize: that.props.data.pagination.pageSize,
                ...queryFilter
              };
              that.queryMaintainPlan(params);
            }
          }
        });
      },
      onCancel() {
      }
    });
  };
  queryMaintainPlan = (params = {}) => {
    this.props.dispatch({
      type: 'maintain/queryMaintainPlan',
      payload: {
        ...params,
        function: this.props.data.functionkey,
      },
    });
  };

  onShowSizeChangehandler = (page, pageSize) =>{
    console.log(page, pageSize, "11111")
  };
  handleTableChange=(pagination)=>{
    const {queryFilter} = this.props
    const params = {
      pageno: pagination.current,
      pagesize: pagination.pageSize,
      ...queryFilter
    };
    this.queryMaintainPlan(params);
  };
  //查看临时计划
  showNewTempModal = (key) => {
    this.setState({
      [key]: true,
      loading: false,
      temp: true,
      oldInfo: key,
    });
    const params = {
      planId: key.planId,
      startTime: key.startTime,
      endTime: key.endTime,
      function: key.functionKey,
      pageno: 1,
      pagesize: 10,
    }
    this.props.dispatch({
      type: "taskdetail/getCardDetail",
      payload: params,
    })
    this.refs.getChildernFunc.resetTempData(key)
  };
    //关闭临时计划窗口
  handleTempCancel = (key) => {
    this.setState({
      [key]: false,
      normal: false,
      temp: false,
      "tempName": '',
      "hasTempName" : false,

    });
  };

/*--------------------------------------------------------------------------------------------*/
  //查看、编辑常规计划方法；
  //查看、编辑常规计划
  showNewNormalModal = (key) => {
    const form = this.form;
    this.setState({
      [key]: true,
      loading: false,
      normal: true,
      normalName: key.name
    });
    form.setFieldsValue({
      regionName: key.regionName,
      userName: key.assigneeName,
      startTime: moment(key.startTime, FormatStr)
    });
    if (!this.props.areaData || this.props.areaData.length === 0) {
      this.props.dispatch({
        type: 'maintain/getAreaData',
      });
    }
  };

  //关闭常规计划窗口
  handleNormalCancel = (key) => {
    this.setState({
      [key]: false,
      normal: false,
      "normalName": '',
      "hasPlanName" : false,
    });
  };
  getCategory = () => {
    switch(this.props.functionkey){
      case 'regulator_a':
        return 2;
      case 'regulator_b':
        return 3;
      case 'regulator_c':
        return 4;
    }
  }
  handleOk = () => {
    const form = this.form;
    // form.validateFields((err, values) => {
    //   if (err) {
    //     return;
    //   }
      // this.setState({loading: true});//只有通过表单验证才产生loding状态
      // const {oldInfo} = this.state;
      // const {name, stationid, gid, station, eqlocation, ecode, userid, usernames} = this.extraParams;
      // const categoryData = this.getCategory(this.func)
      // const params = {
      //   assigneeId:userid,
        // assigneeName:usernames,
      //   zoneId: eqlocation.parentId,
        // regionId: eqlocation.gid,
      //   regionName: name,
        // startTime: values.startTime.format('YYYY-MM-DD') + " " + "00:00:00",
      //   ecode: ecode,
      //   'function': this.props.functionkey,
      //   params: categoryData == undefined ? '' : JSON.stringify({'category': categoryData}),
      //   planName:this.state.normalName,

      // };
      // console.log(params, "★")
      // this.props.dispatch({
      //   type: 'maintain/editRulePlan',
      //   payload: params,
      //   callback: ({success, msg}) => {
      //     if (success) {
      //       message.success('添加成功！');
      //       form.resetFields();
      //       this.queryMaintainPlan();
      //       this.setState({
      //           normalName: ''
      //         });
      //     } else {
      //       message.info(`添加失败:${msg}！`);
      //       setTimeout(() => {
      //         this.setState({
      //           loading: false,
      //         });
      //       }, 1000);
      //     }
      //     this.setState({
      //       normal: !success,
      //       loading: !success,
      //     });
      //   },
      // });
    // });
  };

  extraHandle = (params) => {
    if(params === undefined){
      this.this.extraParams = this.state.oldInfo
    }else{
      this.extraParams = params;
    }
    const date = new Date()
    const normalNameData = params.name + '_' + moment(date).format(FormatStr)
    if(!this.state.hasPlanName){
      this.setState({
        "normalName" : normalNameData,
      })
    }

  };

  changePlanName = (params) => {
    this.setState({"normalName" : params})
    if(params === ''){
      this.setState({
        "hasPlanName" : false
      })
    }else{
      this.setState({
        "hasPlanName" : true
      })
    }
  }
  /*--------------------------------------------------------------------------------------------*/
  render() {
    const {data: {data, pagination, funclist, functionkey}, loading, taskTypes = [], queryFilter,stationData} = this.props;
    const types = {};
    taskTypes.forEach(type => {
      types[type.name] = type.alias
    });
    const tName = COL_FUNS[functionkey]||'养护';
    const columns = [
      {
        title: '计划名称',
        dataIndex: 'taskType',
        key: 'taskType',
        render: (text, record) => {
          return <span>
            <div style={{color: text === 2 ? 'red' : '#379FFF'}}>{types[text] || '未知'}</div>
            <div>{`${record.name}`}</div>
          </span>
        }
      },
      {
        title: '责任人',
        dataIndex: 'assigneeName',
        key: 'assigneeName',
        render: (text, record) => {
          let id = stationData[record.stationid] || record.gid;
          let patrolorImg = ['橙', '黄', '蓝', '绿', '紫'][id ? id % 5 : Math.floor(Math.random() * 5)];
          return <span style={{fontSize: 14}}><img src={`/images/${patrolorImg}.png`}/>{text}</span>
        }
      },
      {
        title: `${tName}对象`,
        dataIndex: 'regionName',
        key: 'regionName',
        render: (text, record) => {
          let eqName = ''
          if(record && record.functionKey){
            if(record.functionKey.startsWith('regulator')){
              eqName = '调压器'
            }else if(record.functionKey.startsWith('negative')){
              eqName = '阴极桩'
            }else if(record.functionKey === 'meter_check'){
              eqName = '表具'
            }else if(record.functionKey === 'valve'){
              eqName = '阀门'
            }else{
              eqName = record.functionName
            }
          }
          return <span>
            <div>{text}</div>
            <div>{eqName}：<span style={{color: "#379FFF"}}>{record.eqCount}</span></div>
          </span>
        }
      },
      {
        title: `${tName}周期`,
        dataIndex: 'cycleName',
        key: 'cycleName',
        render: (text, record) => {
          const len = parseInt(record.len) > 1 ? record.len : '';

          return <span>
            <div>{len} {text}</div>
          </span>
        }
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        // sorter : (a, b)=> {
        //   return new Date(a.startTime) - new Date(b.startTime)
        // },
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => {
          switch (text) {
            case 2:
              return <a style={{"color": "red", "pointer": "cursor"}} onClick={() => {
                this.changeHandler(record)
              }}><Icon type="close-circle-o"/>
                停止</a>
            case 0:
            case 1:
              return <a style={{"color": "#379FFF", "pointer": "cursor"}} onClick={() => {
                this.changeHandler(record)
              }}><Icon type="check-circle-o"/>
                启动</a>
          }
        }
      },
      {
        title: '操作',
        key: 'manipulate',

        render: (text, record, index) => {
          const path = {
            pathname: '/query/task-summary',
            state: {
              cardfunctionkey:this.props.tabFunc,
              maintainValue: this.props.tabFuncName,
              functionkey: functionkey,
              planId: record.planId,
              names: record.name
            }
          }
          /*const menu = (
            text.taskType == 1 ?
                <Menu>
                  <Menu.Item key="1">
                    <a onClick={() => {
                      this.delHandler(record)
                    }}>删除</a>
                  </Menu.Item>
                </Menu>
                :
                <Menu>
                  <Menu.Item key="2">
                    <a onClick={() => {
                      this.showNewTempModal(record)
                    }}>查看</a>
                  </Menu.Item>
                  <Menu.Item key="1">
                    <a onClick={() => {
                      this.delHandler(record)
                    }}>删除</a>
                  </Menu.Item>
                </Menu>
          );*/
            const menu = (
                <Menu>
                  <Menu.Item key="1">
                    <a onClick={() => {
                      this.delHandler(record)
                    }}>删除</a>
                  </Menu.Item>
                </Menu>
            );
          return <span>
                <Link to={path}>任务</Link>
                {" "}|{" "}
                <Dropdown overlay={menu} trigger={['click']}>
                  <a className="ant-dropdown-link" href="#">
                    更多 <Icon type="down"/>
                  </a>
                </Dropdown>
              </span>
        }

      }
    ];

    return (
      <div>
        <Table
          //loading={loading}
          rowKey={record => record.planId}
          dataSource={data}
          columns={columns}
          pagination={{
            showQuickJumper: true,
            showSizeChanger : true,
            defaultPageSize: pagination.pageSize,
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showTotal: (total) => `第${pagination.current}页 共${total}条数据`
          }}
          onChange={(pagination)=>{this.handleTableChange(pagination)}}
        />

        <TempPlanForm
          ref="getChildernFunc"
          changeTempName={this.changeTempName}
          tempName={this.state.tempName}
          TempmodalKey= {this.state.TempmodalKey}
          visible={this.state.temp}
          handCancel={this.handleTempCancel}
          origEquData={this.props.origEquData}
          equData={this.props.equData}
          handleSubmitPlan={this.handleTempCancel}
          areaData={this.props.areaData}
          dispatch={this.props.dispatch}
          detaildata={this.props.detaildata}
          func={functionkey}
          eqcheck={this.eqcheck}
          loading={this.state.loading}
          oldInfo={this.state.oldInfo}
          callbackRegion={this.callbackRegion}
          callbackDevice={this.callbackDevice}
          callbackRoad={(road)=>{
            this.road=road;
          }}
        />

        <NormalPlanForm
          ref={form => {
            this.form = form;
          }}
          extraHandle={this.extraHandle}
          changePlanName={this.changePlanName}
          visible={this.state.normal}
          handCancel={this.handleNormalCancel}
          handleSubmitRulePlan={this.handleOk}
          areaData={this.props.areaData}
          dispatch={this.props.dispatch}
          func={this.func}
          loading={this.state.loading}
        />
      </div>
    );
  }
}

export default connect(
  ({maintain, taskdetail})=>{
    return {
      maintain,
      taskdetail
    }
  }
)(MaintainTable);

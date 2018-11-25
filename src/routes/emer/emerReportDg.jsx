import React from 'react';
import {connect} from 'dva';
import {Button, Select, Input, Table, message, Row, Col, DatePicker } from 'antd';
import moment from 'moment';
import Dialog from '../../components/yd-gis/Dialog/Dialog';
import styles from './css/emerReport.css';

// 接警方式
const alarmReceiveTypeArr = [{gid: 0, name: '员工上报'}, {gid: 1, name: '三方险情'}, {gid: 2, name: '政府相关部门转接'}];
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const Option = Select.Option;

// 单个属性的显示
const OneField = ({name = '', value = '', width = '50%', onChange}) => {
  const nameLength = name.length * 14 + 14;
  return (
    <div style={{padding: 5, display: 'inline-block', width}}>
      <span>{name}</span>
      <Input
        value={value}
        style={{width: `calc(100% - ${nameLength}px)`, cursor: 'pointer'}}
        disabled={!onChange}
        onChange={onChange}
      />
    </div>
  );
};

//时间框
const OneFieldTime = ({name = '', value = '', width = '50%', onChange}) => {
  const nameLength = name.length * 14 + 14;
  return (
    <div style={{padding: 5, display: 'inline-block', width}}>
      <span>{name}</span>
      <DatePicker
        value={value}
        allowClear={false}
        style={{width: `calc(100% - ${nameLength}px)`, cursor: 'pointer'}}
        format={dateFormat}
        disabled={!onChange}
        onChange={onChange}
      />
    </div>
  );
};

// 停气范围下拉选
const OneFieldSelectS = ({name = '', value = '', width = '50%', onChange}) => {
  const nameLength = name.length * 14 + 14;
  return (
    <div style={{padding: 5, display: 'inline-block', width}}>
      <span>{name}</span>
      <Select
        value={value}
        style={{width: `calc(100% - ${nameLength}px)`, cursor: 'pointer'}}
        format={dateFormat}
        disabled={!onChange}
        onChange={onChange}
      >
        <Select.Option value="造成特大用户停气">造成特大用户停气</Select.Option>
        <Select.Option value="造成50户以上工商户停气">造成50户以上工商户停气</Select.Option>
        <Select.Option value="造成50户或以下工商户停气">造成50户或以下工商户停气</Select.Option>
        <Select.Option value="造成5个以上居民小区停气">造成5个以上居民小区停气</Select.Option>
        <Select.Option value="造成5个或以下居民小区停气">造成5个或以下居民小区停气</Select.Option>
      </Select>
    </div>
  );
};
//人员伤亡下拉选
const OneFieldSelectP = ({name = '', value = '', width = '50%', onChange}) => {
  const nameLength = name.length * 14 + 14;
  return (
    <div style={{padding: 5, display: 'inline-block', width}}>
      <span>{name}</span>
      <Select
        value={value}
        style={{width: `calc(100% - ${nameLength}px)`, cursor: 'pointer'}}
        format={dateFormat}
        disabled={!onChange}
        onChange={onChange}
      >
        <Select.Option value="人员死亡">人员死亡</Select.Option>
        <Select.Option value="已经或预计造成人员重伤或轻伤4人或以上">已经或预计造成人员重伤或轻伤4人或以上</Select.Option>
        <Select.Option value="已经或预计无人员重伤或轻伤4人以下">已经或预计无人员重伤或轻伤4人以下</Select.Option>
        <Select.Option value="无人员伤亡">无人员伤亡</Select.Option>
      </Select>
    </div>
  );
};
//响应级别下拉选
const OneFieldSelectX = ({name = '', value = '', width = '50%', onChange}) => {
  const nameLength = name.length * 14 + 14;
  return (
    <div style={{padding: 5, display: 'inline-block', width}}>
      <span>{name}</span>
      <Select
        value={value}
        style={{width: `calc(100% - ${nameLength}px)`, cursor: 'pointer'}}
        format={dateFormat}
        disabled={!onChange}
        onChange={onChange}
      >
        <Select.Option value={1}>Ⅰ</Select.Option>
        <Select.Option value={2}>Ⅱ</Select.Option>
        <Select.Option value={3}>Ⅲ</Select.Option>
      </Select>
    </div>
  );
};
//事件类型下拉选
const OneFieldSelectT = ({name = '', value = '', width = '50%', data = '', onChange}) => {
  const nameLength = name.length * 14 + 14;
  return (
    <div style={{padding: 5, display: 'inline-block', width}}>
      <span>{name}</span>
      <Select
        value={value}
        style={{width: `calc(100% - ${nameLength}px)`, cursor: 'pointer'}}
        format={dateFormat}
        disabled={!onChange}
        onChange={onChange}
      >
        {
          data.length > 0 && data.map((item, index) => {
            return (<Option key={index} value={item.gid}>{item.name}</Option>);
          })
        }
      </Select>
    </div>
  );
};

// 显示层级
const Gradition = ({name = '', children, first = false}) => {
  const styles1 = {
    fontSize: '16px',
    fontWeight: 'bold',
    borderLeft: '3px solid dodgerblue',
    margin: '5px',
    paddingLeft: '5px'
  };
  const styles2 = {
    fontWeight: 'bold',
    padding: '5px',
  };
  return (
    <div>
      <div style={first ? styles1: styles2}>{name}</div>
      <div style={{marginLeft: '10px'}}>{children}</div>
    </div>
  )
};

@connect(state => ({
  user: state.login.user,
}))

export default class EmerReport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orderListData: [],
      emerHandleProcessInfo: [],
      emerEventTypeData: [], //事件类型
      emerReportData: null,
    };
    this.openCreateEmerReport();
    this.handleGetEmerEventType()
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };

  handleReport = (data = {}) => {
    let returnDiv = '';
    for(let item in data){

    }
    return returnDiv;
  };

  // 查询应急事件类型
  handleGetEmerEventType = () => {
    let data = {
      ecode: this.props.user.ecode,
    };
    this.props.dispatch({
      type: 'emer/getEmerEventType',
      payload: data,
      callback: (res) => {
        this.setState({
          emerEventTypeData: res.data,
        });
      },
    });
  };

  // 获取应急处置过程中发布的指令
  handleGetHandleProcessOrder = (model) => {
    let data = {};
    data.alarmId = model.alarmId || '';
    this.props.dispatch({
      type: 'emer/getEmerOrderList',
      payload: data,
      callback: (res) => {
        this.setState({
          orderListData: res.data,
        });
      },
    });
  }

  // 获取应急处置过程信息
  handleGetHandleProcessInfo = (model) => {
    let data = {};
    data.alarmId = model.alarmId || '';
    this.props.dispatch({
      type: 'emer/getEmerHandleProcessRecord',
      payload: data,
      callback: (res) => {
        this.setState({
          emerHandleProcessInfo: res.data,
        });
      },
    });
  }

  // 2.应急报告：提醒用户注意事项
  handleGetUserNotice = (model, index) => {
    if (!model.reportGroups || !model.reportGroups[index]) {
      return;
    }
    model.setEmerReportSelectValue = this.setEmerReportSelectValue;
    model.setEmerReportInputValue = this.setEmerReportInputValue;
    let itemArr = model.reportGroups[index].items;
    const content = [];
    let rowComp = [];
    let gi = 100;
    itemArr.forEach((item, ii) => {
      if (item.datatype === 'text') {
        if (item.datavalues) {
          let opArr = item.datavalues.split('/');
          rowComp.push(
            <span className={styles.block2} key={ii}>{item.operitem}：
              <Select
                onChange={(val) => {
                  model.setEmerReportSelectValue(item.operitem, val, index);
                }}
                defaultValue={-1}
                style={{width: 50, display: 'inline-block'}}
              >
                <Option value={-1}></Option>
                <Option value={opArr[0]}>{opArr[0]}</Option>
                <Option value={opArr[1]}>{opArr[1]}</Option>
              </Select>
            </span>
          );
        } else {
          rowComp.push(
            <span className={styles.block2} key={ii}>{item.operitem}：
              <Input
                type={item.datatype}
                defaultValue=""
                style={{width: 100}}
                onBlur={(e) => {
                  model.setEmerReportInputValue(item.operitem, e);
                }}
              />
            </span>
          );
        }
        if (rowComp.length === 2 || item.operitem.length > 18) {
          content.push(<div
            key={`gi${gi + ii}`}
            className={styles.row}
          >
            {rowComp}
          </div>);
          rowComp = [];
        }
      }
    });
    return (
      <div>
        <div className={styles.blockTitle}>{model.reportGroups[index].opergroup}</div>
        <div>
          {
            content
          }
        </div>
      </div>
    );
  }

  // 设置应急报告中的下拉项值
  setEmerReportSelectValue = (name, value, index) => {
    let reportGroup = this.state.emerReportData.reportGroups[index].items;
    for (let i = 0; i < reportGroup.length; i += 1) {
      if (name === reportGroup[i].operitem) {
        this.state.emerReportData.reportGroups[index].items[i].operitemvalue = value;
      }
    }
  }

  // 设置应急报告中的输入项值
  setEmerReportInputValue = (name, e) => {
    this.setEmerReportSelectValue(name, e.target.value, 1);
  }

  // 生成应急报告
  openCreateEmerReport = () => {
    if (this.props.emerEvent) {
      this.props.dispatch({
        type: 'emerLfMap/getEmerReport',
        payload: {
          eventId: this.props.emerEvent.alarmId,
        },
        callback: (res) => {
          this.setState({
            emerReportData: res.data,
          });
        },
      });
    }
  };

  // 保存应急报告
  handleSaveEmerReport = () => {
    const {onCancel, emerEvent} = this.props;
    let fd = new FormData();
    fd.append('params', JSON.stringify(this.state.emerReportData));
    fd.append('eventId', emerEvent.alarmId || '');
    this.props.dispatch({
      type: 'emer/saveEmerReport',
      payload: fd,
      callback: (res) => {
        // 保存成功后关闭应急报告窗口
        onCancel();
        message.info(res.msg);
      },
    });
  }

  //打开控制方案；
  openCtroll = () => {
    console.log(this.props, 'props')
    this.props.goControll();
    this.props.changeStatus({currentClickEvent: this.props.emerEvent});
    this.props.handleGoEmer(this.props.emerEvent)
  }

  getDivs = (emerReportData) => {
    let usersListColumns = [{
      title: '名称', dataIndex: '名称', key: '名称', width: '15%',
    }, {
      title: '单位', dataIndex: '单位', key: '单位',
    }, {
      title: '岗位', dataIndex: '岗位', key: '岗位', width: '25%',
    }, {
      title: '到场时间', dataIndex: '到岗时间', key: '到岗时间', width: '20%',
    }];
    let closeValvesColumns = [{
      title: '操作人员', dataIndex: '操作人员', key: '操作人员', width: '33%',
    }, {
      title: '关闭时间', dataIndex: '关闭时间', key: '关闭时间', width: '33%',
    }, {
      title: '阀门编号', dataIndex: '阀门编号', key: '阀门编号',
    }];
    let gasListColumns = [{
      title: '操作人员', dataIndex: '操作人员', key: '操作人员', width: '25%',
    }, {
      title: '接入时间', dataIndex: '接入时间', key: '接入时间', width: '25%',
    }, {
      title: '接入地点', dataIndex: '接入地点', key: '接入地点',
    }];
    let stopGasListColumns = [{
      title: '操作人员', dataIndex: '操作人员', key: '操作人员', width: '25%',
    }, {
      title: '通知时间', dataIndex: '通知时间', key: '通知时间', width: '25%',
    }, {
      title: '通知单位', dataIndex: '通知单位', key: '通知单位',
    }];
    return(<div>
      <Gradition name="事故概况" first>
        <OneFieldSelectT name="接警方式：" value={emerReportData.事故概况.接警方式} data={alarmReceiveTypeArr} onChange={(val) => {
          let emerReportData1 = {...this.state.emerReportData};
          emerReportData1.事故概况.接警方式 = val;
          this.setState({emerReportData: emerReportData1})}
        }/>
        <OneField name="日期时间：" value={emerReportData.事故概况.日期时间}/>
        <OneField name="险情地点：" value={emerReportData.事故概况.险情地点} onChange={(e) => {
          let emerReportData1 = {...this.state.emerReportData};
          emerReportData1.事故概况.险情地点 = e.target.value;
          this.setState({emerReportData: emerReportData1})}
        }/>
        <OneField name="抢险对象：" value={emerReportData.事故概况.抢险对象} onChange={(e) => {
          let emerReportData1 = {...this.state.emerReportData};
          emerReportData1.事故概况.抢险对象 = e.target.value;
          this.setState({emerReportData: emerReportData1})}
        }/>
        <OneField name="对象属性：" value={emerReportData.事故概况.对象属性} onChange={(e) => {
          let emerReportData1 = {...this.state.emerReportData};
          emerReportData1.事故概况.对象属性 = e.target.value;
          this.setState({emerReportData: emerReportData1})}
        }/>
        <OneField name="管道属性：" value={emerReportData.事故概况.管道属性} onChange={(e) => {
          let emerReportData1 = {...this.state.emerReportData};
          emerReportData1.事故概况.管道属性 = e.target.value;
          this.setState({emerReportData: emerReportData1})}
        }/>
        <OneFieldSelectT name="事故类型：" value={emerReportData.事故概况.事故类型} data={this.state.emerEventTypeData} onChange={(val) => {
          let emerReportData1 = {...this.state.emerReportData};
          emerReportData1.事故概况.事故类型 = val;
          this.setState({emerReportData: emerReportData1})}
        }/>
        <OneField name="事故诱因：" value={emerReportData.事故概况.事故诱因} width = '100%' onChange={(e) => {
          let emerReportData1 = {...this.state.emerReportData};
          emerReportData1.事故概况.事故诱因 = e.target.value;
          this.setState({emerReportData: emerReportData1})}
        } />
        <OneFieldSelectS name="停气范围：" value={emerReportData.事故概况.停气范围} onChange={(val) => {
          let emerReportData1 = {...this.state.emerReportData};
          emerReportData1.事故概况.停气范围 = val;
          let level = 1;
          if (val === '造成特大用户停气' || val === '造成50户以上工商户停气') {
            level = 1;
          } else if (val === '造成5个或以下居民小区停气') {
            level = 3;
          } else {
            level = 2;
          }
          emerReportData1.事故概况.响应级别 = level;
          this.setState({emerReportData: emerReportData1})}
        }/>
        <OneFieldSelectP name="人员伤亡：" value={emerReportData.事故概况.人员伤亡} onChange={(val) => {
          let emerReportData1 = {...this.state.emerReportData};
          emerReportData1.事故概况.人员伤亡 = val;
          let level = 1;
          if (val === '人员死亡' || val === '已经或预计造成人员重伤或轻伤4人或以上') {
            level = 1;
          } else if (val === '已经或预计无人员重伤或轻伤4人以下') {
            level = 2;
          } else {
            level = 3;
          }
          emerReportData1.事故概况.响应级别 = level;
          this.setState({emerReportData: emerReportData1})}
        }/>
        <OneFieldSelectX name="响应级别：" value={emerReportData.事故概况.响应级别} onChange={(val) => {
          let emerReportData1 = {...this.state.emerReportData};
          emerReportData1.事故概况.响应级别 = val;
          this.setState({emerReportData: emerReportData1})}
        }/>
      </Gradition>
      <Gradition name="人员到达情况" first>
        <Table
          bordered
          columns={usersListColumns}
          dataSource={emerReportData.人员到达情况}
          pagination={false}
          scroll={{x: false, y: 120}}
        />
      </Gradition>
      <Gradition name="事故处置经过" first>
        <Gradition name="接警核实">
          <OneField name="上报时间：" value={(emerReportData.事故处置经过.接警核实 || {}).上报时间}/>
          <OneField name="核实人员：" value={(emerReportData.事故处置经过.接警核实 || {}).核实人员}/>
        </Gradition>
        <Gradition name="预案启动">
          <OneFieldTime name="启动时间：" value={emerReportData.事故处置经过.预案启动 ? moment(emerReportData.事故处置经过.预案启动.启动时间, dateFormat) : null} onChange={(date, dateString) => {
            let emerReportData1 = {...this.state.emerReportData};
            emerReportData1.事故处置经过.预案启动.启动时间 = dateString ? dateString : null;
            this.setState({emerReportData: emerReportData1})}
          }/>
          <OneField name="启动人员：" value={(emerReportData.事故处置经过.预案启动 || {}).启动人员} onChange={(e) => {
            let emerReportData1 = {...this.state.emerReportData};
            emerReportData1.事故处置经过.预案启动.启动人员 = e.target.value;
            this.setState({emerReportData: emerReportData1})}
          }/>
          <div style={{padding: 5, display: 'inline-block', width: '50%'}}>
            <span>控制方案：</span>
            <Button onClick={this.openCtroll}>应急控制方案</Button>
          </div>
          {/* (emerReportData.事故处置经过.预案启动 || {}).控制方案 */}
        </Gradition>
        <Gradition name="关阀">
          <Table
            bordered
            columns={closeValvesColumns}
            dataSource={(emerReportData.事故处置经过.关阀 || [])}
            pagination={false}
            scroll={{x: false, y: 120}}
          />
        </Gradition>
        <Gradition name="辅助控制措施">
          <OneField name="采取方式：" value={(emerReportData.事故处置经过.辅助控制措施 || {}).采取方式} onChange={(e) => {
            let emerReportData1 = {...this.state.emerReportData};
            emerReportData1.事故处置经过.辅助控制措施 = {}
            emerReportData1.事故处置经过.辅助控制措施.采取方式 = e.target.value;
            this.setState({emerReportData: emerReportData1})}
          }/>
          {/* <OneField name="设置地点：" value={emerReportData.事故处置经过.辅助控制措施 ? emerReportData.事故处置经过.辅助控制措施.设置地点.map((v) => (v.addr)).join(', ') : ''} onChange={(e) => { */}
          <OneField name="设置地点：" value={emerReportData.事故处置经过.辅助控制措施 ? emerReportData.事故处置经过.辅助控制措施.设置地点 : ''} onChange={(e) => {
            let emerReportData1 = {...this.state.emerReportData};
            emerReportData1.事故处置经过.辅助控制措施 = {}
            emerReportData1.事故处置经过.辅助控制措施.设置地点 = e.target.value;
            this.setState({emerReportData: emerReportData1})}
          }/>
          <OneField name="操作人员：" value={(emerReportData.事故处置经过.辅助控制措施 || {}).操作人员} onChange={(e) => {
            let emerReportData1 = {...this.state.emerReportData};
            emerReportData1.事故处置经过.辅助控制措施 = {}
            emerReportData1.事故处置经过.辅助控制措施.操作人员 = e.target.value;
            this.setState({emerReportData: emerReportData1})}
          }/>
          <OneFieldTime name="完成时间：" value={emerReportData.事故处置经过.辅助控制措施 ? moment(emerReportData.事故处置经过.辅助控制措施.完成时间, dateFormat) : null} onChange={(date, dateString) => {
            let emerReportData1 = {...this.state.emerReportData};
            emerReportData1.事故处置经过.辅助控制措施 = {}
            emerReportData1.事故处置经过.辅助控制措施.完成时间 = dateString !== '' ? dateString : date;
            this.setState({emerReportData: emerReportData1})}
          }/>
        </Gradition>
        <Gradition name="气源接入">
          <Table
            bordered
            columns={gasListColumns}
            dataSource={(emerReportData.事故处置经过.气源接入 || [])}
            pagination={false}
            scroll={{x: false, y: 120}}
          />
        </Gradition>
        <Gradition name="停气通知">
          <Table
            bordered
            columns={stopGasListColumns}
            dataSource={(emerReportData.事故处置经过.停气通知 || [])}
            pagination={false}
            scroll={{x: false, y: 120}}
          />
        </Gradition>
        <Gradition name="抢险完成">
          <OneFieldTime name="完成时间：" value={emerReportData.事故处置经过.抢险完成 ? moment(emerReportData.事故处置经过.抢险完成.完成时间, dateFormat) : null} onChange={(date, dateString) => {
            let emerReportData1 = {...this.state.emerReportData};
            emerReportData1.事故处置经过.抢险完成 = {};
            emerReportData1.事故处置经过.抢险完成.完成时间 = dateString !== '' ? dateString : null;
            this.setState({emerReportData: emerReportData1})}
          }/>
          <div style={{padding: 5, display: 'inline-block', width: '50%'}}>
            <span>维修方案：</span>
            <Button>维修方案</Button>
          </div>
          {/* (emerReportData.事故处置经过.抢险完成 || {}).维修方案 */}
        </Gradition>
        <Gradition name="恢复供气">
          <div style={{padding: 5, display: 'inline-block', width: '50%'}}>
            <span>管道检测记录：</span>
            <Button>管道检测记录</Button>
          </div>
          <div style={{padding: 5, display: 'inline-block', width: '50%'}}>
            <span>管道保压记录：</span>
            <Button>管道保压记录</Button>
          </div>
          {/* (emerReportData.事故处置经过.恢复供气 || {}).管道检测记录 */}
          {/* (emerReportData.事故处置经过.恢复供气 || {}).管道保压记录 */}
          <OneFieldTime name="恢复供气时间：" value={emerReportData.事故处置经过.恢复供气 ? moment(emerReportData.事故处置经过.恢复供气.恢复供气时间, dateFormat) : null} onChange={(date, dateString) => {
            let emerReportData1 = {...this.state.emerReportData};
            emerReportData1.事故处置经过.恢复供气 = {};
            emerReportData1.事故处置经过.恢复供气.恢复供气时间 = dateString !== '' ? dateString : null;
            this.setState({emerReportData: emerReportData1})}
          }/>
        </Gradition>
      </Gradition>
    </div>)
  };

  render = () => {
    const {onCancel, emerEvent} = this.props;
    const { emerReportData } = this.state;
    return (
      <Dialog
        title="应急报告"
        width={850}
        onClose={onCancel}
        position={{
          top: 60,
          left: window.innerWidth/2 - 425,
        }}
      >
        <div style={{height: 550, overflow: 'auto', margin: '10px 0px 10px 10px'}}>
          {emerReportData && this.getDivs(emerReportData)}
          <div style={{textAlign: 'right'}}>
            <Button type="primary" size="small" onClick={this.handleSaveEmerReport}>保存</Button>
          </div>
        </div>
      </Dialog>
    );
  }
}

import React from 'react';
import { connect } from 'dva';
import { Layout, Button, Input, Select, Icon, message, Tooltip, Table } from 'antd';
import moment from 'moment';
import EmerOrganization from './emerOrganization.jsx';
import Dialog from '../../components/yd-gis/Dialog/Dialog';
import styles from './css/emerOrder.css';

const { Sider, Content } = Layout;
const Option = Select.Option;
const mapEvent = 'mapEvent';
const { TextArea } = Input;

@connect(state => ({
  user: state.login.user,
  currentClickEvent: state.emerLfMap.currentClickEvent, // 当前应急事件
}))

export default class EmerOrder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emerOrderData: [],
      emerOrderTypeData: [],
      emerOrganizationData: [],
      emerOrganizationGids: [],
      openEmerOrganization: false,
      emerOrder_orderType: 0,
      emerOrder_sendContent: '',
      defvalue: '立即前往事发现场进行处置',
      emerOrder_sender: this.props.user.trueName,
      emerOrder_sendDep: this.props.user.company,
      emerOrder_sendTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    message.config({
      duration: 2,
    });
    this.handleGetEmerOrderType();
    this.handleGetEmerOrganization();
    this.handleGetEmerOrder();
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };

  // 查询应急指令
  handleGetEmerOrder = () => {
    const { currentClickEvent } = this.props;
    let data = {};
    data.alarmId = currentClickEvent.alarmId;
    this.props.dispatch({
      type: 'emer/getEmerOrder',
      payload: data,
      callback: (res) => {
        this.setState({
          emerOrderData: res.data,
        });
      },
    });
  }

  // 发布指令
  handleAddEmerOrder = () => {
    // 发送真实指令
    // 表单校验
    let flag = this.handleCheckForm();
    // 校验成功，发送数据
    if (flag) {
      const { currentClickEvent, onCancel } = this.props;
      let receiverArr = this.flattenData(this.state.emerOrganizationData, this.state.emerOrganizationGids);
      const receiverId = [];
      const receiverUser = [];
      (receiverArr || []).forEach(item => {
            if(item.managerId && item.manager){
              receiverId.push(item.managerId);
              receiverUser.push(item.manager);
            }   
      });
      let fd = new FormData();
      fd.append('alarmId', currentClickEvent.alarmId);
      fd.append('orderType', this.state.emerOrder_orderType);
      fd.append('senderId', this.props.user.gid);
      fd.append('sender', this.state.emerOrder_sender);
      fd.append('sendDep', this.state.emerOrder_sendDep);
      fd.append('sendContent', this.state.emerOrder_sendContent);
      fd.append('sendTime', this.state.emerOrder_sendTime);
      fd.append('ecode', this.props.user.ecode);
      // 给多人发送指令
      fd.append('receiver', receiverUser.toString());
      fd.append('receiverId', receiverId.toString());
      this.props.dispatch({
        type: 'emer/addEmerOrder',
        payload: fd,
        callback: (res) => {
          message.info(res.msg);
          // 关闭指令发送框
          onCancel();
        },
      });
    }
  }

  // 表单校验
  handleCheckForm = () => {
    if (this.state.emerOrder_orderType === 0) {
      message.warning('请选择指令类型');
      return false;
    }
    if (this.state.emerOrganizationGids.length === 0) {
      message.warning('请选择指令接收人员');
      return false;
    }
    if (this.state.emerOrder_sendContent.trim() === '') {
      message.warning('发布内容不能为空');
      return false;
    }
    return true;
  }

  // 查询应急指令类型
  handleGetEmerOrderType = () => {
    let data = {
      ecode: this.props.user.ecode,
    };
    this.props.dispatch({
      type: 'emer/getEmerOrderType',
      payload: data,
      callback: (res) => {
        this.setState({
          emerOrderTypeData: res.data,
        });
      },
    });
  }

  // 查询应急组织机构
  handleGetEmerOrganization = () => {
    const { currentClickEvent } = this.props;
    let data = {};
    if (currentClickEvent.planId) {
      data.planId = currentClickEvent.planId;
    } else {
      data.alarmId = currentClickEvent.alarmId;
    }
    this.props.dispatch({
      type: 'emerLfMap/getEmerOrganization',
      payload: data,
      callback: (res) => {
        this.setState({
          emerOrganizationData: res.data,
        });
      },
    });
  }

  // 应急指令关联应急组织结构
  handleAssociateEmerOrganization = (checkedKeys) => {
    this.setState({
      emerOrganizationGids: checkedKeys.checked,
    });
  }

  // 打开/关闭应急组织机构
  handleOpenEmerOrganization = (op) => {
    if (op === 'open') {
      this.setState({
        openEmerOrganization: true,
      });
    } else {
      this.setState({
        openEmerOrganization: false,
      });
    }
  }

  // 设置应急指令接收人员
  setSelectedEmerOrderReceiver = (data) => {
    let receiverArr = [];
    for (let i = 0; i < this.state.emerOrganizationData.length; i += 1) {
      let o = this.state.emerOrganizationData[i];
      if (data.indexOf(`${o.gid}`) > -1) {
        receiverArr.push(o);
      }
    }
    return receiverArr;
  }
  //递归
  flattenData = (list,gidData) => {
    console.log(gidData,'ahahahah');
    const result = [];
    const loop = (data,gidData) => {

      if (gidData.length!==0 && gidData.indexOf(`${data.gid}`) > -1) {
        result.push(data);
      }
      if (typeof data.children !== 'undefined' && Array.isArray(data.children)) {
        data.children.forEach((ele) => {
          loop(ele,gidData);
        });
      }
    };
    list.forEach(element => loop(element,gidData));
    return result;
  };
  // 移除指令接收人员
  handleRemoveReceiver = (gid) => {
    let index = this.state.emerOrganizationGids.indexOf(`${gid}`);
    if (index > -1) {
      this.state.emerOrganizationGids.splice(index, 1);
      this.setState({
        emerOrganizationGids: this.state.emerOrganizationGids,
      });
    }
  }

  // 设置要发布的指令的属性
  setEmerOrderType = (value) => {
    let emerName = this.props.currentClickEvent.name;
    for (let elem of this.state.emerOrderTypeData.values()) {
      if (elem.gid === value) {
        //这里以发布内容是否已xx 或者xx开头事件开头判断是否替换xx
        let emerContent = elem.content;
        if(emerContent.startsWith('XX事件')){
          emerContent = emerContent.replace(/XX/,emerName);
        }
        if(emerContent.startsWith('XXX事件')){
          emerContent = emerContent.replace(/XXX/,emerName);
       }
        this.setState({
          defvalue: emerContent,
          emerOrder_orderType: value,
          emerOrder_sendContent: emerContent,
        });
      }
    }
  }
  setEmerOrderSendContent = (e) => {
    this.setState({
      emerOrder_sendContent: e.target.value,
      defvalue: e.target.value,
    });
  }


  // 重置应急指令
  handleResetEmerOrder = (e) => {
    e.target.ownerDocument.getElementById('emerOrderSendContent').value = '';
    this.setState({
      emerOrder_orderType: 0,
      emerOrganizationGids: [],
    });
  }

  render = () => {
    const { currentClickEvent, onCancel } = this.props;
    const modalStyle = {
      marginLeft: 437,
      marginTop: 65,
    };
    // 获取指令接收人员数组，同时绑定移除指令接收人员事件
    let selectedEmerOrderReceiver = this.flattenData(this.state.emerOrganizationData,this.state.emerOrganizationGids);
    selectedEmerOrderReceiver.handleRemoveReceiver = this.handleRemoveReceiver;
    // 已发布指令
    let orderTableColumns = [{
      title: '指令类型',
      dataIndex: 'orderTypeName',
      width: 80,
    }, {
      title: '指令内容',
      width: 160,
      render: (record) => (
        <Tooltip placement="left" title={record.sendContent}>
          {record.sendContent.length > 10 ? `${record.sendContent.substr(0, 10)}...` : record.sendContent}
        </Tooltip>
      ),
    }];
    return (
      <div>
        <Dialog
          title="应急指令"
          width={770}
          onClose={onCancel}
          position={{
            top: 115,
            left: 395,
          }}
        >
          <Layout style={{ backgroundColor: '#FFFFFF', height: 300 }}>
            <Content style={{ backgroundColor: '#FFFFFF', marginRight: '5px' }}>
              <div>
                <div className={styles.emerOrderItem}>
                  <span><label>事件名称:</label>
                    <Input disabled value={currentClickEvent.name} style={{ width: '100px' }} />
                  </span>
                  <span><label>指令类型:</label>
                    <Select
                      value={this.state.emerOrder_orderType === 0 ? '' : this.state.emerOrder_orderType}
                      style={{ width: '130px', display: 'inline-block'}}
                      onChange={this.setEmerOrderType}
                    >
                      {
                        this.state.emerOrderTypeData.map((item) => {
                          return (<Option key={item.gid} value={item.gid}>{item.name}</Option>);
                        })
                      }
                    </Select>
                  </span>
                  <span>
                    <Button type="primary" size="small" onClick={(op) => this.handleOpenEmerOrganization('open')}>人员</Button>
                  </span>
                </div>
                <div className={styles.emerOrderItem_receiver}>
                  {
                    selectedEmerOrderReceiver.map((item) => {
                      return (<Button
                        size="small"
                        style={{ marginLeft: 5, marginBottom: 5 }}
                        onClick={(gid) => selectedEmerOrderReceiver.handleRemoveReceiver(item.gid)}
                      >
                        <Icon type="close" />{item.manager}
                      </Button>);
                    })
                  }
                </div>
                <div className={styles.emerOrderItem}>发布内容:<br />
                  <TextArea
                    rows={5}
                    cols={70}
                    style={{ resize: 'none' }}
                    onChange={this.setEmerOrderSendContent}
                    value={this.state.defvalue}

                  />
                </div>
                <div className={styles.emerOrderItem}>
                  <span><label>发布部门:</label><Input type="text" value={this.state.emerOrder_sendDep} style={{ width: '120px' }} /></span>
                  <span><label>发布人:</label><Input type="text" value={this.state.emerOrder_sender} style={{ width: '60px' }} /></span>
                  <span><label>发布时间:</label><Input type="text" value={this.state.emerOrder_sendTime} style={{ width: '135px' }} /></span>
                </div>
                <div className={styles.emerOrderBtn}>
                  <Button type="primary" size="small" onClick={this.handleAddEmerOrder}>发布</Button>&nbsp;&nbsp;&nbsp;
                  <Button type="primary" size="small" onClick={this.handleResetEmerOrder}>重置</Button>
                </div>
              </div>
            </Content>
            <Sider width={240} style={{ backgroundColor: '#FFFFFF' }}>
              <span>已发布指令<span className={styles.emerOrderNote}>(移到单元格查看详情)</span></span>
              <Table
                rowKey={record => record.gid}
                bordered
                columns={orderTableColumns}
                dataSource={this.state.emerOrderData}
                scroll={this.state.emerOrderData.length > 5 ? { y: 195 } : {}}
                pagination={false}
              />
            </Sider>
          </Layout>
        </Dialog>
        {/* 指令接收人员列表 */}
        {
          this.state.openEmerOrganization ? <Dialog
            title="应急人员"
            width={240}
            onClose={(op) => this.handleOpenEmerOrganization('close')}
            modal
            position={{
              top: 160,
              left: 808,
            }}
          >
            <EmerOrganization
              emerOrganizationData={this.state.emerOrganizationData}
              associateEmerOrganization={this.handleAssociateEmerOrganization}
              emerOrganizationGids={this.state.emerOrganizationGids}
            />
            <Button type="primary" size="small" onClick={(op) => this.handleOpenEmerOrganization('close')}>确定</Button>
          </Dialog> : ''
        }
      </div>
    );
  }
}

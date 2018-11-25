import React from 'react';
import {connect} from 'dva';
import {Button, Input, Table, Layout, message} from 'antd';
import moment from 'moment';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';
import EmerOrganization from '../emerOrganization.jsx';

const {Sider, Content} = Layout;
const {TextArea} = Input;

@connect(state => ({
  user: state.login.user,
  ecodePattern: state.emerLfMap.ecodePattern, // 企业模式配置
  flowPattern: state.emerLfMap.flowPattern, // 流程模式配置
}))

export default class EmerStartOrder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emerOrder_sendContent: `${this.props.emerEvent.name}事件已启动应急，请各部门做好准备`,
      emerOrganizationData: [],
      emerOrganizationGids: [],
      tableData: [],
    };
    message.config({
      duration: 2,
    });
    this.dataList = [];
    this.handleGetEmerOrganization();
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };

  // 发布应急启动通知
  handleAddEmerOrder = () => {
    const {emerEvent, handleAddEmerStart} = this.props;
    let receiverArr = this.setSelectedEmerOrderReceiver(this.state.emerOrganizationGids);
    let receiver = [];
    let receiverId = [];
    this.state.tableData.forEach(item => {
      if (item.managerId) {
        receiver.push(item.manager);
        receiverId.push(item.managerId);
      }
    });
    let fd = new FormData();
    fd.append('alarmId', emerEvent.alarmId);
    if(this.props.flowPattern.mode === '0'){
      fd.append('orderType', 1);
    }else{
      fd.append('orderType', 6);
    }
    fd.append('receiverId', receiverId.toString());
    fd.append('receiver', receiver.toString());
    fd.append('senderId', this.props.user.gid);
    fd.append('sender', this.props.user.trueName);
    fd.append('sendDep', '廊坊新奥调度中心');
    fd.append('sendContent', this.state.emerOrder_sendContent);
    fd.append('sendTime', moment().format('YYYY-MM-DD HH:mm:ss'));
    fd.append('ecode', this.props.user.ecode);
    this.props.dispatch({
      type: 'emer/addEmerOrder',
      payload: fd,
      callback: (res) => {
        // 向后台发送启动应急
        handleAddEmerStart();
      },
    });
  }

  // 根据组织结构 获取其组织人员id
  getOrganizationGids = (list) => {
    const result = [];
    const loop = (data) => {
      result.push(data.gid.toString());
      if (typeof data.children !== 'undefined' && Array.isArray(data.children)) {
        data.children.forEach((ele) => {
          loop(ele);
        });
      }
    };
    list.forEach(element => loop(element));
    return result;
  };

  // 查询应急组织机构信息
  handleGetEmerOrganization = () => {
    const {emerEvent, planId} = this.props;
    let data = {};
    data.planId = planId;
    this.props.dispatch({
      type: 'emerLfMap/getEmerOrganization',
      payload: data,
      callback: (res) => {
        if (res.data && res.data.length > 0) {
          const emerOrganizationGids = this.getOrganizationGids(res.data);
          const tableData = this.filterData(this.getData(res.data), emerOrganizationGids);
          this.setState({
            emerOrganizationData: res.data,
            emerOrganizationGids,
            tableData,
          });
        }
      },
    });
  }

  // 设置应急指令内容
  setEmerOrderSendContent = (e) => {
    this.setState({
      emerOrder_sendContent: e.target.value,
    });
  }

  // 获取勾选的应急组织机构
  setSelectedOrganization = (data) => {
    let selectedOrganization = [];
    for (let i = 0; i < this.state.emerOrganizationData.length; i += 1) {
      let o = this.state.emerOrganizationData[i];
      if (data.indexOf(`${o.gid}`) > -1) {
        selectedOrganization.push(o);
      }
    }
    // childs
    return selectedOrganization;
  }
  generateList = (data) => {
    for (let i = 0; i < data.length; i += 1) {
      const node = data[i];
      // this.dataList.push({ key:i, name: node.name,manager:node.manager,phone:node.firstTel});
      if (node.children) {
        this.generateList(node.children);
      } else {
        this.dataList.push({ gid: node.gid, key: i, name: node.name, manager: node.manager, phone: node.firstTel});
      }
    }
    return this.dataList;
  };
  // 应急组织机构树和右侧表进行关联
  handleAssociateEmerOrganization = (checkedKeys) => {
    const tableData=this.filterData(this.getData(this.state.emerOrganizationData),checkedKeys.checked);
    this.setState({
      emerOrganizationGids: checkedKeys.checked,
      tableData
    });
  }
  // 根据 一组id过滤 人员组织
  filterData = (data,idData) =>{
     const result= data.filter(item =>{
       return idData.length!==0 && idData.indexOf(`${item.gid}`) > -1
     });
     return result;
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
  //z转 一级结构
  getData = (list) => {
    const result = [];
    const dataFormat = (data) => {
      const obj = {};
      for (const key in data) {
        if (key !== 'children') {
          obj[key] = data[key];
        }
      }
      return obj;
    };
    const loop = (data) => {
      result.push(dataFormat(data));
      if (typeof data.children !== 'undefined' && Array.isArray(data.children)) {
        data.children.forEach((ele) => {
          loop(ele);
        });
      }
    };
    list.forEach(element => loop(element));
    return result;
  };
  render = () => {
    const {onCancel, emerEvent} = this.props;
    const oragnizationTableColumns = [{
      title: '组织机构名称',
      dataIndex: 'name',
      key: 'name',
      width: 130,
    }, {
      title: '负责人',
      dataIndex: 'manager',
      key: 'manager',
      width: 67,
    }, {
      title: '电话',
      dataIndex: 'firstTel',
      key: 'firstTel',
    }];
    console.log(this.state.tableData,'表格数据');
    //let organizationTableData = this.generateList(this.flattenData(this.state.emerOrganizationData, this.state.emerOrganizationGids));
    //console.log(organizationTableData,'xixixi',this.state.emerOrganizationData);
    this.dataList = [];
    return (
      <Dialog
        title="应急启动"
        width={650}
        onClose={onCancel}
      >
        <div style={{margin: 10}}>
          <div>
            <span>指令内容:</span>
            <span>
              <TextArea
                rows={3}
                cols={70}
                style={{resize: 'none'}}
                onChange={this.setEmerOrderSendContent}
                value={this.state.emerOrder_sendContent}
              />
            </span>
          </div>
          <div>
            <span style={{display: 'block'}}>应急组织机构:</span>
            <div style={{border: '1px solid #1890FF'}}>
              <Layout>
                <Sider width={230} style={{backgroundColor: '#FFFFFF'}}>
                <EmerOrganization
                    defaultSelectAll
                    emerOrganizationData={this.state.emerOrganizationData}
                    associateEmerOrganization={this.handleAssociateEmerOrganization}
                    emerOrganizationGids={this.state.emerOrganizationGids}
                  />
                </Sider>
                <Layout>
                  <Content style={{backgroundColor: '#FFFFFF'}}>
                  <Table
                      rowKey={record => record.gid}
                      columns={oragnizationTableColumns}
                      dataSource={this.state.tableData}
                      pagination={false}
                      scroll={{x: false, y: 193}}
                    /> 
                  </Content>
                </Layout>
              </Layout>
            </div>
          </div>
          <div>
            <Button
              type="primary"
              size="small"
              onClick={this.handleAddEmerOrder}
            >发布</Button>&nbsp;&nbsp;&nbsp;
          </div>
        </div>
      </Dialog>
    );
  }
}

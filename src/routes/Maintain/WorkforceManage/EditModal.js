import React, { PureComponent } from 'react';
import {connect} from 'dva';
import moment from 'moment';
import _ from 'lodash';
import {Select, Table, Button, Icon, Modal, Tooltip, message, Form} from 'antd';
import styles from './index.less';

const Option = Select.Option;
const FormItem = Form.Item;
const createForm = Form.create;
const confirm =Modal.confirm;

@connect(({ station, maintain, login}) => ({
  classManage: station.classManage,
  workContentList: maintain.workContentList,
  patrolPlanList: maintain.patrolPlanList,
  feedbackUsers: station.feedbackUsers,
  user: login.user,
}))
export default class EditModal extends PureComponent {
  constructor(props) {
    super(props);
    this.index = 0;
    this.state = {
      data: [],
      editable: false,
      editGid: '',
      editWid: '',
      areaId: '',
      areaName: '',
      planName: '',
      personId: [],
      userArr: [],
      workContent: {},
      selectedRowKeys: [], //勾选的排班计划
      delArr: [], //删除的计划
    }
  }

  componentDidMount() {
    const {workContentList, classManage, data, selectDate} = this.props
    this.props.onRef(this);
    this.setState({
      data
    })
  }

  componentWillUnmount() {
    this.props.onRef(null);
  }
  
   // 增加
  addColumns = (type, val) => {
    if(type === 'edit'){
      const personId = [];
      val.zbrList.map(item => {personId.push(item.id)});
      this.queryWork(val.regionId);
      this.setState({
        editGid: val.gid,
        editWid: val.workListId,
        areaId: val.regionId,
        areaName: val.regionName,
        planName: val.workContent.name,
        personId,
        userArr: val.zbrList,
        workContent: val.workContent,
      })
    }else if(type === 'new'){
      this.setState({
        editGid: '',
        editWid: '',
        areaId: '',
        areaName: '',
        planName: '',
        personId: [],
        userArr: [],
        workContent: {},
      })
    }
    this.setState({editable: true});
  };

  // 删除
  delColumns = (key) => {
    const {selectedRowKeys} = this.state;
    if(selectedRowKeys.length === 0){
      message.info('请选择要删除的排班计划！')
      return
    }else if(selectedRowKeys.length > 0){
      let that = this;
      const newData = this.state.data.filter(item => !selectedRowKeys.includes(item.gid) );
      confirm({
        title: '是否删除计划?',
        onOk() {
          that.setState({
            data: newData,
            delArr: selectedRowKeys,
            areaId: '',
            areaName: '',
            planName: '',
            personId: [],
            userArr: [],
            workContent: {},
            selectedRowKeys: [], //勾选的排班计划
          });
        },
        onCancel() {
        }
      });
    }
  };
  
  //保存
  saveData = () => {
    const pbData = [...this.state.data]
    const rowKey = this.state.delArr.filter(item => !isNaN(Number(item)) )
    this.props.handleOk(pbData, rowKey);
  }

  //重置
  onReset = () => {
    const {data} = this.props;
    const newData = [];
    data.map(item => {
      item.workList.map((item1) => {
        const zbrList = []
        item1.bcList[0].zbrList.map(item2 => {
          zbrList.push({
            id: item2.userId,
            name: item2.userName,
          })
        })
        newData.push({
          gid: item1.gid,
          regionName: item.regionName,
          regionId: item.regionId,
          zoneId: item.zoneId,
          workContent: {id: item1.workContentId, name: item1.workContent},    //工作内容
          bcList: '',       //班次
          zbrList,       //人员
        });
      })
    })
    
    this.setState({
      data: newData,
    })
  }

  //获取初始值
  onStartData = (pbdata) => {
    const {data, selectDate} = this.props;
    const newData = [];
    pbdata.map(item => {
      item.workList.map((item1) => {
        const zbrList = []
        item1.bcList[0].zbrList.map(item2 => {
          zbrList.push({
            id: item2.userId,
            name: item2.userName,
          })
        })
        newData.push({
          gid: item1.pbId,
          workListId: item1.gid,
          regionName: item.regionName,
          regionId: item.regionId,
          zoneId: item.zoneId,
          workContent: {id: item1.workContentId, name: item1.workContent},    //工作内容
          bcList: '',       //班次
          zbrList,       //人员
        });
      })
    })
    
    this.setState({
      data: newData,
    })
  };

  //查询计划名称（工作内容）
  queryWork = (val) => {
    this.props.dispatch({
      type: 'maintain/getPatrolPlanData',
      payload: {
        stationid: this.props.stationid,
        regionid: val,
        isschedule: 1, 
      },
    });
  }

  changeHandle = (val, fileName, node) => {
    const newData = [...this.state.data];
    if(fileName === 'areaId'){
      const {dataRef} = node.props;
      this.queryWork(val);
      this.setState({
        planName: '',
        areaName: dataRef ? dataRef.name : '',
      })
    }else if(fileName === 'personId'){
      const memberArr = [];
      node.map(item => {
        memberArr.push({
          id: item.props.dataRef.userid,
          name: item.props.dataRef.truename,
        })
      })
      this.setState({userArr: memberArr})
    }else if(fileName === 'planName'){
      const {dataRef} = node.props;
      const workContent = {id: dataRef.gid, name: val};
      for(let i = 0; i < newData.length; i++){
        if(newData[i].workContent.id === dataRef.gid){
          message.warn('不能同时存在两个完全相同的工作内容');
          return
        }
      }
      this.setState({ workContent })
    }

    this.setState({[fileName]: val})
  };

  handleCancelEdit = () => {
    this.setState({
      editable: false,
      areaId: '',
      areaName: '',
      planName: '',
      personId: [],
      userArr: [],
      workContent: {},
      selectedRowKeys: [], //勾选的排班计划
    })
  };

  saveEditData = () => {
    console.log(123)
    const {editGid, areaId, areaName, userArr, workContent, editWid} = this.state;
    if(!areaId || !workContent || userArr.length === 0){
      message.warn('请将排班信息填写完整再保存！');
      return
    }
    const newData = [...this.state.data];
    const {data, selectDate} = this.props;
    if(editGid){
      const editData = {
        gid: editGid,
        workListId: editWid,
        regionName: areaName,
        regionId: areaId,
        zoneId: this.props.zoneId,
        workContent,    //工作内容
        bcList: '',       //班次
        zbrList: userArr,       //人员
      }
      newData.map((item, index) => {
        if(item.gid === editGid){
          newData.splice(index, 1, editData)
        }
      })
    }else{
      newData.push({
        gid: `NEW_TEMP_ID_${this.index}`,
        workListId: '',
        regionName: areaName,
        regionId: areaId,
        zoneId: this.props.zoneId,
        workContent,    //工作内容
        bcList: '',       //班次
        zbrList: userArr,       //人员
      });
      this.index++;
    }
    console.log(newData, 'ssssss')
    this.setState({
      data: newData,
      editable: false,
    })
  }


  render() {
    const { show, handleOk, handleReset, handleCancel, bcType, workContentList, classManage, patrolPlanList, feedbackUsers, areaData} = this.props;
    const {data, editable} = this.state;
    
    const columns = [{
      title: '区域',
      dataIndex: 'regionName',
      width: '20%',
      render: (text, record) => (
        <div className={styles['textOverflow']}>
          <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
        </div>
      ),
      }, {
        title: '计划名称',
        dataIndex: 'workContent',
        width: '30%',
        render: (text, record) => {
          let work = record.workList && record.workList.length > 0 ? record.workList[0].workContent : (record.workContent ? record.workContent.name : '');
          return (
            <div className={styles['textOverflow']}>
              <Tooltip placement="topLeft" title={work}>{work}</Tooltip>
            </div>
          )
        },
      }, {
        title: '人员',
        dataIndex: 'zbrList',
        width: '40%',
        render: (text, record) => {
          const member = [];
          record.workList && record.workList.length > 0 && (record.workList[0].bcList)[0].zbrList.map((item)=> {
            member.push(item.userName)
          })
          const memberArr = (text ? _.map(text, 'name') : member).join("，");
          return (
            <div className={styles['textOverflow']}>
              <Tooltip placement="topLeft" title={memberArr}>{memberArr}</Tooltip>
            </div>
          )
        }
      }, {
      
        title: '操作',
        dataIndex: 'action',
        width: '10%',
        render: (text, record) => (
          <a onClick={() => this.addColumns('edit', record)}>编辑</a>
        ),
      }
    ];

    const rowSelection =  {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        this.setState({
          selectedRowKeys,
        })
      },
    };

    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 17},
      style: {marginBottom: '10px'}
    };

    return (
      <div>
        <Modal
          visible={show}
          className={styles.modal}
          width={900}
          maskClosable={false}
          title='编辑值班'
          footer={[
            <Button key="submit" type="primary" onClick={this.saveData}> 提交 </Button>,
          ]}
          onCancel={handleCancel}
        >
          <div style={{marginBottom: 15}}>
            <Button type="primary" value="small" onClick={() => this.addColumns('new')} style={{margin: '0 15px 0 15px'}}>添加</Button>
            <Button type="primary" value="small" onClick={this.delColumns} >删除</Button>
          </div>
          <Table
            columns={columns}
            rowKey={record => record.gid}
            rowSelection={rowSelection}
            dataSource={data}
            pagination={false}
            scroll={{y: 360}}
          />
        </Modal>
        <Modal
          visible={editable}
          className={styles.modal}
          width={450}
          maskClosable={false}
          title='编辑值班'
          footer={[
            <Button key="submit" type="primary" onClick={this.handleCancelEdit}> 取消 </Button>,
            <Button key="submit" type="primary" onClick={this.saveEditData}> 确定 </Button>,
          ]}
          onCancel={this.handleCancelEdit}
        >
          <Form style={{marginTop: '20px'}}>
            <FormItem
              {...formItemLayout}
              label="区域："
              style={{marginBottom: '10px'}}>
              <Select
                style={{width: '95%'}}
                value={this.state.areaId}
                placeholder="请选择"
                onChange={(val, node) => this.changeHandle(val, 'areaId', node)}
                >
                {areaData && areaData.map((item) => {
                    if(item.children && item.children.length > 0){
                        return item.children.map((item1) =>
                          <Option key={item1.eqlocation.gid} value={item1.gid} dataRef={item1}>{item1.name}</Option>
                        )
                    }
                })}
              </Select>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="计划名称："
              style={{marginBottom: '10px'}}>
              <Select
                style={{width: '95%'}}
                value={this.state.planName}
                placeholder="请选择"
                onChange={(val, node) => this.changeHandle(val, 'planName', node)}>
                {
                  patrolPlanList && patrolPlanList.map((item) =>
                      <Option key={item.gid} value={item.name} dataRef={item}><Tooltip className={styles['textOverflow']} placement="top" title={item.name}>{item.name}</Tooltip></Option>
                  )
                }
              </Select>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="人员："
              style={{marginBottom: '10px'}}>
              <Select
                style={{width: '95%'}}
                mode="multiple"
                value={this.state.personId}
                placeholder="请选择"
                onChange={(val, node) => this.changeHandle(val, 'personId', node)}
              >
                {feedbackUsers && feedbackUsers.map((item) =>
                  <Option key={item.userid} value={item.userid} dataRef={item}>{item.truename}</Option>
                )}
              </Select>
            </FormItem>    
          </Form>
        </Modal>
      </div>
      
    );
  }
}

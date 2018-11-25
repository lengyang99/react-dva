import React, { PureComponent } from 'react';
import {connect} from 'dva';
import moment from 'moment';
import _ from 'lodash';
import {Select, Table, Button, Icon, Modal, Tooltip, message} from 'antd';
import styles from './index.less';

const Option = Select.Option;
@connect(({ station, maintain, login}) => ({
  classManage: station.classManage,
  workContentList: maintain.workContentList,
  feedbackUsers: station.feedbackUsers,
  patrolPlanList: maintain.patrolPlanList,
  user: login.user,
}))
export default class NewModal extends PureComponent {
  constructor(props) {
    super(props);
    this.edit = false;
    this.index = 0;
    this.state = {
      data: []
    }
  }

  componentDidMount() {
    const {workContentList, classManage} = this.props
    this.props.onRef(this);
    //查询工作内容
    if(workContentList.length === 0){
      this.props.dispatch({
        type: 'maintain/workContent',
      });
    }
    if(classManage.length === 0){
      this.props.dispatch({
        type: 'station/queryClassManage',
      });
    }
  }
  componentWillUnmount() {
    this.props.onRef(null);
  }
  // 增加
  addColumns = () => {
    const newData = [...this.state.data];
    newData.push({
      gid: `NEW_TEMP_ID_${this.index}`,
      regionId: '',
      regionName: '',
      workContent: '',    //工作内容
      bcList: '',       //班次
      zbrList: [],       //人员
    });
    this.index += 1;
    this.setState({data: newData});
  }
  // 删除
  delColumns = (key) => {
    const newData = this.state.data.filter(item => item.gid !== key);
    this.setState({data: newData});
  };
  getRowByKey(key) {
    return this.state.data.filter(item => item.gid === key)[0];
  }
  handleFieldChange = (value, fileName, key, node) => {
    let val = value;
    const newData = [...this.state.data];
    const target = this.getRowByKey(key)
    if(fileName === 'regionId'){
      this.props.dispatch({
        type: 'maintain/getPatrolPlanData',
        payload: {
          stationid: this.props.stationid,
          regionid: value,
          isschedule: 1, 
        },
      });

    }
    if(fileName === 'zbrList' && val !== []){
      const memberArr = [];
      node.map(item => {
        memberArr.push({
          id: item.props.dataRef.userid,
          name: item.props.dataRef.truename,
        })
      })
      val = memberArr
    }else if(fileName === 'workContent' || fileName === 'bcList'){
      if(value !== undefined){
        const {dataRef} = node.props;
        val = {id: dataRef.gid, name: value}
        for(let i = 0; i < newData.length; i++){
          if(newData[i].workContent.id === dataRef.gid){
            message.warn('不能同时存在两个完全相同的工作内容');
            return
          }
        }
      }
    }else if(fileName === 'regionId'){
      const {dataRef} = node.props;
      if (target) {
        target['regionName'] = dataRef.name;
      }
    }
    if (target) {
      if(fileName === 'regionId'){
        target['workContent'] = '';
      }
      target[fileName] = val;
      this.setState({
        data: newData,
      });
    }

  };
  //保存
  saveData = () => {
    const pbData = [...this.state.data]
    if(pbData.length === 0){
      message.warn('没有添加工作内容，不能新建！')
      return
    }
    this.props.handleOk(pbData);
  }

  //重置
  onReset = () => {
    console.log(123)
    this.setState({
      data: []
    })
  }


  render() {
    const { show, handleOk, handleReset, handleCancel, bcType, workContentList, classManage, patrolPlanList, feedbackUsers, areaData} = this.props;
    const {data} = this.state;
    const columns = [{
      title: '区域',
      dataIndex: 'regionId',
      width: '20%',
      render: (text, record) => (
        // <div className={styles['textOverflow']}>
        //   <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
        // </div>
        <Select
          placeholder="请选择区域"
          style={{width: 120}}
          value={text}
          onSelect={(val, node) => {this.handleFieldChange(val, 'regionId', record.gid, node)}}
        >
          {
            areaData && areaData.map((item) => {
              if(item.children && item.children.length > 0){
                  return item.children.map((item1) =>
                      <Option key={item1.eqlocation.gid} value={item1.gid} dataRef={item1}>
                          <Tooltip placement="top" title={item1.name}>{item1.name}</Tooltip>
                      </Option>
                  )
              }
            })
          }
        </Select>
      ),
    },
    {
      title: '计划名称',
      dataIndex: 'workContent',
      width: '30%',
      render: (text, record) => {
        let work = record.workContent ? record.workContent.name : '';
        return (
          <Select
            placeholder="请选择计划"
            style={{width: '75%'}}
            value={work}
            onSelect={(val, node) => {this.handleFieldChange(val, 'workContent', record.gid, node)}}
          >
            {
              patrolPlanList && patrolPlanList.map((item) =>
                  <Option key={item.gid} value={item.name} dataRef={item}><Tooltip className={styles['textOverflow']} placement="top" title={item.name}>{item.name}</Tooltip></Option>
              )
            }
          </Select>
        )
      },
    },
    // {
    //   title: '工作内容',
    //   dataIndex: 'workContent',
    //   width: '30%',
    //   render: (text, record) => {
    //     let work = record.workContent ? record.workContent.name : '';
    //     return (
    //       <Select
    //         placeholder="请选择工作内容"
    //         style={{width: 120}}
    //         value={work}
    //         onSelect={(val, node) => {this.handleFieldChange(val, 'workContent', record.gid, node)}}
    //       >
    //         {
    //           workContentList && workContentList.map((item) =>
    //               <Option key={item.gid} value={item.name} dataRef={item}>{item.name}</Option>
    //           )
    //         }
    //       </Select>
    //     )
    //   },
    // },
    // {
    //   title: '班次',
    //   dataIndex: 'bcList',
    //   width: '15%',
    //   render: (text, record) => {
    //     let bcData = record.bcList ? record.bcList.name : '';
    //     return (
    //       <Select
    //         placeholder="请选择工作内容"
    //         value={bcData}
    //         style={{width: 80}}
    //         onSelect={(val, node) => {this.handleFieldChange(val, 'bcList', record.gid, node)}}
    //       >
    //         {
    //           classManage && classManage.map((item) =>
    //             <Option key={item.gid} value={item.name} dataRef={item}>{item.name}</Option>
    //           )
    //         }
    //       </Select>
    //     )
    //   }
        
    // },
    {
      title: '人员',
      dataIndex: 'zbrList',
      width: '40%',
      render: (text, record) => {
        const memberArr = text ? _.map(text, 'name') : [];
        const nameUnique = _.sortBy(feedbackUsers, ['userid']);
        for (let i = 0; i < nameUnique.length - 1; i++) {
          if (nameUnique[i].userid === nameUnique[i + 1].userid) {
            nameUnique.splice(i, 1)
          }
        }
        return (
          <Select
            placeholder="请选择人员"
            mode="multiple"
            value={memberArr}
            style={{minWidth: 150}}
            onChange={(val, node) => {this.handleFieldChange(val, 'zbrList', record.gid, node)}}
          >
            {
              nameUnique && nameUnique.map((item) =>
                  <Option key={item.userid} value={item.truename} dataRef={item}>{item.truename}</Option>
              )
            }
          </Select>
        )
      }
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: '10%',
      render: (text, record) => (
        data && data.length === 1 ? <span /> :
        <Tooltip placement="top" title="删除">
          <Icon type="minus" style={{cursor: 'pointer', color: 'black'}} onClick={() => { this.delColumns(record.gid); }} />
        </Tooltip>
      ),
    },
    ];
    return (
      <Modal
        visible={show}
        className={styles.modal}
        width={900}
        maskClosable={false}
        title='新建值班'
        footer={[
          <Button key="submit" type="primary" onClick={this.saveData}> 提交 </Button>,
          <Button type="primary" onClick={this.onReset}>重置</Button>,
        ]}
        onCancel={handleCancel}
      >
        <Tooltip placement="right" title="添加">
          <Icon type="plus" style={{cursor: 'pointer', color: 'black', fontSize: 18, marginLeft: 15}} onClick={this.addColumns} />
        </Tooltip>
        <Table
          columns={columns}
          rowKey={record => record.gid}
          dataSource={data}
          pagination={false}
          scroll={{y: 360}}
        />
      </Modal>
    );
  }
}

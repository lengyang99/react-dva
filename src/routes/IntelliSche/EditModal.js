import React, { PureComponent } from 'react';
import {Select, Table, Button, Icon, Modal, Tooltip} from 'antd';
import styles from './index.less';


const Option = Select.Option;
// 值班人的id 如何获取？
// 选中后人名后获取其id 用一个变量存放 类似pbdata，删除，取消，重置都需要维护其状态，。。。实现困难
// 作为table的一个属性传递过去
export default class EditModal extends PureComponent {
  gid=100;
  // 列改变回调
  handleTableChange = (gid, columns, values) => {
    const newData = [...this.props.data];
    const target = newData.filter(item => item.gid === gid)[0];
    if (target) {
      columns.forEach((item, i) => {
        target[item] = values[i];
      });
      this.props.handleChangePdData(newData);
    }
  }
  // 增加
  addColumns = () => {
    const bcData = [{gid: `newPb_${this.gid += 1}`, bcType: '人员排班', zbrList: '', bcName: '', bcStartTime: '', bcEndTime: ''}];
    const bzData = [{gid: `newPb_${this.gid += 1}`, bcType: '班组排班', bzName: '', zbrList: '', bcName: '', bcStartTime: '', bcEndTime: ''}];
    const emptyData = this.props.data[0].bcType === '班组排班' ? bzData : bcData;
    const newData = [...this.props.data, ...emptyData];
    this.props.handleChangePdData(newData);
  }
  // 删除
  delColumns = (gid) => {
    const newData = [...this.props.data];
    const pdData = newData.filter(item => item.gid !== gid);
    this.props.handleChangePdData(pdData);
  }
  // 人员排班人员
  onUserChange = (value, option, gid) => {
    const zbrList = value.toString();
    const userIds = [];
    option.forEach(item => {
      userIds.push(item.props.dataRef.userid);
    });
    const zbrIds = userIds.toString();
    this.handleTableChange(gid, ['zbrList', 'zbrIds'], [zbrList, zbrIds]);
  }
  // 班组
  onBzSelect = (value, option, gid) => {
    const data = option.props.dataRef;
    const {members, gid: bzId, monitorName, monitorId } = data;
    const userList = [];
    const userIds = [];
    (members || []).forEach(item => {
      userList.push(item.memberName);
      userIds.push(item.gid);
    });
    const columns = ['bzName', 'zbrList', 'zbrIds', 'bzId', 'monitorName', 'monitorId'];
    const values = [value, userList.toString(), userIds.toString(), bzId, monitorName, monitorId];
    this.handleTableChange(gid, columns, values);
  }
  // 班次
  onBcSelect = (value, option, gid) => {
    const startTime = option.props.dataRef.startTime;
    const bcId = option.props.dataRef.gid;
    const endTime = option.props.dataRef.endTime;
    const columns = ['bcName', 'bcStartTime', 'bcEndTime', 'bcId'];
    const values = [value, startTime, endTime, bcId];
    // const bcOptions = [...this.props.bcData];
    // const newOptions = bcOptions.filter(item => item.gid !== bcId);
    // if (newOptions) {
    //   this.onChangeBcSelectValue(newOptions);
    // }
    this.handleTableChange(gid, columns, values);
  }
  // onBcChange = (value, gid) => {
  //   if (!value) {
  //     const newData = [...this.props.data];
  //     const target = newData.filter(item => item.gid === gid)[0];
  //     if (target) {
  //       const cacheBcOptions = [...this.props.cacheBcData];
  //       const bcOptions = [...this.props.bcData];
  //       const newOptions = cacheBcOptions.filter(item => item.gid === target.bcId);
  //       if (newOptions) {
  //         const bcData = [...newOptions, ...bcOptions];
  //         this.onChangeBcSelectValue(bcData);
  //       }
  //     }
  //   }
  //   const columns = ['bcName', 'bcStartTime', 'bcEndTime', 'bcId'];
  //   const values = ['', '', '', ''];
  //   this.handleTableChange(gid, columns, values);
  // }
  // 改变班次下拉选的值
  // onChangeBcSelectValue = (bcData) => {
  //   this.props.dispatch({
  //     type: 'IntelliSche/bcDataChange',
  //     payload: bcData,
  //   });
  // }
  render() {
    const {selectDate, show, bcData, bzData, userData, handleOk, handleReset, handleCancel, data, bcType} = this.props;
    const bcOptions = (bcData || []).map(item => (
      <Option key={item.name} dataRef={item}>{item.name}</Option>
    ));
    const bzOptions = (bzData || []).map(item => (
      <Option key={item.workGroupName} dataRef={item}>{item.workGroupName}</Option>
    ));
    const userOptions = (userData || []).map(item => (
      <Option key={item.truename} dataRef={item}>{item.truename}</Option>
    ));
    const bcColumns = [{
      title: '类型',
      dataIndex: 'bcType',
      width: '15%',
    },
    {
      title: '人员',
      dataIndex: 'zbrList',
      width: '47%',
      render: (text, record) => (
        <Select
          style={{width: '95%', height: 'calc(100%)', overflow: 'auto', maxHeight: 'calc(100vh - 628px)', minHeight: 33}}
          mode="multiple"
          onChange={(value, option) => this.onUserChange(value, option, record.gid)}
          value={record.zbrList !== '' ? record.zbrList.split(',') : []}
        >
          {userOptions}
        </Select>
      ),
    },
    {
      title: '班次',
      dataIndex: 'bcName',
      width: '16%',
      render: (text, record) => (
        <Select
          allowClear
          style={{width: '100%'}}
          value={record.bcName}
          // onChange={(value) => { this.onBcChange(value, record.gid); }}
          onSelect={(value, option) => { this.onBcSelect(value, option, record.gid); }}
        >
          {bcOptions}
        </Select>
      ),
    },
    {
      title: '班次时间',
      dataIndex: 'bcTime',
      width: '18%',
      render: (text, record) => (
        record.bcStartTime ? <span>{`${record.bcStartTime}~${record.bcEndTime}`}</span> : <span />
        // <span>{this.state.bcTime}</span>
      ),
    },
    {
      title: '',
      dataIndex: 'action',
      width: '8%',
      render: (text, record) => (
        data && data.length === 1 ? <span /> :
        <Tooltip placement="top" title="删除">
          <Icon type="minus" style={{cursor: 'pointer'}} onClick={() => { this.delColumns(record.gid); }} />
        </Tooltip>
      ),
    },
    ];
    const bzColumns = [{
      title: '类型',
      dataIndex: 'bcType',
      width: '15%',
      render: () => <span>{bcType}</span>,
    },
    {
      title: '班组',
      dataIndex: 'bzName',
      width: '18%',
      render: (text, record) => (
        <Select style={{width: '100%'}} value={record.bzName} onSelect={(value, option) => { this.onBzSelect(value, option, record.gid); }}>
          {bzOptions}
        </Select>
      ),
    },
    {
      title: '班组人员',
      dataIndex: 'zbrList',
      width: '27%',
      render: (text, record) => (
        <Select
          style={{width: '95%', height: 'calc(100%)', overflow: 'auto', maxHeight: 'calc(100vh - 628px)', minHeight: 33}}
          mode="multiple"
          onChange={(value) => this.onPersonChange(value, record.gid)}
          value={record.zbrList !== '' ? record.zbrList.split(',') : []}
        />
      ),
    },
    {
      title: '班次',
      dataIndex: 'bcName',
      width: '16%',
      render: (text, record) => (
        <Select style={{width: '100%'}} value={record.bcName} onSelect={(value, option) => { this.onBcSelect(value, option, record.gid); }}>
          {bcOptions}
        </Select>
      ),
    },
    {
      title: '班次时间',
      dataIndex: 'bcTime',
      width: '18%',
      render: (text, record) => (
        record.bcStartTime ? <span>{`${record.bcStartTime}~${record.bcEndTime}`}</span> : <span />
        // <span>{this.state.bcTime}</span>
      ),
    },
    {
      title: '',
      dataIndex: 'action',
      width: '6%',
      render: (text, record) => (
        data && data.length === 1 ? <span /> :
        <Tooltip placement="top" title="删除">
          <Icon type="minus" style={{cursor: 'pointer'}} onClick={() => { this.delColumns(record.gid); }} />
        </Tooltip>
      ),
    },
    ];
    const columns = data[0].bcType === '班组排班' ? bzColumns : bcColumns;
    return (
      <Modal
        visible={show}
        className={styles.modal}
        maskClosable={false}
        title={<div style={{backgroundColor: 'RGB(22,155,213)', height: 40, lineHeight: '40px', padding: '2px 10px'}}>
            <span><Icon type="smile-o" style={{fontSize: 25}} /></span>
            <span style={{fontSize: 18, marginLeft: 10}}>{selectDate}</span>
          </div>}
        footer={[
          <Button key="submit" type="primary" onClick={handleOk}> 保存 </Button>,
          <Button type="primary" onClick={handleReset}>重置</Button>,
        ]}
        onCancel={handleCancel}
      >
        <Tooltip placement="right" title="添加">
          <Icon type="plus" style={{cursor: 'pointer'}} onClick={this.addColumns} />
        </Tooltip>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{y: 120}}
        />
      </Modal>
    );
  }
}

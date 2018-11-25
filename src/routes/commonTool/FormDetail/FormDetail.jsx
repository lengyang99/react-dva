import React from 'react';
import {Icon, Popover, Steps, Timeline, Table, Button, Rate, Divider} from 'antd';
import PropTypes from 'prop-types';
import _ from 'lodash';
import SeeMediaInfo from '../SeeMedia/SeeMediaInfo';
import ShowMediaInfo from '../SeeMedia/ShowMediaInfo';
import PatrolControl from '../PatrolControl/PatrolControl';
import {routerRedux, Link} from 'dva/router';

const Step = Steps.Step;
const OneDom = (name, value) => (<div style={{width: '50%', display: 'inline-block', padding: 10}}>
  <div style={{width: 150, display: 'inline-block', verticalAlign: 'top'}}>
    <span style={{float: 'right'}}>{name}：</span>
  </div>
  <div style={{width: 'calc(100% - 150px)', display: 'inline-block', verticalAlign: 'top'}}>
    {value}
  </div>
</div>);

export default class FormDetail extends React.Component {
  constructor(props) {
    super(props);
    this.propsData = props;
    this.state = {
      showAttach: true,
      showApproise: {},
    };
  }

  componentWillReceiveProps(nextProps, nextState) {
    this.propsData = nextProps;
  }

  getDiv = (data) => {
    const contair = [];
    if (data.type && data.type === 'repairList') {
      return this.getRepairList(data.params);
    }
    if (data.params) {
      for (let i = 0; i < data.params.length; i++) {
        if (data.params[i].items.length === 0) {
          continue;
        }
        const tmpdiv = this.getMessages(data.params[i].items);
        const top = (i === 0 ? 0 : 10);
        const titlediv = data.params.length > 1 ?
          (<div style={{float: 'left', width: '100%'}}>
            <div style={{
              float: 'left',
              width: '3px',
              marginTop: '3px',
              marginRight: '10px',
              marginBottom: '10px',
              height: '15px',
              backgroundColor: '#1890FF',
            }}
            />
            <span style={{fontWeight: 'bold'}}>{data.params[i].alias}</span>
          </div>) : null;

        contair.push(<div style={{marginTop: `${top}px`}}>
          {titlediv}
          {tmpdiv}
        </div>);
      }
      return contair;
    } else if (this.props.tabName === 'woLIstinfo') {
      return this.getWoList(data);
    } else if (this.props.tabName === 'taskInfo') {
      return this.getTaskInfo(data);
    } else if (data.fieldAliases) {
      return this.getList(data);
    } else if (data.results) {
      return this.getLogList(data.results);
    } else if (data.data && this.props.tabName === 'jginfo') {
      return this.jgListInfo(data);
    } else if (this.props.tabName === 'tzinfo') {
      return this.tzListInfo(data);
    } else if (this.props.tabName === 'dgxsinfo') {
      let funBtn = null;
      this.props.funBtn.map((item) => {
        if (item.key == 'approise') {
          funBtn = item;
        }
      });

      return (<PatrolControl
        showApproise={funBtn !== null}
        approiseBtn={funBtn}
        showApproiseDetail={this.jgListInfo.bind(this)}
        data={data}
      />);
    } else if (data.data) {
      // contair.push(<div style={{marginTop: '10px'}}>
      //   <div>
      //     <div style={{float: 'left', width: '3px', marginTop: '3px', marginRight: '10px', height: '15px', backgroundColor: '#1890FF'}}></div>
      //     <span>{data.alias}</span>
      //   </div>
      //   {}
      // </div>);
      return this.getMaterials(data.data.length > 0 ? data.data : [{}]);
    } else {
      return null;
    }
  };

  getLogList = (data) => {
    const timelines = data.map((timeline, i) => (
      <Timeline.Item key={timeline.nodeid}>
        <span style={{display: 'inline-block', verticalAlign: 'top', height: 24, width: 140, marginRight: 20}}>{timeline.nodeid}</span>
        <span style={{display: 'inline-block', verticalAlign: 'top', height: 24, width: 150, marginRight: 20}}>{timeline.username}</span>
        <span style={{display: 'inline-block', verticalAlign: 'top', height: 24, width: 160, marginRight: 20}}>{timeline.processtime}</span>
        <span style={{
          display: 'inline-block',
          verticalAlign: 'top',
          height: 24,
          width: 400,
          marginRight: 20,
          fontWeight: 'bold',
        }}
        >{timeline.description}</span>
      </Timeline.Item>
    ));
    /* let steps = data.map((step, i) => (
     <div>
     {i === 0 ? '' : <div style={{height: 30, width: 2, backgroundColor: '#1890ff', margin: '0px 0px 10px 10px'}}/>}
     <div>
     <span style={{
     display: 'inline-block',
     height: 24,
     width: 24,
     marginRight: 15,
     borderRadius: 12,
     backgroundColor: "#1890ff"
     }}/>
     <span style={{display: 'inline-block', height: 24, width: 120, marginRight: 20}}>{step.nodeid}</span>
     <span style={{display: 'inline-block', height: 24, width: 120, marginRight: 20}}>{step.username}</span>
     <span style={{display: 'inline-block', height: 24, width: 200, marginRight: 20}}>{step.processtime}</span>
     <span style={{display: 'inline-block', height: 24, width: 400, marginRight: 20, fontWeight: 'bold'}}>{step.description}</span>
     </div>
     </div>
     )); */
    return <Timeline>{timelines}</Timeline>;
  };
  // modify by lengyang 2018 07 11
  getTaskInfo = (data) => {
    const {taskInfo, equipmentInfo} = data.data || {};
    const equInfo = equipmentInfo || [];
    equInfo.forEach((item, index) => {
      Object.assign(item, { findex: index + 1 });
    });
    const {createTime, endTime, name, workOrderCode} = taskInfo || {};
    const columns = [
      {
        key: 'findex',
        title: '序号',
        dataIndex: 'findex',

      },
      {
        key: 'eqCode',
        title: '设备编号',
        dataIndex: 'eqCode',
      },
      {
        key: 'eqCode',
        title: '设备名称',
        dataIndex: 'eqName',
      },
      {
        key: 'eqStatus',
        title: '设备状态',
        dataIndex: 'eqStatus',
      },
      {
        key: 'posDesc',
        title: '地址',
        dataIndex: 'posDesc',
      },
    ];
    return (
      <div>
        <p style={{fontWeight: 'bold', fontSize: 15}}>任务信息</p>
        <div>
          {OneDom('工单编号', workOrderCode)}
          {OneDom('工单名称', name)}
          {OneDom('生成时间', createTime)}
          {OneDom('要求完成时间', endTime)}
        </div>
        <p style={{fontWeight: 'bold', fontSize: 15}}>关联设备</p>
        <Table
          rowKey="gid"
          dataSource={equInfo}
          columns={columns}
        />
      </div>
    );
  }
  getMaterials = (datas) => {
    const columns = [{
      title: '物料编码', dataIndex: 'matnr', key: 'matnr',
    }, {
      title: '物料名称', dataIndex: 'des', key: 'des',
    }, {
      title: '数量', dataIndex: 'bdmng', key: 'bdmng',
    }, {
      title: '单位', dataIndex: 'unitname', key: 'unitname',
    }, {
      title: '工厂名称', dataIndex: 'facName', key: 'facName',
    }, {
      title: '物料库', dataIndex: 'wlName', key: 'wlName',
    }];
    const dataDivs = [];
    for (let i = 0; i < datas.length; i++) {
      const data = datas[i];
      dataDivs.push(<div key={i}>
        <p style={{fontWeight: 'bold', fontSize: 15}}>领料信息</p>
        <div>
          {OneDom('工单编号', data.kempf)}
          {OneDom('发料时间', data.issueTime)}
          {OneDom('预留号', data.theReserved)}
          {OneDom('申请时间', data.applyTime)}
          {OneDom('申请人', data.applyPerson)}
          {OneDom('移动类型', data.mtInfo)}
          {/* <OneDom name="工单编号" value="工单编号"/> */}
          {/* <OneDom name="发料时间" value="发料时间"/> */}
          {/* <OneDom name="预留号" value="预留号"/> */}
          {/* <OneDom name="申请时间" value="申请时间"/> */}
          {/* <OneDom name="申请人" value="申请人"/> */}
          {/* <OneDom name="移动类型" value="移动类型"/> */}
        </div>
        <p style={{fontWeight: 'bold', fontSize: 15}}>物料清单</p>
        <Table
          rowKey="gid"
          dataSource={data.reserve}
          columns={columns}
          bordered={false}
        />
      </div>);
    }
    return <div>{dataDivs}</div>;
  };

  getRepairList = (params) => {
    const resultDiv = [];
    for (let i = 0; i < params.length; i++) {
      resultDiv.push(
        <div style={{marginTop: `${i == 0 ? '' : 20}px`, width: '100%', height: '30px'}} key={`repair_${i}`}>
          <div style={{float: 'left', width: '150px'}}>{params[i].report_type}</div>
          <div style={{float: 'left', width: '100px'}}>{params[i].report_userid}</div>
          <div style={{float: 'left', width: '200px'}}>{params[i].report_time}</div>
          <div style={{float: 'left'}}>{params[i].report_content}</div>
        </div>);
    }
    return resultDiv;
  }

  jgListInfo = (data, showApproise) => {
    if (!data) {
      return '';
    }
    const lists = [];
    const fields = [];
    const appraiseField = [];
    data.fields[0].items.filter((field) => {
      if (field.name !== 'appraise_userid' && field.name !== 'createtime'
      && field.name !== 'score' && field.name !== 'remark'
      && field.name !== 'create_userid' && field.name !== 'create_time'
      && field.name !== 'appraise') {
        fields.push(field);
      }
      if (field.name == 'appraise_userid' || field.name == 'createtime'
        || field.name == 'score' || field.name == 'remark') {
        appraiseField.push(field);
      }
    });
    for (let i = 0; i < data.data.length; i++) {
      const divs = [];
      for (let j = 0; j < fields.length; j++) {
        if (fields[j].visible === 1) {
          divs.push(this.getOneDom(fields[j], data.data[i][fields[j].name], data.data[i], j));
        }
      }

      const appraiseDivs = [];
      for (let n = 0; n < data.data[i].appraise.length; n++) {
        const tmpData = data.data[i].appraise[n];
        const tmpDiv = [];
        for (let m = 0; m < appraiseField.length; m++) {
          if (appraiseField[m].visible === 1) {
            tmpDiv.push(this.getOneDom(appraiseField[m], tmpData[appraiseField[m].name], tmpData, m));
          }
        }
        appraiseDivs.push(<div key={n}>{tmpDiv}</div>);
      }

      let funBtn = null;
      this.props.funBtn.map((item) => {
        if (item.key == 'approise') {
          funBtn = item;
        }
      });

      const appraiseStyle = {
        display: ((this.state.showApproise[data.data[i].gid] && this.state.showApproise[data.data[i].gid] === true) || showApproise) ? 'block' : 'none',
      };
      const listDiv = (<div key={i} style={{borderBottom: '1px solid #e8e8e8'}}>
        <div style={{width: '100%', display: 'inline-block', padding: 10, fontWeight: 'bold'}}>
          <span style={{marginRight: 20}}>{data.data[i].create_userid}</span>
          <span>{data.data[i].create_time}</span>
        </div>
        {divs}
        <div style={{borderTop: '1px solid #e8e8e8', height: '40px', lineHeight: '40px'}}>
          <span style={{ cursor: 'pointer' }} onClick={this.showApproiseClick.bind(this, data.data[i].gid)}>领导评价({data.data[i].appraise.length})</span>
          {funBtn === null ? '' : <Button type="primary" style={{ float: 'right', marginTop: '5px' }} onClick={funBtn.click.bind(this, data.data[i].gid)}>{funBtn.name}</Button>}
        </div>
        <div style={appraiseStyle}>
          {appraiseDivs}
        </div>
      </div>);
      lists.push(listDiv);
    }
    return lists;
  }

  tzListInfo = (data) => {
    if (!data) {
      return '';
    }
    const columns = [{
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => index,
    }, {
      title: '监护人',
      dataIndex: 'userid',
      key: 'userid',
    }, {
      title: '监护时长',
      dataIndex: 'stay_time_count',
      key: 'stay_time_count',
    }, {
      title: '监护类型',
      dataIndex: 'stay_type',
      key: 'stay_type',
      render: (index, record) => (record.stay_type == 1 ? '白天' : '晚上'),
    }, {
      title: '开始时间',
      dataIndex: 'stay_stime',
      key: 'stay_stime',
    }, {
      title: '结束时间',
      dataIndex: 'stay_etime',
      key: 'stay_stime',
    }];
    const lists = (
      <div>
        <div>
          <span>累计监护时长:<span style={{ marginLeft: '50px' }}>{data.timeTotal}分钟</span></span>
        </div>
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <span>白天监护时长:<span style={{ marginLeft: '50px' }}>{data.dayTimeTotal}</span>分钟</span>
          <span style={{ marginLeft: '100px' }}>夜间监护时长:<span style={{ marginLeft: '50px' }}>{data.nightTimeTotal}分钟</span></span>
        </div>
        <Table
          columns={columns}
          dataSource={data.data}
        />
      </div>
    );
    return lists;
  }

  getWoList = (data) => {
    if (!data) {
      return '';
    }
    const columns = [{
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => index,
    }];
    data.fields.forEach((item) => {
      if (item.visible != '0') {
        columns.push({
          title:item.alias,
          dataIndex: item.name,
          key: item.name,
        });
      }
    });
    const tableData = [];
    data.features.forEach((item) => {
      tableData.push(item.attributes);
    });
    const lists = (
      <div>
        <Table
          columns={columns}
          dataSource={tableData}
          onRow={(record, index) => ({
            onDoubleClick: () => {
              this.props.showWoByEventClick(record);
            },
          })}
        />
      </div>
    );
    return lists;
  }

  getList = (data) => {
    if (!data) {
      return '';
    }
    const lists = [];
    const fields = data.fields.filter((field) => {
      return field.name !== 'create_userid' && field.name !== 'create_time'
      && field.name !== 'createuserid' && field.name !== 'createtime';
    });
    for (let i = 0; i < data.total; i++) {
      const divs = [];
      for (let j = 0; j < fields.length; j++) {
        if (fields[j].visible === 1) {
          divs.push(this.getOneDom(fields[j], data.features[i].attributes[fields[j].name], data.features[i].attributes, j));
        }
      }
      const listDiv = (<div key={i} style={{borderBottom: '1px solid #e8e8e8'}}>
        <div style={{width: '100%', display: 'inline-block', padding: 10, fontWeight: 'bold'}}>
          <span style={{marginRight: 20}}>{data.features[i].attributes.create_userid || data.features[i].attributes.createuserid}</span>
          <span>{data.features[i].attributes.create_time || data.features[i].attributes.createtime}</span>
        </div>
        {divs}
      </div>);
      lists.push(listDiv);
    }
    return lists;
  };

  getMessages = (datas) => {
    if (!datas) {
      return '';
    }
    const valuesJson = {};
    datas.map((data, i) => {
      valuesJson[data.name] = data.value;
    });
    const divs = [];
    for (let i = 0; i < datas.length; i++) {
      if (datas[i].visible === 1) {
        divs.push(this.getOneDom(datas[i], valuesJson[datas[i].name], valuesJson, i));
      }
    }
    return divs;
  };

  closeSeeMediaInfo = () => {
    this.setState({
      showAttach: false,
    });
  };

  getOneDom = (d, value, valuesJson, i) => {
    let tempDiv = '';
    let width = '';
    // let types = ['DDL', 'DATETIME', 'DATE', 'TXT', 'RDO', 'NUM', 'CONTACTS', 'CHK', 'DDLEXT', 'CONTACTM'];
    // NUM TXT TXTEXT DATE DATETIME DDL CONTACTS RDO CHK DDLEXT CONTACTM GEOM GEOMG IMG ATT ADO
    // if (types.indexOf(d.type) !== -1) {
    //   width = '50%';
    //   tempDiv = value;
    // }
    // else
    if (d.type === 'TXTEXT') {
      width = '100%';
      tempDiv = value;
    } else if (d.type === 'ATT' || d.type === 'ADO' || d.type === 'IMG') {
      width = '100%';
      tempDiv = value === '' || !this.state.showAttach ? '' : (
        [1].map(item => {
          return <ShowMediaInfo key={value} attactInfo={value} type={d.type} />;
        })
      );
    } else if (d.type === 'GEOM' || d.type === 'GEOMG') {
      width = '50%';
      tempDiv = (<span>
        {value}
        {(value === '' || valuesJson[`${d.name}_geom`] === '' || valuesJson[`${d.name}_geom`] === undefined) ? '' :
        <Icon
          style={{marginLeft: 10}}
          type="environment"
          onClick={this.propsData.showPoint.bind(this, valuesJson[`${d.name}_geom`])}
        />}
      </span>);
    } else if (d.type === 'DEV') {
      let tempDevValue = value;
      try {
        tempDevValue = JSON.parse(value);
        let devName = '';
        for(let i = 0; i < tempDevValue.length; i++){
          devName = tempDevValue[i].eqcode + '、';
        }
        if(devName.length > 0){
          tempDiv = devName.substring(0, devName.length - 1);
        }
      } catch (e) {
        value = tempDevValue;
        tempDiv = value;
      }
      width = '50%';
    } else if (d.type === 'PIPEDEV') {
      let tempDevValue = value;
      try {
        let equipNum = '';
        let pipeCode = '';
        tempDevValue = JSON.parse(value);
        if (tempDevValue.equip && tempDevValue.pipe) {
          for (let i = 0; i < tempDevValue.equip.length; i++) {
            equipNum += `${tempDevValue.equip[i].eqcode}、`;
          }
          if (equipNum.length > 0) {
            equipNum = equipNum.substring(0, equipNum.length - 1);
          }
          for (let i = 0; i < tempDevValue.pipe.length; i++) {
            pipeCode += `${tempDevValue.pipe[i].num}、`;
          }
          if (pipeCode.length > 0) {
            pipeCode = pipeCode.substring(0, pipeCode.length - 1);
          }
        }
        value = (<span>管段: {pipeCode}<br/>设备: {equipNum}</span>);
      } catch (e) {
        value = tempDevValue;
      }
      width = '50%';
      tempDiv = value;
    } else if (d.type === 'ADD' || d.type === 'ADDR') {
      let tempDevValue = value;
      try {
        tempDevValue = JSON.parse(value);
        value = tempDevValue.name || '';
      } catch (e) {
        value = tempDevValue;
      }
      width = '50%';
      tempDiv = value;
    } else if (d.type === 'TITLE_DIVIDER') {
      return (<div style={{width: '100%', marginBottom: '10px'}}>
        <div style={{
          float: 'left',
          width: '3px',
          marginTop: '3px',
          marginRight: '10px',
          marginBottom: '10px',
          height: '15px',
          backgroundColor: '#1890FF',
        }}
        />
        <span style={{fontWeight: 'bold'}}>{d.alias}</span>
      </div>);
    } else if (d.type === 'FAULT') {
      width = '50%';
      if (typeof value === 'string' && value !== '') {
        value = JSON.parse(value);
      }
      tempDiv = value.name;
    } else if (d.type === 'RATE') {
      width = '50%';
      tempDiv = <Rate allowHalf disabled value={parseFloat(value)} count={5} />;
    } else if (d.type === 'DDL') {
      width = '50%';
      if(d.name === 'is_workflow_approval' && d.value === '是'){
        console.log(this.props.sqdno, 'workOrderNum')
        let url = "/#/query/report-dangerwork-detail?sqdno=" + this.props.sqdno;
        let editurl = "/#/query/report-dangerwork?newplan=editplan&sqdno=" + this.props.sqdno;
        tempDiv = (<span>
          是
          <a
            style={{marginLeft: 10}}
            href={`${url}`}
            // onClick={() => {that.props.toDangerWork()}}
          >查看详情</a>
          <Divider type="vertical"/>
          <a
            style={{marginLeft: 10}}
            href={`${editurl}`}
          >编辑</a>
        </span>);
      }else{
        tempDiv = value;
      }
    } else {
      width = '50%';
      // 关联工单特殊处理，支持跳转到工单详情
      if (d.name === 'wocode') {
        tempDiv = <a style={{textDecoration: 'none'}} href="javascript:void(0)" onClick={this.props.showWoClick}>{value}</a>;
      } else {
        tempDiv = value;
      }
    }
    if (d.alias === 'GIS编号') {
      let valueble = tempDiv === '' ? '' : JSON.parse(tempDiv);
      if (Array.isArray(valueble)) {
        tempDiv = '';
        valueble.forEach((item, index) => {
          if (index === 0) {
            tempDiv += `${item.eqcode}`;
          } else {
            tempDiv += `,${item.eqcode}`;
          }
        });
      } else if (valueble.eqcode) {
        tempDiv = valueble.eqcode;
      } else {
        tempDiv = '';
      }
    }
    const returnDiv = (
      <div key={i} style={{width, display: 'inline-block', padding: 10}}>
        <div style={{width: 130, display: 'inline-block', verticalAlign: 'top'}}>
          <span style={{float: 'right'}}>{d.alias}：</span>
        </div>
        <div style={{width: 'calc(100% - 150px)', display: 'inline-block', verticalAlign: 'top'}}>
          {tempDiv}
          <span style={{marginLeft: '2px'}}>{d.unit}</span>
        </div>
      </div>
    );
    return returnDiv;
  };

  showApproiseClick = (gid) => {
    const flag = this.state.showApproise[gid];
    const showApproise = this.state.showApproise;
    if (!flag) {
      showApproise[gid] = true;
    } else {
      showApproise[gid] = false;
    }
    this.setState({
      showApproise,
    });
  }

  render() {
    const divs = this.getDiv(this.propsData.data);
    return (
      <div style={{marginTop: '10px'}}>
        {divs}
      </div>
    );
  }
}

FormDetail.propTypes = {
  data: PropTypes.object,
  tabName: PropTypes.string,
  showPoint: PropTypes.func,
  showWoClick: PropTypes.func,
  showWoByEventClick: PropTypes.func,
  funBtn: PropTypes.any,
};

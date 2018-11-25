import React, { PureComponent } from 'react';
import {Modal, Table, Form, Input, DatePicker, TreeSelect, Row, Col, Button, Tooltip, message} from 'antd';
import styles from './TempPlanForm.less';
import moment from 'moment';
// import Ellipsis from 'ant-design-pro/lib/Ellipsis';
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const createForm = Form.create;
const TreeNode = TreeSelect.TreeNode;
const FormatStr = 'YYYY-MM-DD';
const road = {};

class TempPlanForm extends PureComponent {
  constructor({ porps }) {
    super();
    this.state = {
      guardian: '',
      startTime: moment(new Date()).format(FormatStr),
      endTime: moment(new Date()).add('days', 7).format(FormatStr),
      stationValue: '',
      pageno: 1,
      pagesize: 10,
      eqInfo: '',
      others: '',
      planName: '',
      hasTempName: false,
      isReadOnly: false,
      eqData: '',
      rowKeys: [],
    };
  }
    tempOthers = '';
    isShowA = 'true';
    isShowB = 'true';
    isNextLine = 'true';
    isShowChildren = 'false';

   roadClick=(data, val) => {
     const {rowKeys} = this.state;
     if (!rowKeys.includes(data.gid)) {
       return;
     }
     const arr = [];
     this.props.equData.forEach((dd) => {
       if (data.gid === dd.gid) {
         arr.push({...dd, abl: val});
       } else {
         if (dd.abl) {
           delete dd.abl;
         }
         arr.push({...dd});
       }
     });
     this.props.dispatch({
       type: 'maintain/changeEquData',
       payload: arr,
     });

     arr.forEach(kk => {
       if (kk.abl) {
         road[kk.gid] = kk.abl;
       }
     });
     const roadArr = Object.keys(road);
     this.props.callbackRoad(road);
   };

    // const showWhr = !['safety_check','meter_read'].includes(func);//维护人,按键和抄表没有维护人
    resetABlStatus = (record) => {
      delete road[record.gid];
      this.props.callbackRoad(road);
    };

    submitHandle=() => {
      this.props.handleSubmitPlan(this.state.startTime, this.state.endTime, this.state.planName);
    };
    rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        let equipments = '';
        for (let i = 0; i < selectedRows.length; i++) {
          if (i > 0) {
            equipments += ',';
          }
          equipments += selectedRows[i].gid;
        }
        // const roadArr = Object.keys(road)
        selectedRowKeys.forEach(item => {
          if (!road[item]) {
            road[item] = 'AB';
          }
        });
        for (const key in road) {
          if (!selectedRowKeys.includes(Number(key))) {
            delete road[key];
          }
        }
        console.log(selectedRowKeys, road, '333');
        this.setState({rowKeys: selectedRowKeys});
        this.props.callbackRoad(road);
        this.props.callbackDevice(equipments, selectedRowKeys);
      },
      onSelect: (record, selected, selectedRows) => {
        console.log(record, selected, selectedRows, road, 'road2');
      },
    };


    onInputChange = (e) => {
      const val = e.target.value;
      this.setState({
        others: val,
      });
    };

    onAreaSelect = (value, node) => {
      if (value !== '' && (node !== undefined)) {
        const {dataRef} = node.props;
        this.props.callbackRegion(dataRef);
        if (value === dataRef.station) {
          message.error(`请选择 ${value} 下的小区域！`);
          return;
        }
        for (const key in road) {
          delete road[key];
        }
        this.props.dispatch({
          type: 'maintain/getAreaEquData',
          payload: {
            pageno: 1,
            pagesize: this.state.pagesize,
            ecode: dataRef.ecode,
            function: this.props.func,
            regionId: dataRef.eqlocation.gid,
          },
        });
        const date = new Date();
        const tempNameData = `${dataRef.name}_${moment(date).format(FormatStr)}`;
        if (!this.state.hasTempName) {
          this.setState({'planName': tempNameData});
        }
        this.tempOthers = '';
        this.setState({
          pageno: 1,
          guardian: dataRef.usernames,
          stationValue: dataRef.name,
          eqInfo: dataRef,
        });
      }
    };
    gettempName = (value) => {
      this.setState({'planName': value.target.value});
      if (value === '') {
        this.setState({
          'hasTempName': false,
        });
      } else {
        this.setState({
          'hasTempName': true,
        });
      }
      // this.props.changeTempName(value.target.value)
    }

    // 默认时间不能小于当日；
    disabledDate = (current) => {
      return current && current.valueOf() < new Date(new Date().getTime() - 86400000);
    }
    // 当前时间后7天；
    fun_date = (aa) => {
      let date1 = new Date(),
        time1 = `${date1.getFullYear()}-${date1.getMonth() + 1}-${date1.getDate()}`;// time1表示当前时间
      const date2 = new Date(date1);
      date2.setDate(date1.getDate() + aa);
      const time2 = `${date2.getFullYear()}-${date2.getMonth() + 1}-${date2.getDate()}`;
    }
    // 填充数据至区域
    renderTreeNodes = (data) => {
      return data.map((item) => {
        if (item.children && item.children.length > 0) {
          return (
            <TreeNode title={item.name} key={item.gid} value={item.name} dataRef={item}>
              {renderTreeNodes(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode title={item.name} key={item.gid} value={item.name} dataRef={item} />;
      });
    };

    changeTime = (date, dateString) => {
      this.setState({
        startTime: dateString[0],
        endTime: dateString[1],
      });
    }
    onChange = (value, dateString) => {
      console.log('Formatted Selected Time: ', dateString);
    };
    onOk = (value) => {
      console.log('onOk: ', value);
    };

    // 查询设备；
    checkHandler = () => {
      this.props.dispatch({
        type: 'maintain/getAreaEquData',
        payload: {
          pageno: 1,
          pagesize: 10,
          ecode: this.state.eqInfo.ecode,
          regionId: this.state.eqInfo.eqlocation.gid,
          others: this.state.others,
          function: this.props.func,
        },
      });
      this.tempOthers = this.state.others;
      this.setState({
        others: '',
        pageno: 1,
        pagesize: 10,
      });
    };
    // 查看设备查询
    lookHandler = () => {
      const {oldInfo: {planId, startTime, endTime, functionKey}} = this.props;
      this.props.dispatch({
        type: 'taskdetail/getCardDetail',
        payload: {
          pageno: 1,
          pagesize: 10,
          planId,
          startTime,
          endTime,
          function: functionKey,
          others: this.state.others,
        },
      });
      this.tempOthers = this.state.others;
      this.setState({
        others: '',
        pageno: 1,
        pagesize: 10,
      });
    }

    cancelHandler = () => {
      this.props.handCancel();
      for (const key in road) {
        delete road[key];
      }
      this.setState({
        guardian: '',
        startTime: moment(new Date()).format(FormatStr),
        endTime: moment(new Date()).add('days', 7).format(FormatStr),
        stationValue: '',
        pagesize: 10,
        pageno: 1,
        others: '',
        eqInfo: '',
        planName: '',
        isReadOnly: false,
        hasTempName: false,
      });
    }

    // 分页；
    changePageHandler = (pagedata) => {
      this.setState({
        pageno: pagedata.current,
        pagesize: pagedata.pageSize,
      });
      if (!this.state.isReadOnly) {
        this.props.dispatch({
          type: 'maintain/getAreaEquData',
          payload: {
            pageno: pagedata.current,
            pagesize: pagedata.pageSize,
            ecode: this.state.eqInfo.ecode,
            regionId: this.state.eqInfo.eqlocation.gid,
            others: this.tempOthers,
            function: this.props.func,
          },
        });
      } else {
        const {oldInfo: {planId, startTime, endTime, functionKey}} = this.props;
        this.props.dispatch({
          type: 'taskdetail/getCardDetail',
          payload: {
            pageno: pagedata.current,
            pagesize: pagedata.pageSize,
            planId,
            startTime,
            endTime,
            function: functionKey,
            others: this.tempOthers,
          },
        });
      }
    }

    resetTempData = (data) => {
      this.setState({
        guardian: data.assigneeName,
        startTime: data.startTime,
        endTime: data.endTime,
        stationValue: data.regionName,
        planName: data.name,
        isReadOnly: true,
        eqData: this.props.detaildata,
      });
    }
    render() {
      const {
        visible, loading, handleSubmitPlan, handCancel, dispatch, callbackRegion, callbackDevice,
        areaData = [], equData = [], origEquData = [], func, callbackRoad, tempName, changeTempName, eqTempTotal, eqTotal, detaildata, oldInfo,
      } = this.props;

      const formItemLayout = {
        labelCol: {
          sm: {span: 24},
          md: {span: 7},
        },
        wrapperCol: {
          sm: {span: 24},
          md: {span: 17},
        },
      };

      const columns = [
        {
          title: '设备编号',
          dataIndex: 'eqCode',
          key: 'eqCode',
          render: (text) => {
            return (<div className={styles.textOverflow}>
              <Tooltip placement="topLeft" title={text} >{text}</Tooltip>
            </div>);
          },
        },
        {
          title: '位置',
          dataIndex: 'posDesc',
          key: 'posDesc',
          render: (text) => {
            return (<div className={styles.textOverflow}>
              <Tooltip placement="topLeft" title={text} >{text}</Tooltip>
            </div>);
          },
        },
      ];

      const columnsRead = [
        {
          title: '设备编号',
          dataIndex: 'code',
          key: 'code',
          render: (text, record) => {
            return (<div className={styles.textOverflow}>
              <Tooltip placement="topLeft" title={text} >{text}</Tooltip>
            </div>);
          },
        },
        {
          title: '位置',
          dataIndex: 'address',
          key: 'address',
          render: (text, record) => {
            return (<div className={styles.textOverflow}>
              <Tooltip placement="topLeft" title={text} >{text}</Tooltip>
            </div>);
          },
        },
      ];
      if (func === 'regulator_a' || func === 'regulator_b' || func === 'regulator_debug_qieduan' || func === 'regulator_debug_fangsan') {
        columnsRead.push({
          title: 'AB路',
          dataIndex: 'line',
          key: 'line',
        });
      }

      if (func === 'regulator_a' || func === 'regulator_b' || func === 'regulator_debug_qieduan' || func === 'regulator_debug_fangsan') {
        columns.push({
          title: 'AB路',
          dataIndex: 'abl', // fixed: 'right',
          key: 'abl',
          render: (text, record) => {
            // console.log(road[record.gid],record,road, 'ablu');
            return <RoadAB value={road[record.gid]} data={record} />;
          },
        });
      }

      const RoadAB = ({value, data}) => (<span>
        {
        ['AB', 'A', 'B'].map((ii) =>
          (<a
            key={ii}
            onClick={() => { this.roadClick(data, ii); }}
            style={{color: ii === value ? 'blue' : '#ccc', marginRight: 8}}
          >{ii}路</a>))
      }
      </span>);
      return (
        <Modal
          visible={visible}
          title="计划制定"
          onOk={this.submitHandle}
          onCancel={this.cancelHandler}
          confirmLoading={loading}
          maskClosable={false}
          width={800}
        >
          <Form>
            <Row>
              <Col span={11}>
                <FormItem
                  {...formItemLayout}
                  label="计划名称"
                  style={{marginBottom: 15}}
                >
                  <Input
                    placeholder="请输入"
                    value={this.state.planName}
                    style={{fontSize: 12}}
                    onChange={this.gettempName}
                    disabled={this.state.isReadOnly}
                  />
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem
                  {...formItemLayout}
                  label="维护人"
                  style={{marginBottom: 15}}
                >
                  <Input style={{fontSize: 12}} placeholder="不支持编辑，默认是区域负责人" readOnly="true" value={this.state.guardian} disabled={this.state.isReadOnly} />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={11}>
                <FormItem
                  {...formItemLayout}
                  label={<span style={{fontSize: 14}}>区域</span>}
                  style={{marginBottom: 15}}
                >
                  <TreeSelect
                    placeholder="请选择站点"
                    dropdownStyle={{maxHeight: 180, overflow: 'auto'}}
                    disabled={this.state.isReadOnly}
                    value={this.state.stationValue}
                    onSelect={this.onAreaSelect}
                  >
                    {
                    areaData.map((item) => {
                      if (item.children && item.children.length > 0) {
                        return (
                          <TreeNode title={item.name} key={item.gid} value={item.name} dataRef={item}>
                            {this.renderTreeNodes(item.children)}
                          </TreeNode>
                        );
                      }
                      return <TreeNode title={item.name} key={item.gid} value={item.nam} dataRef={item} />;
                    })
                  }
                  </TreeSelect>
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem
                  {...formItemLayout}
                  label="起止时间"
                  style={{marginBottom: 15}}
                >
                  <RangePicker
                    disabledDate={this.disabledDate}
                    format="YYYY-MM-DD"
                    style={{width: 300, fontSize: 12}}
                    value={this.state.startTime === '' ? [null, null] : [moment(this.state.startTime, FormatStr), moment(this.state.endTime, FormatStr)]}
                    onChange={(date, dateString) => { this.changeTime(date, dateString); }}
                    disabled={this.state.isReadOnly}
                  />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem style={{marginBottom: 15}}>
                  <Input
                    style={{fontSize: 12, width: 240, display: 'inLine'}}
                    onChange={this.onInputChange}
                    value={this.state.others}
                    placeholder="请输入编号或名称"
                  />
                </FormItem>
              </Col>
              <Col span={5} style={{ textAlign: 'left'}}>
                <Button type="primary" onClick={!this.state.isReadOnly ? this.checkHandler : this.lookHandler}>查询</Button>
              </Col>
            </Row>
            <Table
              columns={!this.state.isReadOnly ? columns : columnsRead}
              dataSource={!this.state.isReadOnly ? equData : detaildata}
              rowSelection={this.rowSelection}
              rowKey={record => (!this.state.isReadOnly ? record.gid : record.taskId)}
              size="small"
              pagination={{
              current: this.state.pageno,
              pageSize: this.state.pagesize,
              total: !this.state.isReadOnly ? eqTempTotal : oldInfo.eqCount,
              showTotal() { // 设置显示一共几条数据
                return <div style={{marginRight: this.width}}>共 {this.total} 条数据</div>;
              },
            }}
              onChange={(pagedata) => {
              this.changePageHandler(pagedata);
            }}
            />
          </Form>
        </Modal>
      );
    }
}

export default TempPlanForm;

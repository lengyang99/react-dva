import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Tabs, Input, Button, From, Modal, message} from 'antd';
import {routerRedux} from 'dva/router';
import moment from 'moment';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import parseValues from '../../../utils/utils';
import DutyTab from '../../../components/DutyManage/DutyTab';
import Basic from './Basic';

const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
@connect(({dutymanage, login}) => ({
  user: login.user,
  DutyDetail: dutymanage.DutyDetail,
  lastDutyData: dutymanage.lastDutyData,
  workTime: dutymanage.workTime,
}))
export default class DutyDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.getDutyData();
    this.state = {
      basicData: {}, // 基础数据
      formData: [], // 表单数据
    };
  }
  action=''; // 功能参数 上报 or 详情
  station=''; // 站点
  writeclass='当班';  //当前所处状态
  jiebanr=''; // 接班人
  update = false; //是否可以交班
  isNewbc = false; // 是否为值班日志新一轮流程的最开始的阶段
  jiebanForm=null;
  basicForm=null;
  //查询最新的交接班情况
  getDutyData=() => {
    const { location: { search }, dispatch } = this.props;
    const { zbrzid, action, station } = parseValues(search) || {};
    this.station = station;
    this.action = action;
    // 功能为上报时
    if (station && action === 'add') {
      dispatch({
        type: 'dutymanage/queryDutyStatus',
        payload: {stationcode: station},
        callback: (data) => {
          if (data && Object.keys(data).length !== 0) {
            //根据 交接班时间 判断当前所处状态(当班、接班)
            const {jiaobansj, jiebansj} = data;
            if (!jiebansj && jiaobansj) {// 交班时间有 接班时间无  则 需接班 
              this.writeclass = '接班';
              this.isNewbc = false;
            } else if (!jiebansj && !jiaobansj) { // 交班时间无 接班时间无  则 需是当班 当班之后紧接着交班 
              //流程的开始为 当班 交班 接班  时间 也从 交无 接无 到 交有 接无 最后到交有接有  再从 当班的 双无开始循环流程
              this.writeclass = '当班';
              this.update = true;
              this.isNewbc = false;
            } else {
              this.writeclass = '当班';
              this.update = false;
              this.isNewbc = true;
            }
            this.setState({basicData: data || {}});
          }
          this.props.dispatch({
            type: 'dutymanage/queryLastDutyData',
            payload: {stationcode: station, writeclass: this.writeclass},
          });
        },
      });// 功能为详情时
    } else if (action === 'read') {
      dispatch({
        type: 'dutymanage/getDutyDetailForms',
        payload: {zbrzid},
      });
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'dutymanage/queryWorkTime',
      payload: { group: 'net'},
    });
  }
  // 保存接班 交班信息
  saveFormData= () => {
    const {formData, basicData} = this.state;
    const {gid, ecode, isjiaoban, stationCode, zbr, zbrq, bc} = basicData || {};
    const {user} = this.props;
    const items = JSON.stringify(
      formData.map(item => ({
        gid: 0,
        rzgroup: item.rzgroup,
        xuhao: item.xuhao,
        itemvalue: item.itemvalue || item.defaultvalue,
        rzitem: item.rzitem,
        writeclass: item.writeclass || item.fromClass,
        zbrzid: gid || 0,
      })));
    const items2 = JSON.stringify(
      formData.map(item => ({
        gid: 0,
        rzgroup: item.rzgroup,
        xuhao: item.xuhao,
        itemvalue: item.itemvalue || item.defaultvalue,
        rzitem: item.rzitem,
        writeclass: item.writeclass || item.fromClass,
        zbrzid: gid || 0,
      })));
    if (this.writeclass === '接班') {
      // const { form } = this.jiebanForm.props;
      // form.validateFieldsAndScroll((err, values) => {
      //   if (!err) {
      //   }
      // });
      const data = {
        zbrzid: gid || 0,
        jiebanr: this.jiebanr,
        jiebanrid: user.gid,
        items,
      };
      this.props.dispatch({
        type: 'dutymanage/submitJiebanDuty',
        payload: data,
        callback: ({success}) => {
          if (!success) {
            message.warn('保存失败');
            this.getDutyData();
          } else {
            message.success('保存成功');
            this.getDutyData();
          }
        },
      });
    }
    if (this.writeclass === '当班') {
      const { form } = this.basicForm.props;
      form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          const {zbr: zhibanr, bc: banci} = values;
          const zbrz = {
            ecode: ecode || user.ecode,
            stationCode: stationCode || this.station,
            isjiaoban: isjiaoban || 0,
            zbrzid: gid || 0,
            zbr: zhibanr || user.trueName,
            zbrq: moment().format('YYYY-MM-DD'),
            bc: bc || banci,
            zhibanr: user.trueName,
            zhibanrid: user.gid};
          const zbrz2 = Object.assign(zbrz, {zbrid: user.gid});
          const data = {
            items: items2,
            zbrz: JSON.stringify(zbrz),
          };
          const data2 = {
            items: items2,
            zbrz: JSON.stringify(zbrz2),
            gid: gid || 0,
          };
          if (this.update && gid && gid > 0) {
            this.props.dispatch({
              type: 'dutymanage/updateZhibanDuty',
              payload: data2,
              callback: ({success}) => {
                if (!success) {
                  message.warn('保存失败');
                  this.getDutyData();
                } else {
                  message.success('保存成功');
                  this.getDutyData();
                }
              },
            });
          } else {
            this.props.dispatch({
              type: 'dutymanage/submitZhibanDutyList',
              payload: data,
              callback: ({success}) => {
                if (!success) {
                  message.warn('保存失败');
                  this.getDutyData();
                } else {
                  message.success('保存成功');
                  this.getDutyData();
                }
              },
            });
          }
        }
      });
    }
  }
    handleDataChange = (val, gid, index) => {
      const newData = [...this.props.lastDutyData];
      const target = newData[index].items.filter(item => gid === item.gid)[0];
      if (target) {
        target.itemvalue = val;
        if (target.rzitem === '接班人') {
          this.jiebanr = target.itemvalue;
        }
      }
      const formData = [];
      (newData || []).forEach(item => {
        (item.items || []).forEach(item2 => {
          formData.push(item2);
        });
      });
      this.setState({formData});
    }
  // 提交交班信息
  submitFormData = () => {
    const that = this;
    const { basicData: {gid} } = this.state;
    confirm({
      title: '是否确认交班?',
      onOk() {
        that.props.dispatch({
          type: 'dutymanage/submitJiaobanDutyList',
          payload: {zbrzid: gid},
          callback: ({ msg, success }) => {
            if (success) {
              message.success(msg);
              that.props.dispatch(routerRedux.push('dutyLog'));
            } else {
              message.warn(msg);
            }
          },
        });
      },
      onCancel() {
      },
    });
  }
  render() {
    return (
      <PageHeaderLayout>
        <div style={{minHeight: '120px', minWidth: '1100px'}}>
          <br />
          <Basic
            {...this.props}
            wrappedComponentRef={basicForm => {
                  this.basicForm = basicForm;
              }}
            isNewbc={this.isNewbc}
            update={this.update}
            disable={this.action === 'read'}
            basicData={this.action === 'read' ? this.props.DutyDetail.data : this.state.basicData}
          />
          <br />
          <Tabs
            defaultActiveKey="dangban"
            tabBarExtraContent={this.action === 'read' ? null : [
              <Button
                key="normal"
                type="primary"
                onClick={this.saveFormData}
              >保存
              </Button>,
                        '　',
                  this.update ? <Button
                    key="temp"
                    type="primary"
                    onClick={this.submitFormData}
                  >交班
                  </Button> : null,
                      ]}
          >
            {this.action === 'read' || this.writeclass !== '接班' ?
              <TabPane tab="当班情况" key="dangban" >
                <DutyTab
                  wrappedComponentRef={jiebanForm => {
                          this.jiebanForm = jiebanForm;
                      }}
                  disable={this.action === 'read'}
                  handleDataChange={this.handleDataChange}
                  data={this.action === 'read' ? this.props.DutyDetail.data.dangbanDetail : this.props.lastDutyData}
                />
              </TabPane> : null}
            {this.action === 'read' || this.writeclass === '接班' ? <TabPane tab="接班情况" key="jieban" >
              <DutyTab
                wrappedComponentRef={jiebanForm => {
                          this.jiebanForm = jiebanForm;
                      }}
                disable={this.action === 'read'}
                handleDataChange={this.handleDataChange}
                data={this.action === 'read' ? this.props.DutyDetail.data.jiebanDetail : this.props.lastDutyData}
              />
            </TabPane> : null}
          </Tabs>
        </div>
      </PageHeaderLayout>

    );
  }
}

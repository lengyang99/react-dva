import React, {PureComponent} from 'react';
import {connect} from 'dva';
import { routerRedux, Router, Route, Link } from 'dva/router';
import {Table, Dropdown, Menu, Icon,Modal, message, Button, Divider } from 'antd';
import moment from 'moment';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

const FormatStr = 'YYYY-MM-DD';
const confirm =Modal.confirm;
// @connect(({maintain, login}) => ({
//   user: login.user,
// }))
class FunctionModule extends PureComponent {
  constructor(){
    super();

    this.state = {
      ecode: '',
      loading: false,
    }
  }

  componentDidMount() {
    const {login: {user}, dispatch, maintain: {funcListData}} = this.props;
    this.setState({
      ecode: user.ecode,
    })
    dispatch({
      type: 'maintain/queryFunctionModule',
    })
  }


  //新建功能
  newPlan = () => {
    this.props.dispatch(routerRedux.push('new-function-template'));
  };

  //编辑
  editHandler = (record) => {
    this.props.dispatch({
        type: 'maintain/queryFunctionModuleDetail',
        payload: {
            planTemplateId: record.gid,
        },
        callback: (res) => {
            this.props.dispatch(routerRedux.push(`new-function-template?planTemplateId=${record.gid}`));
        }
    });
    
  };
  //删除
  delHandler = (record) => {
    console.log('delete')
    let that = this;
    confirm({
      title: '是否删除计划?',
      onOk() {
        that.props.dispatch({
          type: 'maintain/delFuncModule',
          payload: record.gid,
          callback: ({success, msg}) => {
            if(success){
              message.success(msg);
              that.props.dispatch({
                type: 'maintain/queryFunctionModule',
              })
            }
          }
        });
      },
      onCancel() {
      }
    });
  };
  //启停
  changeHandler(record) {
    let that = this;
    let src = record.status === 1 ? 'start' : 'stop';
    let mt = record.status === 1 ? '启动' : '停止';
    confirm({
      title: `是否${mt}计划?`,
      onOk() {
        that.props.dispatch({
          type: 'maintain/startModuleplan',
          planTemplateId: record.gid,
          src,
          callback: ({success, msg}) => {
            if(success){
              message.success(msg)
              that.props.dispatch({
                type: 'maintain/queryFunctionModule',
              })
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

  render() {
    const columns = [
      {
        title: '模板名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '站点',
        dataIndex: 'stationName',
        key: 'stationName',
      },
      {
        title: '功能名称',
        dataIndex: 'functionKey',
        key: 'functionKey',
      },
      {
        title: '周期',
        dataIndex: 'cycleId',
        key: 'cycleId',
      },
      {
        title: '任务类型',
        dataIndex: 'taskType',
        key: 'taskType',
        render: (text) => {
            return <span>{text === 1 ? '常规' : '临时'}</span>
        }
      },
      {
        title: '表单',
        dataIndex: 'formId',
        key: 'formId',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => {
          switch (text) {
            case 1:
              return <a style={{"color": "red", "pointer": "cursor"}} onClick={() => {
                this.changeHandler(record)
              }}><Icon type="close-circle-o"/>
                停止</a>
            case 0:
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
          const menu = (
              <Menu>
                <Menu.Item key="1">
                  <a onClick={() => {
                    this.moveUp(record)
                  }}>上移</a>
                </Menu.Item>
                <Menu.Item key="2">
                  <a onClick={() => {
                    this.moveDown(record)
                  }}>下移</a>
                </Menu.Item>
              </Menu>
          );
          return <span>
                  <a onClick={() => {this.editHandler(record)}}>编辑</a>
                  <Divider type="vertical" />
                  <a onClick={() => {this.delHandler(record)}}>删除</a>
                </span>
        }

      }
    ];

    return (
      <PageHeaderLayout>
        <div style={{padding: 10}}>
          <Button type="primary" onClick={this.newPlan}><Icon type="plus" />新建作业计划模板</Button>
        </div>
        <Table
          rowKey={record => record.planId}
          dataSource={this.props.maintain.funcModuleData || []}
          columns={columns}
        />
      </PageHeaderLayout>
    );
  }
}

export default connect(
  ({maintain, login})=>{
    return {
      maintain,
      login
    }
  }
)(FunctionModule);

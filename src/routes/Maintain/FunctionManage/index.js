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
class NewFunction extends PureComponent {
  constructor(){
    super();

    this.state = {
      ecode: '',
      loading: false,
      funcData: [],
      pageno: 1,
      pagesize: 10,
    }
    this.form = null;
  }

  componentDidMount() {
    const {login: {user}, dispatch, maintain: {funcListData}} = this.props;
    this.setState({
      ecode: user.ecode,
    })
    this.queryMaintainPlan()
  }
  //查询列表
  queryMaintainPlan = () => {
    const {pageno, pagesize} = this.state;
    this.props.dispatch({
      type: 'maintain/queryFunctionPlan',
      callback: (res) => {
        this.setState({
          funcData: res.data,
        })
      }
    });
  };

  //新建功能
  newPlan = () => {
    this.props.dispatch(routerRedux.push('newFunction'));
  };
  //子功能列表
  addChildren = (record) => {
    this.props.dispatch(routerRedux.push(`function-child?parentFunctionKey=${record.functionKey}&functionGroup=${record.functionGroup}&who=ff`));
  }
  moveUp = (key) => {
    console.log('moveup')
    const {pageno, pagesize, funcData} = this.state;
    const arr = [...funcData];
    const KEY = (pageno - 1) * pagesize + key;
    if (KEY === 0) {
      message.warning('不能再上移了！')
      return;
    }
    const temp = arr[KEY];
    arr[KEY] = arr[KEY - 1];
    arr[KEY - 1] = temp;
    this.setState({funcData: arr}, () => {
      const params = [];
      arr && arr.map((item, index) => {
        params.push({
          orderIndex: index,
          functionId: item.gid,
        })
      })
      this.props.dispatch({
        type: 'maintain/moveUD',
        payload: params,
        callback: (res) => {
          this.queryMaintainPlan()
        }
      })
    });
  };
  moveDown = (key) => {
    console.log('moveDown')
    const {pageno, pagesize, funcData} = this.state;
    const arr = [...funcData];
    const KEY = (pageno - 1) * pagesize + key;
    if (KEY === arr.length - 1) {
      message.warning('不能再下移了！')
      return;
    }
    const temp = arr[KEY];
    arr[KEY] = arr[KEY + 1];
    arr[KEY + 1] = temp;
    this.setState({funcData: arr}, () => {
      const params = [];
      arr && arr.map((item, index) => {
        params.push({
          orderIndex: index,
          functionId: item.gid,
        })
      })
      this.props.dispatch({
        type: 'maintain/moveUD',
        payload: params,
        callback: (res) => {
          this.queryMaintainPlan()
        }
      })
    });
  };
  //编辑功能
  editFunc = (record) => {
    this.props.dispatch(routerRedux.push(`editFunction?functionId=${record.gid}&functionKey=${record.functionKey}&functionName=${record.functionName}&who=ff`));
  };
  //编辑表单
  editForm = (record) => {
    this.props.dispatch(routerRedux.push(`editForm?functionId=${record.gid}&functionKey=${record.functionKey}&functionName=${record.functionName}&who=ff`));
  };

  //分页
  pageChange = (current, pageSize) => {
    this.setState({
      pageno: current,
      pagesize: pageSize,
    });  
  };

  render() {
    const {pageno, pagesize, funcData} = this.state;
    const {maintain: {functionTotal}} = this.props;

    const columns = [
      {
        title: '功能名称',
        dataIndex: 'functionName',
        key: 'functionName',
        width: '15%',
      },
      {
        title: '功能英文名称',
        dataIndex: 'functionKey',
        key: 'functionKey',
        width: '14%',
      },
      {
        title: '功能分组',
        dataIndex: 'functionGroup',
        key: 'functionGroup',
        width: '15%',
      },
      {
        title: '常规计划',
        dataIndex: 'allowRoutineTask',
        key: 'allowRoutineTask',
        width: '8%',
        render: (text) => {
          const Text =  text === 0 ? '否' : '是'
          return <span>{Text}</span>
        }
      },
      {
        title: '临时计划',
        dataIndex: 'allowTempTask',
        key: 'allowTempTask',
        width: '8%',
        render: (text) => {
          const Text =  text === 0 ? '否' : '是'
          return <span>{Text}</span>
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
                    this.moveUp(index)
                  }}>上移</a>
                </Menu.Item>
                <Menu.Item key="2">
                  <a onClick={() => {
                    this.moveDown(index)
                  }}>下移</a>
                </Menu.Item>
              </Menu>
          );
          return <span>
                  <a onClick={() => {this.editFunc(record)}}>编辑功能信息</a>
                  <Divider type="vertical" />
                  <a onClick={() => {this.editForm(record)}}>编辑表单</a>
                  <Divider type="vertical" />
                  <a onClick={() => {this.addChildren(record)}}>子功能列表</a>
                  <Divider type="vertical" />
                  <Dropdown overlay={menu} trigger={['click']}>
                    <a className="ant-dropdown-link" href="#">
                      更多 <Icon type="down"/>
                    </a>
                  </Dropdown>
                </span>
        }

      }
    ];

    const pagination = {
      total: functionTotal,
      // current: pageno,
      // pageSize: pagesize,
      showTotal: (total, range) => {
        return (<div>
          共 {total} 条记录 第{pageno}/{Math.ceil(total / pagesize)}页
        </div>);
      },
      onChange: (current, pageSize) => {
        this.pageChange(current, pageSize);
      },
    };
    return (
      <PageHeaderLayout>
        <div style={{padding: 10}}>
          <Button type="primary" onClick={this.newPlan}><Icon type="plus" />新建功能</Button>
        </div>
        <Table
          rowKey={record => record.gid}
          dataSource={funcData || []}
          columns={columns}
          pagination={pagination}
          scroll={{x: 1100}}
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
)(NewFunction);

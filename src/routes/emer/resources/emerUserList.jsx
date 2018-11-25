import React from 'react';
import {connect} from 'dva';
import {Table, Button, Select, Input, message, Radio} from 'antd';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';
import baiduConvert from '../baiduConvert';
const RadioGroup = Radio.Group;

const defaultParams = {
  organization: '',
  name: '',
};

@connect(state => ({
  user: state.login.user,
  sceneController: state.emerLfMap.sceneController,
}))

export default class EmerUserList extends React.Component {
  constructor(props) {
    super(props);
    let hash = {};
    let organizationDatas = this.props.sceneController.reduce((item, next) => {
      hash[next.groupname] ? '' : hash[next.groupname] = true && item.push(next);
      return item
    }, []);
    this.state = {
      organization: '',
      name: '',
      users: this.props.sceneController,
      organizationDatas,

      chooseUserId: '',
      chooseUser: '',
    };
  }

  componentDidMount() {

  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };

  queryUsers = () => {
    this.setState({
      users: this.props.sceneController.filter((v) => (
        (!this.state.organization || v.groupid === this.state.organization) && (!this.state.name || v.truename.indexOf(this.state.name) !== -1)
      ))
    });
  };


  onChangeParams = (field, value) => {
    this.setState({
      [field]: value,
    });
  };

  onChangeName = (e) => {
    this.setState({
      name: e.target.value,
    });
  };

  render() {
    const {onCancel} = this.props;
    const columns = [{
      title: '姓名', dataIndex: 'truename', key: 'truename', width: '20%',
    }, {
      title: '电话', dataIndex: 'phone', key: 'phone', width: '30%',
    }, {
      title: '距离事发点(米)',
      dataIndex: 'distance',
      key: 'distance',
      width: '35%',
      // render: (text, record) => {
      //   return baiduConvert.getDistance(record, this.props.geom).toFixed(2);
      // },
    }, {
      title: '选择',
      dataIndex: 'choose',
      key: 'choose',
      render: (text, record) => (
        <input type="radio" style={{textAlign: 'center'}} name="user" onClick={(e) => this.setState({chooseUserId: record.userid, chooseUser: record.truename})} />
      ),
    }];
    return (
      <Dialog
        title="选择人员"
        width={472}
        onClose={onCancel}
        position={{
          top: 60,
          left: 390,
        }}
      >
        <div style={{margin: 10}}>
          <span>机构名称:
            <Select
              value={this.state.organization}
              style={{width: 100, margin: '0px 14px 5px 8px', display: 'inline-block'}}
              placeholder="请选择"
              onChange={this.onChangeParams.bind(this, 'organization')}
            >
              {
                this.state.organizationDatas.map((v, i) => (
                  <Select.Option key={v.groupid} value={v.groupid}>{v.groupname}</Select.Option>
                ))
              }
            </Select>
          </span>
          <span>姓名:
            <Input
              style={{width: 80, margin: '0px 0px 5px 8px'}}
              value={this.state.name}
              onChange={this.onChangeName}
            />
          </span>
          <Button type="primary" style={{marginLeft: 10}} onClick={() => this.queryUsers()}>搜索</Button>
          <Button type="primary" style={{marginLeft: 10}} onClick={() => { this.props.setEmerEventSceneController(this.state.chooseUserId, this.state.chooseUser); onCancel(); }}>确认</Button>
          <Table
            rowKey={(record) => record.userid}
            bordered
            columns={columns}
            pagination={{pageSize: 5}}
            dataSource={this.state.users}
          />
        </div>
      </Dialog>
    );
  }
}


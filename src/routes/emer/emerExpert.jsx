import React from 'react';
import {connect} from 'dva';
import {Button, Input, Table, message, Icon, Row, Col} from 'antd';
import Dialog from '../../components/yd-gis/Dialog/Dialog';
import styles from './css/emerExpertName.css';

@connect(state => ({
  user: state.login.user,
  phone: state.emerLfMap.phone,
}))


export default class EmerExpertName extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      addOpen: false,
      editOpen: false,
    };
    this.columns = [{
      title: '序号',
      dataIndex: 'num',
      key: 'num',
      width: 80,
    }, {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 80,
    }, {
      title: '工作单位',
      dataIndex: 'work',
      key: 'work',
      width: 300,
    }, {
      title: '职称/职务',
      dataIndex: 'job',
      key: 'job',
      width: 110,
    }, {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 100,
    }, {
      title: '操作',
      key: 'operation',
      render: (text) => (<span>
        <Button size="small" type="primary" onClick={this.callExpert.bind(this, text)} style={{marginRight: '15px'}}>电话</Button>
        <Button size="small" type="primary" onClick={this.editExpert.bind(this, 'open', text)} style={{marginRight: '15px'}}>编辑</Button>
        <Button size="small" type="primary" onClick={this.deleteExpert.bind(this, text)}>删除</Button>
      </span>),
    }];
    this.queryNameValue = '';
    this.queryWorkValue = '';
    this.queryJobValue = '';
    this.addNameValue = '';
    this.addWorkValue = '';
    this.addPhoneValue = '';
    this.addJobValue = '';
    this.editNameValue = '';
    this.editWorkValue = '';
    this.editPhoneValue = '';
    this.editJobValue = '';
    this.gid = 1;
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };

  setData = (data) => {
    let arr = [];
    for (let [index, elem] of data.entries()) {
      arr.push({
        key: index,
        num: index + 1,
        name: elem.name,
        work: elem.workUnit,
        job: elem.jobTitle,
        phone: elem.tel,
        operation: elem,
      });
    }
    return arr;
  }
  callExpert = (elem) => {
    const {phone} = this.props;
    this.props.dispatch({
      type: 'emerLfMap/callUp',
      payload: {
        phone, // 主叫号码
        call: elem.operation.tel, // 被叫号码
      },
    });
  }
  deleteExpert = (elem) => {
    let data = {};
    data.gid = elem.operation.gid;
    this.props.dispatch({
      type: 'emer/delEmerExpert',
      payload: data,
      callback: (res) => {
        this.onQueryAll();
        message.info('删除成功！');
      },
    });
  }
  editExpert = (op, elem) => {
    if (op === 'open') {
      if (elem === undefined) {
        return;
      } else {
        this.editNameValue = elem.operation.name;
        this.editWorkValue = elem.operation.workUnit;
        this.editPhoneValue = elem.operation.tel;
        this.editJobValue = elem.operation.jobTitle;
        this.gid = elem.operation.gid;
      }
      this.setState({
        editOpen: true,
      });
    } else {
      this.setState({
        editOpen: false,
      });
    }
  }
  onQuery = () => {
    let data = {};
    data.ecode = this.props.user.ecode;
    data.jobTitle = this.queryJobValue;
    data.workUnit = this.queryWorkValue;
    data.name = this.queryNameValue;
    this.props.dispatch({
      type: 'emer/getEmerExpert',
      payload: data,
      callback: (res) => {
        this.setState({
          dataSource: this.setData(res.data),
        });
      },
    });
  }
  onQueryAll = () => {
    let data = {};
    data.ecode = this.props.user.ecode;
    data.jobTitle = '';
    data.workUnit = '';
    data.name = '';
    this.props.dispatch({
      type: 'emer/getEmerExpert',
      payload: data,
      callback: (res) => {
        this.setState({
          dataSource: this.setData(res.data),
          addOpen: false,
          editOpen: false,
        });
      },
    });
  }

  componentWillMount() {
    let data = {};
    data.ecode = this.props.user.ecode;
    data.jobTitle = '';
    data.workUnit = '';
    data.name = '';
    this.props.dispatch({
      type: 'emer/getEmerExpert',
      payload: data,
      callback: (res) => {
        this.setState({
          dataSource: this.setData(res.data),
        });
      },
    });
  }

  //   onReset = () => {

  //   }
  onAdd = (op) => {
    if (op === 'open') {
      this.setState({
        addOpen: true,
      });
    } else {
      this.setState({
        addOpen: false,
      });
    }
  }
  onAddKeep = () => {
    // 验证手机号码
    if (!/^1\d{10}$/.test(this.addPhoneValue)) {
      message.warning('手机号码格式不正确');
      return;
    }
    let fd = new FormData();
    fd.append('jobTitle', this.addJobValue);
    fd.append('workUnit', this.addWorkValue);
    fd.append('name', this.addNameValue);
    fd.append('tel', this.addPhoneValue);
    this.props.dispatch({
      type: 'emer/addEmerExpert',
      payload: fd,
      callback: (res) => {
        this.onQueryAll();
        message.info('添加成功！');
      },
    });
  }
  onEditKeep = () => {
    // 验证手机号码
    if (!/^1\d{10}$/.test(this.editPhoneValue)) {
      message.warning('手机号码格式不正确');
      return;
    }
    let data = {};
    data.gid = this.gid;
    data.jobTitle = this.editJobValue;
    data.workUnit = this.editWorkValue;
    data.name = this.editNameValue;
    data.tel = this.editPhoneValue;
    this.props.dispatch({
      type: 'emer/updateEmerExpert',
      payload: data,
      callback: (res) => {
        this.onQueryAll();
        message.info('编辑成功！');
      },
    });
  }
  // 隔行换色
  setRowClassName = (data, index) => {
    let classStr = index % 2 ? styles.doubleRow : '';
    return classStr;
  }
  queryExpertName = (e) => {
    this.queryNameValue = e.target.value;
  }
  queryExpertWork = (e) => {
    this.queryWorkValue = e.target.value;
  }
  queryExpertJob = (e) => {
    this.queryJobValue = e.target.value;
  }
  addExpertName = (e) => {
    this.addNameValue = e.target.value;
  }
  addExpertWork = (e) => {
    this.addWorkValue = e.target.value;
  }
  addExpertPhone = (e) => {
    this.addPhoneValue = e.target.value;
  }
  addExpertJob = (e) => {
    this.addJobValue = e.target.value;
  }
  editExpertName = (e) => {
    this.editNameValue = e.target.value;
  }
  editExpertWork = (e) => {
    this.editWorkValue = e.target.value;
  }
  editExpertPhone = (e) => {
    this.editPhoneValue = e.target.value;
  }
  editExpertJob = (e) => {
    this.editJobValue = e.target.value;
  }
  render = () => {
    const {onCancel} = this.props;
    return (
      <div style={{width: '100%', height: '100%'}}>
        <Dialog
          title="应急专家名单"
          width={950}
          onClose={onCancel}
          position={{
            top: 130,
            left: 250,
          }}
        >
          <div style={{width: '100%', height: '100%'}}>
            <div className={styles.flex}>
              <span>姓名：
                <Input size="small" style={{width: 150}} onBlur={this.queryExpertName} />
              </span>
              <span>工作单位：
                <Input size="small" style={{width: 150}} onBlur={this.queryExpertWork} />
              </span>
              <span>职称/职务：
                <Input size="small" style={{width: 150}} onBlur={this.queryExpertJob} />
              </span>
              <span>
                <Button value="search" size="small" type="primary" onClick={this.onQuery} style={{marginRight: '15px'}}>查询</Button>
                <Button value="export" size="small" type="primary" onClick={this.onAdd.bind(this, 'open')} style={{marginRight: '15px'}}>添加</Button>
                {/* <Button value='export' size="small" type='export' onClick={this.onReset}>重置</Button> */}
              </span>
            </div>
          </div>
          <Table
            dataSource={this.state.dataSource}
            bordered
            columns={this.columns}
            pagination={false}
            rowClassName={this.setRowClassName}
            style={{padding: '0px 20px 20px 20px', textAlign: 'center'}}
            scroll={{y: 320}}
          />
        </Dialog>
        {
          this.state.addOpen ?
            <Dialog
              title="添加专家"
              width={350}
              onClose={this.onAdd.bind(this, 'close')}
              position={{
                top: 200,
                left: 500,
              }}
            >
              <div style={{width: '100%', height: '100%', padding: '20px'}}>
                <Row style={{marginBottom: '10px'}}>
                  <Col span={8}>姓名：</Col>
                  <Col span={16}><Input size="small" onBlur={this.addExpertName} /></Col>
                </Row>
                <Row style={{marginBottom: '10px'}}>
                  <Col span={8}>工作单位：</Col>
                  <Col span={16}><Input size="small" onBlur={this.addExpertWork} /></Col>
                </Row>
                <Row style={{marginBottom: '10px'}}>
                  <Col span={8}>职称/职务：</Col>
                  <Col span={16}><Input size="small" onBlur={this.addExpertJob} /></Col>
                </Row>
                <Row style={{marginBottom: '10px'}}>
                  <Col span={8}> 联系电话：</Col>
                  <Col span={16}><Input size="small" onBlur={this.addExpertPhone} /></Col>
                </Row>
                <Row>
                  <Col span={7} offset={11}>
                    <Button size="small" type="primary" onClick={this.onAddKeep}>保存</Button>
                  </Col>
                </Row>
              </div>
            </Dialog> : ''
        }
        {
          this.state.editOpen ?
            <Dialog
              title="编辑专家"
              width={350}
              onClose={this.editExpert.bind(this, 'close')}
              position={{
                top: 200,
                left: 500,
              }}
            >
              <div style={{width: '100%', height: '100%', padding: '20px'}}>
                <Row style={{marginBottom: '10px'}}>
                  <Col span={8}>姓名：</Col>
                  <Col span={16}><Input size="small" onBlur={this.editExpertName} defaultValue={this.editNameValue} /></Col>
                </Row>
                <Row style={{marginBottom: '10px'}}>
                  <Col span={8}>工作单位：</Col>
                  <Col span={16}><Input size="small" onBlur={this.editExpertWork} defaultValue={this.editWorkValue} /></Col>
                </Row>
                <Row style={{marginBottom: '10px'}}>
                  <Col span={8}>职称/职务：</Col>
                  <Col span={16}><Input size="small" onBlur={this.editExpertJob} defaultValue={this.editJobValue} /></Col>
                </Row>
                <Row style={{marginBottom: '10px'}}>
                  <Col span={8}> 联系电话：</Col>
                  <Col span={16}><Input size="small" onBlur={this.editExpertPhone} defaultValue={this.editPhoneValue} /></Col>
                </Row>
                <Row>
                  <Col span={7} offset={11}>
                    <Button size="small" type="primary" onClick={this.onEditKeep}>保存</Button>
                  </Col>
                </Row>
              </div>
            </Dialog> : ''
        }
      </div>
    );
  }
}

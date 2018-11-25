import React, { Component } from 'react';
import { Button, message, Upload, Icon} from 'antd';
import { connect } from 'dva';
import {routerRedux} from 'dva/router';
import SearchBar from './SearchBar';
import styles from './index.less';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import TableList from './TableList';
import TemperModal from './TemperModal';
import moment, { isMoment } from 'moment';
import SeeMediaInfo from '../../routes/commonTool/SeeMedia/SeeMediaInfo';
import {getQzzfData} from '../../services/TemperComponent';

const pageParams = {
  pageno: 1,
  pagesize: 10,
};// 分页参数
@connect(({TemperComponent, login}) => ({
  user: login.user,
  funs: login.funs,
}))
export default class TemperComponent extends Component {
  constructor(props) {
    super(props);
    let canAdd = false;
    let canEdit = false;
    const funs = this.props.funs;
    for (let i = 0; i < funs.length; i += 1) {
      if (funs[i].code === 'qzzf_add') {
        canAdd = true;
      }
      if (funs[i].code === 'qzzf_edit') {
        canEdit = true;
      }
    }
    this.state = {
      ...pageParams, // 分页参数
      searchParams: {}, // 搜索条件
      addData: [],
      data: [], // table data
      canAdd,
      canEdit,
      visible: false, // 弹出框
      showMore: false, // 展示右边
      needSub: false, // 是否需要提交
      record: {},
      attachFileList: [],
      uuid: '',
    };
  }
    form = null ;
    componentDidMount() {
      console.log(this.props.user, this.props.funs, 'sadqdada');
      this.queryQzzfData(pageParams);
    }
    // 查询气质组分记录
    handleOnSearch = (querParams = {}) => {
      console.log(querParams, '查询的参数');
      const params = {pageno: this.state.pageno, pagesize: this.state.pagesize, ...querParams};
      this.queryQzzfData(params);
      this.setState({searchParams: querParams});
    }
    queryQzzfData = (params = {}) => {
      getQzzfData(params).then((res) => {
        if (!res.success) {
          message.error(res, message);
          return;
        }
        this.setState({
          data: res.data,
          uuid: res.uuid || '',
        });
      });
    }
    // 提交气质组分记录
    onSubmit = () => {
      const {user} = this.props;
      const {attachFileList} = this.state;
      const data = [...this.state.data];
      const newData = data.filter(item => (item.gid !== undefined));
      const editData = JSON.stringify(newData);
      const addData = JSON.stringify(this.state.addData);
      console.log(addData, 'dada提交过去的参数', editData);
      this.props.dispatch({
        type: 'TemperComponent/updateQzzfData',
        payload: {items: editData},
        callback: (res) => {
          if (res.success) {
            this.queryQzzfData(pageParams);
            this.setState({needSub: false});
            message.success('提交气质组分成功');
          } else {
            message.warn(res.msg);
          }
        },
      });
      if (this.state.addData.length !== 0) {
        this.props.dispatch({
          type: 'TemperComponent/addQzzfData',
          payload: {items: addData},
          callback: (res) => {
            if (res.success) {
              this.queryQzzfData(pageParams);
              this.setState({addData: [], needSub: false});
            } else {
              message.warn(res.msg);
            }
          },
        });
      }
      if (attachFileList.length !== 0) {
        const fd = new FormData();
        fd.append('userId', user.id);
        fd.append('userName', user.trueName);
        attachFileList.forEach((item, index) => {
          fd.append(`file${index + 1} `, item.originFileObj);
        });
        this.props.dispatch({
          type: 'TemperComponent/addAttach',
          payload: fd,
          callback: (res) => {
            if (res.success) {
              this.queryQzzfData(pageParams);
              this.setState({needSub: false});
              message.success(res.msg);
            } else {
              message.warn(res.msg);
            }
          },
        });
      }
    }
    // 确认
    handleOk = (e) => {
      e.preventDefault();
      this.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          const formData = {...values};
          if (isMoment(values.scheduleTime)) {
            formData.scheduleTime = values.scheduleTime.format('YYYY-MM-DD hh:mm:ss');
          }
          if (isMoment(values.adjustTime)) {
            formData.adjustTime = values.adjustTime.format('YYYY-MM-DD hh:mm:ss');
          }
          this.handleChangeTable(formData);
          this.setState({ visible: false, needSub: true });
        }
      });
    }
    // 取消
    handleCancel = () => {
      this.setState({ visible: false });
    }
    // 编辑
    editPlan = (record = {}) => {
      if (record.action === '删除') {
        const data = [...this.state.data];
        const newData = data.filter(item => (item.gid !== record.gid));
        this.setState({ data: newData });
      } else {
        this.setState({ visible: true, record });
      }
    };
    // 查看
    readPlan = () => {
      this.setState({showMore: !this.state.showMore});
    }
    // 记录改变时回调
    handleChangeTable = (values = {}) => {
      const record = {...this.state.record};
      const data = [...this.state.data];
      const addData = [...this.state.addData];
      if (record.action === '添加') {
        data.push(values);
        addData.push(values);
      } else if (record.action === '编辑') {
        const target = data.filter(item => (item.gid === record.gid))[0];
        if (target) {
          for (const key in values) {
            if (target[key] !== values) {
              target[key] = values[key];
            }
          }
        }
      }
      this.setState({data, addData});
    }
    // 分页查询
    handleTableChange = (pagination) => {
      const params = {
        pageno: pagination.current,
        pagesize: pagination.pageSize,
        ...this.state.searchParams,
      };
      this.setState({
        pageno: pagination.current,
        pagesize: pagination.pageSize,
      });
      this.handleOnSearch(params);
    };
    render() {
      const {showMore, data, record, needSub, pageno, pagesize, attachFileList} = this.state;
      console.log(attachFileList, 'ddd');
      const pagination = {
        current: pageno,
        pageSize: pagesize,
        total: data.length,
        showQuickJumper: true,
        showSizeChanger: true,
        showTotal: () => {
          return (<div className={styles.pagination}>
                         共 {data.length} 条记录
          </div>);
        },
      };
      const uploadProps = {
        onRemove: (file) => {
          this.setState(({attachFileList}) => {
            const index = attachFileList.indexOf(file);
            const newFileList = attachFileList.slice();
            newFileList.splice(index, 1);
            return {
              attachFileList: newFileList,
            };
          });
        },
        beforeUpload: (file) => {
          this.setState(({attachFileList}) => ({
            attachFileList: [...attachFileList, file],
          }));
          return false;
        },
        onChange: ({fileList }) => {
          this.setState({attachFileList: fileList, needSub: true});
        },
        fileList: this.state.attachFileList,
      };
      return (
        <PageHeaderLayout>
          <SearchBar
            {...this.props}
            editPlan={this.editPlan}
            handleOnSearch={(params) => { this.handleOnSearch(params); }}
            onSubmit={this.onSubmit}
            showMore={showMore}
            canAdd={this.state.canAdd}
            canEdit={this.state.canEdit}
            needSub={needSub}
          />
          <TableList
            {...this.props}
            data={data}
            showMore={showMore}
            pagination={pagination}
            handleTableChange={this.handleTableChange}
            editPlan={this.editPlan}
            readPlan={this.readPlan}
            canAdd={this.state.canAdd}
            canEdit={this.state.canEdit}
          />
          {this.state.visible ? <TemperModal
            ref={(form) => { this.form = form; }}
            record={record}
            handleOk={(e) => this.handleOk(e)}
            handleCancel={this.handleCancel}
            showMore={showMore}
          /> : null}
          <div style={{marginTop: 10, display: !showMore && this.state.canAdd ? 'inline-block' : 'none'}}>
            <div className={styles.order2} />
            <span style={{ fontSize: 16, marginRight: 10}}>附件</span>
            <Upload {...uploadProps}>
              <Button>
                <Icon type="upload" /> 上传
              </Button>
            </Upload>
          </div>
          <div style={{display: 'inline-block', marginLeft: 20, marginBottom: 10, marginTop: 20}}>
            <SeeMediaInfo attactInfo={this.state.uuid} />
          </div>
        </PageHeaderLayout>
      );
    }
}

import React, {PureComponent} from 'react';
import { Modal, Table, Input, Icon, Button, message, Form, Upload, Select } from 'antd';
import {connect} from 'dva';
import {routerRedux, Link} from 'dva/router';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from '../style.less';
import { log } from 'lodash-decorators/utils';
const FormItem = Form.Item;
const Option = Select.Option;
const confirm = Modal.confirm;

@connect(
  state => ({
    user: state.login.user,
    successReport: state.report.success,
    msgReport: state.report.msg,
  })
)
@Form.create()
export default class MonthReport extends PureComponent {
  constructor(props) {
    super(props);
    this.state={
      state: 0,
      iscng: "1",
      disable: false,
      fileList: [],
    }
  }

  handleReport = (state) => {
    this.setState({
      disable: true,
    });
    let user = this.props.user;//登录用户信息
    let details = this.props.form.getFieldsValue();//获取表单信息
    const monthDetails = [];
    //拼接月计划详情中的数据
    if (Object.keys(details).length > 0) {
      for (const key in details) {
        if (typeof(details[key]) == "undefined") {
          details[key] = "";
        }
        const detail = {
          reportDate: key,
          reportValue: details[key]
        };
        monthDetails.push(detail);
      } 
    }
    //拼接发送至服务的月计划上报的参数
    let param = {
      ecode:this.props.user.ecode,
      startdate: monthDetails[0].reportDate,
      enddate: monthDetails[monthDetails.length-1].reportDate,
      reportUserid: this.props.user.id,
      state: state,
      iscng: this.state.iscng,
      monthDetails: monthDetails
    };
    this.props.dispatch({
      type:'report/addMonthPlan',
      params:param,
      callback:({msg,success})=>{
        if (success) {
          message.success(msg);
          this.setState({
            state: 0,
            disable: false,
          });
          this.props.form.resetFields();//重置表单内容
          //返回月计划列表
          this.props.history.goBack();
        } else {
          message.warning(msg);
          this.setState({
            disable: false,
          });
        }
      }
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const {handleReport} = this;
    confirm({
      title: '确定提交吗?',
      content: '提交后将无法修改',
      okText: '确定',
      cancelText: '取消',
      confirmLoading: true,
      onOk() {
        handleReport(1);
      },
    });
  }

  handleChange = (info) => {
    let fileList = info.fileList.slice(-1);
    if (info.file.status === 'uploading') {
      this.setState({
        disable: true,
        fileList: fileList,
      });
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name}导入成功`);
      this.setState({
        disable: false,
        fileList: fileList,
      });
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name}导入失败`);
      this.setState({
        disable: false,
        fileList: fileList,
      });
    } else if (info.file.status === 'removed') {
      message.error(`${info.file.name}移出列表，但不影响导入数据`, 5);
      this.setState({
        disable: false,
        fileList: fileList,
      });
    }
  }

  handleSelectChange = (value) => {
    this.setState({
      iscng: value,
    });
  }
 
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        span: 8, 
        offset: 1,
      },
      wrapperCol: {
        span: 8, 
        offset: 0,
      },
    };

    const tailFormItemLayout = {
      wrapperCol: {
        span: 12, 
        offset: 10,
      },
    };

    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 2;
    if (month == 13) {
      year = parseInt(year) + 1;
      month = 1;
    }
    //当前月的天数
    let days = new Date(year, month, 0).getDate();
    if (month < 10) {
      month = `0${month}`;
    }
    //构造表单信息
    const formItems = [];
    for (let i = 0; i < days; i++) {
      if (i < 9) {
        formItems.push(`${year}-${month}-0${i+1}`);        
      } else {
        formItems.push(`${year}-${month}-${i+1}`);
      }
    }

    //文件上传
    const file = {
      name: 'file',
      action: '//jsonplaceholder.typicode.com/posts/',
      headers: {
        authorization: 'authorization-text',
      },
      onChange: this.handleChange,
      disabled: this.state.disable,
      fileList: this.state.fileList,
      beforeUpload: (file) => {
        if (file.name.substring(file.name.lastIndexOf(".")+1) !== 'xlsx' && file.name.substring(file.name.lastIndexOf(".")+1) !== 'xls') {
        // if (file.name.split('.')[1] !== 'xlsx' && file.name.split('.')[1] !== 'xls') {
          message.error('请上传.xls或者.xlsx文件！', 3);
          return false;
        }
      },
    };

    return (
      <PageHeaderLayout>
        <div className={styles.main}>
          <div className={styles.title}>
            <span>从&nbsp;&nbsp;{formItems[0]}&nbsp;&nbsp;到&nbsp;&nbsp;{formItems[days-1]}</span>
            <span style={{paddingLeft: "90px"}}>单位：立方米</span>
          </div>
          <div className={styles.title}>
            <span>请选择上报站点：</span>
            <Select defaultValue="1" style={{ width: 120 }} onChange={this.handleSelectChange}>
              <Option value="1">车用CNG</Option>
              <Option value="0">车用母站</Option>
            </Select>
          </div>
          {/* <div className={styles.button}>
            <Button type="primary">模板导出</Button>
            <Upload {...file}>
              <Button style={{marginLeft: '25px'}}><Icon type="upload"/>计划导入</Button>
            </Upload>
          </div> */}
            <Form onSubmit={this.handleSubmit}>
              <div className={styles.wrapper}>
                {formItems.map((item, index)=>{
                  return <FormItem key={index} label={`${item}`} {...formItemLayout}>
                      {getFieldDecorator(`${item}`, {
                        rules: [
                          {pattern: /^\d{1,10}(\.\d{1,2})?$/, message: '请输入少于10位整数或2位小数！', whitespace: true }
                        ],
                      })(
                        <Input />
                      )}
                    </FormItem>
                })}
              </div>
              <div>
                <FormItem {...tailFormItemLayout}>
                  <Button disabled={this.state.disable} type="primary" htmlType="submit">提交</Button>
                  <Button disabled={this.state.disable} style={{marginLeft: '25px'}} onClick={() => {this.handleReport(0)}}>保存</Button>
                  <Button style={{marginLeft: '25px'}}><Link to={'/distribution/month-list'}>返回</Link></Button>
                </FormItem>
              </div>
            </Form>
        </div>
      </PageHeaderLayout>
    );
  }
}


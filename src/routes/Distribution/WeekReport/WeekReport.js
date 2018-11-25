import React, {PureComponent} from 'react';
import {Modal, Table, Input, Icon, Button, message, Form, Select } from 'antd';
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
export default class WeekReport extends PureComponent {
  constructor(props) {
    super(props);
    this.week = ["星期一","星期二","星期三","星期四","星期五","星期六","星期日"];
    this.state={
      state: 0,
      click: false,
      iscng: "1",
    }
  }

  handleReport = (state) => {
    this.setState({
      click: true,
    });
    let user = this.props.user;//登录用户信息
    let details = this.props.form.getFieldsValue();//获取表单信息
    const weekDetails = [];
    //拼接周计划详情中的数据
    if (Object.keys(details).length > 0) {
      for (const key in details) {
        if (typeof(details[key]) == "undefined") {
          details[key] = "";
        }
        const detail = {
          reportDate: key,
          reportValue: details[key]
        };
        weekDetails.push(detail);
      }
    }
    //拼接发送至服务的周计划上报的参数
    let param = {
      ecode: this.props.user.ecode,
      startdate: weekDetails[0].reportDate,
      enddate: weekDetails[weekDetails.length-1].reportDate,
      reportUserid: this.props.user.id,
      state: state,
      iscng: this.state.iscng,
      weekDetails: weekDetails
    };
    this.props.dispatch({
      type:'report/addWeekPlan',
      params:param,
      callback:({msg,success})=>{
        if (success) {
          message.success(msg);
          this.setState({
            state: 0,
          });
          this.props.form.resetFields();//重置表单内容
          //返回周计划列表
          this.props.history.goBack();
        } else {
          message.warning(msg);
          this.setState({
            click: false,
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

  handleChange = (value) => {
    this.setState({
      iscng: value,
    });
  }
 
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        span: 10, 
        offset: 1,
      },
      wrapperCol: {
        span: 6, 
        offset: 0,
      },
    };

    const tailFormItemLayout = {
      wrapperCol: {
        span: 12, 
        offset: 10,
      },
    };

    //获取下一周日期，并格式化为"yyyy-mm-dd",放入数组中
    const formItems = [];
    for (let i = 0; i < 7; i++) {
      let Stamp = new Date();
      let number;
      if (Stamp.getDay() == 0) {
        number = 7;
      } else {
        number = Stamp.getDay();
      }
      let num = 7-number + 1 + i;
      Stamp.setDate(Stamp.getDate() + num);

      let year = Stamp.getFullYear();
      let month = Stamp.getMonth() + 1;
      let date = Stamp.getDate();
      if (month < 10) {
          month = `0${month}`;
      }
      if (date < 10) {
        formItems.push(`${year}-${month}-0${date}`);
      } else {
        formItems.push(`${year}-${month}-${date}`);
      }
    }

    return (
      <PageHeaderLayout>
        <div className={styles.main}>
          <div className={styles.title}>
            <span>从&nbsp;&nbsp;{formItems[0]}&nbsp;&nbsp;到&nbsp;&nbsp;{formItems[formItems.length-1]}</span>
            <span style={{paddingLeft: "90px"}}>单位：立方米</span>
          </div>
          <div className={styles.title}>
            <span>请选择上报站点：</span>
            <Select defaultValue="1" style={{ width: 120 }} onChange={this.handleChange}>
              <Option value="1">车用CNG</Option>
              <Option value="0">车用母站</Option>
            </Select>
          </div>
            <Form onSubmit={this.handleSubmit}>
              <div className={styles.wrapper}>
                {formItems.map((item, index)=>{
                  return <FormItem key={index} label={`${item}（${this.week[index]}）`} {...formItemLayout}>
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
                  <Button disabled={this.state.click} type="primary" htmlType="submit">提交</Button>
                  <Button disabled={this.state.click} style={{marginLeft: '25px'}} onClick={() => {this.handleReport(0)}}>保存</Button>
                  <Button style={{marginLeft: '25px'}}><Link to={'/distribution/week-list'}>返回</Link></Button>
                </FormItem>
              </div>
            </Form>
        </div>
      </PageHeaderLayout>
    );
  }
}


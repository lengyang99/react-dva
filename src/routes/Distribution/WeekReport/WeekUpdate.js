import React, {PureComponent} from 'react';
import {Modal, Table, Input, Icon, Button,message, Form } from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from '../style.less';
const FormItem = Form.Item;
const confirm = Modal.confirm;

@connect(({report}) => ({
  success:report.success,
  msg:report.msg,
  dataSource: report.dataWeek,
}))

@Form.create()
export default class WeekUpdate extends PureComponent {

  state={
    click: false,
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'report/getWeekDetail',
      params: this.props.location.state.planId,
    });
  }

  handleReport = (state) => {
    this.setState({
      click: true,
    });
    let details = this.props.form.getFieldsValue();//获取表单信息
    const weekDetails = [];
    //拼接周计划详情中的数据
    if (Object.keys(details).length > 0) {
      for (const key in details) {
        if (typeof(details[key]) == "undefined") {
          details[key] = "";
        }
        const detail = {
          gid: key,
          reportValue: details[key]
        };
        weekDetails.push(detail);
      }
    }
    //拼接发送至服务的周计划上报的参数
    let param = {
      gid: this.props.location.state.planId,
      state: state,
      weekDetails: weekDetails
    };
    this.props.dispatch({
      type:'report/updateWeekPlan',
      params:param,
      callback:({msg,success})=>{
        message.success(msg);
        //返回周计划列表
        this.props.history.goBack();
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

  render() {
    const {success, msg, dataSource} = this.props;
    const { getFieldDecorator } = this.props.form;
    const week = ["星期一","星期二","星期三","星期四","星期五","星期六","星期日"];
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
    return (
      <PageHeaderLayout>
        <div className={styles.main}>
          <div className={styles.title}>
            <span>从&nbsp;&nbsp;{dataSource.startdate}&nbsp;&nbsp;到&nbsp;&nbsp;{dataSource.enddate}</span>
            <span style={{paddingLeft: "90px"}}>单位：立方米</span>
          </div>
            <Form  onSubmit={this.handleSubmit}>
              <div className={styles.wrapper}>
                { Object.keys(dataSource).length > 0 && dataSource.weekDetails.map((item, index)=>{
                    if (typeof(item.reportValue) === "undefined") {
                      item.reportValue = "";
                    }
                    return <FormItem key={index} label={`${item.reportDate}（${week[index]}）`} {...formItemLayout}>
                      {getFieldDecorator(`${item.gid}`, {
                        initialValue: `${item.reportValue}`,
                        rules: [
                          {pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/, message: '请输入正确格式的气量值！', whitespace: true }
                        ]
                      })(
                        <Input />
                      )}
                    </FormItem>
                  })
                }
              </div>
              <div>
                <FormItem {...tailFormItemLayout}>
                  <Button type="primary" htmlType="submit">提交</Button>
                  <Button style={{marginLeft: '25px'}} onClick={() => {this.handleReport(0)}}>保存</Button>
                  <Button style={{marginLeft: '25px'}}><Link to={'/distribution/week-list'}>返回</Link></Button>
                </FormItem>
              </div>
            </Form>
        </div>
      </PageHeaderLayout>
    );
  }
}




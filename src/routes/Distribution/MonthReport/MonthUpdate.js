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
  dataMonth: report.dataMonth,
}))

@Form.create()
export default class MonthUpdate extends PureComponent {

  state={
    click: false,
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'report/getMonthDetail',
      params: this.props.location.state.planId,
    });
  }

  handleReport = (state) => {
    this.setState({
      click: true,
    });
    let details = this.props.form.getFieldsValue();//获取表单信息
    const monthDetails = [];
    //拼接月计划详情中的数据
    if (Object.keys(details).length > 0) {
      for (const key in details) {
        if (typeof(details[key]) == "undefined") {
          details[key] = "";
        }
        const detail = {
          gid: key,
          reportValue: details[key]
        };
        monthDetails.push(detail);
      }
    }
    //拼接发送至服务的月计划上报的参数
    let param = {
      gid: this.props.location.state.planId,
      state: state,
      monthDetails: monthDetails
    };
    this.props.dispatch({
      type:'report/updateMonthPlan',
      params:param,
      callback:({msg,success})=>{
        message.success(msg);
        //返回月计划列表
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
    const {success, msg, dataMonth} = this.props;
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
    return (
      <PageHeaderLayout>
        <div className={styles.main}>
          <div className={styles.title}>
            <span>从&nbsp;&nbsp;{dataMonth.startdate}&nbsp;&nbsp;到&nbsp;&nbsp;{dataMonth.enddate}</span>
            <span style={{paddingLeft: "90px"}}>单位：立方米</span>
          </div>
            <Form onSubmit={this.handleSubmit}>
              <div className={styles.wrapper}>
                { Object.keys(dataMonth).length > 0 && dataMonth.monthDetails.map((item, index)=>{
                  if (typeof(item.reportValue) === "undefined") {
                    item.reportValue = "";
                  }
                      return <FormItem key={index} label={`${item.reportDate}`} {...formItemLayout}>
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
                  <Button disabled={this.state.click} type="primary" htmlType="submit">提交</Button>
                  <Button disabled={this.state.click} style={{marginLeft: '25px'}} onClick={() => {this.handleReport(0)}}>保存</Button>
                  <Button style={{marginLeft: '25px'}}><Link to={'/distribution/month-list'}>返回</Link></Button>
                </FormItem>
              </div>
            </Form>
        </div>
      </PageHeaderLayout>
    );
  }
}




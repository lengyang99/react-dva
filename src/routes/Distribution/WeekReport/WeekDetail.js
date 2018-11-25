import React, {PureComponent} from 'react';
import { Table, Input, Icon, Button, Form } from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from '../style.less';
const FormItem = Form.Item;

@connect(({report}) => ({
  success:report.success,
  msg:report.msg,
  dataWeek: report.dataWeek,
}))

@Form.create()
export default class WeekDetail extends PureComponent {

  componentDidMount() {
    this.props.dispatch({
      type: 'report/getWeekDetail',
      params: this.props.location.state.planId,
    });
  }

  render() {
    const {success, msg, dataWeek} = this.props;
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
            <span>从&nbsp;&nbsp;{dataWeek.startdate}&nbsp;&nbsp;到&nbsp;&nbsp;{dataWeek.enddate}</span>
            <span style={{paddingLeft: "90px"}}>单位：立方米</span>
          </div>
            <Form>
              <div className={styles.wrapper}>
                { Object.keys(dataWeek).length > 0 && dataWeek.weekDetails.map((item, index)=>{
                  if (typeof(item.reportValue) === "undefined") {
                    item.reportValue = "";
                  }
                      return <FormItem key={index} label={`${item.reportDate}（${week[index]}）`} {...formItemLayout}>
                        {getFieldDecorator(`${item.reportDate}`, {
                          initialValue: `${item.reportValue}`,
                        })(
                          <Input disabled />
                        )}
                      </FormItem>
                    })
                  
                }
              </div>
              <div>
                <FormItem {...tailFormItemLayout}>
                  <Button style={{marginLeft: '25px'}}><Link to={'/Distribution/week-list'}>返回</Link></Button>
                </FormItem>
              </div>
            </Form>
        </div>
      </PageHeaderLayout>
    );
  }
}




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
  dataMonth: report.dataMonth,
}))

@Form.create()
export default class MonthDetail extends PureComponent {

  componentDidMount() {
    this.props.dispatch({
      type: 'report/getMonthDetail',
      params: this.props.location.state.planId,
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
            
            <Form>
              <div className={styles.wrapper}>
                { Object.keys(dataMonth).length > 0 && dataMonth.monthDetails.map((item, index)=>{
                  if (typeof(item.reportValue) === "undefined") {
                    item.reportValue = "";
                  }
                      return <FormItem key={index} label={`${item.reportDate}`} {...formItemLayout}>
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
                  <Button style={{marginLeft: '25px'}}><Link to={'/distribution/month-list'}>返回</Link></Button>
                </FormItem>
              </div>
            </Form>
        </div>
      </PageHeaderLayout>
    );
  }
}




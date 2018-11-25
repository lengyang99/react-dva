import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux, Link} from 'dva/router';
import {Form, Input, Tabs, Button, Icon, Checkbox, Row, Col, Alert} from 'antd';
import styles from './Login.less';

const FormItem = Form.Item;

@connect(state => ({
  login: state.login,
}))
@Form.create()
export default class Login extends Component {
  state = {
    count: 0,
    type: 'account',
  };

  componentDidMount() {
    if (this.props.login.status === 'ok') {
      this.props.dispatch(routerRedux.push('/'));
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.login.status === 'ok') {
      this.props.dispatch(routerRedux.push('/'));
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  onSwitch = (key) => {
    this.setState({
      type: key,
    });
  }

  onGetCaptcha = () => {
    let count = 59;
    this.setState({count});
    this.interval = setInterval(() => {
      count -= 1;
      this.setState({count});
      if (count === 0) {
        clearInterval(this.interval);
      }
    }, 1000);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const {type} = this.state;
    this.props.form.validateFields({force: true},
      (err, values) => {
        if (!err) {
          this.props.dispatch({
            type: `login/${type}Submit`,
            payload: {
              ...values,
              sys: 'web',
              client: ''
            },
          });
        }
      }
    );
  }

  renderMessage = (message) => {
    return (
      <Alert
        style={{marginBottom: 24}}
        message={message}
        type="error"
        showIcon
      />
    );
  };

  render() {
    const {form, login} = this.props;
    const {getFieldDecorator} = form;
    const {type} = this.state;

    const appUrl = 'http://app-deploy-zhyytest.ipaas.enncloud.cn:58935/sop/sop.apk';
    return (
      <div className={styles.main}>
        <div className={styles.text}>系统登录</div>
        <Form onSubmit={this.handleSubmit}>
          {
            login.status === 'error' &&
            login.type === 'account' &&
            login.submitting === false &&
            this.renderMessage('账户或密码错误')
          }
          <FormItem>
            {getFieldDecorator('username', {
              rules: [{
                required: type === 'account', message: '请输入账户名！',
              }],
            })(
              <Input
                size="large"
                suffix={<Icon type="user" className={styles.prefixIcon}/>}
                placeholder="用户名"
              />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('password', {
              rules: [{
                required: type === 'account', message: '请输入密码！',
              }],
            })(
              <Input
                size="large"
                suffix={<Icon type="lock" className={styles.prefixIcon}/>}
                type="password"
                placeholder="密码"
              />
            )}
          </FormItem>
          <FormItem className={styles.additional}>
            <Button size="large" loading={login.submitting} className={styles.submit} type="primary" htmlType="submit">
              登录
            </Button>
          </FormItem>
        </Form>
        <div className={styles.foot}>
          <span className={styles.version}>V1.0</span>
          <a download className={styles.device}
             href={appUrl}
          >
            <Icon type="tablet" className={styles.pad}/>
            <span>PAD版</span>
          </a>
          <a download className={styles.device} style={{marginRight: 30}} href={appUrl}
          >
            <Icon type="mobile" className={styles.mobile}/>
            <span>APP版</span>
          </a>
        </div>
        <div style={{position: 'fixed', bottom: 170, right: 35}}>
            <img src="./images/downloadApp.jpg" alt="download" style={{width: 100, height: 100}}/>
        </div>
      </div>
    );
  }
}

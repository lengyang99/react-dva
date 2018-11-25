import React from 'react';
import PropTypes from 'prop-types';
import {Layout, Menu, Icon, Dropdown, Tag, message, Spin, Avatar,Modal} from 'antd';
import DocumentTitle from 'react-document-title';
import {connect} from 'dva';
import {Link, Route, Redirect, Switch, routerRedux} from 'dva/router';
import moment from 'moment';
import {groupBy,intersection} from 'lodash';
import {ContainerQuery} from 'react-container-query';
import classNames from 'classnames';
import Debounce from 'lodash-decorators/debounce';

import {Scrollbars} from 'react-custom-scrollbars';
//import NoticeIcon from '../components/NoticeIcon';
import MessageInfo from '../components/MessageInfo';
import GlobalFooter from '../components/GlobalFooter';
import NotFound from '../routes/Exception/404';
import styles from './BasicLayout.less';
import CompanySwitch from '../components/CompanySwitch';
import {getHomePath} from './config';

const {Header, Sider, Content} = Layout;
const {SubMenu} = Menu;

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
  },
};

@connect(state => ({
  user: state.login.user,
}))
class BasicLayout extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  };

  constructor(props) {
    super(props);
    // 把一级 Layout 的 children 作为菜单项
    this.menus = props.navData.reduce((arr, current) => arr.concat(current.children), []);
    this.state = {
      openKeys: this.getDefaultCollapsedSubMenus(props),
    };
    this.userMenu = [];
  }

  getChildContext() {
    const {location, navData, getRouteData} = this.props;
    const routeData = getRouteData('BasicLayout');
    const firstMenuData = navData.reduce((arr, current) => arr.concat(current.children), []);
    const menuData = this.getMenuData(firstMenuData, '');
    const breadcrumbNameMap = {};

    routeData.concat(menuData).forEach((item) => {
      breadcrumbNameMap[item.path] = item.name;
    });
    return {location, breadcrumbNameMap};
  }

  componentDidMount() {

  }

  componentWillUnmount() {
    this.triggerResizeEvent.cancel();
  }

  onCollapse = (collapsed) => {
    this.props.dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };
  onMenuClick = ({key}) => {
    if (key === 'logout') {
      Modal.confirm({
        title:'提示',
        content:'要退出登录吗？',
        onOk:()=>{
          this.props.dispatch({
            type: 'login/logout',
            payload: this.props.user,
          });
        },
        onCancel(){}
      });

    }
  };
  getMenuData = (data, parentPath) => {
    let arr = [];
    data.forEach((item) => {
      if (item.children) {
        arr.push({path: `${parentPath}/${item.path}`, name: item.name});
        arr = arr.concat(this.getMenuData(item.children, `${parentPath}/${item.path}`));
      }
    });
    return arr;
  };

  getDefaultCollapsedSubMenus(props) {
    const currentMenuSelectedKeys = [...this.getCurrentMenuSelectedKeys(props)];
    currentMenuSelectedKeys.splice(-1, 1);
    if (currentMenuSelectedKeys.length === 0) {
      return ['dashboard'];
    }
    return currentMenuSelectedKeys;
  }

  getCurrentMenuSelectedKeys(props) {
    const {location: {pathname}} = props || this.props;
    const keys = pathname.split('/').slice(1);
    if (keys.length === 1 && keys[0] === '') {
      return [this.menus[0].key];
    }
    return keys;
  }

  getNavMenuItems(userMenus, parentPath = '') {
    if (!userMenus) {
      return [];
    }
    return userMenus.map((item, index) => {
      let itemPath;
      if (item.path.indexOf('http') === 0) {
        itemPath = item.path;
      } else {
        itemPath = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
      }

      if (item.children && item.children.some(child => child.name)) {
        return (
          <SubMenu
            title={
              item.icon ? (
                <span>
                  <Icon type={item.icon}/>
                  <span>{item.name}</span>
                </span>
              ) : item.name
            }
            key={item.key || item.path + '_' + index}
          >
            {this.getNavMenuItems(item.children, itemPath)}
          </SubMenu>
        );
      }
      const icon = item.icon && <Icon type={item.icon}/>;
      return (
        <Menu.Item key={item.key || item.path + '_' + index}>
          {
            /^https?:\/\//.test(itemPath) ? (
              <a href={itemPath} target={item.target}>
                {icon}<span>{item.name}</span>
              </a>
            ) : (
              <Link
                to={itemPath}
                target={item.target}
                replace={itemPath === this.props.location.pathname}
              >
                {icon}<span>{item.name}</span>
              </Link>
            )
          }
        </Menu.Item>
      );
    });
  }

  dealMenuData(userMenu, menus, data){
    let resultMenu = [];
    // 管理员身份不过滤
    if (this.props.currentUser.username === 'admin') {
      let resultItem = {};
      menus.map((menuInfo, index) => {
        if (menuInfo && menuInfo.name && !menuInfo.isHide) {
          resultItem = {
            ...menuInfo,
            children: [],
          };

          data.push(resultItem);
          if (menuInfo.children && menuInfo.children.length > 0) {
            this.dealMenuData(menuInfo.children, menuInfo.children || [], resultItem.children);
          }
        }
      })
    }

    userMenu.map((userItem, index1) => {
      let resultItem = {};
      let menuInfo = null;
      for (let i = 0; i < menus.length; i++) {
        // const tp = itemPath.replace(/\/:[\w-]+\/?/g, '').substr(1);
        if (userItem.pageUrl === menus[i].path) {
          menuInfo = menus[i];
          break;
        }
      }
      if (menuInfo && menuInfo.name && !menuInfo.isHide) {
        resultItem = {
          ...menuInfo,
          name: userItem.nodeName,
          children: [],
        };

        data.push(resultItem);
        if (userItem.children && userItem.children.length > 0) {
          this.dealMenuData(userItem.children, menuInfo.children || [], resultItem.children);
        }
      }
    });
  }

  getPageTitle() {
    const {location, getRouteData} = this.props;
    const {pathname} = location;
    let title = '智慧运营';
    getRouteData('BasicLayout').forEach((item) => {
      if (item.path === pathname) {
        title = `${item.name} - 智慧运营`;
      }
    });
    return title;
  }

  getNoticeData() {
    const {notices = []} = this.props;
    if (notices.length === 0) {
      return {};
    }
    const newNotices = notices.map((notice) => {
      const newNotice = {...notice};
      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime).fromNow();
      }
      // transform id to item key
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (newNotice.extra && newNotice.status) {
        const color = ({
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        })[newNotice.status];
        newNotice.extra = <Tag color={color} style={{marginRight: 0}}>{newNotice.extra}</Tag>;
      }
      return newNotice;
    });
    return groupBy(newNotices, 'type');
  }

  handleOpenChange = (openKeys) => {
    const lastOpenKey = openKeys[openKeys.length - 1];
    const isMainMenu = this.menus.some(
      item => lastOpenKey && (item.key === lastOpenKey || item.path === lastOpenKey)
    );
    this.setState({
      openKeys: isMainMenu ? [lastOpenKey] : [...openKeys],
    });
  }
  toggle = () => {
    const {collapsed} = this.props;
    this.props.dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: !collapsed,
    });
    this.triggerResizeEvent();
  }

  @Debounce(600)
  triggerResizeEvent() { // eslint-disable-line
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }

  handleNoticeClear = (type) => {
    message.success(`清空了${type}`);
    this.props.dispatch({
      type: 'global/clearNotices',
      payload: type,
    });
  }
  handleNoticeVisibleChange = (visible) => {
    if (visible) {
      this.props.dispatch({
        type: 'global/fetchNotices',
      });
    }
  }

  render() {
    const {currentUser, collapsed, getRouteData, menus, funs,spin} = this.props;

    const helpUrl = window.location.origin + '/staticFile/用户操作手册.docx';

    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
        <Menu.Item key="help"><Icon style={{float: 'left', marginTop: '5px'}} type="question-circle-o" /><a href={helpUrl}>帮助文档</a></Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout"><Icon type="logout" />退出登录</Menu.Item>
      </Menu>
    );
    // const noticeData = this.getNoticeData();

    // Don't show popup menu when it is been collapsed
    const menuProps = collapsed ? {} : {
      openKeys: this.state.openKeys,
    };

    const menuInfo = [];
    this.dealMenuData(menus, this.menus, menuInfo);

    // 根据用户信息判断跳转的首页地址
    let homePath = getHomePath(currentUser, funs);
    const layout = (
      <Layout>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          breakpoint="md"
          onCollapse={this.onCollapse}
          width={205}
          className={styles.sider}
        >
          <div className={styles.logo}>
            <Link to="/">
              <img src="./images/logo.png" alt="logo"/>
              <h1>智慧运营</h1>
            </Link>
          </div>
          <Scrollbars
            thumbSize={1}
            autoHeight
            autoHeightMax='calc(100vh - 50px)'
          >
            <Menu
              theme="dark"
              mode="inline"
              {...menuProps}
              onOpenChange={this.handleOpenChange}
              selectedKeys={this.getCurrentMenuSelectedKeys()}
              style={{margin: '16px 0', width: '100%'}}
            >
              {this.getNavMenuItems(menuInfo)}
            </Menu>
          </Scrollbars>

        </Sider>
        <Layout
          style={{
            height:'100vh',
            overflowY:'auto',
          }}
        >
          <Header className={styles.header}>
            <Icon
              className={styles.trigger}
              type={collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
            <div className={styles.right}>
              <CompanySwitch

              />
              <span className={styles.quick}>
                 <Icon type="home" className={styles.icon} onClick={() => {
                   this.props.dispatch(routerRedux.push('/'));
                 }}/>
              </span>
              <MessageInfo
                className={styles.action}
                count={10}
                onPopupVisibleChange={this.handleNoticeVisibleChange}
                popupAlign={{offset: [20, 0]}}
              >
              </MessageInfo>
              {currentUser.trueName ? (
                <Dropdown overlay={menu}>
                  <span className={`${styles.action} ${styles.account}`}>
                    <Avatar size="small" icon="user" className={styles.avatar}/>
                    {currentUser.trueName}
                  </span>
                </Dropdown>
              ) : <Spin size="small" style={{marginLeft: 8}}/>}
            </div>
          </Header>
          <Spin spinning={spin} size="large">
            <Content style={{height: '100%'}}>
              <Switch>
                {
                  getRouteData('BasicLayout').map(item =>
                    (
                      <Route
                        exact={item.exact}
                        key={item.path}
                        path={item.path}
                        component={item.component}
                      />
                    )
                  )
                }
                <Redirect exact from="/" to={homePath}/>
                <Route component={NotFound}/>
              </Switch>
              <GlobalFooter
                links={
                  [
                    {
                      title: '新奥能源',
                      href: 'http://www.enn.cn/',
                      blankTarget: true,
                    },
                  ]
                }
                copyright={
                  <div>
                    Copyright <Icon type="copyright"/> 2018 智慧运营
                  </div>
                }
              />
            </Content>
          </Spin>
        </Layout>
      </Layout>
    );

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <ContainerQuery query={query}>
          {params => <div className={classNames(params)}>{layout}</div>}
        </ContainerQuery>
      </DocumentTitle>
    );
  }
}

export default connect(state => ({
  menus: state.login.menus,
  currentUser: state.login.user,
  collapsed: state.global.collapsed,
  notices: state.global.notices,
  funs:state.login.funs||[],
  spin:state.global.spin
}))(BasicLayout);

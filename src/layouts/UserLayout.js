import React from 'react';
import PropTypes from 'prop-types';
import {Link, Route} from 'dva/router';
import DocumentTitle from 'react-document-title';
import {Icon} from 'antd';
import GlobalFooter from '../components/GlobalFooter';
import styles from './UserLayout.less';

const links = [];

const copyright = <div>Copyright <Icon type="copyright"/> 2018 新奥能源</div>;

class UserLayout extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
  };

  getChildContext() {
    const {location} = this.props;
    return {location};
  }

  getPageTitle() {
    const {getRouteData, location} = this.props;
    const {pathname} = location;
    let title = '智慧运营';
    getRouteData('UserLayout').forEach((item) => {
      if (item.path === pathname) {
        title = `${item.name} - 智慧运营`;
      }
    });
    return title;
  }

  render() {
    const {getRouteData} = this.props;

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <div>
          <div className={styles.south}>
          </div>
          <div className={styles.bg}>
            <img src="./images/login_bg.png" alt="背景图"/>
            <div className={styles.ad}>
              <img src="./images/login_ad.png"/>
            </div>
            {
              getRouteData('UserLayout').map(item =>
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
          </div>

          <div>
            <GlobalFooter className={styles.footer} links={links} copyright={copyright}/>
          </div>
        </div>
      </DocumentTitle>
    );
  }
}

export default UserLayout;

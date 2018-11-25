import React from 'react';
import PropTypes from 'prop-types';
import {Link, Route} from 'dva/router';
import DocumentTitle from 'react-document-title';

class EmerLayout extends React.PureComponent {
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
    getRouteData('EmerLayout').forEach((item) => {
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
          {
            getRouteData('EmerLayout').map(item =>
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
      </DocumentTitle>
    );
  }
}

export default EmerLayout;

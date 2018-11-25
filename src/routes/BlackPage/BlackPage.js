/**
 * Created by hexi on 2018/4/24.
 */
import React, { Component } from 'react';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

export default class BlackPage extends Component {
  render() {
    return (
      <PageHeaderLayout>
        <div style={{ height: '100px', width: '100%', backgroundColor: 'white', textAlign: 'center', lineHeight: '100px' }}>
          <span>该功能暂未开通，敬请期待！</span>
        </div>
      </PageHeaderLayout>
    );
  }
}

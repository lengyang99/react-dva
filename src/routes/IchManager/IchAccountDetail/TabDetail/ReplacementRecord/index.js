import React, { PureComponent } from 'react';
import { Table, Input, Button } from 'antd';
import styles from './index.less';
import SearchPlan from '../component/SearchPlan';
import RecordList from './RecordList';

export default class ReplacementRecord extends PureComponent {
  actionClick = (type) => {
    switch (type) {
      case 'submit':
        console.log(type);
        break;
      default:
        break;
    }
  };
  render() {
    const searchField = [{
      title: '搜索',
      search: <Input style={{width: '300px'}} />,
    }];
    const extra = [{
      title: '高级搜索',
      search: <Input />,
    }];
    const actionBtn = [
      <Button type="primary" onClick={this.actionClick.bind('', 'submit')} >提交</Button>,
    ];
    return (
      <div className={styles.container}>
        <SearchPlan
          className={styles.container_searchplan}
          searchField={searchField}
          extra={extra}
          actionBtn={actionBtn}
        />
        <RecordList />
      </div>
    );
  }
}

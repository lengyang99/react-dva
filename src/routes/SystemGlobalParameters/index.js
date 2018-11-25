import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, message } from 'antd';
import ParameterQuery from './ParameterQuery';
import ParameterEditModal from './ParameterEditModal';
import ParameterTable from './ParameterTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './index.less';

@connect(state => ({
  selectedRows: state.globalParameter.selectedRows,
}))
class SystemGlobalParameters extends PureComponent {
  /*
      @desc 新建/批量删除
      @param type: 事件类型
   */
  handleOperate = (type) => {
    if (type === 'batchDelete') {
      if (this.props.selectedRows.length > 0) {
        this.props.dispatch({
          type: 'globalParameter/makeModalShow',
          payload: {
            modalType: type,
            modalForm: null,
          },
        });
      } else {
        message.warning('还未选择任何数据');
      }
    } else {
      this.props.dispatch({
        type: 'globalParameter/makeModalShow',
        payload: {
          modalType: type,
          modalForm: null,
        },
      });
    }
  };
  /*
    @desc 查询模块下拉列表
   */
  queryModuleList = () => {
    this.props.dispatch({
      type: 'globalParameter/queryModuleList',
    });
  };
  /*
    @desc 查询参数列表
   */
  queryParameterList = () => {
    this.props.dispatch({
      type: 'globalParameter/queryParameterList',
      payload: {
        module: '',
        name: '',
      },
    });
  };
  componentDidMount() {
    this.queryModuleList();
    this.queryParameterList();
  }
  render() {
    return (
      <PageHeaderLayout>
        <div style={{ margin: 10, paddingTop: 10}}>
          <ParameterQuery />
          <div className={styles.btnDiv}>
            <Button className={styles.btn} icon="plus" type="primary" onClick={this.handleOperate.bind('', 'add')}>新建</Button>
            {/*<Button className={styles.btn} icon="delete" type="danger" onClick={this.handleOperate.bind('', 'batchDelete')}>批量删除</Button>*/}
          </div>
          <ParameterTable />
          <ParameterEditModal />
        </div>
      </PageHeaderLayout>
    );
  }
}

export default SystemGlobalParameters;

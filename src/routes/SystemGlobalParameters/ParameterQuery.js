import React, { PureComponent } from 'react';
import { Input, Button, Select } from 'antd';
import { connect } from 'dva';
import styles from './ParameterQuery.less';

const Option = Select.Option;
@connect(state => ({
  moduleSelectList: state.globalParameter.moduleSelectList,
}))
class ParameterQuery extends PureComponent {
  state = {
    module: '',
    name: '',
  };
  /*
   @desc 查询/重置
   @param type: 事件类型
   */
  handleConfirm = (type) => {
    const { dispatch } = this.props;
    switch (type) {
      case 'query':
        dispatch({
          type: 'globalParameter/queryParameterList',
          payload: this.state,
        });
        break;
      case 'reset':
        this.setState({
          module: '',
          name: '',
        });
        break;
      default:
        break;
    }
  };
  /*
   @desc 模块名称下拉菜单事件监听
   @param value: 选项值
   */
  handleSelectChange = (value) => {
    this.setState({
      module: value,
    });
  };
  /*
   @desc 规则名称输入框事件监听
   */
  handleInputChange = (e) => {
    this.setState({
      name: e.target.value,
    });
  };
  render() {
    const { moduleSelectList } = this.props;
    return (
      <div className={styles.queryDiv} >
        <span className={styles.inputZone} >
          <span className={styles.inputPrefix} >模块名称:</span>
          <Select className={styles.paraInput} defaultValue="" onChange={this.handleSelectChange} value={this.state.module} placeholder="请选择模块名称" >
            {
              moduleSelectList.map((item, index) => {
               return (
                 <Option value={item.value}>{item.text}</Option>
               );
              })
            }
          </Select>
        </span>
        <span className={styles.inputZone}>
          <span className={styles.inputPrefix} >规则名称:</span>
          <Input className={styles.paraInput} onChange={this.handleInputChange} value={this.state.name} placeholder="请输入规则名称" />
        </span>
        <div className={styles.btnDiv}>
          <Button className={styles.btn} type="primary" onClick={this.handleConfirm.bind('', 'query')}>查询</Button>
          <Button className={styles.btn} onClick={this.handleConfirm.bind('', 'reset')}>重置</Button>
        </div>
      </div>
    );
  }
}

export default ParameterQuery;

import React, { PureComponent } from 'react';
import { Input, Button, DatePicker } from 'antd';
import { connect } from 'dva';
import update from 'immutability-helper';
import Moment from 'moment';
import SearchPlan from '../component/SearchPlan';
import RecordList from './RecordList';
import styles from './index.less';

const { RangePicker } = DatePicker;
const disabledDate = current => {
  return current && current < Moment().endOf('day'); // moment().endOf('day')
};
const option = {
  param: '',
  contract_account: '',
  feedback_name: '',
  eq_name: '',
  arrive_time_start: '',
  arrive_time_end: '',
  pageNum: 1,
  pageSize: 10,
};
@connect(state => ({
  securityFilterOption: state.ichAccountDetail.securityFilterOption,
}))
class SecurityCheckRecord extends PureComponent {
  actionClick = (type) => {
    switch (type) {
      case 'submit':
        this.props.dispatch({
          type: 'ichAccountDetail/fetchSecurityRecordList',
          payload: Object.assign({}, {...this.props.securityFilterOption}),
        });
        break;
      case 'reset':
        this.props.dispatch({
          type: 'ichAccountDetail/setSecurityFilterOption',
          payload: update(this.props.securityFilterOption, {$merge: {...option}}),
        });
        this.props.dispatch({
          type: 'ichAccountDetail/fetchSecurityRecordList',
          payload: {...option},
        });
        break;
      default:
        break;
    }
  };
  onChangeDate = (moment, dateString) => {
    this.props.dispatch({
      type: 'ichAccountDetail/setSecurityFilterOption',
      payload: update(this.props.securityFilterOption, {$merge: {arrive_time_start: dateString[0], arrive_time_end: dateString[1]}}),
    });
  };
  inputOnChange = (type, e) => {
    this.props.dispatch({
      type: 'ichAccountDetail/setSecurityFilterOption',
      payload: update(this.props.securityFilterOption, {$merge: {[type]: e.target.value}}),
    });
  };
  componentDidMount() {
    const { securityFilterOption } = this.props;
    this.props.dispatch({
      type: 'ichAccountDetail/fetchSecurityRecordList',
      payload: Object.assign({}, {...securityFilterOption}),
    });
  }
  render() {
    const { securityFilterOption } = this.props;
    const searchField = [{
      title: '快速搜索',
      search: <Input placeholder="合同账户,合同号,表钢号,安检人,地址" value={securityFilterOption.param} style={{width: '300px'}} onChange={this.inputOnChange.bind(this, 'param')} />,
    }];
    const extra = [{
      title: '合同账户',
      search: <Input value={securityFilterOption.contract_account} onChange={this.inputOnChange.bind(this, 'contract_account')} />,
    }, {
      title: '安检人',
      search: <Input value={securityFilterOption.feedback_name} onChange={this.inputOnChange.bind(this, 'feedback_name')} />,
    }, {
      title: '表钢号',
      search: <Input value={securityFilterOption.eq_name} onChange={this.inputOnChange.bind(this, 'eq_name')} />,
    }, {
      title: '安检日期',
      search: <RangePicker
        value={securityFilterOption.arrive_time_start ? [Moment(securityFilterOption.arrive_time_start, 'YYYY-MM-DD'), Moment(securityFilterOption.arrive_time_end, 'YYYY-MM-DD')] : [null, null]}
        format="YYYY-MM-DD"
        placeholder={['开始时间', '结束时间']}
        onChange={this.onChangeDate}
      />,
    }];
    const actionBtn = [
      <Button type="primary" onClick={this.actionClick.bind('', 'submit')} >查询</Button>,
      <Button onClick={this.actionClick.bind('', 'reset')} >重置</Button>,
    ];
    return (
      <div className={styles.container}>
        <SearchPlan
          disabledDate={disabledDate}
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

export default SecurityCheckRecord;

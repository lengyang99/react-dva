import React, {Component} from 'react';
import {Button, Select, DatePicker, Input, message} from 'antd';
import PropTypes from 'prop-types';

import styles from './SearchPanel.less';

const {RangePicker} = DatePicker;
const Option = Select.Option;
const defaultState = {
  bc: '',
  stationcode: '',
  rangeTime: [null, null],
  zbrid: '',
};

class SearchPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...defaultState,
    };
  }


  handleUsersChange=(userid) => {
    if (this.state.stationcode != null && this.state.stationcode.length > 0) {
      this.setState({
        zbrid: userid,
      });
    } else {
      message.info('请先选择站点！');
    }
  };

  onClickSelect=() => {
    if (this.state.stationcode != null && this.state.stationcode.length > 0) {
      //  this.handleUsersChange();
    } else {
      message.info('请先选择站点！');
    }
  };


  handleStationChange = (station) => {
    this.setState({
      stationcode: station,
    });
    this.props.queryAllUsersBySation(station);
  };

  handleClassesChange = (classes) => {
    this.setState({
      bc: classes,
    });
  };
  handleRangeTimeChange = (dates) => {
    this.setState({
      rangeTime: dates,
    });
  };


  getSearchValue = () => {
    const {bc, stationcode, zbrid, rangeTime: [st, et]} = this.state;
    const startZbrq = st ? st.format('YYYY-MM-DD') : '';
    const endZbrq = et ? et.format('YYYY-MM-DD') : '';
    return {
      bc,
      stationcode,
      zbrid,
      startZbrq,
      endZbrq,
    };
  };

  onReset = () => {
    this.setState({
      bc: '',
      zbrid: '',
      stationcode: '',
      rangeTime: [null, null],
    });
    //  this.props.handOnSearch(this.getSearchValue());
  };
  onSearch = () => {
    this.props.handOnSearch(this.getSearchValue());
  };
  onReport = () => {
    const {stationcode} = this.state;
    if (!stationcode || stationcode === '') {
      message.info('上报前请先选择所属站点');
      return;
    }
    this.props.handOnReport({stationcode});
  }
  render() {
    const {stations, workTime, users} = this.props;
    console.log(workTime, 'hahha');
    const stationOptions = (stations || []).map(item => {
      return (<Option key={item.gid}>
        {item.name}
      </Option>);
    });

    const userOptions = (users || []).map(item => {
      return (<Option key={item.userid}>
        {item.truename}
      </Option>);
    });

    const workTimeOptions = (workTime || []).map(item => {
      return (<Option key={item.gid}>
        {item.name}
      </Option>);
    });
    return (
      <div>
        <br />
        <div className={styles['field-block']}>
          <label>日期：</label>
          <RangePicker
            value={this.state.rangeTime}
            style={{marginRight: 25, width: 250}}
            onChange={this.handleRangeTimeChange}
            allowClear
          />
        </div>
        <div className={styles['field-block']}>
          <label>所属站点：</label>
          <Select
            style={{width: 125, marginRight: 25}}
            value={this.state.stationcode}
            onChange={this.handleStationChange}
            allowClear
          >
            {stationOptions || null}
          </Select>
        </div>
        <div className={styles['field-block']}>
          <label>值班人：</label>
          <Select
            style={{width: 125, marginRight: 25}}
            onClick={this.onClickSelect}
            value={this.state.zbrid}
            onChange={this.handleUsersChange}
            onFocus={this.onClickSelect}
            allowClear
          >
            {userOptions || null}
          </Select>
        </div>
        <div className={styles['field-block']}>
          <label>班次：</label>
          <Select
            style={{marginRight: 25, width: 125}}
            value={this.state.bc}
            onChange={this.handleClassesChange}
            allowClear
          >
            {workTimeOptions || null}
          </Select>
        </div>

        <Button
          type="primary"
          className={styles.button}
          onClick={this.onSearch}
        >查询</Button>
        <Button
          onClick={this.onReset}
        >重置</Button>
        <Button
          type="primary"
          className={styles.button}
          onClick={this.onReport}
        >上报</Button>
      </div>
    );
  }
}

SearchPanel.propTypes = {
  stationData: PropTypes.array,
  users: PropTypes.array,
  handOnSearch: PropTypes.func,
  queryAllUsersBySation: PropTypes.func,
};

SearchPanel.defaultProps = {
  stationData: [],
  users: [],
  handOnSearch: f => f,
  queryAllUsersBySation: f => f,
};

export default SearchPanel;


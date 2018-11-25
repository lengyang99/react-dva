import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styles from './TaskSearch.less'
import { Button, Icon, DatePicker, Input} from 'antd';
import moment from 'moment';
const RANGE_GORMAT=['YYYY-MM-DD 00:00:00','YYYY-MM-DD 23:59:59'];
const {RangePicker} = DatePicker;
const defaultState = {
  stateValue: '',
  rangeValue: [moment(), moment()],
  likeValue:''
};

class TaskSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...defaultState
    }
  }

  // componentDidMount() {
  // }
  // componentWillReceiveProps(nextProps) {
  // }

  // componentWillUnmount() {
  // }


  stateChangeHandle = (st) => {
    this.setState({
      stateValue: st.name
    })
  };

  rangeChangeHandle = (dates) => {
    this.setState({
      rangeValue: dates
    });

  };
  resetHandle = () => {
    this.setState(defaultState);
    this.props.expOnChange();
  };
  queryHandle=()=>{
    this.props.expOnChange(this.getExpData());
  };

  likeChangeHandle=(e)=>{
    this.setState({likeValue:e.target.value});
  };

  getExpData = () => {
    const { rangeValue:[st,et],stateValue, stationValue,likeValue} = this.state;
    const [sf,ef] = RANGE_GORMAT;
    return  {
      startTime:st?st.format(sf):'',
      endTime:et?et.format(ef):'',
      checkId:stateValue,
      others:likeValue
    };
  };
  render() {
    const State = ({datas, value, onChange}) => {
      const items = datas.map(item =>
        <label className={styles['state-item']}
               style={{
                 color: item.name === (value || this.state.stateValue) ? '#1C8DF5' : 'default'
               }}
               onClick={() => {
                 onChange(item);
               }} key={item.name}
        ><span>{item.alias}</span></label>);
      return (
        <div style={{display: 'inline-block'}}>
          {
            items
          }
        </div>
      )
    };
    const selectValues = [
      {name: '', alias: '全部'},
      ...this.props.stateValues
    ];

    return (
      <div>
        <div>

          <div className={styles['field-block']}>
            <RangePicker style={{width: 284}}
              value={this.state.rangeValue}
              onChange={this.rangeChangeHandle}
            />
          </div>

          <div className={styles['field-block']}>
            <label>任务状态：</label>
            <State datas={selectValues} onChange={(d) => {
              this.stateChangeHandle(d);
            }} value={this.state.stateValue}/>
          </div>

          <div className={styles['field-block']}>
            <label>快速：</label>
            <Input className={styles.input}
                   value={this.state.likeValue}
                   onChange={this.likeChangeHandle}
            />
          </div>
          <div className={styles['field-block']}>
            <Button style={{marginRight: 20}} type="primary" onClick={this.queryHandle}>查询</Button>
            <Button onClick={this.resetHandle}>重置</Button>
          </div>
        </div>
        </div>

    );
  }
}

TaskSearch.defaultProps = {
  station: [],
  stateValues:[],
  expOnChange: f => f
};

/**
 * 查询和重置按钮都会触发expOnChange
 * 并返回查询条件对应的值
 * @type {{station: *, expOnChange: *}}
 */
TaskSearch.propTypes = {
  station: PropTypes.array,
  expOnChange: PropTypes.func,
  stateValues:PropTypes.array,
};

export default TaskSearch;

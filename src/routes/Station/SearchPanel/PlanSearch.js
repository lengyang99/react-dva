import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styles from './PlanSearch.less'
import {Select, Button, Icon, DatePicker, Input} from 'antd';

const {RangePicker} = DatePicker;


const defaultState = {
  stateValue: '',
  stationValue: '',
  likeValue:'',
  pageno: 1,
  pagesize: 10,
};

class PlanSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...defaultState,
      expand: false,
      stationValue:props.stationValue
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
  stationChangeHandle = (val) => {
    this.setState({
      stationValue: val
    });
  };
  resetStation = () => {
    this.setState({
      stationValue:this.props.stationValue
    })
  }
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
    const { stateValue, stationValue,likeValue, pageno, pagesize} = this.state;
    // const { pagination: { current, pageSize } } = this.props;
    return {
      status:stateValue,
      stationId:stationValue,
      others:likeValue,
      pageno,
      pagesize,
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
    const stateValues = [
      {name: '', alias: '全部'},
      ...this.props.stateValues
    ];
    const stationArr = this.props.station;
    const options = stationArr.map(ii =>
      <Select.Option key={ii.name}>
        {ii.alias}
      </Select.Option>);
    return (
      <div>
          <div className={styles['field-block']}>
            <label>计划状态：</label>
            <State datas={stateValues} onChange={(d) => {
              this.stateChangeHandle(d);
            }} value={this.state.stateValue}/>
          </div>
          <div className={styles['field-block']}>
            <label>快速：</label>
            <Input className={styles.input}
              placeholder='巡检员、计划名称'
              value={this.state.likeValue}
              onChange={this.likeChangeHandle}
            />
          </div>
          <div className={styles['field-block']}>
            <Button style={{marginRight: 20}} type="primary" onClick={this.queryHandle}>查询</Button>
            <Button onClick={this.resetHandle}>重置</Button>
          </div>
        </div>
    );
  }
}

PlanSearch.defaultProps = {
  station: [],
  stateValues:[],
  expOnChange: f => f

};

/**
 * 查询和重置按钮都会触发expOnChange
 * 并返回查询条件对应的值
 * @type {{station: *, expOnChange: *}}
 */
PlanSearch.propTypes = {
  station: PropTypes.array,
  stateValues:PropTypes.array,
  expOnChange: PropTypes.func,
};

export default PlanSearch;

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styles from './TaskSearch.less'
import {Select, Button, Icon, DatePicker, Input,Tag} from 'antd';
import moment from 'moment';
const FormatStr = 'YYYY-MM-DD';
const {RangePicker} = DatePicker;
const { CheckableTag } = Tag

const defaultState = {
  stateValue: '',
  stationValue: '',
  startDate: '',
  endDate: '',
  likeValue:'',
  pagesize: 10,
  pageno: 1

};

class TaskSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...defaultState,
      expand: false,
    }
  }

  toggle = () => {
    this.setState({
      expand: !this.state.expand
    });
  };

  stateChangeHandle = (st) => {
    this.setState({
      stateValue: st.name,
    })
  };

  stationChangeHandle = (val) => {
    console.log(val)
    // this.setState({
    //   startTime: val[0],
    //     endTime: val[1]
    // });
  };
  stationSelectHandle = (val, option) => {
    this.setState({
      stationValue: val
    });
  }
  changeTime = (date, dateString) => {
      console.log(date, dateString)
      this.setState({
        startDate: dateString[0],
        endDate: dateString[1]
      })
    }
  resetHandle = (params) => {
    this.setState(defaultState);
    if(params.function === undefined){
      this.props.expOnChange(defaultState);
    }
  };

  queryHandle=(params)=>{
    if(params.planId){
      const value = {
        checkId   : params.status || '',
        zoneId    : params.zoneId || '',
        startDate : params.startDate || '',
        endDate   : params.endDate || '',
        others    : params.others || null,
        pagesize  : params.pagesize || '',
        pageno    : params.pageno || '',
        planId    : params.isJump ? '' : params.planId,
      }
      this.setState({expand: true})
      this.props.expBackOnChange(value);

    }else{
      this.props.expOnChange(this.getExpData());
    }
  }

  likeChangeHandle=(e)=>{
    this.setState({likeValue:e.target.value});
  }

  getExpData = () => {
    const { expand,stateValue,stationValue,likeValue,startDate, endDate} = this.state;
    const {pagination: {pagesize,pageno}} = this.props
    if(this.state.others !== "" || this.state.startDate !== "" || this.state.endDate !== ""){
      this.setState({expand: true})
    }

    return Object.assign( {
      checkId:stateValue,
      zoneId:stationValue,
      pagesize,
      pageno,
      startDate: startDate.length > 8 ? startDate + " " + "00:00:00" : "",
      endDate: endDate.length > 8 ? endDate + " " + "23:59:59" : "",
      others:likeValue,
    })

  };

  jumpQuery = (params) => {
    this.setState({
      stateValue: params.status || '',
      stationValue: params.zoneId || '',
      startDate: params.startDate || '',
      endDate: params.endDate || '',
      likeValue: params.others || '',
    })

    this.queryHandle(params)
  }

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
      {name: 1, alias: '未完成'},
      {name: 2, alias: '完成'},
      // {name: 3, alias: '超期'},

    ];
    const stationArr = this.props.station;
    const options = stationArr.map(ii =>
      <Select.Option key={ii.eqlocation.gid}>
        {ii.name}
      </Select.Option>);
    const {expand} = this.state;
    return (
      <div>
        <div>
          <div className={styles['field-block']}>
            <label>任务状态：</label>
            <State datas={selectValues} onChange={(d) => {
              this.stateChangeHandle(d);
            }} value={this.state.stateValue}/>
          </div>
          <div className={styles['field-block']} style={{marginLeft: 52}}>
            <label>站点：</label>
            <Select className={styles.select}
                    onChange={this.stationChangeHandle}
                    onSelect={this.stationSelectHandle}
                    value={this.state.stationValue}
                    allowClear={true}
            >
              {
                options
              }
            </Select>
          </div>
          <div className={styles['field-block']} style={
            Object.assign({
              position: 'relative',
            }, expand ? {top: 40} : {})}>
            <Button style={{marginRight: 20}} type="primary" onClick={this.queryHandle}>查询</Button>
            <Button onClick={this.resetHandle}>重置</Button>
            <a style={{marginLeft: 8, fontSize: 12}} onClick={this.toggle}>
              {expand ? '收起' : '展开'}<Icon type={expand ? 'up' : 'down'}/>
            </a>
          </div>
        </div>
        <div style={{
          paddingTop: 10,
          display: expand ? 'block' : 'none',
        }}>
          <div className={styles['field-block']}>
            <RangePicker
              style={{width: 284}}
              value={this.state.startDate === "" ? [null, null] : [moment(this.state.startDate, FormatStr), moment(this.state.endDate, FormatStr)]}
              onChange={(date, dateString) => {this.changeTime(date, dateString)}}
            />
          </div>
          <div className={styles['field-block']}>
            <label>模糊：</label>
            <Input className={styles.input}
                   value={this.state.likeValue}
                   onChange={this.likeChangeHandle}
                   placeholder="计划名称、巡线员"
            />
          </div>
        </div>
      </div>

    );
  }
}

TaskSearch.defaultProps = {
  station: [
    {name: 1, alias: 'A站'},
    {name: 2, alias: 'B站'}
  ],
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
};

export default TaskSearch;

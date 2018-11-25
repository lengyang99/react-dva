import React, {Component} from 'react';
import {connect} from 'dva';
import PropTypes from 'prop-types';
import styles from './PlanSearch.less'
import {Select, Button, Icon, DatePicker, Input} from 'antd';

const {RangePicker} = DatePicker;


const defaultState = {
  stateValue: '',
  stationValue: '',
  likeValue: '',
  taskType: '',
  regulator: undefined,
};

@connect(state => ({
  functionData: state.maintain.functionData
}))
class PlanSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...defaultState,
      expand: false
    };
  }

  componentDidMount(){
    this.props.onRef(this)
  }

  componentWillReceiveProps(nextProps){
    console.log(nextProps, this.props.func, this.props.funcN, 'this.func')
  }
  stateChangeHandle = val => {
    this.setState({
      stateValue: val
    });
  };
  stationChangeHandle = val => {
    this.setState({
      stationValue: val
    });
  };
  taskTypeChangeHandle = val => {
    this.setState({
      taskType: val
    });
  };
  regChangeHandle = (key, name, routine, temp) => {
    this.setState({
      regulator: key
    });
    const { func } = this.props;
    this.props.expOnChange({ ...this.getExpData(), regulator: key }, func, name, routine, temp);
  };

  resetHandle = () => {
    this.setState(defaultState);
    // this.props.expOnChange(this.getExpData(),this.props.func);
    this.props.expOnChange(defaultState, this.props.funcN);
  };
  resetState = () => {
    this.setState(defaultState);
  }
  queryHandle = () => {
    this.props.expOnChange(this.getExpData(), this.props.funcN);
  };

  likeChangeHandle = e => {
    this.setState({ likeValue: e.target.value });
  };

  getExpData = () => {
    const {
      stateValue,
      stationValue,
      likeValue,
      taskType,
      regulator
    } = this.state;
    return {
      status: stateValue,
      zoneId: stationValue,
      taskType,
      others: likeValue,
      regulator
    };
  };

  toggle = () => {
    this.setState({ expand: !this.state.expand });
  };

  render() {
    console.log(this.state, 'state')
    const State = ({ datas, value, onChange, defaultValue }) => {
      const items = datas.map(item => (
        <label
          className={styles["state-item"]}
          style={{
            color:
              item.name === (value !== undefined ? value : defaultValue)
                ? "#1C8DF5"
                : "default"
          }}
          onClick={() => {
            onChange(item.name);
          }}
          key={item.name}
        >
          <span>{item.alias}</span>
        </label>
      ));
      return <div style={{ display: "inline-block" }}>{items}</div>;
    };

    const StateMaintain = ({ datas, value, onChange, defaultValue }) => {
      const items = datas.map(item => (
        <label
          className={styles["state-item"]}
          style={{
            color:
              item.functionKey === (value !== undefined ? value : defaultValue)
                ? "#1C8DF5"
                : "default"
          }}
          onClick={() => {
            onChange(
              item.functionKey,
              item.functionName,
              item.allowRoutineTask,
              item.allowTempTask,
            );
          }}
          key={item.functionKey}
        >
          <span>{item.functionName}</span>
        </label>
      ));
      return <div style={{ display: "inline-block" }}>{items}</div>;
    };

    const stateValues = [
      { name: "", alias: "全部" },
      ...this.props.stateValues
    ];
    const taskTypeArr = [{ name: "", alias: "全部" }, ...this.props.taskTypes];
    const { stations: stationArr, regulators, areaData, funcData } = this.props;
    const options = stationArr.map(ii => (
      <Select.Option key={ii.gid}>{ii.name}</Select.Option>
    ));
    // const isRe = this.props.func.startsWith("regulator"); //是否是调压器
    const isRe = funcData && funcData.length > 0 ? true : false; //是否是调压器
    const { expand } = this.state;
    return (
      <div className={styles.panel} style={{ height: isRe ? (expand ? 100 : 54) : (expand ? 70 : 24) }}>
        {isRe ? (
          <div className={styles["field-block"]}>
            <label>维护类型：</label>
            <StateMaintain
              datas={funcData}
              onChange={(a, b, c, d) => {
                this.regChangeHandle(a, b, c, d);
              }}
              defaultValue={funcData.length > 0 ? funcData[0].functionKey : ""}
              value={this.state.regulator}
            />
          </div>
        ) : null}
        {isRe ? <p /> : null}
        <div className={styles["field-block"]}>
          <label>计划状态：</label>
          <State
            datas={stateValues}
            onChange={d => {
              this.stateChangeHandle(d);
            }}
            value={this.state.stateValue}
          />
          <label style={{ marginLeft: 20 }}>计划类型：</label>
          <State
            datas={taskTypeArr}
            onChange={d => {
              this.taskTypeChangeHandle(d);
            }}
            value={this.state.taskType}
          />
        </div>
        <p />
        <div className={styles["field-block"]}>
          <label>站点：</label>
          <Select
            className={styles.select}
            style={{ width: 190 }}
            value={this.state.stationValue}
            onChange={this.stationChangeHandle}
            allowClear={true}
          >
            {options}
          </Select>
          <label style={{ marginLeft: 20 }}>快速查询：</label>
          <Input
            className={styles.input}
            value={this.state.likeValue}
            style={{ width: 190 }}
            onChange={this.likeChangeHandle}
            placeholder={
              "计划名称、巡线员、地址" //     "用户名、表纲号、合同号、地址、责任人":"设备名称、设备编码、地址、责任人"} //   this.props.funcN == 'safety_check' || this.props.funcN == 'meter_read' || this.props.funcN == 'meter_check'? // placeholder={
            }
          />
        </div>
        <div
          className={styles["field-block"]}
          style={{
            position: "relative",
            top: expand ? 0 : -40,
            left: isRe ? 0 : 10
          }}
        >
          <Button
            style={{ marginRight: 20 }}
            type="primary"
            onClick={this.queryHandle}
          >
            查询
          </Button>
          <Button onClick={this.resetHandle}>重置</Button>
          <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
            {expand ? "收起" : "展开"}
            <Icon type={expand ? "up" : "down"} />
          </a>
        </div>
      </div>
    );
  }
}

PlanSearch.defaultProps = {
  stations: [],
  stateValues: [],
  taskTypes: [],
  func: '',
  expOnChange: f => f

};

/**
 * 查询和重置按钮都会触发expOnChange
 * 并返回查询条件对应的值
 * @type {{station: *, expOnChange: *}}
 */
PlanSearch.propTypes = {
  stations: PropTypes.array,
  stateValues: PropTypes.array,
  taskTypes: PropTypes.array,
  expOnChange: PropTypes.func,
  func: PropTypes.string
};

export default connect(
  ({maintain})=>{
    return {
      maintain
    }
  }
)(PlanSearch);

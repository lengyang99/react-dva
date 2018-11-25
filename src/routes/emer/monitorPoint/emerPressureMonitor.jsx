import React from 'react';
import {Carousel, Icon} from 'antd';
import styles from '../css/emerPressureMonitor.css';
import EChart from '../../../components/ECharts/index';


let timeTicket = -1;

/*
 * 高压>1.6，次高压0.4至1.6，中压0.01至0.4，低压≤0.01  单位是MPA
 * 中压0.01至0.4
 * 当前监测点是中压，设置在0.01和0.4
 * 给个0.25，上下波动
 *
 * 管网监测
 * 0~2000~5000~10000
 *h/m3
 */
const chunk = (arr, size) =>
  Array.from({length: Math.ceil(arr.length / size)}, (v, i) => arr.slice(i * size, i * size + size));

export default class EmerPressureMonitor extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      marginLeftValue: 0,

    };
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };

  // componentWillReceiveProps = (nextProps) => {
  //     if (nextProps.emerMonitorMsg) {
  //         this.setState({datas: nextProps.datas.filter((e) => e.name == nextProps.emerMonitorMsg.name).concat(nextProps.datas.filter((e) => e.name !== nextProps.emerMonitorMsg.name))});
  //     }datas
  //     else {
  //         this.setState({datas: nextProps.datas});
  //     }
  // }

  // componentDidMount = () => {
  //     this.setState({datas: this.props.data || []});
  // }

  // shouldComponentUpdate = (nextProps, nextState) => {
  //     if (this.state.marginLeftValue !== nextState.marginLeftValue) {
  //         return true;
  //     }
  //     if (this.props.datas.length === 0) {
  //         return true;
  //     }
  //     if (this.props.datas.length !== 0 && nextProps.datas.length !== 0 && this.props.datas[0].deviceId !== nextProps.datas[0].deviceId) {
  //         // for (let i = 0; i < this.props.datas.length; i++) {
  //         //     let echart = document.getElementById(`echart_${this.props.datas[i].deviceId}_${i}`);
  //         //     if (echart != null) {
  //         //         echart.parentNode.removeChild(echart);
  //         //     }
  //         // }
  //         return true;
  //     }
  //     return false;
  // };

  getECharts = (info) => {
    let dataDivs = [];
    for (let i = 0; i < (info.indicators || []).length; i += 1) {
      let data = info.indicators[i];
      if (data.itemText.indexOf('压力') > -1) {
        dataDivs.push(<EChart
          id={`${info.gid}_${i}`}
          key={i}
          color={[[0.01, '#228b22'], [0.2, '#48b'], [0.8, '#ffa500'], [1, '#f00']]}
          value={data.unit === 'kPa' ? parseFloat(data.itemValue).toFixed(3) : parseFloat(data.itemValue).toFixed(2)}
          name={data.itemText}
          title={info.name}
          formatter={(value) => `${value}${data.unit}`}
          min="0.00"
          max="2.00"
        />);
      } else if (data.itemText.indexOf('流量') > -1) {
        dataDivs.push(<EChart
          id={`${info.gid}_${i}`}
          key={i}
          color={[[0.2, '#228b22'], [0.5, '#ffa500'], [1, '#f00']]}
          value={data.unit === 'm³/h' ? parseFloat(data.itemValue).toFixed(2) : parseFloat(data.itemValue).toFixed(0)}
          name={data.itemText}
          title={info.name}
          formatter={(value) => `${value}${data.unit}`}
          min="0.00"
          max="10000.00"
        />);
      }
    }
    return dataDivs;
  };

  onChangeMarginLeftValue = (num) => {
    this.setState({
      marginLeftValue: this.state.marginLeftValue + num,
    });
  };

  handleECharts = (eCharts) => {
    if (eCharts.length === 0) {
      return <div className={styles.noData}>暂无数据</div>;
    } else if (eCharts.length === 1) {
      return <div style={{width: 165, height: 165, margin: '0px auto'}}>{eCharts}</div>;
    } else if (eCharts.length === 2) {
      return eCharts;
    } else {
      // let carousels = chunk(eCharts, 2);
      // let carouselDivs = carousels.map((carousel, i) => <div>{carousel}</div>);
      // return <Carousel>{carouselDivs}</Carousel>;
      let carouselDivs = eCharts;
      return (<div style={{width: eCharts.length * 165, height: 165, marginLeft: this.state.marginLeftValue}}>
        <div className={styles.left} style={{display: this.state.marginLeftValue >= 0 ? 'none' : 'block'}} onClick={() => this.onChangeMarginLeftValue(330)}>
          <Icon type="left" />
        </div>
        <div
          className={styles.right}
          style={{display: this.state.marginLeftValue <= -(eCharts.length - 2) * 165 ? 'none' : 'block'}}
          onClick={() => this.onChangeMarginLeftValue(-330)}
        >
          <Icon type="right" />
        </div>
        {eCharts}
      </div>);
    }
  };

  render = () => {
    let {datas} = this.props;
    let eCharts = this.getECharts(datas);
    let newECharts = this.handleECharts(eCharts);
    return (
      <div style={{width: 330, height: 165, top: 30, left: 0, position: 'absolute', overflow: 'hidden'}}>
        {newECharts}
      </div>
    );
  }
}

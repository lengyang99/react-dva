import React, {Component} from 'react';
import {connect} from 'dva';
import echarts from 'echarts';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import styles from './HomePageCard.less';

// const Map = new Map();
// Map.set('key_point', {color: '#FF886A', isGrowth: '1', showImg: {flag: false}});
// Map.set('valve_maintain', {color: '#FD9D36', isGrowth: '1', showImg: {flag: true, img: './images/homePageImages/valve_maintain.png'}});
// Map.set('key_point', {color: '#FFD42B', sGrowth: '0', showImg: {flag: true, img: './images/homePageImages/regulator_maintain.png'}});
// Map.set('key_point', {color: '#22AC38', sGrowth: '1', showImg: {flag: false}});
// Map.set('key_point', {color: '#1890FF', sGrowth: '0', showImg: {flag: true, img: './images/homePageImages/except_event.png'}});
// Map.set('key_point', {color: '#9790ED', sGrowth: '0', showImg: {flag: true, img: './images/homePageImages/third_constrution.png'}});
const data = [
  {
    value: 98,
    name: '关键点巡视完成率',
    percentage: '2%',
    color: '#FF886A',
    isGrowth: '1',
    cycleText: '昨日',
    showImg: {flag: false},
  },
  {
    value: 50,
    name: '阀门养护任务完成率',
    percentage: '10%',
    color: '#FD9D36',
    isGrowth: '1',
    cycleText: '上周',
    showImg: {flag: true, img: './images/homePageImages/有效巡查.png'},
  },
  {
    value: 30,
    name: '调压器养护任务完成率',
    percentage: '5%',
    color: '#FFD42B',
    sGrowth: '0',
    cycleText: '上周',
    showImg: {flag: true, img: './images/homePageImages/上报事件数量.png'},
  },
  {
    value: 60,
    name: '有效巡查里程(公里)',
    percentage: '10%',
    color: '#22AC38',
    sGrowth: '1',
    cycleText: '上周',
    showImg: {flag: false},
  },
  {
    value: 10,
    name: '上报异常事件(个)',
    percentage: '5%',
    color: '#1890FF',
    sGrowth: '0',
    cycleText: '上月',
    showImg: {flag: true, img: './images/homePageImages/必经点.png'},
  },
  {
    value: 3,
    name: '新增第三方施工(个)',
    percentage: '2%',
    color: '#9790ED',
    sGrowth: '0',
    cycleText: '上月',
    showImg: {flag: true, img: './images/homePageImages/阀门巡检数量.png'},
  },
];
const confg = {
  'key_point': {showPrec: true, color: '#FF886A', showImg: {flag: false}},
  'valve_maintain': {showPrec: true, color: '#FF886A', showImg: {flag: false}},
  'regulator_maintain': {showPrec: true, color: '#FF886A', showImg: {flag: false}},
  'patrol_length': {showPrec: false, color: '#FD9D36', showImg: {flag: true, img: './images/homePageImages/有效巡查.png'}},
  'except_event': {showPrec: false, color: '#1890FF', showImg: {flag: true, img: './images/homePageImages/必经点.png'} },
  'third_constrution': {showPrec: false, color: '#9790ED', showImg: {flag: true, img: './images/homePageImages/阀门巡检数量.png'}},
};
@connect(({homePage, login}) => ({
  operateData: homePage.operateData,
  user: login.user,
}))
export default class HomePageCard extends React.Component {
  componentWillMount() {

  }

  componentDidMount() {
    const {user} = this.props;
    this.props.dispatch({
      type: 'homePage/getHomeYYDC',
      payload: {userid: user.gid},
    });
    this.drawPie();
  }

  componentDidUpdate() {
    this.drawPie();
  }

  componentWillUnmount() {

  }
  unit = (unit) => {
    let formatter = '';
    switch (unit) {
      case 'day':
        formatter = '昨日';
        break;
      case 'week':
        formatter = '上周';
        break;
      case 'month':
      default:
        formatter = '上月';
    }
    return formatter;
  }
  drawPie = () => {
    const labelTop = {
      normal: {
        label: {
          show: false,
          position: 'center',
        },
        labelLine: {
          show: false,
        },
      },
    };

    const labelBottom = {
      normal: {
        color: '#ccc',
        label: {
          show: true,
          position: 'center',
          textStyle: {
            baseline: 'middle',
          },
        },
        labelLine: {
          show: false,
        },
      },
    };
    let operateData = this.props.operateData || [];
    if (this.props.iKey) {
      operateData = operateData.filter(item => {
        return item.iKey === this.props.iKey;
      });
    }
    console.log(operateData, 'lasdaa');
    operateData.forEach(item => {
      if (confg[item.iKey]) {
        Object.assign(item, confg[item.iKey]);
      }
    });
    console.log(operateData, 'lalalalalla');
    for (let i = 0; i < operateData.length; i++) {
      if (operateData[i].showImg && operateData[i].showImg.flag) {
        continue;
      }
      const {value: vv} = operateData[i];
      console.log(vv, '哈哈哈');
      const myChart = echarts.init(document.getElementById((`main_${i}`)));
      // 绘制图表
      myChart.setOption({
        series: [{
          type: 'pie',
          hoverAnimation: false,
          center: ['50%', '50%'],
          radius: [15, 20],
          itemStyle: {
            normal: {
              label: {
                formatter(params) {
                  return `${100 - Math.round(parseFloat(params.value, 10) * 100)}%`;
                },
              },
            },
          },
          data: [
            {name: 'other', value: 1 - vv, itemStyle: labelBottom},
            {name: 'Instagram', value: vv, itemStyle: labelTop},
          ],
        }],
      });
    }
  };

  dealData = () => {
    const returnData = [];
    // let tmpData = this.props.data;
    let tmpData = this.props.operateData || [];
    if (this.props.iKey) {
      tmpData = tmpData.filter(item => {
        return item.iKey === this.props.iKey;
      });
    }
    console.log(tmpData, 'laswqqqqqdaa');
    tmpData.forEach(item => {
      if (confg[item.iKey]) {
        Object.assign(item, confg[item.iKey]);
      }
    });
    for (let i = 0; i < tmpData.length; i++) {
      const divstyle = {
        backgroundColor: tmpData[i].color,
      };

      const cardstyle = {
        float: 'left',
        width: '205px',
        height: '80px',
        border: '1px solid #cccccc',
        borderRadius: '5px',
        'marginLeft': (this.props.width - 640) / 4 - 10,
        'marginTop': '20px',
      };
      const value = tmpData[i].showPrec ? `${Math.abs(Math.round(parseFloat(tmpData[i].value, 10) * 100))}%` : tmpData[i].value;
      const dValue = tmpData[i].showPrec ? `${Math.abs(Math.round(parseFloat(tmpData[i].dValue, 10) * 100))}%` : `${Math.abs(Math.round(parseFloat(tmpData[i].dValue, 10)))}%`;
      const iName = tmpData[i].showPrec ? tmpData[i].iName : `${tmpData[i].iName}(${tmpData[i].valueUnit})`;
      const showImg = tmpData[i].showImg && tmpData[i].showImg.flag ?
        <img alt="" src={tmpData[i].showImg.img} style={{'marginTop': '10px', marginRight: '5px'}} /> :
        (<div id={`main_${i}`} style={{width: '40px', height: '40px'}} />);

      const upImg = tmpData[i].dValue >= 0 ?
        <img alt="" src="./images/homePageImages/上升.png" style={{float: 'left', 'marginTop': '7px'}} /> :
        <img alt="" src="./images/homePageImages/下降.png" style={{float: 'left', 'marginTop': '7px'}} />;
      returnData.push(
        <div style={cardstyle} key={`card_${i}`}>
          <div className={styles.card_div} style={divstyle} />
          <div style={{float: 'left', 'marginLeft': '20px', 'marginTop': '10px'}}>
            <span style={{fontWeight: 'bold', fontSize: '15px'}}>{value}</span>
            <br />
            <span style={{fontSize: '13px'}}>{iName}</span>
            <br />
            {upImg}
            <span
              style={{'marginLeft': '5px', marginRight: '5px', color: tmpData[i].color}}
            >{dValue}</span>
            <span>同比{this.unit(tmpData[i].dUnit)}</span>
          </div>
          <div style={{float: 'right', 'marginTop': '15px', marginRight: tmpData[i].iKey === 'regulator_maintain' ? '10px' : '15px'}}>
            {showImg}
          </div>
        </div>
      );
    }

    return returnData;
  };

  render() {
    const divdata = this.dealData();
    return (
      <div style={{width: 'auto', 'marginLeft': '10px'}}>
        {divdata}
      </div>
    );
  }
}

// HomePageCard.defaultProps = {
//
// };
//
// HomePageCard.propTypes = {
//
// };

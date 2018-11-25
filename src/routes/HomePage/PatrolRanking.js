import React, {PureComponent} from 'react';

const data = [
  {index: 1, station: '中心所', name: '陈涛', value: '7954.81', isGrowth: '1'},
  {index: 2, station: '城南所', name: '侯钧舰', value: '4727.52', isGrowth: '1'},
  {index: 3, station: '中心所', name: '小刘超', value: '4422.37', isGrowth: '1'},
  {index: 4, station: '开发区所', name: '费越', value: '4378.36', isGrowth: '1'},
  {index: 5, station: '城北所', name: '刘超', value: '4375.69', isGrowth: '0'},
  {index: 6, station: '开发区所', name: '许鹏飞', value: '4269.46', isGrowth: '1'},
  {index: 7, station: '城北所', name: '马震', value: '4156.28', isGrowth: '1'},
  {index: 8, station: '中心所', name: '卢国亚', value: '3857.27', isGrowth: '1'},
  {index: 9, station: '开发区所', name: '周红生', value: '3751.40', isGrowth: '1'},
  {index: 10, station: '万庄', name: '王森', value: '3318.55', isGrowth: '0'},
  {index: 11, station: '开发区所', name: '刘培生', value: '3291.96', isGrowth: '1'},
];

export default class PatrolRanking extends PureComponent {
  componentWillMount() {

  }
    dealData = () => {
      const tmpdata = this.props.reportData || [];
      const hrStyle = {
        borderBottom: 'none',
        borderTop: '1px solid #ccc',
        'marginTop': '11px',
        'marginLeft': '32px',
        width: `${this.props.width - 110}px`,
      };
      const resultData = [];
      for (let i = 0; i < tmpdata.length; i++) {
        let tmp = <div style={{display: 'inline-block', width: '20px', height: '20px', borderRadius: '10px', backgroundColor: '#F7F7F7', verticalAlign: 'middle', textAlign: 'center'}}>{tmpdata[i].rno}</div>;
        if (i === 0) {
          tmp = <img alt="" src="./images/homePageImages/金牌.png" style={{float: 'left', 'marginTop': '-5px'}} />;
        } else if (i === 1) {
          tmp = <img alt="" src="./images/homePageImages/银牌.png" style={{float: 'left', 'marginTop': '-5px'}} />;
        } else if (i === 2) {
          tmp = <img alt="" src="./images/homePageImages/铜牌.png" style={{float: 'left', 'marginTop': '-5px'}} />;
        }

        let upImg = <img alt="" style={{float: 'right', marginRight: '30px', 'marginTop': '7px'}} src="./images/homePageImages/上升.png" />;
        if (tmpdata[i].score - tmpdata[i].lscore < 0) {
          upImg = <img alt="" style={{float: 'right', marginRight: '30px', 'marginTop': '7px'}} src="./images/homePageImages/下降.png" />;
        }

        resultData.push(
          <div style={{height: '50px', paddingTop: '15px'}} key={`ranking_${i}`}>
            {tmp}
            <span style={{'marginLeft': '10px'}}>{tmpdata[i].locName}</span>：
            <span>{tmpdata[i].userName}</span>
            {upImg}
            <span style={{'float': 'right', marginRight: '20px'}}>{tmpdata[i].score}</span>
            <hr style={hrStyle} />
          </div>
        );
      }
      return resultData;
    }

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

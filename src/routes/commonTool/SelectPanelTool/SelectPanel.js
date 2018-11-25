import React from 'react';
import PropTypes from 'prop-types';
import {DatePicker} from 'antd';
import moment from 'moment';
import styles from './SelectPanel.less';

class SelectPanel extends React.Component {

  constructor(props) {
    super(props);

    this.state = ({
      selectValue: '',
      showMsgInfo: {},
    });

    this.starttime = '';
    this.endTime = '';

    this.selectDataClick = this.selectDataClick.bind(this);
    this.selectDdlClick = this.selectDdlClick.bind(this);
  }

  // componentWillReceiveProps() {
  //     this.setState({
  //         selectValue: this.props.value,
  //     });
  // }

  // dealData = () => {
  //     let result = [];
  //     let type = this.props.dataType;
  //     switch (type) {
  //         case 'date':
  //         case 'datecustom':
  //             result = this.initDataPanel(this.props.data, type);
  //             break;
  //         case 'ddl':
  //             result = this.initDdlPanel(this.props.data);
  //             break;
  //         default:
  //             break;
  //     }
  //     return result;
  // }

  initDataPanel = (data, type) => {
    let panelData = [];
    let today = new Date();

    this.starttime = moment().add(-1, 'month').format('YYYY-MM-DD HH:ss:mm');
    this.endTime = moment().utc().format('YYYY-MM-DD HH:ss:mm');

    for (let i = 0; i < data.length; i++) {
      let dataInfo = data[i];
      let datadiv = '';
      if (dataInfo.valueType === 'custom') {
        datadiv = ([<div key={this.props.fieldName + '_' + i} className={styles.select_panel_div}
                         data-valuest={dataInfo.valueSt}
                         data-valueed={dataInfo.valueEd}
                         data-index={i}
                         onClick={this.selectDataClick}>
                         <span
                           className={(dataInfo.value === this.state.selectValue ? styles.select_panel_span_selected : '') + ' ' + styles.select_panel_span}>
                            {dataInfo.name + (this.props.showMoreInfo ? ('(' + dataInfo.more + ')') : '')}
                         </span>
        </div>, <div key={this.props.fieldName + '_time_' + i}
                     className={(dataInfo.value === this.state.selectValue ? styles.select_panel_time_show : styles.select_panel_time_hide)}
                     style={{float: 'left', marginLeft: '40px'}}>
          从<DatePicker defaultValue={moment().add(-1, 'month')} showTime format="YYYY-MM-DD HH:ss:mm"
                       onChange={this.handleSTimeChange}/>
          至<DatePicker defaultValue={moment().utc()} showTime format="YYYY-MM-DD HH:ss:mm"
                       onChange={this.handleETimeChange}/>
        </div>
        ]);
      }
      else {
        let dataValue = this.dealTimeValue(dataInfo);
        datadiv = (
          <div key={this.props.fieldName + '_' + i} className={styles.select_panel_div}
               data-valuest={dataValue.starttime}
               data-valueed={dataValue.endTime}
               data-index={i}
               onClick={this.selectDataClick}>
                    <span
                      className={(dataInfo.value === this.state.selectValue ? styles.select_panel_span_selected : '') + ' ' + styles.select_panel_span}>
                         {dataInfo.name + (this.props.showMoreInfo ? ('(' + dataInfo.more + ')') : '')}
                    </span>
          </div>
        );
      }

      panelData.push(datadiv);
    }
    return panelData;
  }

  dealTimeValue = (dateinfo) => {
    let datevalue = {
      starttime: '',
      endTime: ''
    }
    if (dateinfo.valueType === 'datecustom') {
      switch (dateinfo.value) {
        case 'yesterday':
          datevalue.starttime = moment().subtract(1, 'days').format('YYYY-MM-DD') + ' 00:00:00';
          datevalue.endTime = moment().subtract(1, 'days').format('YYYY-MM-DD') + ' 23:59:59';
          break;
        case 'today':
          datevalue.starttime = moment().format('YYYY-MM-DD') + ' 00:00:00';
          datevalue.endTime = moment().format('YYYY-MM-DD') + ' 23:59:59';
          break;
        case 'tomorrow':
          datevalue.starttime = moment().add(1, 'days').format('YYYY-MM-DD') + ' 00:00:00';
          datevalue.endTime = moment().add(1, 'days').format('YYYY-MM-DD') + ' 23:59:59';
          break;
        case 'lastweek':
          datevalue.starttime = moment().add(-1, 'week').day(0).format('YYYY-MM-DD') + ' 00:00:00';
          datevalue.endTime = moment().add(-1, 'week').day(7).format('YYYY-MM-DD') + ' 23:59:59';
          break;
        case 'thisweek':
          datevalue.starttime = moment().day(0).format('YYYY-MM-DD') + ' 00:00:00';
          datevalue.endTime = moment().day(7).format('YYYY-MM-DD') + ' 23:59:59';
          break;
        case 'nextweek':
          datevalue.starttime = moment().add(1, 'week').day(0).format('YYYY-MM-DD') + ' 00:00:00';
          datevalue.endTime = moment().add(1, 'week').day(7).format('YYYY-MM-DD') + ' 23:59:59';
          break;
        case 'lastmonth':
          datevalue.starttime = moment().add(-1, 'month').startOf('month').format('YYYY-MM-DD') + ' 00:00:00';
          datevalue.endTime = moment().add(-1, 'month').endOf('month').format('YYYY-MM-DD') + ' 23:59:59';
          break;
        case 'thismonth':
          datevalue.starttime = moment().startOf('month').format('YYYY-MM-DD') + ' 00:00:00';
          datevalue.endTime = moment().endOf('month').format('YYYY-MM-DD') + ' 23:59:59';
          break;
        case 'nextmonth':
          datevalue.starttime = moment().add(1, 'month').startOf('month').format('YYYY-MM-DD') + ' 00:00:00';
          datevalue.endTime = moment().add(1, 'month').endOf('month').format('YYYY-MM-DD') + ' 23:59:59';
          break;
        default:
          break;
      }
    }
    else if (dateinfo.valueType === 'date') {
      datevalue.starttime = dateinfo.valueSt;
      datevalue.endTime = dateinfo.valueEd;
    }

    return datevalue;
  }

  selectDataClick = (e) => {
    let getindex = e.currentTarget.getAttribute('data-index');
    let getvalue = e.currentTarget.getAttribute('data-value');

    if (this.props.data[getindex].valueType !== 'custom') {
      this.starttime = e.currentTarget.getAttribute('data-valuest');
      this.endTime = e.currentTarget.getAttribute('data-valueed');
    }

    this.setState({
      selectValue: getvalue,
    });

    this.props.onclick({stime: this.starttime, etime: this.endTime});
  }

  handleSTimeChange = (e, value) => {
    this.starttime = value;

    this.props.onclick({stime: this.starttime, etime: this.endTime});
  }

  handleETimeChange = (e, value) => {
    this.endTime = value;

    this.props.onclick({stime: this.starttime, etime: this.endTime});
  }

  // 初始化普通选择组件
  initDdlPanel = (data) => {
    let panelData = [];
    for (let i = 0; i < data.length; i++) {
      let dataInfo = data[i];
      let dot = '';
      if (dataInfo.showDot) {
        dot = (
          <div className={(dataInfo.value === this.state.selectValue ? styles.select_panel_dot_selected : '')
          + ' ' + styles.select_panel_dot}>
          </div>
        );
      }
      let datadiv = (
        <div key={this.props.fieldName + '_' + i}
             className={styles.select_panel_div}
             data-value={dataInfo.value}
             data-index={i}
             onClick={this.selectDdlClick}>
          {dot}
          <span style={{margin: dataInfo.showDot ? '' : 0, padding: dataInfo.showDot ? '' : 0}}
                className={(dataInfo.value === this.state.selectValue ? styles.select_panel_span_selected : '') + ' ' + styles.select_panel_span}>
                               {dataInfo.name + (this.props.showMoreInfo ? ('(' + dataInfo.more + ')') : '')}
                    </span>
        </div>
      );
      panelData.push(datadiv);
    }
    return panelData;
  };

  // 组件选择类型分组
  dealData = () => {
    let result = [];
    let type = this.props.dataType;
    this.state.selectValue = this.props.value;
    switch (type) {
      case 'date':
      case 'datecustom':
        result = this.initDataPanel(this.props.data, type);
        break;
      case 'ddl':
        result = this.initDdlPanel(this.props.data);
        break;
      default:
        break;
    }
    return result;
  }

  selectDdlClick = (e) => {
    let getindex = e.currentTarget.getAttribute('data-index');
    let getvalue = e.currentTarget.getAttribute('data-value');
    this.setState({
      selectValue: getvalue,
    });

    this.props.onclick({value: getvalue});
  }

  render() {
    let dealPanel = this.dealData();
    let image = this.props.imageUrl !== undefined ?
      <img style={{marginRight: '10px', marginTop: '4px'}} src={this.props.imageUrl}/> : '';
    return (
      <div style={{height: '100%', width: this.props.Swidth || '100%', overflow: 'hidden'}}>
        <div className={styles.select_panel_div} style={{marginRight: '15px'}}>
          {image}
          <span>{this.props.fieldName}</span>:
        </div>
        {dealPanel}
      </div>
    );
  }
}

SelectPanel.propTypes = {
  fieldName: PropTypes.string, // 名字
  dataType: PropTypes.string, // 组件类型
  data: PropTypes.array, // 数据
  value: PropTypes.string, // 当前值
  imageUrl: PropTypes.string, // 左边图片
  showMoreInfo: PropTypes.bool, // 展示更多（more）
  Swidth: PropTypes.any,
  onclick: PropTypes.func,
};

SelectPanel.defaultProps = {
  fieldName: '',
  dataType: '',
  data: [],
  value: '',
  showMoreInfo: false,
  onclick: (valueObj) => {

  }
};

export default SelectPanel;

// 数据格式
// const testdata = {
//     fieldName: '自定义时间段',
//     dataType: 'date',
//     data: [
//         {
//             name: "全部",
//             valueSt: "",
//             valueEd: "",
//             valueType:"interval",
//         },
//         {
//             name: "测试1",
//             valueSt: "2015-10-10",
//             valueEd: "2015-10-11",
//             valueType:"interval",
//         },
//         {
//             name: "自定义",
//             valueType:"custom",
//         },
//     ],
// };

// const testdata = {
//     fieldName: '固定格式时间段',
//     dataType: 'datecustom',
//     data: [
//         {
//             name: "全部",
//             valueSt: "",
//             valueEd: "",
//             valueType:"interval",
//         },
//         {
//             name: "测试1",
//             valueSt: "2015-10-10",
//             valueEd: "2015-10-11",
//             valueType:"interval",
//         },
//         {
//             name: "自定义",
//             valueType:"custom",
//         },
//     ],
// };

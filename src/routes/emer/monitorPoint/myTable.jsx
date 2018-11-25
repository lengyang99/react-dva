import _ from 'lodash';
import React from 'react';
import { Pagination, message } from 'antd';
import s from '../css/mytable.css';

export default class myTable extends React.Component {
  state = {
    dataSource: [],
    current: 1,
    pageSize: 10,
    datas: [],
    total: 0,
  }
  componentWillReceiveProps(nextProps) {
    this.init(nextProps);
  }
  componentDidMount() {
    this.init(this.props);
    let work = () => {
      let curPage = this.state.current + 1;
      if (curPage > (this.state.datas.length || 1)) { curPage = 1; }
      this.setState({dataSource: this.state.datas[curPage - 1], pageSize: this.state.pageSize, current: curPage});
    }
    if (this.props.auto) {
      this.timer = setInterval(work, (this.props.interval || 5) * 1000);
    }
  }
  componentWillUnmount = () => {
    if (this.timer) { clearInterval(this.timer); }
    this.setState = (state, callback) => {};
  }
  init = (props) => {
    let datas = props.datas || [];
    let pageSize = props.pageSize || 10;
    let all = _.chunk(datas, pageSize);
    this.setState({dataSource: all[0], pageSize, datas: all, total: datas.length, current: 1});
  }
  onChange = (page, pageSize) => {
    this.setState({dataSource: this.state.datas[page - 1], pageSize, current: page});
  }
  showPoint = (data) => {
    let map = this.props.map;
    const XY = this.props.ecodePattern.myTable;
    if (!(data.x > XY.minX && data.x < XY.maxX && data.y > XY.minY && data.y < XY.maxY)) {
      message.warn('坐标超出当前地图范围');
      return;
    }
    let centerPoint = {
      x: data.x,
      y: data.y,
    };
    map.centerAt(centerPoint);
    let param = {
      x: data.x,
      y: data.y,
      onCloseHandle: (op) => this.handleOpenEmerOrder('close'),
      info: {
        title: '监测点',
        content: [
          {
            name: '编号', value: data.gid,
          }, {
            name: '监测点', value: data.name,
          }, {
            name: '指标', value: data.itemText,
          }, {
            name: '数值', value: data.itemValue + data.unit,
          }],
      },
    };
    map.popup(param);
  }
  render() {
    let {flds = []} = this.props;
    return (
      <div className={s.mytable} style={{overFlow: 'hidden'}}>
        <div className={s.tclass}>
          <table style={this.props.style}>
            {
              this.props.showHeader ?
                <thead>
                  <tr>
                    {
                      flds.map((fld, i) => {
                        return <td key={i}>{fld.title}</td>;
                      })
                    }
                  </tr>
                </thead> : null
            }
            <tbody>
              {
                (this.state.dataSource || []).map((data, i) => {

                  return (
                    <tr style={ this.props.trStyle ? (typeof (this.props.trStyle) === 'function' ? this.props.trStyle(data) : this.props.trStyle) : {}} key={i}>
                      {
                        flds.map((fld, j) => {
                          return (<td key={j} onClick={this.showPoint.bind(this, data)}>
                            {this.props.td ? (typeof (this.props.td) === 'function' ? this.props.td(fld.name, data[fld.name], data) : this.props.td) : data && data[fld.name]}
                          </td>);
                        })
                      }
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
        <div className={s.pclass}>
          <div>
            <Pagination size="small" total={this.state.total} current={this.state.current} pageSize={this.state.pageSize} onChange={this.onChange} />
          </div>
        </div>
      </div>
    );
  }
}

import React from 'react';
import PropTypes from 'prop-types';
import {Button, Icon} from 'antd';

export default class SearchTablePanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpand: false,
    };
    if(this.props.isDefaultExpand){
      this.state = {
        isExpand: true,
      };
    }
  }

  // 查询条件显示隐藏
  expand = () => {
    this.setState({
      isExpand: !this.state.isExpand,
    });
  };

  // 获取第一行查询参数div
  getSearch = (search) => {
    let divs = [];
    for (let i = 0; i < search.length; i++) {
      if(search[i] === null){
        continue;
      }
      let div = (
        <div key={i} style={{height: '100%', float: 'left', marginRight: i === search.length - 1 ? '' : '25px'}}>
          {search[i]}
        </div>
      );
      divs.push(div);
    }
    return divs;
  };

  // 获取扩展的第二行及以上的查询参数div
  getExtra = (extra) => {
    let divs = [];
    for (let i = 0; i < extra.length; i++) {
      if(extra[i] === null){
        continue;
      }
      let div = (
        <div key={i} style={{height: '32px', float: 'left', marginRight: i === extra.length - 1 ? '' : '40px', marginTop: 7}}>
          {extra[i]}
        </div>
      );
      divs.push(div);
    }
    return <div style={{
      height: '32px',
      width: 'calc(100% - 30px)',
      margin: '5px',
      display: this.state.isExpand ? 'block' : 'none'
    }}>
      {divs}
    </div>;
  };

  render() {
    // const tableHeight = '100vh - 310px';
    const search = this.getSearch(this.props.field.search);
    const extra = this.props.field.extra ? this.getExtra(this.props.field.extra) : '';
    const extra1 = this.props.field.extra1 ? this.getExtra(this.props.field.extra1) : '';
    const addTemp = this.props.onAddTemp === undefined ? '' :
      <Button type='primary' onClick={this.props.onAddTemp}><Icon type="plus"/>临时</Button>;
    const add = this.props.add === undefined ? 
      (this.props.onAdd === undefined ? '' :
      <div style={{height: '32px', width: '100%', margin: '5px 5px 30px 15px'}}>
        <div>
          <Button type='primary' onClick={this.props.onAdd} style={{marginRight: '15px'}}><Icon type="plus"/>常规</Button>
          {addTemp}
        </div>
      </div>)
      : 
      <div>
        <Button type='primary' onClick={this.props.add}><Icon type="plus"/>申请</Button>
      </div>;
    return (
      <div style={{minWidth: '1000px', width: '100%', overflow: 'hidden', position: 'relative'}}>
        <div style={{width: this.props.field.searchWidth, height: 'auto', display: 'inline-block', marginLeft: '10px'}}>
          <div style={{height: '32px', width: 'calc(100% - 10px)', margin: '5px'}}>
            {search}
          </div>
          {extra}
          {extra1}
        </div>
        <div style={{height: '32px', display: 'inline-block', margin: '5px'}}>
          <Button style={{float: 'left', marginRight: '5px', display: this.props.onSearch ? 'block' : 'none'}}
                  type='primary' onClick={this.props.onSearch}>查询</Button>
          <Button style={{float: 'left', marginRight: '10px', display: this.props.onReset ? 'block' : 'none'}}
                  type='ghost' onClick={this.props.onReset}>重置</Button>
          <div style={{
            color: '#1890ff',
            margin: '5px 0px 0px 10px',
            cursor: 'pointer',
            float: 'left',
            display: this.props.field.extra ? 'block' : 'none'
          }} onClick={this.expand}>
            <span style={{verticalAlign: 'middle', display: this.state.isExpand ? 'inline' : 'none'}}>收起<Icon
              type="up"/></span>
            <span style={{verticalAlign: 'middle', display: this.state.isExpand ? 'none' : 'inline'}}>展开<Icon
              type="down"/></span>
          </div>
        </div>
        <div style={{position: 'absolute', top: 10, right: 40}}>
          {this.props.field.other}
        </div>
        {add}
        <div style={{height: 'auto', margin: 5, overflowY: 'auto'}}>
          {this.props.field.table}
        </div>
      </div>
    )
  }
}

SearchTablePanel.propTypes = {
  field: PropTypes.object, // 模块配置
  isDefaultExpand: PropTypes.bool, // 是否默认扩展查询条件
  onSearch: PropTypes.func, // 查询
  onReset: PropTypes.func, // 重置
  onAdd: PropTypes.func, // 添加
  onAddTemp: PropTypes.func, // 添加临时
};

SearchTablePanel.defaultProps = {
  field: [],
};


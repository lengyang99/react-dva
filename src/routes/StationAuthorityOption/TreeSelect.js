import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { connect } from 'dva';
import TreeList from './TreeList';


@connect(state => ({
  searchOption: state.stationAuthorityOption.searchOption,
}))
class TreeSelect extends PureComponent {
  treeSelect = (value) => {
    this.props.dispatch({
      type: 'stationAuthorityOption/getAuthList',
      payload: {
        userName: this.props.searchOption,
        locCode: value[0] && Number(value[0]),
        pageSize: 10,
        pageNum: 1,
      },
    });
  };
  render() {
    const { className } = this.props;
    return (
      <div className={classnames(className)}>
        <TreeList
          onSelect={this.treeSelect}
        />
      </div>
    );
  }
}

export default TreeSelect;

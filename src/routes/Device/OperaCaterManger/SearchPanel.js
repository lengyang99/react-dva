import React, { PureComponent } from 'react';
import { Button, Select, Input } from 'antd';
import styles from './index.less';

const Option = Select.Option;
const defaultState = {
  likeValue: '',
};
class SearchPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...defaultState,
    };
  }
    handleLikeValueChange = (e) => {
      this.setState({
        likeValue: e.target.value,
      });
    }
    // 获取
    getSearchValue = () => {
      const {likeValue } = this.state;
      const params = {
        others: likeValue,
      };
      return params;
    }
    // 搜索
    onSearch = () => {
      this.props.handleOnSearch(this.getSearchValue());
    }
    // 重置
    onRest = () => {
      this.setState(defaultState);
      this.props.handleOnRest();
    }
    render() {
      const {parentFunctionKeyData, catergoryData} = this.props;
      const AppliySceneData = [{gid: 'prev_maintain', name: '预防性维护'}, {gid: 'net', name: '巡视'}, {gid: 'check_leak', name: '捡漏'}];
      const AppliyOptions = (AppliySceneData || []).map(item =>
        <Option value={item.gid}>{item.name}</Option>
      );
      return (
        <div className={styles.panel}>
          <div className={styles['field-block']}>
            <label>快速搜索：</label>
            <Input
              className={styles.input}
              placeholder="类型分类"
              value={this.state.likeValue}
              onChange={this.handleLikeValueChange}
            />
          </div>
          {/* <div className={styles['field-block']}>
            <label>应用场景：</label>
            <Select
              className={styles.select}
              value={this.state.parentFunctionKey}
              onChange={this.handleTypeChange}
            >
              { AppliyOptions}
            </Select>
          </div> */}
          <Button
            className={styles['search-button']}
            type="primary"
            onClick={this.onSearch}
          >查询</Button>
          <Button
            onClick={this.onRest}
          >重置</Button>
        </div>
      );
    }
}
export default SearchPanel;


import React, { PureComponent } from 'react';
import { Button, Select, Input } from 'antd';
import styles from './index.less';

const Option = Select.Option;
class SearchPanel extends PureComponent {
    handleTypeChange = (taskCategory) => {
      const {searchStandardParams} = this.props;
      const {likeValue, stateValue} = searchStandardParams || {};
      const searchParams = {likeValue, taskCategory, stateValue};
      this.handleSearchParamsChange(searchParams);
      this.props.handleOnSearch();
    }
    handleLikeValueChange = (e) => {
      const {searchStandardParams} = this.props;
      const {taskCategory, stateValue} = searchStandardParams || {};
      const searchParams = {likeValue: e.target.value, taskCategory, stateValue};
      this.handleSearchParamsChange(searchParams);
    }
    stateChangeHandle = (st) => {
      const {searchStandardParams} = this.props;
      const {taskCategory, likeValue} = searchStandardParams || {};
      const searchParams = {likeValue, taskCategory, stateValue: st.name};
      this.handleSearchParamsChange(searchParams);
      this.props.handleOnSearch();
    };
    handleSearchParamsChange = (params) => {
      this.props.dispatch({
        type: 'operationStandard/searchStandardParamsSave',
        payload: params,
      });
    }
    // 搜索
    onSearch = () => {
      this.props.handleOnSearch();
    }
    // 重置
    onRest = () => {
      this.handleSearchParamsChange({
        likeValue: null,
        taskCategory: null,
        stateValue: null,
      });
      this.props.handleOnSearch();
    }
    render() {
      const {taskTypeData, searchStandardParams} = this.props;
      const {stateValue, taskCategory, likeValue} = searchStandardParams || {};
      const typeOptions = (taskTypeData || []).map(item =>
        <Option key={item.logmark} value={parseInt(item.logmark, 10)}>{item.alias}</Option>
      );
      const State = ({datas, value, onChange}) => {
        const items = datas.map(item =>
          (<label
            className={styles['state-item']}
            style={{color: item.name === value ? '#1C8DF5' : 'default' }}
            onClick={() => { onChange(item); }}
            key={item.name}
          >
            <span>{item.alias}</span></label>));
        return (
          <div style={{display: 'inline-block'}}>
            {items}
          </div>
        );
      };
      const selectValues = [
        { alias: '全部', name: null },
        { alias: '在用', name: 1 },
        { alias: '停用', name: 0 },
      ];
      return (
        <div className={styles.panel}>
          <div className={styles['field-block']}>
            <label><b>作业标准：</b></label>
            <State
              datas={selectValues}
              onChange={(d) => {
                        this.stateChangeHandle(d);
                    }}
              value={stateValue}
            />
          </div>
          <div className={styles['field-block']}>
            <label>类型：</label>
            <Select
              className={styles.select}
              value={taskCategory}
              onChange={this.handleTypeChange}
            >
              <Option key={null} value={null}>全部</Option>
              { typeOptions}
            </Select>
          </div>
          <div className={styles['field-block']}>
            <label>快速搜索：</label>
            <Input
              className={styles.input}
              placeholder="作业标准名称"
              value={likeValue}
              onChange={this.handleLikeValueChange}
            />
          </div>
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


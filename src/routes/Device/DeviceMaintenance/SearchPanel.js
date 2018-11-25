import React from 'react';
import { Button, Select, Input } from 'antd';
import PropTypes from 'prop-types';
import styles from './index.less';

const Option = Select.Option;

const SearchPanel = (props) => {
  const { stationData, searchPlanParams, queryPrePlanList, handleSearchParamsChange} = props;
  const { stationId, others } = searchPlanParams || {};
  const options = (stationData || []).map(item =>
    (<Option key={item.gid}>
      {item.locName}
    </Option>));
  return (
    <div className={styles.panel}>
      <div className={styles['field-block']}>
        <label>搜索：</label>
        <Input
          className={styles.input}
          placeholder="按责任人,计划名称查询"
          value={others}
          onChange={(e) => handleSearchParamsChange({others: e.target.value})}
        />
      </div>
      <div className={styles['field-block']}>
        <label>所属组织：</label>
        <Select
          className={styles.select2}
          value={stationId}
          onChange={(value) => handleSearchParamsChange({stationId: value})}
          allowClear
        >
          {options}
        </Select>
      </div>
      <Button
        className={styles['search-button']}
        type="primary"
        onClick={() => queryPrePlanList()}
      >查询</Button>
      <Button
        onClick={() => queryPrePlanList({pageno: 1, pagesize: 10, stationId: null, others: null })}
      >重置</Button>
    </div>
  );
};
SearchPanel.defaultProps = {
  stationData: [],
  searchPlanParams: {},
  queryPrePlanList: (f) => f,
  handleSearchParamsChange: (f) => f,
};
SearchPanel.propTypes = {
  stationData: PropTypes.array,
  searchPlanParams: PropTypes.object,
  queryPrePlanList: PropTypes.func,
  handleSearchParamsChange: PropTypes.func,
};
export default SearchPanel;


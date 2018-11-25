import React, { PureComponent } from 'react';
import { Row, Col, Select, Button, Icon, Input } from 'antd';
import { connect } from 'dva';
import update from 'immutability-helper';
import styles from './SearchPlan.less';

const Option = Select.Option;
@connect(state => ({
  attachmentTypes: state.attachmentManage.attachmentTypes,
  searchOption: state.attachmentManage.searchOption,
}))
class SearchPlan extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'attachmentManage/fetchAttachmentTypes',
    });
  }
  clickButtonWithType = (type) => {
    switch (type) {
      case 'search':
        this.props.dispatch({
          type: 'attachmentManage/fetchAttachmentList',
          payload: this.props.searchOption,
        });
        break;
      case 'rest':
        this.props.dispatch({
          type: 'attachmentManage/resetSearch',
        });
        break;
      case 'delete':
        break;
      default:
        return 0;
    }
  };
  selectOnchange = (type, inputData) => {
    switch (type) {
      case 'attachmentType':
        this.props.dispatch({
          type: 'attachmentManage/setSearchOption',
          payload: update(this.props.searchOption, {attachmentType: {$set: inputData}}),
        });
        break;
      case 'fileName':
        this.props.dispatch({
          type: 'attachmentManage/setSearchOption',
          payload: update(this.props.searchOption, {fileName: {$set: inputData.target.value}}),
        });
        break;
      default:
        return 0;
    }
  };
  render() {
    const { attachmentTypes } = this.props;
    return (
      <div className={styles.searchbar}>
        <Row gutter={16}>
          <Col span={6}>
            <label htmlFor="">附件类型:</label>
            <Select
              value={this.props.searchOption.attachmentType}
              className={styles.searchbar_select}
              placeholder="请选择文件类型"
              onChange={this.selectOnchange.bind(this, 'attachmentType')}
            >
              {attachmentTypes.map(type => <Option key={type} value={type}>{type}</Option>)}
            </Select>
          </Col>
          <Col span={6}>
            <label htmlFor="">附件名称:</label>
            <Input
              value={this.props.searchOption.fileName}
              className={styles.searchbar_select}
              placeholder="请输入附件名称"
              onChange={this.selectOnchange.bind(this, 'fileName')}
            />
          </Col>
          <Col span={6}>
            <Button className={styles.searchbar_search} type="primary" onClick={this.clickButtonWithType.bind(this, 'search')}>查询</Button>
            <Button className={styles.searchbar_rest} onClick={this.clickButtonWithType.bind(this, 'rest')}>重置</Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default SearchPlan;

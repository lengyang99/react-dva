import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import { connect } from 'dva';
import { Row, Col, Select, Button, Icon } from 'antd';
import styles from './SearchPlan.less';


const Option = Select.Option;
@connect(state => ({
  module: state.PcAppMapConfig.searchHistory.module,
  ecode: state.PcAppMapConfig.searchHistory.ecode,
  ecodeList: state.PcAppMapConfig.ecodeList,
}))
class SearchPlan extends PureComponent {
  static propTypes = {
  };
  static defaultProps = {
  };
  componentDidMount() {
    this.props.dispatch({
      type: 'PcAppMapConfig/fetchEcodeListData',
    });
    this.props.dispatch({
      type: 'PcAppMapConfig/fetchListData',
      payload: {
        ecode: undefined,
        module: undefined,
      },
    });
  }
  clickButtonWithType = (type) => {
    switch (type) {
      case 'new':
        this.props.dispatch({
          type: 'PcAppMapConfig/showModal',
          payload: true,
        });
        this.props.dispatch({
          type: 'PcAppMapConfig/setDetailData',
          payload: {
            module: undefined,
            ecode: undefined,
            name: [],
          },
        });
        break;
      case 'rest':
        this.props.dispatch({
          type: 'PcAppMapConfig/saveSearchHistory',
          payload: {
            ecode: undefined,
            module: undefined,
          },
        });
        this.props.dispatch({
          type: 'PcAppMapConfig/fetchListData',
          payload: {
            ecode: undefined,
            module: undefined,
          },
        });
        break;
      case 'search':
        this.props.dispatch({
          type: 'PcAppMapConfig/fetchListData',
          payload: {
            ecode: this.props.ecode,
            module: this.props.module,
          },
        });
        break;
      case 'delete':
        break;
      default:
        break;
    }
  }
  selectOnchange = (types, value) => {
    this.props.dispatch({
      type: 'PcAppMapConfig/saveSearchHistory',
      payload: {[types]: value},
    });
  };
  render() {
    const { module, ecode, ecodeList } = this.props;
    return (
      <div className={styles.searchbar}>
        <Row gutter={16}>
          <Col span={6}>
            <label htmlFor="">所属平台:</label>
            <Select
              className={styles.searchbar_select}
              placeholder="请选择"
              onChange={this.selectOnchange.bind(this, 'module')}
              value={module}
            >
              <Option value="pc" key="pc">PC端</Option>
              <Option value="app" key="app">移动端</Option>
            </Select>
          </Col>
          <Col span={6}>
            <label htmlFor="">企业名称:</label>
            <Select
              className={styles.searchbar_select}
              placeholder="请选择"
              onChange={this.selectOnchange.bind(this, 'ecode')}
              value={ecode}
            >
              {ecodeList.map(item => (
                <Option value={item.ecode} key={item.name}>{item.name}</Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Button className={styles.searchbar_search} type="primary" onClick={this.clickButtonWithType.bind(this, 'search')}>查询</Button>
            <Button className={styles.searchbar_rest} onClick={this.clickButtonWithType.bind(this, 'rest')}>重置</Button>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col>
            <Button className={styles.searchbar_add} type="primary" onClick={this.clickButtonWithType.bind(this, 'new')} ><Icon type="plus" />新建</Button>
            {/*<Button className={styles.searchbar_delete} onClick={this.clickButtonWithType.bind(this, 'delete')} ><Icon type="delete" />删除</Button>*/}
          </Col>
        </Row>
      </div>
    );
  }
}

export default SearchPlan;

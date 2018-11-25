import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import { Input, Select, notification } from 'antd';
import styles from './LinkHeader.less';
import { fetchPositionType } from '../../../services/eqLedger';

const Option = Select.Option;

class LinkHeader extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      SelectOption: [],
    };
  }
  componentDidMount() {
    fetchPositionType().then((data) => {
      if (data.success) {
        this.setState({
          SelectOption: data.data,
        });
      } else {
        notification.error({
          message: '位置类型获取失败',
        });
      }
    });
  }
  getOptions = (arr) => {
    const children = [];
    if (Array.isArray(arr)) {
      arr.forEach((value, index) => {
        const options = arr[index];
        children.push(
          <Option key={options.value} value={options.value}>{options.text}</Option>
        );
      });
    }
    return children;
  };
  render() {
    const {locType, locName} = this.props;
    return (
      <div className={styles.head}>
        <div className={styles.head__item}>
          <label className={styles.head__label} htmlFor="id">位置类型 :</label>
          <Select className={styles.head__input} value={locType} placeholder="请选择" disabled >{this.getOptions(this.state.SelectOption)}</Select>
        </div>
        <div className={styles.head__item}>
          <label className={styles.head__label} htmlFor="name">位置名称 :</label>
          <Input className={styles.head__input} value={locName} id="name" disabled />
        </div>
      </div>
    );
  }
}

LinkHeader.propTypes = {
  locType: propTypes.string,
  locName: propTypes.string,
};

LinkHeader.defaultProps = {
  locType: '',
  locName: '',
};

export default LinkHeader;

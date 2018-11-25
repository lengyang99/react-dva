import React, {PureComponent} from 'react';
import { Input, AutoComplete } from 'antd';
import propTypes from 'prop-types';
import styles from './DialogForm.less';
import ErrorMessage from './DialogFormErrorMessage';

const Option = AutoComplete.Option;

const filterOption = (inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;

const getOptions = list => list.map(option => <Option value={option.id.toString()} key={option.id.toString()}>{option.name}</Option>);

export default class DialogFormItem extends PureComponent {
  static propTypes = {
    display: propTypes.bool.isRequired,
    title: propTypes.string.isRequired,
    value: propTypes.string.isRequired,
    onChange: propTypes.func.isRequired,
    disabled: propTypes.bool.isRequired,
    nameError: propTypes.bool.isRequired,
    nameErrorMessage: propTypes.string.isRequired,
    codeValue: propTypes.string.isRequired,
    codeDisabled: propTypes.bool.isRequired,
    codeError: propTypes.bool.isRequired,
    codeErrorMessage: propTypes.string.isRequired,
    dataSource: propTypes.array.isRequired,
  };
  render() {
    const {
      display,
      title,
      value,
      onChange,
      disabled,
      dataSource,
      nameError,
      nameErrorMessage,
      codeValue,
      codeDisabled,
      codeError,
      codeErrorMessage,
    } = this.props;
    return (display ?
      <div className={styles.malfunction__form__item}>
        <p className={styles.malfunction__form__title}>{title}</p>
        <div className={styles.malfunction__form__item__sub}>
          <label className={styles.malfunction__form__label}>描述 :</label>
          <AutoComplete
            allowClear
            className={styles.malfunction__form__input__left}
            placeholder={`请输入 or 选择${title}`}
            value={value}
            onChange={onChange.bind('', 'describe')}
            disabled={disabled}
            filterOption={filterOption}
            dataSource={getOptions(dataSource)}
          />
          <ErrorMessage flag={nameError} message={nameErrorMessage} />
        </div>
        <div className={styles.malfunction__form__item__sub}>
          <label className={styles.malfunction__form__label}>代码 : </label>
          <Input
            placeholder={`请输入${title}代码`}
            className={styles.malfunction__form__input__right}
            onChange={onChange.bind('', 'code')}
            value={codeValue}
            disabled={!codeDisabled}
          />
          <ErrorMessage flag={codeError} message={codeErrorMessage} />
        </div>
      </div> : null);
  }
}

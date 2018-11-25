import React, { PureComponent } from 'react';
import { Input, Checkbox } from 'antd';
import { connect } from 'dva';
import propTypes from 'prop-types';
import update from 'immutability-helper';
import classnames from 'classnames';
import styles from './DialogForm.less';
import DialogFormItem from './DialogFormItem';
import ErrorMessage from './DialogFormErrorMessage';

const types = ['classify', 'malfunction', 'reason', 'solution'];

/**
 * @desc 根据条件,过滤数据,获取数据的 children 列表
 * @param {Array} list
 * @param {string} option
 * @returns {Object}
 */
const filterData = (list, option) => {
  let result = {
    list: [],
    name: '',
    id: '',
    parentId: '',
    code: '',
  };
  list.forEach((ele) => {
    if (parseInt(ele.id, 10) === parseInt(option, 10)) {
      result = {
        list: Array.isArray(ele.children) ? ele.children : [],
        name: ele.name,
        id: ele.id,
        parentId: ele.pid,
        code: ele.data.code,
      };
    }
  });
  return result;
};

const empty = { id: '', name: '', code: '', isNew: true };

@connect(
  state => ({
    list: state.malfunction.list,
    modalOption: state.malfunction.modalOption,
    formValidateFiled: state.malfunction.formValidateFiled,
    formList: state.malfunction.formList,
  })
)
export default class DialogForm extends PureComponent {
  static propTypes = {
    list: propTypes.array.isRequired,
    modalOption: propTypes.object.isRequired,
    formList: propTypes.object.isRequired,
    formValidateFiled: propTypes.object.isRequired,
  };
  initFormValidateFiled() {
    this.props.dispatch({ type: 'malfunction/initFormValidateFiled' });
  }
  /**
   * @desc 故障分类改变
   * @param {string} type - 故障分类的改变字段是 ['describe' | 'code']
   * @param {string} value - 改变值
   */
  onChangeClassify = (type, value) => {
    this.initFormValidateFiled();
    const result = filterData(this.props.list, value);
    if (type === 'describe') {
      this.props.dispatch({
        type: 'malfunction/setFormList',
        payload: update(this.props.formList, {
          malfunctionList: { $set: result.list },
        }),
      });
      this.props.dispatch({
        type: 'malfunction/setModalOption',
        payload: update(this.props.modalOption, {
          classify: { $merge: { id: result.id ? result.id : value, name: result.id ? result.name : value, code: result.code, isNew: !result.id, parentId: result.parentId } },
          malfunction: { $merge: empty },
          reason: { $merge: empty },
          solution: { $merge: empty },
        }),
      });
    } else {
      this.props.dispatch({
        type: 'malfunction/setModalOption',
        payload: update(this.props.modalOption, {
          classify: { $merge: { code: value.target.value } },
        }),
      });
    }
  };
  /**
   * @desc 故障 change 事件
   * @param {string} type - ['describe' | 'edit']
   * @param {string} value
   */
  onChangeMalfunction = (type, value) => {
    this.initFormValidateFiled();
    const result = filterData(this.props.formList.malfunctionList, value);
    if (type === 'describe') {
      this.props.dispatch({
        type: 'malfunction/setFormList',
        payload: update(this.props.formList, {
          reasonList: { $set: result.list },
        }),
      });
      this.props.dispatch({
        type: 'malfunction/setModalOption',
        payload: update(this.props.modalOption, {
          malfunction: { $merge: { id: result.id ? result.id : value, name: result.id ? result.name : value, code: result.code, isNew: !result.id, parentId: result.parentId } },
          reason: { $merge: empty },
          solution: { $merge: empty },
        }),
      });
    } else {
      this.props.dispatch({
        type: 'malfunction/setModalOption',
        payload: update(this.props.modalOption, {
          malfunction: { $merge: { code: value.target.value } },
        }),
      });
    }
  };
  /**
   * @desc 原因 change 事件
   * @param {string} type - ['describe' | 'edit']
   * @param {string} value - 变化值
   */
  onChangeReason = (type, value) => {
    this.initFormValidateFiled();
    const result = filterData(this.props.formList.reasonList, value);
    if (type === 'describe') {
      this.props.dispatch({
        type: 'malfunction/setFormList',
        payload: update(this.props.formList, {
          solutionList: { $set: result.list },
        }),
      });
      this.props.dispatch({
        type: 'malfunction/setModalOption',
        payload: update(this.props.modalOption, {
          reason: { $merge: { id: result.id ? result.id : value, name: result.id ? result.name : value, code: result.code, isNew: !result.id, parentId: result.parentId } },
          solution: { $merge: empty },
        }),
      });
    } else {
      this.props.dispatch({
        type: 'malfunction/setModalOption',
        payload: update(this.props.modalOption, {
          reason: { $merge: { code: value.target.value } },
        }),
      });
    }
  };
  /**
   * @desc 解决方案 change 事件
   * @param {string} type - ['describe' | 'code']
   * @param e
   */
  onChangeSolution = (type, e) => {
    this.initFormValidateFiled();
    if (type === 'describe') {
      this.props.dispatch({
        type: 'malfunction/setModalOption',
        payload: update(this.props.modalOption, { solutionR: { $merge: { id: '', name: e.target.value, isNew: true } } }),
      });
    } else {
      this.props.dispatch({
        type: 'malfunction/setModalOption',
        payload: update(this.props.modalOption, { solutionR: { $merge: { id: '', code: e.target.value, isNew: true } } }),
      });
    }
  };
  /**
   * @desc 修改故障是否活动
   * @param {object} e - dom 事件对象
   */
  onChangeActive = (e) => {
    this.props.dispatch({
      type: 'malfunction/setModalOption',
      payload: update(this.props.modalOption, { isActive: { $set: e.target.checked ? '1' : '0' } }),
    });
  };

  render() {
    const { modalOption, formValidateFiled, list } = this.props;
    const { malfunctionList, reasonList, solutionList } = this.props.formList;
    const index = types.indexOf(modalOption.modalType) > -1 ? types.indexOf(modalOption.modalType) : types.length - 1; // 判断编辑具体为哪一项
    return (
      <div className={styles.malfunction__form}>
        <DialogFormItem
          display
          title="故障分类"
          value={modalOption.classify.id}
          onChange={this.onChangeClassify}
          disabled={modalOption.classify.active}
          dataSource={list}
          nameError={formValidateFiled.classify.nameError}
          nameErrorMessage={formValidateFiled.classify.nameErrorMessage}
          codeValue={modalOption.classify.code}
          codeDisabled={modalOption.classify.isNew}
          codeError={formValidateFiled.classify.codeError}
          codeErrorMessage={formValidateFiled.classify.codeErrorMessage}
        />
        <DialogFormItem
          display={index >= 1}
          title="故障"
          value={modalOption.malfunction.id}
          onChange={this.onChangeMalfunction}
          disabled={modalOption.malfunction.active}
          dataSource={malfunctionList}
          nameError={formValidateFiled.malfunction.nameError}
          nameErrorMessage={formValidateFiled.malfunction.nameErrorMessage}
          codeValue={modalOption.malfunction.code}
          codeDisabled={modalOption.malfunction.isNew}
          codeError={formValidateFiled.malfunction.codeError}
          codeErrorMessage={formValidateFiled.malfunction.codeErrorMessage}
        />
        <DialogFormItem
          display={index >= 2}
          title="故障原因"
          value={modalOption.reason.id}
          onChange={this.onChangeReason}
          disabled={modalOption.reason.active}
          dataSource={reasonList}
          nameError={formValidateFiled.reason.nameError}
          nameErrorMessage={formValidateFiled.reason.nameErrorMessage}
          codeValue={modalOption.reason.code}
          codeDisabled={modalOption.reason.isNew}
          codeError={formValidateFiled.reason.codeError}
          codeErrorMessage={formValidateFiled.reason.codeErrorMessage}
        />
        {index >= 3 ?
          <div>
            <div className={styles.malfunction__form__item}>
              <p className={styles.malfunction__form__title}>维修措施</p>
              <div className={styles.malfunction__form__item__sub}>
                <label className={styles.malfunction__form__label}>描述 :</label>
                <Input
                  placeholder="请输入维修措施"
                  className={styles.malfunction__form__input__left}
                  onChange={this.onChangeSolution.bind('', 'describe')}
                  value={modalOption.solutionR.name}
                />
                <ErrorMessage flag={formValidateFiled.solutionR.nameError} message={formValidateFiled.solutionR.nameErrorMessage} />
              </div>
              <div className={styles.malfunction__form__item__sub}>
                <label className={styles.malfunction__form__label}>代码 : </label>
                <Input
                  className={styles.malfunction__form__input__right}
                  value={modalOption.solutionR.code}
                  onChange={this.onChangeSolution.bind('', 'code')}
                  placeholder="请输入代码"
                />
                <ErrorMessage flag={formValidateFiled.solutionR.codeError} message={formValidateFiled.solutionR.codeErrorMessage} />
              </div>
            </div>
            <div className={styles.malfunction__form__item}>
              <label className={classnames(styles.malfunction__form__label__full, 'align-top')}>已有措施 :</label>
              <div className={styles.malfunction__form__input}>
                {reasonList.length === 0 ? '无' : solutionList.map(ele => <p key={ele.id}>{ele.name}</p>)}
              </div>
            </div>
          </div> : null}
        <div className={styles.malfunction__info}>
          <div className={styles.malfunction__info__item}>
            <label className={styles.malfunction__info__label}>引用次数 :</label>
            <Input className={styles.malfunction__info__input} disabled value={modalOption.quoteCount} />
          </div>
          <div className={styles.malfunction__info__item}>
            <label className={styles.malfunction__info__label}>所属组织 :</label>
            <Input className={styles.malfunction__info__input} disabled value={modalOption.organization} />
          </div>
          <div className={styles.malfunction__info__item}>
            <label className={styles.malfunction__info__label}>是否活动 :</label>
            <Checkbox onChange={this.onChangeActive} checked={modalOption.isActive === '1'} className={styles.malfunction__info__input} />
          </div>
        </div>
      </div>
    );
  }
}

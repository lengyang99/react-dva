import React, { PureComponent } from 'react';
import { Button, Modal } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import { find } from 'lodash';
import propTypes from 'prop-types';
import formValidate, { fieldValidate, typeList } from './formValidate';
import DialogForm from './DialogForm';
import styles from './Dialog.less';

/**
 * @desc 表单提交数据格式化
 * @param {object} data - 需要格式化的数据
 * @return {{classify: {description, failCode, gid: string}, malfunction: {description, failCode, gid: string}, reason: {description, failCode, gid: string}, solution: {description: (string|*), failCode: (string|*), gid: string}, active}}
 */
const dataFormat = (data) => {
  return {
    classify: {
      description: data.classify.name,
      failCode: data.classify.code,
      gid: data.classify.isNew ? '' : data.classify.id,
    },
    malfunction: {
      description: data.malfunction.name,
      failCode: data.malfunction.code,
      gid: data.malfunction.isNew ? '' : data.malfunction.id,
    },
    reason: {
      description: data.reason.name,
      failCode: data.reason.code,
      gid: data.reason.isNew ? '' : data.reason.id,
    },
    solution: {
      description: data.solutionR.name,
      failCode: data.solutionR.code,
      gid: data.solutionR.isNew ? '' : data.solution.id,
    },
    active: data.isActive,
  };
};
@connect(
  state => ({
    visible: state.malfunction.visible,
    modalOption: state.malfunction.modalOption,
    formValidateFiled: state.malfunction.formValidateFiled,
    modalEditOptionId: state.malfunction.modalEditOptionId,
    userName: state.login.user.trueName,
    company: state.login.user.company,
  })
)
export default class Dialog extends PureComponent {
  static propTypes = {
    visible: propTypes.bool.isRequired,
    userName: propTypes.string,
    company: propTypes.string,
    modalOption: propTypes.object.isRequired,
    modalEditOptionId: propTypes.string.isRequired,
    formValidateFiled: propTypes.object.isRequired,
  };
  static defaultProps = {
    userName: '',
    company: '',
  };
  /**
   * @desc 表单提交
   */
  onSubmit = () => {
    let result;
    // 判断是编辑 or 新增
    if (this.props.modalOption.isEdit) {
      const data = this.props.modalOption.editName === 'solution' ? this.props.modalOption.solutionR : this.props.modalOption[this.props.modalOption.editName];
      result = fieldValidate(Object.assign(data, find(typeList, { type: this.props.modalOption.editName === 'solution' ? 'solutionR' : this.props.modalOption.editName })));
      const editName = this.props.modalOption.editName === 'solution' ? 'solutionR' : this.props.modalOption.editName;
      if (result[editName].codeError || result[editName].nameError) {
        this.props.dispatch({
          type: 'malfunction/setFormValidMessage',
          payload: {
            ...this.props.formValidateFiled,
            ...result,
          },
        });
      } else {
        this.props.dispatch({
          type: 'malfunction/updateMalfunction',
          payload: {
            failCode: data.code,
            description: data.name,
            gid: this.props.modalEditOptionId,
            active: this.props.modalOption.isActive,
          },
        });
      }
    } else {
      // 新增表单验证
      result = formValidate(this.props.modalOption);
      if (result.flag) {
        this.props.dispatch({
          type: 'malfunction/postMalfunction',
          payload: dataFormat(this.props.modalOption),
        });
      } else {
        this.props.dispatch({
          type: 'malfunction/setFormValidMessage',
          payload: {
            ...this.props.formValidateFiled,
            ...result.data,
          },
        });
      }
    }
  };
  /**
   * @desc 弹框取消
   */
  handleCancel = () => {
    this.props.dispatch({
      type: 'malfunction/toggleModal',
      payload: false,
    });
  };
  afterClose = () => {
    this.props.dispatch({
      type: 'malfunction/setFormList',
      payload: { malfunctionList: [], reasonList: [], solutionList: [] },
    });
  };

  render() {
    const { visible, userName, company } = this.props;
    return (
      <Modal
        visible={visible}
        title="故障体系"
        width={530}
        onCancel={this.handleCancel}
        afterClose={this.afterClose}
        className="malfunction__dialog"
        footer={
          <div>
            <Button type="primary" onClick={this.onSubmit}>确定</Button>
            <Button onClick={this.handleCancel}>取消</Button>
          </div>}
      >
        <DialogForm />
        <p className={styles.malfunction__dialog__info}>
          <span>变更人: </span>
          <span>{`${userName}-${company}`}</span>
          <span>{moment(Date.now()).format('YYYY/MM/DD HH:mm')}</span>
        </p>
      </Modal>
    );
  }
}

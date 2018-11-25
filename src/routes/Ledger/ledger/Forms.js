import React, { Component } from 'react';
import { Form } from 'antd';
import { connect } from 'dva';
import update from 'immutability-helper';
import moment from 'moment';
import Basic from './Basic';
import Detail from './Detail';

class Forms extends Component {
  render() {
    return (
      <Form>
        <Basic form={this.props.form} eqDetail={this.props.eqDetail} />
        <Detail form={this.props.form} eqDetail={this.props.eqDetail} />
      </Form>
    );
  }
}

export default connect(
  state => ({
    eqDetail: state.ledger.eqDetail,
    ecode: state.login.user.ecode,
  })
)(
  Form.create({
    mapPropsToFields: (props) => ({
      id: Form.createFormField({ value: props.eqDetail.id }),
      name: Form.createFormField({ value: props.eqDetail.name }),
      classify: Form.createFormField({ value: props.eqDetail.classify }),
      organization: Form.createFormField({ value: props.eqDetail.organization }),
      organizationName: Form.createFormField({ value: props.eqDetail.organizationName }),
      site: Form.createFormField({ value: props.eqDetail.site }),
      area: Form.createFormField({ value: props.eqDetail.area }),
      position: Form.createFormField({ value: props.eqDetail.position }),
      positionName: Form.createFormField({ value: props.eqDetail.positionName }),
      type: Form.createFormField({ value: props.eqDetail.type }),
      perfect: Form.createFormField({ value: props.eqDetail.perfect }),
      isSpecial: Form.createFormField({ value: props.eqDetail.isSpecial }),
      model: Form.createFormField({ value: props.eqDetail.model }),
      company: Form.createFormField({ value: props.eqDetail.company }),
      manufacturer: Form.createFormField({ value: props.eqDetail.manufacturer }),
      installDate: Form.createFormField({ value: props.eqDetail.installDate ? moment(props.eqDetail.installDate) : undefined }),
      person: Form.createFormField({ value: props.eqDetail.person }),
      importantLevel: Form.createFormField({ value: props.eqDetail.importantLevel }),
      productionDate: Form.createFormField({ value: props.eqDetail.productionDate ? moment(props.eqDetail.productionDate) : undefined }),
      code: Form.createFormField({ value: props.eqDetail.code }),
      malfunction: Form.createFormField({ value: props.eqDetail.malfunction }),
      material: Form.createFormField({ value: props.eqDetail.material }),
      provider: Form.createFormField({ value: props.eqDetail.provider }),
      qualityDate: Form.createFormField({ value: props.eqDetail.qualityDate ? moment(props.eqDetail.qualityDate) : undefined }),
      fixedCode: Form.createFormField({ value: props.eqDetail.fixedCode }),
      status: Form.createFormField({ value: props.eqDetail.status }),
      nextRepairDate: Form.createFormField({ value: props.eqDetail.nextRepairDate ? moment(props.eqDetail.nextRepairDate) : undefined}),
      nextRepairLevel: Form.createFormField({ value: props.eqDetail.nextRepairLevel }),
      proDefineNumber: Form.createFormField({ value: props.eqDetail.proDefineNumber }),
      oldEqCode: Form.createFormField({ value: props.eqDetail.oldEqCode }),
      ccode: Form.createFormField({ value: props.eqDetail.ccode }),
    }),
    onValuesChange(props, fields) {
      const key = Object.keys(fields)[0];
      let value = '';
      // 判断如果是时间格式的,需要格式化时间传给后台
      if (['installDate', 'productionDate', 'qualityDate', 'nextRepairDate'].indexOf(key) > -1) {
        value = fields[key] !== 'null' ? fields[key].format('YYYY-MM-DD HH:mm:ss') : undefined;
      } else {
        value = fields[key];
      }
      // 表单如果是 classify or site 类型的,需要根据 site or classify 获取 eqCode
      if (key === 'classify' && fields[key] && props.eqDetail.site && props.eqDetail.gid === undefined) {
        props.dispatch({
          type: 'ledger/fetchEqCode',
          payload: {
            params: { clsCode: fields[key], stationId: props.eqDetail.site },
            eqDetail: update(props.eqDetail, { $merge: { classify: fields[key] } }),
          },
        });
      } else if (key === 'site' && fields[key] && props.eqDetail.classify && props.eqDetail.gid === undefined) {
        props.dispatch({
          type: 'ledger/fetchEqCode',
          payload: {
            params: { clsCode: props.eqDetail.classify, stationId: fields[key] },
            eqDetail: update(props.eqDetail, { $merge: { site: fields[key] } }),
          },
        });
      } else {
        props.dispatch({
          type: 'ledger/setEqDetail',
          payload: update(props.eqDetail, { $merge: { [key]: value, isEdit: true } }),
        });
      }
    },
  })(Forms)
);

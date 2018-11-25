import React from 'react';
import moment from 'moment';
import { Form, Button, Row, Col, Input, Select, Icon, InputNumber, DatePicker } from 'antd';
import {ContentTip} from './common';
import PanelCtrl from './PanelCtrl';

import styles from './style.less';

const FormItem = Form.Item;
const {Option} = Select;

const empty = () => {};

const fieldMng = { // 字段配置信息
  getItems(flds, item, change) {
    const {key, field} = item;
    const [{lx = 'string', values = []} = {}] = flds.filter(x => x.name === field);
    return [
      {lx: 'dropdown', alias: '关系', key: 'relation', values: 'and-且,or-或'},
      {lx: 'dropdown', alias: '字段', key: 'field', values: flds.map(o => `${o.name}-${o.alias}`).join(','), props: {onChange(val) { change({key, field: val}); }}},
      {lx: 'dropdown', alias: '匹配', key: 'match', values: fieldMng[lx].match},
      {lx, alias: '字段值', key: 'value', values: values.map(o => `${o.dbval}-${o.dispval}`).join(',')},
    ];
  },
  string: {
    getForm(fld, item, required, edite, props) {
      return {
        value: item[fld.key],
        rules: [{required, message: edite && `${fld.alias}必须输入!`}],
        component: <Input placeholder={edite && `请输入${fld.alias}` || '<空>'} disabled={!edite} {...props} />,
      };
    },
    match: '=-等于,like-模糊',
  },
  dropdown: {
    getForm(fld, item, required, edite, props) {
      const values = fld.values.split(',').map(o => { const arr = o.split('-'); return {dbval: arr[0], dispval: arr[1]}; });
      return {
        value: item[fld.key],
        rules: [{required, message: `${fld.alias}必须选择!`}],
        component: (
          <Select placeholder={edite && `请选择${fld.alias}` || '<空>'} disabled={!edite} {...props} >{values.map((obj, i) => <Option key={`${i * 1}`} value={obj.dbval}>{obj.dispval}</Option>)}</Select>
        ),
      };
    },
    match: '=-等于',
  },
  int: {
    getForm(fld, item, required, edite, props) {
      return {
        value: item[fld.key],
        rules: [{required, message: `${fld.alias}必须输入!`}],
        component: <InputNumber placeholder={edite && `请输入${fld.alias}` || '<空>'} disabled={!edite} style={{width: '100%'}} {...props} />,
      };
    },
    match: '=-等于,<-小于,>-大于,<=-小于等于,>=-大于等于',
  },
  date: {
    getForm(fld, item, required, edite, props) {
      const value = item[fld.key];
      return {
        value: value && moment(value.replace(/-/g, '/'), 'YYYY/MM/DD hh:mm:ss') || undefined,
        rules: [{required, message: `${fld.alias}必须输入!`}],
        component: <DatePicker style={{width: '100%'}} disabled={!edite} showTime format="YYYY-MM-DD HH:mm:ss" {...props} />,
      };
    },
    match: '=-等于,<-小于,>-大于,<=-小于等于,>=-大于等于',
  },
};

@Form.create()
export default class Control extends React.Component {
  render() {
    const {gutter = 8, span = [3, 6, 4, 9, 2], flds = [], items = [], form: {getFieldDecorator, setFieldsValue}, edite, delItem = empty, changeFld = empty, onSubmit = empty} = this.props;
    const change = (obj) => {
      const {key} = obj;
      setFieldsValue({[`match_${key}`]: '=', [`value_${key}`]: undefined});
      changeFld(obj);
    };
    return (
      <PanelCtrl
        header={(
          <div className={styles.fileForm_header}>
            {<Row gutter={gutter}>{['关系', '字段', '匹配', '字段值', '删除'].map((item, idx) => <Col key={`col_${idx * 1}`} span={span[idx]}> {item} </Col>)}</Row>}
          </div>
        )}
      >
        <Form
          style={{height: '100%'}}
          onSubmit={(e) => {
            this.props.form.validateFields((err, values) => {
              e.preventDefault();
              if (!err) onSubmit(values);
            });
          }}
        >
          <div className={styles.fileForm}>
            {
              Array.isArray(items) && items.length > 0 ? items.map((item, fdx) => {
                const {key} = item;
                const fields = fieldMng.getItems(flds, item, change);
                return (
                  <Row gutter={gutter} key={key}>
                    {
                      fields.map((cfg, idx) => {
                        if (fdx === 0 && idx === 0) return <div className={styles.fileForm_filter}><Icon type="filter" /></div>;
                        const {value: initialValue, rules = [], component} = fieldMng[cfg.lx].getForm(cfg, item, true, edite, cfg.props);
                        return <FormItem>{getFieldDecorator(`${cfg.key}_${key}`, {initialValue, rules})(component)}</FormItem>;
                      }).concat(<Button disabled={!edite} style={{margin: '4px 0'}} icon="delete" type="primary" onClick={() => delItem(key)} />)
                      .map((data, idx) => <Col key={`${idx * 1}`} span={span[idx]}> {data} </Col>)
                    }
                  </Row>
                );
              }) : <ContentTip msg="请添加条件" />
            }
          </div>
        </Form>
      </PanelCtrl>
    );
  }
}

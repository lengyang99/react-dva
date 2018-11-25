import React, {PureComponent} from 'react';
import {Input, Form} from 'antd';
import PropTypes from 'prop-types';
import styles from './DutyTab.less';

const TextArea = Input.TextArea;
const Item = Form.Item;
@Form.create()
class DutyTab extends PureComponent {
  render() {
    const {data, disable, handleDataChange} = this.props;
    console.log(data, '这个时候');
    const {getFieldDecorator} = this.props.form;
    const panes = (data || []).map((item, index) => {
      const items = item.items;
      const count = items.length;
      let forms = '';
      if (count === 1) {
        forms = items.map(form =>
          (
            <Item>
              {getFieldDecorator(`${item.rzgroup}`, {initialValue: form.defaultvalue || form.itemvalue})(
                <TextArea
                  className={styles.textArea}
                  onChange={(e) => { handleDataChange(e.target.value, form.gid, index); }}
                  readOnly={disable}
                />)}
            </Item>)
        );
      } else {
        // 每行3组
        forms = items.map(form => (
          <Item className={styles.form_item}>
            <label className={styles.form_label}>{form.rzitem}</label>
            {getFieldDecorator(`${form.rzitem}`, {initialValue: form.defaultvalue || form.itemvalue})(
              <Input
                className={styles.form_input}
                onChange={(e) => { handleDataChange(e.target.value, form.gid, index); }}
                readOnly={disable}
              />)}
            <label className={styles.form_unit}>{form.unit}</label>
          </Item>)
        );
      }
      return (<div style={{marginTop: 30}}>
        <label>{item.rzgroup}</label>
        <hr style={{marginBottom: 20}} />
        <div>
          <Form>{forms}</Form>
        </div>
      </div>);
    }
    );

    return (
      <div style={{minWidth: '1100px'}}>
        {panes}
      </div>
    );
  }
}

DutyTab.defaultProps = {
  data: [],
};

DutyTab.propTypes = {
  data: PropTypes.array,
};

export default DutyTab;

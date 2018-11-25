import React, { PureComponent } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Row, Button, Form, Input, Checkbox, Select } from 'antd';
import FeedbackTable from './FeedbackTable';
import FilterPlan from './FilterPlan';
import styles from './DetialForm.less';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(state => ({
  configDetial: state.PatrolTargetConfig.configDetial,
  typeOptions: state.PatrolTargetConfig.typeOptions,
  layerNameOptions: state.PatrolTargetConfig.layerNameOptions,
  feedbackList: state.PatrolTargetConfig.feedbackList,
  filterDataSource: state.PatrolTargetConfig.filterDataSource,
}))
@Form.create({
  mapPropsToFields(props) {
    return {
      name: Form.createFormField({ value: props.configDetial.name }),
      layername: Form.createFormField({ value: props.configDetial.layername }),
      type: Form.createFormField({ value: props.configDetial.type }),
      isfeedback: Form.createFormField({ value: props.configDetial.isfeedback }),
    };
  },
  onValuesChange(props, value) {
    props.dispatch({
      type: 'PatrolTargetConfig/configValuesChange',
      payload: value,
    });
    // 根据选择的图层名称，更换筛选条件下拉值
    if (value.layername) {
      props.layerNameOptions.forEach(item => {
        if (item.dno.toString() === value.layername.toString()) {
          props.dispatch({
            type: 'PatrolTargetConfig/setFilterOptions',
            payload: item.fields,
          });
        }
      });
    }
  },
})
export default class DetialForm extends PureComponent {
  componentDidMount() {
    const { layerNameOptions } = this.props;
    this.tool = this.props.location;
    if (this.tool.detailData) {
      localStorage.setItem('patrolTargetConfigDetail', JSON.stringify(this.tool));
    } else {
      const dataString = localStorage.getItem('patrolTargetConfigDetail');
      this.tool = JSON.parse(dataString);
    }
    this.props.dispatch({
      type: 'PatrolTargetConfig/setConfigDetial',
      payload: this.tool.detailData,
    });
    // 获取过滤filter下拉指选项
    if (this.tool.detailData.layername) {
      layerNameOptions.forEach(item => {
        if (item.dno.toString() === this.tool.detailData.layername.toString()) {
          this.props.dispatch({
            type: 'PatrolTargetConfig/setFilterOptions',
            payload: item.fields,
          });
        }
      });
    } else {
      this.props.dispatch({
        type: 'PatrolTargetConfig/setFilterOptions',
        payload: [],
      });
    }
    /*
      filter = ["gid", ">", "'1'", "and", "oid", "~", "'21'", "or", "org", "=", "'廊坊'"]
     */
    // 获取filter过滤列表
    if (this.tool.detailData.gid && this.tool.detailData.filter !== '') {
      let [...arr] = this.tool.detailData.filter ? JSON.parse(this.tool.detailData.filter) : [];
      let temp = [];
      let list = [];
      arr.unshift('0');
      for (let i = 0, len = arr.length; i < len; i += 4) {
        temp.push(arr.slice(i, i + 4));
      }
      temp.forEach((item, i) => {
        list.push({
          relation: i ? item[0] : undefined,
          term: item[1],
          mark: item[2],
          value: item[3] ? item[3].replace(/['"\\/\b\f\n\r\t]/g, '') : '',
        });
      });
      this.props.dispatch({
        type: 'PatrolTargetConfig/setFilterData',
        payload: list,
      });
    } else {
      this.props.dispatch({
        type: 'PatrolTargetConfig/setFilterData',
        payload: [],
      });
    }

    this.props.dispatch({
      type: 'PatrolTargetConfig/fetchTypeOptionData',
    });
    if (this.tool.detailData.gid) {
      this.props.dispatch({
        type: 'PatrolTargetConfig/fetchFeedbackTableData',
        payload: {
          layerid: this.tool.detailData.gid,
        },
      });
    }
  }
  handleClick = (type) => {
    const { feedbackList, configDetial, filterDataSource } = this.props;
    // 把筛选条件拼接转成数组
    /*
      filterDataSource: [
      {
        index: 0,
        term: 'gid',
        mark: '<',
        value: '10',
      },
      {
        index: 1,
        term: 'gid',
        mark: '>',
        value: '10',
        relation: 'and',
      },
    ],
     */
    let filterArr = [];
    if (filterDataSource.length) {
      filterDataSource.forEach((item, i) => {
        if (i !== 0) {
          filterArr.push(item.relation);
        }
        filterArr.push(item.term);
        filterArr.push(item.mark);
        filterArr.push(`'${item.value}'`);
      });
    }
    let filter = filterArr.length ? JSON.stringify(filterArr) : '';
    switch (type) {
      case 'back': // 返回
        this.props.dispatch(routerRedux.push(this.tool.historyPageName));
        this.props.dispatch({
          type: 'PatrolTargetConfig/setFilterOptions',
          payload: [],
        });
        break;
      case 'submit':
        this.props.form.validateFields((err, value) => {
          if (!err) {
            if (configDetial.gid) { // 新增
              this.props.dispatch({
                type: 'PatrolTargetConfig/editPatrolTargetConfigData',
                payload: {
                  ...configDetial,
                  filter,
                  isfeedback: configDetial.isfeedback ? 1 : 0,
                  form: {
                    title: `表单反馈项-${value.name}`,
                    fields: feedbackList.map(item => ({...item, required: item.required ? 1 : 0})),
                  },
                },
                callback: () => {
                  this.props.dispatch(routerRedux.push(this.tool.historyPageName));
                },
              });
            } else { // 编辑
              this.props.dispatch({
                type: 'PatrolTargetConfig/addPatrolTargetConfigData',
                payload: {
                  ...configDetial,
                  filter,
                  isfeedback: configDetial.isfeedback ? 1 : 0,
                  form: {
                    title: `表单反馈项-${value.name}`,
                    fields: feedbackList.map(item => ({...item, required: item.required ? 1 : 0})),
                  },
                },
                callback: () => {
                  this.props.dispatch(routerRedux.push(this.tool.historyPageName));
                },
              });
            }
          }
        });
        break;
      default:
        break;
    }
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const { typeOptions, layerNameOptions, configDetial } = this.props;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 2 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
    };
    return (
      <div>
        <Row>
          <Button
            className={styles.btn}
            type="primary"
            onClick={this.handleClick.bind(this, 'back')}
          >返回</Button>
        </Row>
        <Row>
          <Form>
            <div className={styles['span-button']}>
              <div className={styles.order} />
              <span style={{ fontSize: 16 }}>基本信息</span>
            </div>
            <FormItem label="名称" {...formItemLayout} >
              {getFieldDecorator('name', {
                rules: [{required: true, message: '不能为空'}],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="类型" {...formItemLayout} >
              {getFieldDecorator('type', {
                rules: [{required: true, message: '不能为空'}],
              })(
                <Select placeholder="请选择">
                  {typeOptions && typeOptions.map(item => (
                    <Option key={item.type}>{item.type}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label="图层名称" {...formItemLayout}>
              {getFieldDecorator('layername', {
                rules: [{required: true, message: '不能为空'}],
              })(
                <Select>
                  {layerNameOptions && layerNameOptions.map(item => (
                    <Option key={item.dno}>{item.dname}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label="筛选条件" {...formItemLayout}>
              <FilterPlan />
            </FormItem>
            <FormItem label="是否反馈" {...formItemLayout}>
              {getFieldDecorator('isfeedback', {
                valuePropName: 'checked',
              })(
                <Checkbox />
              )}
            </FormItem>
          </Form>
        </Row>
        {configDetial.isfeedback ?
          <div>
            <div className={styles['span-button']}>
              <div className={styles.order} />
              <span style={{ fontSize: 16 }}>反馈信息</span>
            </div>
            <Row>
              <FeedbackTable />
            </Row>
          </div> :
          null}
        <Row type="flex" justify="center" className={styles.submit}>
          <Button onClick={this.handleClick.bind(this, 'submit')} type="primary">提交</Button>
        </Row>
      </div>
    );
  }
}

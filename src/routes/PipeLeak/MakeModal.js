import React, {PureComponent} from 'react';
import {Modal, Form, Input, DatePicker, Select,message, Radio } from 'antd';
import {connect} from 'dva';
const RadioGroup = Radio.Group;

const {RangePicker} = DatePicker;
const FormItem = Form.Item;
import moment from 'moment';


const initState = {
  hasTempName: false,
  planName: '',
  stationValue: '',
  guardian: '',
  status: 1,
  rangeTime: [null, null],
};

@Form.create()
class MakeModal extends PureComponent {
  state = {
    ...initState
  };
  stationItem = null;
  user=null;
  componentWillMount() {
  }

  handleSelect=(val,option)=>{
    const st = option.props.dataRef;
    this.setState({
      stationValue:val,
      guardian: '',
    });
    this.stationItem=st;
    this.props.dispatch({
      type:'leak/getStationUsers',
      payload:{
        stationId:val
      }
    });
  };

  handleUserSelect=(val,option)=>{
    this.setState({guardian:val});
    this.user={...option.props.dataRef};
  }

  gettempName = (value) => {
    this.setState({planName: value.target.value});
    if (value === '') {
      this.setState({
        "hasTempName": false
      });
    } else {
      this.setState({
        "hasTempName": true
      });
    }
  };
  statusChange = (e) => {
    const val = e.target.value;
    this.setState({
      status: val,
    })
  }


  //默认时间不能小于当日；
  disabledDate = (current) => {
    return current && current.valueOf() < new Date(new Date().getTime() - 86400000);
  };

  changeTime = (date) => {
    this.setState({rangeTime: date})
  };


  submitHandle = () => {
    const {planName, stationValue, guardian, rangeTime:[a,b]} = this.state;
    if(!planName || !stationValue || !guardian || !a ||!b){
      message.warn('字段不能为空');
      return;
    }
    this.props.okHandle({
      ...this.state,
      ...this.user
    }, this.stationItem, () => {
      this.setState(initState);
    })
  };

  cancelHandle = () => {
    this.props.cancelHandle();
    this.setState(initState);
  };


  render() {

    const {visible, loading, stations = [],stationUsers} = this.props;
    const formItemLayout = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 7},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 12},
        md: {span: 10},
      },
    };


    return (
      <Modal
        visible={visible}
        title="制订计划"
        onOk={this.submitHandle}
        onCancel={this.cancelHandle}
        confirmLoading={loading}
        maskClosable={false}
        width={600}
      >
        <Form>
          <FormItem
            {...formItemLayout}
            label="计划名称"
            style={{marginBottom: 15}}
          >
            <Input
              placeholder='请输入'
              value={this.state.planName}
              style={{fontSize: 12}}
              onChange={this.gettempName}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<span style={{fontSize: 14}}>站点</span>}
            style={{marginBottom: 15}}
          >
            <Select
              placeholder="请选择站点"
              // dropdownStyle={{maxHeight: 180, overflow: 'auto'}}
              value={this.state.stationValue}
              onSelect={this.handleSelect}
            >

              {
                stations.map((item) => {
                  return <Select.Option
                    title={item.loc_name}
                    key={item.gid}
                    value={item.gid}
                    dataRef={item}>
                    {item.loc_name}
                  </Select.Option>;
                })
              }
            </Select>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="维护人"
            style={{marginBottom: 15}}
          >

            <Select
              // dropdownStyle={{maxHeight: 180, overflow: 'scroll'}}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              value={this.state.guardian}
              onSelect={this.handleUserSelect}
            >

              {
                stationUsers.map((item) => {
                  return <Select.Option
                    key={item.userid}
                    value={item.userid}
                    dataRef={item}>
                    {item.truename}
                  </Select.Option>;
                })
              }
            </Select>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="起止时间"
            style={{marginBottom: 15}}
          >
            <RangePicker
              showTime
              placeholder={['开始时间', '结束时间']}
              disabledDate={this.disabledDate}
              format="YYYY-MM-DD"
              style={{width: 300, fontSize: 12}}
              value={this.state.rangeTime}
              onChange={(date) => {
                this.changeTime(date)
              }}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="计划是否启用"
            style={{marginBottom: 15}}
          >
            <RadioGroup onChange={this.statusChange} value={this.state.status}>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </RadioGroup>
          </FormItem>
        </Form>
      </Modal>
    )

  }
}

export default MakeModal

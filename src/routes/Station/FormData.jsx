import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import _ from 'lodash';
import { Radio, Select, Row, Col, Form, Icon, Input, Button,message, InputNumber } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
let uuid = 0;

const UNIT = ['NM³', 'Mpa', '℃', 'M³', 'NM³/h', 'mmg/Nm3', 'mm', 'Kpa', '吨'];
const TYPES = {
  TXT: '短文本',
  TXTEXT: '长文本',
  DATE: '日期',
  DATETIME: '时间戳',
  NUM: '数字',
  TXTSEL:'选择',
};
@connect(state => ({
    user: state.login.user,
}))
class FormData extends React.Component {
    constructor(props) {
        super(props);
        this.tool = this.props.location;
        this.state = {
            dataSt:[],
            rangeData: [],
            backupsData: [], //备份数据
            checkGid: '',
        };
        this.arr = [];
        this.uuidArr=[];
        this.idx = 0;
    }

    componentWillMount() {
        let formId =this.tool.record.formId;
        let name =this.tool.record.name;
        let data = {};
        let valueS = '';
        data.formId = formId;
        this.props.dispatch({
            type: 'formStation/formStationInit',
            payload: {formId},
            callback: (res) => {
                console.log(res);
                if(res.data===null){
                    return;
                }
                if(res.data.length > 0){
                    const checkData = res.data[0].items
                    this.setState({
                        backupsData: res.data[0].items,
                        checkGid: res.data[0].id,
                    })
                    this.idx = checkData.length;
                    for (var i = 0; i < checkData.length; i++) {
                        this.arr.push({
                            findex: i + 1,
                            gid: checkData[i].gid,
                            name:checkData[i].alias,
                            type:checkData[i].type,
                            unit: checkData[i].type === 'NUM' ? checkData[i].unit : '',
                            accuracy: checkData[i].type === 'NUM' ? checkData[i].accuracy : '',
                            defaultvalue: checkData[i].type === 'TXTSEL' ? checkData[i].defaultvalue : '',
                            required:checkData[i].required===1 ? '是':'否'
                        });
                        this.uuidArr.push(i);
                    }
                }
                this.props.form.setFieldsValue({
                    keys: this.arr,
                });
                console.log(this.arr, 'willMount');
            }
        });
        this.props.dispatch({
            type: 'formStation/queryRange',
            callback: (res) => {
                console.log(res, 'res');
                if(res.data === null){
                    return
                }
                const data = res.data.station_oper_type
                this.setState({
                    rangeData: data,
                })
            }
        })
    };

    remove = (k) => {
        console.log(k);
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        // We need at least one passenger
        // if (keys.length === 1) {
        //     return;
        // }
        this.arr.splice(k,1);
        console.log(this.arr);
        // can use data-binding to set
        form.setFieldsValue({
            keys: this.arr,
        });
    };
    add = () => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        const nextKeys = keys.concat(this.idx);
        uuid++;

        if(this.arr && this.arr.length > 0){
          this.idx = this.arr[this.arr.length - 1].findex + 1
        }else{
          this.idx ++;
        }
        console.log(keys, nextKeys, this.idx, '☆');
        // can use data-binding to set
        // important! notify form to detect changes
        this.arr.push({
            findex: this.idx,
            gid: '',
            name:"",
            type:"",
            unit: '',
            accuracy: '',
            defaultvalue: "",
            required:'否',
        });
        form.setFieldsValue({
            keys: this.arr,
        });
    };

    handleSubmit = (e) => {
        e.preventDefault();
        let obj = {
            checkTargetId:this.tool.record.checkTargetId,
            gid: this.state.checkGid,
            params:{}
        };
        let arr =[];
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {backupsData} = this.state;
                console.log(values,'values');
                if (values.keys.length !== 0) {
                    if(values.keys.length === backupsData.length){
                      let isChange = 0
                      for (var i = 0; i < backupsData.length; i++) {
                        const required = values.required[i] === '是' ? 1 : 0
                        const accuracy = values.accuracy[i] === '' ? '0' : values.accuracy[i]
                        if(values.name[i] === backupsData[i].alias && values.type[i] === backupsData[i].type && values.unit[i] === backupsData[i].unit && values.defaultvalue[i] === backupsData[i].defaultvalue && accuracy === backupsData[i].accuracy && required === backupsData[i].required){
                          isChange++
                        }
                      }
                      if(isChange === backupsData.length || (this.arr.length === 0 && backupsData.length > 0)){
                        message.error('数据没有修改不用提交！');
                        return;
                      }
                    }
                    obj.params.title = this.tool.record.name;
                    for(let [i,elem] of values.name.entries()){
                        if(values.name[i]===undefined){
                            continue;
                        }
                        arr.push(
                            {
                                findex:i + 1,
                                gid: values.keys[i].gid,
                                type:values.type[i],
                                required:values.required[i]==="是"?1:0,
                                alias:values.name[i],
                                name:values.name[i],
                                unit:values.unit[i],
                                accuracy: values.accuracy[i],
                                defaultvalue: values.defaultvalue[i] ? values.defaultvalue[i].replace('，', ',') : '',
                            }
                        )
                        if(!values.name[i]){
                            message.warning(`请输入第${i + 1}条检查项名称！`);
                            return
                        }
                        if(!values.type[i]){
                            message.warning(`请输入第${i + 1}条检查项类型！`);
                            return
                        }
                        if(values.type[i] === 'TXTSEL' && !values.defaultvalue[i]){
                            message.warning(`请输入第${i + 1}条检查项值域！`);
                            return
                        }
                    }
                    const nameUnique = _.sortBy(values.name)
                    console.log(nameUnique,arr, 'nameUnique');
                    for (var i = 0; i < nameUnique.length; i++) {
                        if (nameUnique[i] === nameUnique[i + 1]) {
                            message.error(`检查项【${nameUnique[i].name}】名称重复,请修改！`);
                            return
                        }
                    }
                }

                obj.params.fields = arr;
                this.props.dispatch({
                    type: 'formStation/formStationSubmit',
                    payload: {editCheckTargetFormParams:JSON.stringify(obj)},
                    callback: (res) => {
                        console.log(res);
                        if(res.success){
                            message.info("提交检查项成功");
                            uuid = 0;
                            this.uuidArr = [];
                            this.backHandler()
                        }
                    }
                });
            }
        });
    }
    selectCha = (k, filName, value ) =>{
        console.log(k,value, filName);
        const {form} = this.props;
        const keys = form.getFieldValue('keys');
        if(filName === 'name'){
            this.arr[k][filName] = value.target.value;
        }else{
            this.arr[k][filName] = value;
        }
        if(filName === 'type'){
            this.arr[k].type=value;
            if(value !== 'TXTSEL'){
                this.arr[k].defaultvalue = '';
                const temp = {}
                temp[`defaultvalue[${k}]`] = ''
                form.setFieldsValue(temp);
            }
            if(value === 'TXTSEL'){
                this.arr[k].unit = '';
                const temp = {}
                temp[`unit[${k}]`] = ''
                form.setFieldsValue(temp);
            }
            if(value !== 'NUM'){
                this.arr[k].unit= '';
                this.arr[k].accuracy = '';
                const temp = {}
                temp[`accuracy[${k}]`] = ''
                temp[`unit[${k}]`] = ''
                form.setFieldsValue(temp);
            }else if(value === 'NUM'){
                this.arr[k].unit = '';
                this.arr[k].accuracy = '0';
                const temp = {}
                temp[`accuracy[${k}]`] = '0'
                form.setFieldsValue(temp);
            }
        }
    };

    sortHandler = (k, e) => {
        this.arr[k].findex = Number(e.target.value);
        this.arr = _.sortBy(this.arr, ['findex'])
        console.log(this.arr, 'findex');
    }
    backHandler = () => {
        const {stationId, areaId, equipmentUnitName} = this.tool.record
        uuid = 0;
        this.uuidArr = [];
        this.props.dispatch(routerRedux.push(`/station/CheckData?stationId=${stationId}&areaId=${areaId}`));
    };
    //上移
    moveUp = (key) => {
        const { form } = this.props;
        let arr = this.arr
        if(key === 0){
          return
        }
        const temp = arr[key];
        arr[key] = arr[key - 1];
        arr[key - 1] = temp;
        this.arr = arr;
        arr.map((item, index)=>{
            this.arr[index].findex = index + 1;
        })
        // const keys = form.getFieldValue('keys');
        // form.setFieldsValue({
        //     keys: this.arr,
        // });

        const params = {}
        for (var i = 0; i < this.arr.length; i++) {
            params[`findex[${i}]`] = this.arr[i].findex;
            params[`name[${i}]`] = this.arr[i].name;
            params[`type[${i}]`] = this.arr[i].type;
            params[`unit[${i}]`] = this.arr[i].unit;
            params[`defaultvalue[${i}]`] = this.arr[i].defaultvalue;
            params[`accuracy[${i}]`] = this.arr[i].accuracy;
            params[`required[${i}]`] = this.arr[i].required;
        }
        form.setFieldsValue(params);
    };
    //下移
    moveDown = (key) => {
        const { form } = this.props;
        const arr = this.arr
        if(key === arr.length - 1){
          return
        }
        const temp = arr[key];
        arr[key] = arr[key + 1];
        arr[key + 1] = temp;
        this.arr = arr;
        arr.map((item, index)=>{
            this.arr[index].findex = index + 1;
        })
        // const keys = form.getFieldValue('keys');
        // form.setFieldsValue({
        //     keys: this.arr,
        // });
        const params = {}
        for (var i = 0; i < this.arr.length; i++) {
            params[`findex[${i}]`] = this.arr[i].findex;
            params[`name[${i}]`] = this.arr[i].name;
            params[`type[${i}]`] = this.arr[i].type;
            params[`unit[${i}]`] = this.arr[i].unit;
            params[`defaultvalue[${i}]`] = this.arr[i].defaultvalue;
            params[`accuracy[${i}]`] = this.arr[i].accuracy;
            params[`required[${i}]`] = this.arr[i].required;
        }
        form.setFieldsValue(params);
    };
    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form;
        getFieldDecorator('keys', { initialValue: this.arr});
        const keys = getFieldValue('keys');
        const {rangeData} = this.state;
        console.log(this.arr,keys, '★★');
        let obj={};
        const formItems = keys && keys.map((k, index) => {
            return (
                <FormItem
                    wrapperCol={{
                        xs: { span: 24, offset: 0 },
                    }}
                    key={index}
                >
                    <Row>
                        <Col span={1} style={{ textAlign: 'center' }}>
                            {getFieldDecorator(`findex[${index}]`, {
                                initialValue: k.findex
                            })(
                                <span>{index + 1}</span>
                            )}
                        </Col>
                        <Col span={3}>
                            {getFieldDecorator(`name[${index}]`, {
                                initialValue: k.name
                            })(
                                <Input onChange={this.selectCha.bind(this,index, 'name')}/>
                            )}
                        </Col>
                        <Col span={2} offset={1}>
                            {getFieldDecorator(`type[${index}]`, {
                                initialValue: k.type })(
                                <Select
                                    onChange={this.selectCha.bind(this,index, 'type')}
                                >
                                    {
                                      Object.keys(TYPES).map(kk =>
                                        <Option  key={kk} value={kk}>{TYPES[kk]}</Option>
                                      )
                                    }
                                </Select>
                            )}
                        </Col>
                        <Col span={2} offset={1}>
                            {getFieldDecorator(`unit[${index}]`, { initialValue: k.unit})(
                                <Select
                                    disabled={this.arr[index]?((this.arr[index].type !== 'NUM')?true:false):true}
                                    onChange={this.selectCha.bind(this,index, 'unit')}
                                >
                                    {
                                      UNIT.map(item =>
                                        <Option key={item} value={item}>{item}</Option>
                                      )
                                    }
                                </Select>
                            )}
                        </Col>
                        <Col span={2} offset={1}>
                            {getFieldDecorator(`defaultvalue[${index}]`, {

                                initialValue: k.defaultvalue})(
                                <Select
                                    mode="combobox"
                                    allowClear
                                    disabled={this.arr[index]?(this.arr[index].type==="TXTSEL"?false:true):true}
                                    onChange={this.selectCha.bind(this,index, 'defaultvalue')}
                                >
                                    {
                                      rangeData && rangeData.map(item =>
                                        <Option key={item.name} value={item.alias}>{item.alias}</Option>
                                      )
                                    }
                                </Select>
                            )}
                        </Col>
                        <Col span={2} offset={1}>
                            {getFieldDecorator(`accuracy[${index}]`, {

                                initialValue: k.accuracy})(
                                <InputNumber
                                    min={0}
                                    max={4}
                                    disabled={this.arr[index]?(this.arr[index].type==="NUM"?false:true):true}
                                    onChange={this.selectCha.bind(this,index, 'accuracy')}
                                />
                            )}
                        </Col>
                        <Col span={2} offset={1}>
                            {getFieldDecorator(`required[${index}]`, { initialValue: k.required || '否'})(
                                <RadioGroup onChange={this.selectCha.bind(this,index, 'required')}>
                                    <Radio value="是">是</Radio>
                                    <Radio value="否">否</Radio>
                                </RadioGroup>
                            )}
                        </Col>
                        <Col span={4}>
                            <Col span={6}>
                                <Button type="primary" onClick={() => this.remove(index)}>
                                    删除
                                </Button>
                            </Col>
                            <Col span={6} offset={1}>
                                <Button type="primary" onClick={() => this.moveUp(index)}>
                                    上移
                                </Button>
                            </Col>
                            <Col span={6} offset={1}>
                                <Button type="primary" onClick={() => this.moveDown(index)}>
                                    下移
                                </Button>
                            </Col>
                        </Col>
                    </Row>
                </FormItem>
            );
        });
        return (
            <PageHeaderLayout showBack={this.backHandler}>
                <div style={{minWidth: 1440}}>
                    <Row style={{margin: '20px',paddingTop:'20px'}}>
                        <span style={{marginRight: 15}}><b>{this.tool.record.equipmentUnitName}: {' '}{this.tool.record.name}</b></span>
                        <Button type="primary" onClick={this.add}>
                            新增检查项
                        </Button>
                    </Row>
                    <Form onSubmit={this.handleSubmit} style={{overflowX: 'auto'}}>
                        <Row style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'left', background: '#FAFAFA', padding: '10px 0'}}>
                            <Col span={1}>序号</Col>
                            <Col span={3}>检查项</Col>
                            <Col span={2} offset={1}>类型</Col>
                            <Col span={2} offset={1}>单位</Col>
                            <Col span={2} offset={1}>选择范围</Col>
                            <Col span={2} offset={1}>小数位数</Col>
                            <Col span={2} offset={1}>是否必填</Col>
                            <Col span={4} offset={1}>操作</Col>
                        </Row>
                        {formItems}
                        <FormItem
                            wrapperCol={{
                                xs: { span: 24, offset: 12 },
                            }}
                        >
                            <Button type="primary" htmlType="submit" onClick={this.handleSubmit}>提交</Button>
                        </FormItem>
                    </Form>
                </div>
            </PageHeaderLayout>
        );
    }
}
export default Form.create()(FormData);



import {Modal, Form, Select, DatePicker, Input} from 'antd';

const FormItem = Form.Item;
export default Form.create()(
  (props) => {
    const {visible, onCancel, onCreate, form, stations = [], templates = [], dispatch, func, loading} = props;
    const {getFieldDecorator} = form;
    const stationChange = (val) => {
      dispatch(
        {
          type: 'station/getTemplateData',
          payload: {
            stationId: val,
            function: 'station_patrol'
          }
        }
      );
    };
    return (
      <Modal
        visible={visible}
        title="新建计划"
        onCancel={onCancel}
        onOk={onCreate}
        maskClosable={false}
        width={400}
        confirmLoading={loading}
      >
        <Form>
          <FormItem
            label="站点"
            labelCol={{span: 6}}
            wrapperCol={{span: 18}}
          >
            {getFieldDecorator('stationId', {
              rules: [{required: true, message: '请选择站点'}],
            })(
              <Select
                placeholder="选择站点"
                onChange={stationChange}
              >
                {
                  stations.map(st => <Select.Option key={`aa-${st.gid}`} value={st.gid}>{st.name}</Select.Option>)
                }
              </Select>
            )}
          </FormItem>
          <FormItem
            label="模板"
            labelCol={{span: 6}}
            wrapperCol={{span: 18}}
          >
            {getFieldDecorator('template', {
              rules: [{required: true, message: '请选择模板'}],
            })(
              <Select
                placeholder="选择模板"
                onChange={() => {
                }}
              >
                {
                  templates.map(st =>
                    <Select.Option key={`bb-${st.gid}`} value={st.gid}>{st.name}</Select.Option>
                  )
                }
              </Select>
            )}
          </FormItem>
          <FormItem
            label="分组名称"
            labelCol={{span: 6}}
            wrapperCol={{span: 18}}
          >
            {getFieldDecorator('group', {
              initialValue:func,
              rules: [{required: true, message: '请输入分组'}],
            })(
              <Input
                placeholder="输入组名"
              />
            )}
          </FormItem>
          <FormItem
            label="计划名称"
            labelCol={{span: 6}}
            wrapperCol={{span: 18}}
          >
            {getFieldDecorator('planName', {
              rules: [{required: true, message: '请计划名称'}],
            })(
              <Input
                placeholder="计划名称"
              />
            )}
          </FormItem>
          <FormItem
            label="开始时间"
            labelCol={{span: 6}}
            wrapperCol={{span: 18}}
          >
            {getFieldDecorator('startTime', {
              rules: [{required: true, message: '选择开始时间'}],
            })(
              <DatePicker style={{
                width: 264
              }}>
              </DatePicker>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
);

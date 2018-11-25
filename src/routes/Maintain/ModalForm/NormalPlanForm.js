import {Modal, Form, Input, DatePicker, TreeSelect, message} from 'antd';

const TreeNode = TreeSelect.TreeNode;
const confirm = Modal.confirm;

const FormItem = Form.Item;
export default Form.create()(
  (props) => {
    const {visible, loading, handCancel, areaData = [], form, handleSubmitRulePlan,extraHandle, NormalmodalKey, normalName, changePlanName} = props;
    const {getFieldDecorator} = form;
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

    const onAreaSelect = (value, node) => {
      if (value !== '' && (node !== undefined)) {
         if(value === node.props.dataRef.station){
          message.error(`请选择 ${value} 下的小区域！`)
          return
        }
        form.setFieldsValue({
          userName: node.props.dataRef.usernames,
        });
        extraHandle && extraHandle(node.props.dataRef);
      }
    };
    const getplanName = (value) => {
      changePlanName(value.target.value);
    };

    // 默认时间不能小于当日；
    const disabledDate = (current) => {
      return current && current.valueOf() < new Date(new Date().getTime() - 86400000);
    };
    // 填充数据至区域
    const renderTreeNodes = (data) => {
      return data.map((item) => {
        if (item.children && item.children.length > 0) {
          return (
            <TreeNode
              title={item.name}
              key={item.gid}
              value={item.name}
              dataRef={item}
            >
              {renderTreeNodes(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode title={item.name} key={item.gid} value={item.name} dataRef={item} />;
      });
    };
    return (
      <Modal
        visible={visible}
        title="制定计划"
        onOk={handleSubmitRulePlan}
        onCancel={handCancel}
        confirmLoading={loading}
      >
        <Form>
          <FormItem
            {...formItemLayout}
            label={<span style={{fontSize: 14}}>计划名称</span>}
            style={{marginBottom: 15}}
          >
            <Input
              style={{fontSize: 12}}
              placeholder="请输入"
              value={normalName}
              onChange={getplanName}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<span style={{fontSize: 14}}>区域</span>}
            style={{marginBottom: 15}}
          >
            {getFieldDecorator('regionName', {
              rules: [{
                required: true, message: '请选择站点!',
              }],
            })(
              <TreeSelect
                placeholder="请选择站点"
                dropdownStyle={{maxHeight: 180, overflow: 'auto'}}
                onSelect={onAreaSelect}
              >
                {
                  areaData.map((item) => {
                    if (item.children && item.children.length > 0) {
                      return (
                        <TreeNode title={item.name} key={item.gid} value={item.name} dataRef={item}>
                          {renderTreeNodes(item.children)}
                        </TreeNode>
                      );
                    }
                    return <TreeNode title={item.name} key={item.gid} value={item.nam} dataRef={item} disabled={true} />;
                  })
                }
              </TreeSelect>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="维护人"
            style={{marginBottom: 15}}
          >
            {getFieldDecorator('userName', {})(
              <Input style={{fontSize: 12}} placeholder="不支持编辑，默认是区域负责人" readOnly="true" />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="养护周期"
            style={{marginBottom: 15}}
          >
            {getFieldDecorator('cycleInfo', {})(
              <Input style={{fontSize: 12}} placeholder="不支持编辑" readOnly="true" />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="开始时间"
            style={{marginBottom: 15}}
          >
            {getFieldDecorator('startTime', {
              rules: [{
                required: true, message: '请选择开始时间!',
              }],
            })(
              <DatePicker
                placeholder="请选择开始时间"
                disabledDate={disabledDate}
                format="YYYY-MM-DD"
                style={{width: 200, fontSize: 12}}
              />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
);


import React, { Component } from 'react';
import { Button, message, Form, Select, Col, Row, Table, InputNumber } from 'antd';
import styles from './index.less';
import NewWlModal from '../NewModalForm/NewWlModal';

const FormItem = Form.Item;
const Option = Select.Option;
const defaultPage = {
  pageno: 1,
  pagesize: 10,
};
@Form.create()
export default class Picking extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...defaultPage,
      btLoding: false,
      visible: false,
      selectedRowKeys: [],
      targetData: [], // 领料数据
      total: 0,
      faccode: '',
      likeValue: '',
    };
  }
    moveData = [];
    selRows = {};
    componentDidMount = () => {
      const { placeInfo} = this.props;
      if (placeInfo && placeInfo.length > 0) {
        const { faccode } = placeInfo[0];
        this.setState({ faccode });
        this.queryMaterialInfo({factoryCode: faccode});
      }
    };
    // 模糊
    handleLikeValueChange = (e) => {
      this.setState({ likeValue: e.target.value });
    };
    // 数量改变时回调
    handleInputChage(value, gid, column) {
      const newData = [...this.state.targetData];
      const target = newData.filter(item => gid === item.gid)[0];
      if (target) {
        target[column] = value;
        this.setState({ targetData: newData });
      }
    }
    targetDataChange = (tarData) => {
      this.setState({ targetData: tarData });
    };
    // 此处前台保存所勾选领料
    saveSelectedRows =(selectedRows) => {
      const {pageno} = this.state;
      this.selRows[`第${pageno}行`] = selectedRows;
    }
    // 搜索
    onSearch = () => {
      this.queryMaterialInfo({ wlcode: this.state.likeValue});
    };
    // 根据工厂中心查询领料
    queryMaterialInfo = (params = {}) => {
      this.props.dispatch({
        type: 'device/queryMaterialInfo',
        payload: {
          factoryCode: this.state.faccode,
          ...defaultPage,
          ...params,
        },
        callback: (total) => {
          this.setState({ total });
        },
      });
    };
    // 分页改变时回调
    handleTableChange = (pagination) => {
      const params = {
        pageno: pagination.current,
        pagesize: pagination.pageSize,
        wlcode: this.state.likeValue,
      };
      this.setState(params);
      this.queryMaterialInfo(params);
    };
    // 删除物料
    reducePick = (wl) => {
      const { targetData } = this.state;
      const reduceItem = targetData.filter(item => {
        return item.gid !== wl.gid;
      });
      this.targetDataChange(reduceItem);
    };
    // 添加物料
    addPick = () => {
      const { targetData } = this.state;
      const { selectedRowKeys } = this.state;
      if (selectedRowKeys.length > 0) {
        for (const key of Object.values(this.selRows)) {
          this.moveData = [...new Set([...this.moveData, ...key])];
        }
        const tarData = targetData.filter(item => {
          return !selectedRowKeys.includes(item.gid);
        });
        // 第一次添加时默认数量为1
        this.moveData.forEach(item => { Object.assign(item, {num: 1}); });
        const newData = [...tarData, ...this.moveData];
        this.targetDataChange(newData);
      }
    };
    showModal = () => {
      this.setState({ visible: true, ...defaultPage, likeValue: ''});
    };
    closeModal = () => {
      this.setState({ visible: false, selectedRowKeys: []});
      this.moveData = [];
      this.selRows = {};
      this.queryMaterialInfo();
    };
    handleSubmit = (e) => {
      const { form, dispatch, taskId, handleBack} = this.props;
      const { targetData } = this.state;
      e.preventDefault();
      form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          if (targetData.length === 0) {
            message.warn('请选择物料');
            return;
          } else {
            const items = targetData.find(item => item.num === undefined);
            if (items) {
              message.warn(`编号为${items.code}的物料数量为空`);
              return;
            }
          }
          const { facname, cbname, wlname, mtInfo } = values;
          let meteReserved = {
            BWART: mtInfo,
            WEMPF: `WEMPF_${taskId}`,
            KOSTL: cbname, // 成本中心
            RESERVE:
                    targetData.map(item => ({
                      MATNR: item.code,
                      WERKS: facname,
                      BDMNG: item.num || '1',
                      LGORT: wlname,
                      GSBER: 1000,
                      SGTXT: '预防性维护',
                    })),
          };
          meteReserved = JSON.stringify(meteReserved);
          this.setState({btLoding: true});
          dispatch({
            type: 'device/savePickingData',
            payload: { meteReserved },
            callback: ({ success, msg }) => {
              if (success) {
                message.success('保存成功');
                this.setState({btLoding: false});
                handleBack();
              } else {
                message.warn(msg);
                this.setState({btLoding: false});
              }
            },
          });
        }
      });
    };
    render() {
      const { form, mtInfo, placeInfo, materialInfo} = this.props;
      const { getFieldDecorator } = form;
      const { cname, ccode, facname, faccode, wlname, wlcode, cbname, cbcode } = placeInfo && placeInfo.length > 0 ? placeInfo[0] : {};
      const formItemLayout = {
        labelCol: {
          xs: { span: 12 },
          sm: { span: 10 },
        },
        wrapperCol: {
          xs: { span: 28 },
          sm: { span: 12 },
          md: { span: 6 },
        },
      };
      const columns = [{
        title: '物料编号',
        dataIndex: 'code',
        key: 'code',
        width: '15%',
      },
      {
        title: '物料类别',
        dataIndex: 'groupdes',
        key: 'groupdes',
        width: '30%',
      },
      {
        title: '物料名称',
        dataIndex: 'des',
        key: 'des',
        width: '30%',
      },
      {
        title: '数量',
        dataIndex: 'num',
        key: 'num',
        width: '15%',
        render: (text, record) => {
          return (<InputNumber
            autoFocus
            max={666}
            min={1}
            value={text}
            placeholder="请输入数量"
            onChange={value => { this.handleInputChage(value, record.gid, 'num'); }}
          />);
        },
      },
      {
        title: '',
        dataIndex: 'action',
        key: 'action',
        width: '10%',
        render: (text, record) => {
          return <a onClick={() => { this.reducePick(record); }}>删除</a>;
        },
      },
      ];
        // 表格分页
      const pagination = {
        current: this.state.pageno,
        pageSize: this.state.pagesize,
        total: this.state.total || 0,
        showTotal: (total) => {
          const { pageno, pagesize } = this.state;
          return (<div className={styles.pagination}>
                    共 {total} 条记录 第{pageno}/{Math.ceil(total / pagesize)}页
          </div>);
        },
      };
      const pagination2 = {
        size: 'small',
        defaultPageSize: 10,
        showTotal: (total, range) => {
          return (<div className={styles.pagination}>
                     共 {total} 条记录 </div>);
        },
      };
      const mtInfoOptions = mtInfo.map(item =>
        <Option key={item.mtCode} value={item.mtCode}>{`【${item.mtCode}】 ${item.mtInfo}`}</Option>
      );
      return (
        <div>
          <div >
            <Form
              hideRequiredMark
              onSubmit={this.handleSubmit}
            >
              <Row >
                <Col span={9}>
                  <FormItem
                    label="移动类型"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('mtInfo', {
                                        rules: [{ required: true, message: '请选择移动类型' }],

                                    })(
                                      <Select
                                        style={{ width: 240 }}
                                      >
                                        {mtInfoOptions}
                                      </Select>
                                        )}
                  </FormItem>
                </Col>
                <Col span={7}>
                  <FormItem
                    label="公司名称"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('cname', {
                                        rules: [{ required: true, message: '请选择公司名称' }],
                                        initialValue: ccode || '',
                                    })(
                                      <Select
                                        notFoundContent="暂无数据"
                                        style={{ width: 240 }}
                                      >
                                        {ccode ? <Option value={ccode}>{`【${ccode}】 ${cname}`}</Option> : null}
                                      </Select>
                                        )}
                  </FormItem>
                </Col>
              </Row>
              <Row >
                <Col span={9}>
                  <FormItem
                    label="工厂中心"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('facname', {
                                        rules: [{ required: true, message: '请选择工厂中心' }],
                                        initialValue: faccode,
                                    })(
                                      <Select
                                        notFoundContent="暂无数据"
                                        placeholder="请先选择公司名称"
                                        style={{ width: 240 }}
                                      >
                                        {faccode ? <Option value={faccode}>{`【${faccode}】 ${facname}`}</Option> : null}
                                      </Select>
                                        )}
                  </FormItem>
                </Col>
                <Col span={7}>
                  <FormItem
                    label="成本中心"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('cbname', {
                                        rules: [{ required: true, message: '请选择成本中心' }],
                                        initialValue: cbcode,
                                    })(
                                      <Select
                                        notFoundContent="暂无数据"
                                        placeholder="请先选择公司名称"
                                        style={{ width: 240 }}
                                      >
                                        {cbcode ? <Option value={cbcode}>{`【${cbcode}】 ${cbname}`}</Option> : null}
                                      </Select>
                                        )}
                  </FormItem>
                </Col>
              </Row>
              <Row >
                <Col span={9}>
                  <FormItem
                    label="物料库名称"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('wlname', {
                                        rules: [{ required: true, message: '选择物料库名称' }],
                                        initialValue: wlcode,
                                    })(
                                      <Select
                                        notFoundContent="暂无数据"
                                        placeholder="请先选择公司名称"
                                        style={{ width: 240 }}
                                      >
                                        {wlcode ? <Option value={wlcode}>{ `【${wlcode}】 ${wlname}`}</Option> : null}
                                      </Select>
                                        )}
                  </FormItem>
                </Col>
                <Col span={11} />
              </Row>
              <Row >
                <Col span={9}>
                  <Button style={{ width: 240, left: '42%', marginBottom: 10 }} onClick={this.showModal}>选择物料</Button>
                </Col>
                <Col span={11} />
              </Row>
              <FormItem>
                <Table
                  style={{ width: '54%', marginLeft: '15%' }}
                  columns={columns}
                  pagination={{...pagination2, total: this.state.targetData.length}}
                  dataSource={this.state.targetData || []}
                  rowKey={record => record.gid}
                />
              </FormItem>
            </Form>
            <NewWlModal
              materialInfo={materialInfo}
              visible={this.state.visible}
              selectedRowKeys={this.state.selectedRowKeys}
              handleTableChange={this.handleTableChange}
              pagination={pagination}
              likeValue={this.state.likeValue}
              onSearch={this.onSearch}
              handleOk={() => {
                            this.addPick();
                            this.closeModal();
                        }}
              handleCancel={() => {
                            this.closeModal();
                        }}
              handleLikeValueChange={this.handleLikeValueChange}
              callback={(selectedRowKeys, selectedRows) => {
                            this.saveSelectedRows(selectedRows);
                            this.setState({ selectedRowKeys });
                        }}
            />
            <Button
              className={styles.button}
              style={{ display: 'inline-block' }}
              type="primary"
              htmlType="submit"
              loading={this.state.btLoding}
              onClick={this.handleSubmit}
            >提交</Button>
          </div>
        </div>
      );
    }
}

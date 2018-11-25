import React from 'react';
import {connect} from 'dva';
import {Table, Button, Select, Input, message} from 'antd';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';
import EmerGoodsDispatchOrder from './emerGoodsDispatchOrder';

const defaultParams = {
  factory: '',
  store: '',
  condition: '',
  pageno: 1,
  pagesize: 5,
};

@connect(state => ({
  user: state.login.user,
}))

export default class EmerGoodsDispatch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emerGoodsList: [],
      emerGoodsTotal: 0,
      openDispatchOrder: false, // 物资调度单个物资调度弹框
      selectedRowKeys: [],
      the_emerGoods: [], // 当前选中物资
      params: {...defaultParams},
      goodsStore: [],
      goodsFactory: [],
      currentEmerEvent: null, // 当前正在处置的应急事件
      faccode: '',  //工厂code
    };
  }

  componentDidMount = () => {
    this.getGoodsFactory();
    // this.getEmerMaterialHouse();
    this.getDispatcher();
    this.getCurrentEmerEvent();
  };

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };

  getGoodsFactory = () => {
    this.props.dispatch({
      type: 'emer/getEmerMaterialFactory',
      payload: {ecode: this.props.user.ecode},
      callback: (res) => {
        let params = {...this.state.params};
        params.factory = res.data[0].faccode || '';
        this.getEmerMaterialHouse(res.data[0].faccode);
        this.setState({
          goodsFactory: res.data,
          params,
        });
      },
    });
    this.handleGetEmerGoods();
  };

  getEmerMaterialHouse =(val) => {
    this.props.dispatch({
      type: 'emer/getEmerMaterialHouse',
      payload: {
        ecode: this.props.user.ecode,
        faccode: val,
      },
      callback: (res) => {
        let params = {...this.state.params};
        params.store = res.data[0].wcode || '';
        this.setState({
          goodsStore: res.data,
          params,
        });
        this.handleGetEmerGoods();
      },
    });
  };

  // 获取应急物资信息
  handleGetEmerGoods = () => {
    // const num = () => Math.floor(Math.random() * 500);
    // let res = {data: [{des: '热镀锌钢管_DN15_2.75888', labct: num()},
    //     {des: '热镀锌钢管_DN15_2.75888', labct: num()},
    //     {des: '热镀锌钢管_DN25_3.251', labct: num()},
    //     {des: '热镀锌钢管_DN32_3.25', labct: num()},
    //     {des: '热镀锌钢管_DN40_3.5', labct: num()}], total: 5};
    // this.setState({
    //     emerGoodsList: res.data,
    //     emerGoodsTotal: res.total,
    // });
    let params = this.state.params;
    let data = {};
    if (params.factory !== '') {
      data.factoryCode = params.factory;
    }
    if (params.store !== '') {
      data.wlkcd = params.store;
    }
    if (params.condition !== '') {
      data.wlcode = params.condition;
    }
    data.pageno = params.pageno;
    data.pagesize = params.pagesize;
    this.props.dispatch({
      type: 'emer/getEmerMaterial',
      payload: data,
      callback: (res) => {
        this.setState({
          emerGoodsList: res.data,
          emerGoodsTotal: res.total,
        });
      },
    });
  };

  onChangeFactory = (value) => {
    let params = this.state.params;
    params.factory = value;
    // params.store = '';
    this.setState({params});
    // this.handleGetEmerGoods();
    this.getEmerMaterialHouse(value)
  };

  onChangeStore = (value) => {
    let params = this.state.params;
    params.store = value;
    this.setState({params});
    this.handleGetEmerGoods();
  };

  onChangeCondition = (e) => {
    let params = this.state.params;
    params.condition = e.target.value;
    this.setState({params});
  };

  dispatch = () => {

  };

  closeDispatch = () => {

  };

  // 打开/关闭物资调度指令窗口
  handleOpenOrCloseDispatchOrder = (op) => {
    if (!this.state.currentEmerEvent) {
      message.warn('当前没有应急事件');
      return;
    }
    if (op === 'open') {
      if (this.state.the_emerGoods.length === 0) {
        message.warn('未选择物资');
        return;
      }
      this.setState({
        openDispatchOrder: true,
      });
    } else {
      this.setState({
        the_emerGoods: [],
        selectedRowKeys: [],
        openDispatchOrder: false,
      });
    }
  }

  reset = () => {
    let params = this.state.params;
    params.factory = defaultParams.factory;
    params.store = defaultParams.store;
    params.condition = defaultParams.condition;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({params});
    this.handleGetEmerGoods();
  };

  // 查询调度员
  getDispatcher = () => {
    let eventXY = {
      x: 1,
      y: 1,
    };
    this.props.getSceneController(eventXY);
  }

  // 查询当前正在处置的应急事件
  getCurrentEmerEvent = () => {
    let data = {};
    data.isInDeal = 1;
    data.ecode = this.props.user.ecode;
    this.props.dispatch({
      type: 'emer/getEmerEvent',
      payload: data,
      callback: (res) => {
        this.setState({
          currentEmerEvent: res.data[0],
        });
      },
    });
  }

  render = () => {
    let that = this;
    const { onCancel } = this.props;
    let {selectedRowKeys, goodsStore, goodsFactory} = this.state;
    const columns = [{
      title: '物资名称', dataIndex: 'des',
    }, {
      title: '数量', dataIndex: 'labct',
    }];
    const pagination = {
      size: 'small',
      total: this.state.emerGoodsTotal,
      current: that.state.params.pageno,
      pageSize: that.state.params.pagesize,
      showSizeChanger: true,
      showQuickJumper: true,
      onChange(page, pageSize) {
        let params = that.state.params;
        params.pageno = page;
        params.pagesize = pageSize;
        that.setState({params});
        that.handleGetEmerGoods();
      },
      onShowSizeChange(current, pageSize) {
        let params = that.state.params;
        params.pageno = current;
        params.pagesize = pageSize;
        that.setState({params});
        that.handleGetEmerGoods();
      },
      showTotal() { // 设置显示一共几条数据
        return <div>共 {this.total} 条数据</div>;
      },
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          the_emerGoods: selectedRows,
        });
      },
    };
    return (
      <div>
        <Dialog
          title="物资调度"
          width={680}
          onClose={onCancel}
          position={{
            top: 130,
            left: 390,
          }}
        >
          <div style={{margin: 10}}>
            <div>
              <span>工厂:
                <Select
                  value={this.state.params.factory}
                  style={{width: 270, margin: '0px 14px 5px 8px', display: 'inline-block'}}
                  placeholder="请选择"
                  onChange={this.onChangeFactory}
                >
                  {
                    goodsFactory && goodsFactory.map((v, i) => (
                      <Select.Option key={i} value={v.faccode}>{v.facname}</Select.Option>)
                    )
                  }
                  {/* <Select.Option value='0011'>资产运营</Select.Option>
                  <Select.Option value='0012'>销售服务</Select.Option> */}
                </Select>
              </span>
              <span>库存地:
                <Select
                  value={this.state.params.store}
                  style={{width: 165, margin: '0px 0px 5px 8px', display: 'inline-block',}}
                  placeholder="请选择"
                  onChange={this.onChangeStore}
                >
                  {
                    goodsStore && goodsStore.map((v, i) => (
                      <Select.Option key={i} value={v.wcode}>{v.name}</Select.Option>)
                    )
                  }
                  {/* <Select.Option value='1004'>运行部抢修队仓库</Select.Option>
                  <Select.Option value='1011'>城北综合维护所</Select.Option> */}
                </Select>
              </span>
            </div>
            <div>
              <span>快速查询:
                <Input
                  type="text"
                  style={{width: '185px', margin: '0px 14px 5px 8px'}}
                  value={this.state.params.condition}
                  onChange={this.onChangeCondition}
                  placeholder="物资名称"
                />
              </span>
              <Button type="primary" style={{marginRight: 10}} onClick={this.handleGetEmerGoods}>查询</Button>&nbsp;&nbsp;&nbsp;
              <Button style={{marginRight: 10}} onClick={this.reset}>重置</Button>&nbsp;&nbsp;&nbsp;
              <Button style={{marginRight: 10}} onClick={() => this.handleOpenOrCloseDispatchOrder('open')}>调度</Button>&nbsp;&nbsp;&nbsp;
            </div>
            <Table
              rowKey={(record) => record.gid + record.faccode}
              bordered
              columns={columns}
              dataSource={this.state.emerGoodsList}
              pagination={pagination}
              scroll={{y:300}}
              rowSelection={rowSelection}
            />
          </div>
        </Dialog>
        {/*  物资调度指令 */}
        {
          this.state.openDispatchOrder ? <EmerGoodsDispatchOrder
            the_emerGoods={this.state.the_emerGoods}
            onCancel={() => this.handleOpenOrCloseDispatchOrder('close')}
            myStore={this.state.params.store}
            theCurrentEmerEvent={this.state.currentEmerEvent}
          /> : ''
        }
      </div>
    );
  }
}

import React from 'react';
import {Table, Button} from 'antd';
import EmerCarDispatchOrder from './emerCarDispatchOrder.jsx';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';

// 引入应急人员数据
import emerCarList from '../data/car.js';

export default class EmerCarDispatch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emerCarList: [],
      openDispatchOrder: false,
      the_emerCar: null,
    };
  }

  componentDidMount = () => {
    // this.handleGetEmerUser();
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };

  // 获取应急车辆信息
  handleGetEmerUser = () => {
    let op = '应急演练';
    if (op === '应急演练') {
      // 加载应急车辆脚本
      this.setState({
        emerCarList: emerCarList.data,
      });
    } else {
      // 调用服务获取应急人员信息

    }
  }

  // 打开/关闭车辆调度指令窗口
  handleOpenOrCloseDispatchOrder = (op, record) => {
    if (op === 'open') {
      this.setState({
        the_emerCar: record,
        openDispatchOrder: true,
      });
    } else {
      this.setState({
        the_emerCar: record,
        openDispatchOrder: false,
      });
    }
  }

  render = () => {
    const {onCancel, emerEvent, token, emerCarData} = this.props;
    const carColumns = [{
      title: '#',
      width: 38,
      render: (text, record, index) => (
        <span>{index + 1}</span>
      ),
    }, {
      title: '车牌号',
      dataIndex: 'Vehicle',
    }, {
      title: '电话',
      dataIndex: 'Tel',
    }, {
      title: '操作',
      render: (text) => (
        <span>
          <Button
            type="primary"
            size="small"
            onClick={(op, record) => this.handleOpenOrCloseDispatchOrder('open', text)}
          >调度</Button>
        </span>
      ),
    }];
    if (emerEvent) {
      carColumns.splice(3, 0, {title: '距离(米)', key: 'distance', dataIndex: 'distance', width: 100});
    }
    return (
      <div>
        <Dialog
          title="车辆调度"
          width={470}
          onClose={onCancel}
        >
          <div style={{margin: 10}}>
            <span>车辆列表:</span>
            <Table
              bordered
              columns={carColumns}
              dataSource={emerCarData}
            />
          </div>
        </Dialog>
        {/* 车辆调度指令 */}
        {
          this.state.openDispatchOrder ? <EmerCarDispatchOrder
            emerEvent={emerEvent}
            the_emerCar={this.state.the_emerCar}
            onCancel={(op, record) => this.handleOpenOrCloseDispatchOrder('close', null)}
            map={this.props.map}
          /> : ''
        }
      </div>
    );
  }
}

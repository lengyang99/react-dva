import React, {PureComponent} from 'react';
import {Link} from 'dva/router';
import moment from 'moment';
import {Table, DatePicker} from 'antd';

const {RangePicker} = DatePicker;

const ACCOUNTS = [
  {
    gid: 1,
    rowNum: 1,
    name: '永唐秦值班日志',
    templateName: 'YTQ_STATION_WORK_LOG',
    tt: 1,
    time: moment(),
    path: 'exportWorkLogExcel'
  },
  {
    gid: 2,
    rowNum: 2,
    name: '永唐秦门站运行记录',
    templateName: 'YTQ_STATION_RUN_LOG',
    tt: 2,
    time: [moment(), moment()],
    path: 'exportRunPlanExcel'
  },
  {
    gid: 3,
    rowNum: 3,
    name: '永唐秦环城高压撬运行记录表',
    templateName: 'YTQ_STATION_HCGYQ_LOG',
    tt: 2,
    time: [moment(), moment()],
    path: 'exportRunPlanExcel'
  },
  {
    gid: 4,
    rowNum: 4,
    name: '永唐秦LNG运行参数记录(罐区部分)',
    templateName: 'YTQ_STATION_LNG_LOG_GQ',
    tt: 2,
    time: [moment(), moment()],
    path: 'exportRunPlanExcel'
  },
  {
    gid: 5,
    rowNum: 5,
    name: '永唐秦LNG运行参数记录(计量撬部分)',
    templateName: 'YTQ_STATION_LNG_LOG_JLQ',
    tt: 2,
    time: [moment(), moment()],
    path: 'exportRunPlanExcel'
  }

];


class AccTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: ACCOUNTS,
    };
  }

  componentWillReceiveProps(nextProps) {

  }

  // handleTableChange = (pagination, filters, sorter) => {
  //   this.props.onChange(pagination, filters, sorter);
  // };


  exportExcel = (data,format='') => {
    const {tt, time, templateName, path} = data;

    const params = {
      templateName,
      format
    };
    if (tt === 1) {
      params.day = time.format('YYYY-MM-DD');
    }else{
      const [s,e] = time;
      params.startTime=s.format('YYYY-MM-DD 06:00:00');
      params.endTime=e.add(1,'days').format('YYYY-MM-DD 06:00:00');
    }

    return this.props.exportAccount(params,path);
  };

  handleFieldChange(fieldName, value, key) {
    const newData = [...this.state.data];
    const target = this.getRowByKey(key);
    if (target) {
      target[fieldName] = value;
      this.setState({data: newData});
    }
  }

  getRowByKey(key) {
    return this.state.data.filter(item => item.gid === key)[0];
  }

  render() {
    const style = {width: 220};
    const columns = [
      {
        title: '序号',
        dataIndex: 'gid',
      },
      {
        title: '台账名称',
        dataIndex: 'name',
      },
      {
        title: '选择时间',
        dataIndex: 'time',
        render: (text, record) => {
          let {tt} = record;
          const timeProps = {
            style: style,
            value: text,
            onChange: (date) => {
              this.handleFieldChange('time', date, record.gid);
            },
            allowClear: false
          };
          if (tt === 1) {
            return <DatePicker
              {...timeProps}
            />
          } else {
            return <RangePicker
              {...timeProps}
            />;
          }

        }
      },
      {
        title: '操作',
        dataIndex: 'cz',
        render: (value, record) => {
          return (
            <span>
              <a href={this.exportExcel(record)} download>导出</a>　
              <a href={this.exportExcel(record,'html')} target="_blank">预览</a>
            </span>

          )
        },
      },
    ];
    return (
      <div>
        <Table
          rowKey='gid'
          dataSource={this.state.data}
          columns={columns}
          pagination={false}
        />
      </div>
    );
  }
}

export default AccTable;

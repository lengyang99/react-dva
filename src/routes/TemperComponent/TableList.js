import React, { PureComponent } from 'react';
import {Table, Popconfirm, Icon} from 'antd';
import styles from './index.less';


export default class TableList extends PureComponent {
    editPlan = (record) => {
      this.props.editPlan(record);
    }
    delPlan = (record) => {
      this.props.editPlan(record);
    }
    render() {
      const {showMore, canAdd, canEdit, pagination, handleTableChange, readPlan, data} = this.props;
      const columns = [
        {
          title: '仪表编号',
          dataIndex: 'meterCode',
          width: '15%',
        },
        {
          title: '描述',
          dataIndex: 'scheduleDesc',
          width: '15%',
        },
        {
          title: '量程',
          dataIndex: 'gasRange',
          width: '5%',
        },
        {
          title: '测量值',
          dataIndex: 'scheduleObserved',
          width: '5%',
        },
        {
          title: '单位',
          dataIndex: 'scheduleUnit',
          width: '5%',
        },
        {
          title: '时间',
          dataIndex: 'scheduleTime',
          width: '15%',
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: '10%',
          render: (text, record) => (
            <span>
              {(!showMore && canAdd) || (showMore && canEdit) ?
                <a onClick={() => { this.editPlan({...record, action: '编辑'}); }}>编辑</a> : null}
              {/* <span style={{color: 'e8e8e8'}}> | </span>
              <Popconfirm title="确认删除?" onConfirm={() => this.delPlan({ ...record, action: '删除' })}>
                <a>删除</a>
              </Popconfirm> */}
            </span>
          ),
        }];
      if (showMore) {
        const rightColumns = [
          {
            title: '调整时间',
            dataIndex: 'adjustTime',
            width: '15%',
          },
          {
            title: '单位',
            dataIndex: 'adjustUnit',
            width: '5%',
          },
          {
            title: '测量值',
            dataIndex: 'adjustObserved',
            width: '5%',
            className: styles.border,
          },
        ];
        rightColumns.forEach((item, index) => {
          columns.splice(columns.length - index - 1, 0, item);
        });
      }
      return (
        <div>
          <div>
            <div className={styles['span-button']}>
              <div className={styles.order2} />
              <span style={{ fontSize: 16 }}>上游</span>
              {showMore ? <div style={{display: 'inline-block', position: 'relative', left: '60%'}}>
                <div className={styles.order2} />
                <span style={{ fontSize: 16 }}>站内检测</span>
              </div> : null}
              <a style={{ marginLeft: 8, float: 'right'}} onClick={readPlan}>
                {showMore ? '收起' : '展开'}{showMore ? <Icon type="left" /> : <Icon type="right" />}
              </a>
            </div>
            <div >
              <Table
                dataSource={data || []}
                columns={columns}
                pagination={pagination}
                onChange={handleTableChange}
              />
            </div>
          </div>
        </div>
      );
    }
}

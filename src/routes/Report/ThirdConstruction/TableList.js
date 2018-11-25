import React, { PureComponent } from 'react';
import {Table} from 'antd';
import styles from './index.less';
import ConstructionBar from './ConstructionBar';
import ControlBar from './ControlBar';

export default class TableList extends PureComponent {
    getSum = (arr) => {
      if (!arr || arr.length === 0) {
        return 0;
      }
      let sum = null;
      arr.forEach(item => {
        if (!item) {
          sum += 0;
        } else {
          sum += item;
        }
      });
      return sum;
    }
    render() {
      const { thridConData, stationNames, reportData} = this.props;
      const { zdData, ybData, newData, totalData, jxData, dgData, rgData, qtData, cjData } = reportData || {};
      const showBar = stationNames && stationNames.length !== 0;
      const data = thridConData;
      data.forEach((item, index) => {
        Object.assign(item, {index: index + 1});
      });
      const Footer = () => {
        return (
          <div>
            <div className={styles['field-block4']}>
              <label style={{width: '10%', textAlign: 'center'}} >合计 </label>
              <label style={{width: '15%', textAlign: 'center'}} />
              <label style={{width: '25%', textAlign: 'center'}}>{this.getSum(zdData)}</label>
              <label style={{width: '25%', textAlign: 'center'}}>{this.getSum(ybData)} </label>
              <label style={{width: '25%', textAlign: 'center'}}>{this.getSum(totalData || [])}</label>
            </div>
          </div>
        );
      };
      const Footer2 = () => {
        return (
          <div>
            <div className={styles['field-block4']}>
              <label style={{width: '10%', textAlign: 'center'}} >合计 </label>
              <label style={{width: '15%', textAlign: 'center'}} />
              <label style={{width: '17%', textAlign: 'center'}}>{this.getSum(rgData)}</label>
              <label style={{width: '17%', textAlign: 'center'}}>{this.getSum(jxData)} </label>
              <label style={{width: '17%', textAlign: 'center'}}>{this.getSum(dgData)}</label>
              <label style={{width: '12%', textAlign: 'center'}}>{this.getSum(cjData)}</label>
              <label style={{width: '12%', textAlign: 'center'}}>{this.getSum(qtData)}</label>
            </div>
          </div>
        );
      };
      const columns = [
        {
          title: '序号',
          dataIndex: 'index',
          width: '10%',
        },
        {
          title: '所属辖区',
          dataIndex: 'station',
          className: styles['column-center'],
          width: '15%',
        },
        {
          title: '重点施工(个)',
          dataIndex: 'controlKey',
          className: styles['column-center'],
          width: '25%',
        },
        {
          title: '一般施工(个)',
          dataIndex: 'controlNormal',
          className: styles['column-center'],
          width: '25%',
        },
        {
          title: '总数(个)',
          dataIndex: 'totalNum',
          className: styles['column-center'],
          width: '25%',
          render: (text, record) => {
            return <span>{record.totalNum || 0}</span>;
          },
        },
      ];
      const columns2 = [
        {
          title: '序号',
          dataIndex: 'index',
          className: styles['column-center'],
          width: '10%',
        },
        {
          title: '所属辖区',
          dataIndex: 'station',
          className: styles['column-center'],
          width: '15%',
        },
        {
          title: '人工开挖(个)',
          dataIndex: 'rgNum',
          className: styles['column-center'],
          width: '17%',
        },
        {
          title: '机械开挖(个)',
          dataIndex: 'jxNum',
          className: styles['column-center'],
          width: '17%',
        },
        {
          title: '穿越顶管(个)',
          dataIndex: 'dgNum',
          className: styles['column-center'],
          width: '17%',
        },
        {
          title: '拆建(个)',
          dataIndex: 'cjNum',
          className: styles['column-center'],
          width: '12%',
        },
        {
          title: '其他(个)',
          dataIndex: 'qtNum',
          className: styles['column-center'],
          width: '12%',
        },
      ];
      return (
        <div className={styles.container}>
          <div className={`${styles.block} ${styles.left}`} >
            <div className={styles.title} />
            <span style={{color: '#1890ff'}}>管控级别</span>
            <Table
              className={styles.table}
              dataSource={data || []}
              columns={columns}
              rowKey={record => record.index}
              scroll={{x: true, y: '210px'}}
              pagination={false}
            />
            <Footer />
          </div>
          <div className={`${styles.block} ${styles.right}`} >
            {showBar ? <ControlBar
              reportData={this.props.reportData}
              stationNames={this.props.stationNames}
            /> : null}
          </div>
          <div className={`${styles.block} ${styles.left}`} >
            <div className={styles.title} />
            <span style={{color: '#1890ff'}}>施工方式</span>
            <Table
              className={styles.table}
              dataSource={data || []}
              columns={columns2}
              pagination={false}
              scroll={{x: true, y: '210px'}}
              rowKey={record => record.index}
            />
            <Footer2 />
          </div>
          <div className={`${styles.block} ${styles.right}`} >
            {showBar ? <ConstructionBar
              reportData={this.props.reportData}
              stationNames={this.props.stationNames}
            /> : null}
          </div>
        </div>
      );
    }
}

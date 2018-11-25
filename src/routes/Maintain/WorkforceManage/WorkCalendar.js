import React, { PureComponent } from 'react';
import moment from 'moment';
import {Calendar, Popover, Icon, Button, Select, Popconfirm, Checkbox, message} from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import styles from './index.less';
import DetailModal from './DetailModal';
import NewModal from './NewModal';
import EditModal from './EditModal';

const Option = Select.Option;
@connect(({ IntelliSche, login, maintain, station}) => ({
  stationData: IntelliSche.stationData,
  patrolPlanList: maintain.patrolPlanList,
  feedbackUsers: station.feedbackUsers,
  user: login.user,
}))
export default class WorkCalendar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectDate: null,   //点击日历时间
      searchTime: moment().format('YYYY-MM'),  //查询时间
      visible: {}, // 当前排班信息是否可见
      pbCheck: {}, // 当前排班信息是否选中
      show: false,
      showDetail: false,
      showEdit: false,
      pbData: [], // 排班数据
      pbDetailData: [], // 排班详情数据
      pbEditData: [],  //编辑数据
      cachePbData: [], // 暂存排班数据
      checkData: {},   //查询条件
      isFilterChange: false,  //是否查询计划列表
    };
  }
    componentDidMount() {
      this.props.onRef(this);
      
    }
    componentWillReceiveProps(nextProps){
      console.log(nextProps, 'nextProps')
    }
    componentWillUnmount() {
      this.props.onRef(null);
    }
    getSchedulData = (params) => {
      if(params && params.selectd){
        this.setState({
          checkData: params,
        })
      }
      this.props.dispatch({
        type: "maintain/queryWorkForceList",
        payload: {
          searchTime: this.state.searchTime,
          regionId: params ? params.regionId : '',
          zoneId: params ? params.zoneId : '',
          pbType: params ? params.pbType : '',
        },
        callback: (res) => {
          const arr = [];
          for (let i = 0; i < res.data.length; i++) {
            arr.push(Object.assign({}, res.data[i]));
          }
          this.setState({
            pbData: res.data || [],
            cachePbData:arr,
          })
        },
      })
    };

    // 选择日期
    onSelect = (value) => {
      console.log(value, 'select')
      const selectMonth = Number(value.format('MM'));
      const nowMonth = new Date().getMonth() + 1;
      // if(nowMonth !== selectMonth){
      //   this.setState({searchTime: value.format('YYYY-MM')});
      // }
      this.setState({selectDate: value.format('YYYY-MM-DD')});
    };
    
    showModal = (val, selectTime, pbData) => {
      const {checkData, searchTime} = this.state;
      if(val === 'new'){
        this.setState({show: true});
      }else if(val === 'edit'){
        this.setState({
          pbEditData: pbData,
          showEdit: true,
        }, () => {
          this.editcalendar.onStartData(pbData)
        })
      }else if(val === 'detail'){
        this.setState({
          pbDetailData: pbData,
          showDetail: true,
        })
      }
    }
    // 切换时间
    onPanelChange = (value) => {
      this.setState({
        searchTime: value.format('YYYY-MM'),
      }, () => {
        this.props.onDateChange();
        this.getSchedulData(this.state.checkData);
      })
    }

    dateCellRender = (value) => {
      const selectDate = value.format('YYYY-MM-DD');
      const selectMonth = value.format("YYYY-MM");
      const {pbData} = this.state;
      const dayPb = pbData.filter(item => item.pbDate === selectDate)
      const areaArr = [];
      dayPb.length > 0 && dayPb.map(item => {
        if(_.some(areaArr), ['name', item.regionName]){
          areaArr.push({name: item.regionName, regionid: []})
        }
      })
      return (
        pbData && _.some(pbData, ['pbDate', selectDate]) && dayPb[0].workList && dayPb[0].workList[0] ?
        <ul className={styles["events"]}>
          {dayPb.length > 0 && dayPb.map((item, index) => 
            <li style={{marginBottom: 5}}>
              <div><b>{item.regionName}</b></div>
              <div style={{marginLeft: 5}}>
                {/* <span style={{marginRight: 10}}>{item.workList[0].workContent}</span> */}
                {/* <span>{bcList.bcName}</span> */}
                <div>
                  <img src="images/scheduling/白班.png" alt="太阳" style={{width: 16, height: 16, marginBottom: 5, marginRight: 4}}/>
                  {
                  item.workList.length > 0 && item.workList[0].bcList && dayPb[0].workList[0].bcList[0].zbrList && item.workList[0].bcList[0].zbrList.length > 0 && item.workList[0].bcList[0].zbrList.map(item1 => (
                      <span>{item1.userName}{" "}</span>
                    ))
                  }
                </div>
                {dayPb.length === index + 1 ?
                  <div style={{textAlign: 'right'}}>
                    {/* <span style={{cursor: 'pointer', marginRight: 10, display: value > moment().add(-1, 'day') ? 'inline-block' : 'none'}} onClick={() => this.showModal('new', selectDate, item)}><Icon type="plus" /></span>*/}
                    <span style={{cursor: 'pointer', display: value > moment().add(-1, 'day') ? 'inline-block' : 'none', marginRight: 10}} onClick={() => this.showModal('edit', selectDate, dayPb)}><img src="images/scheduling/编辑-点击.png" alt="编辑" style={{width: 13, height: 13, marginBottom: 5}}/></span>
                    <span style={{cursor: 'pointer', display: value <= moment().add(-1, 'day') ? 'inline-block' : 'none', marginRight: 10}} onClick={() => this.showModal('detail', selectDate, dayPb)}><img src="images/scheduling/详情-点击.png" alt="详情" style={{width: 12, height: 13, marginBottom: 5}}/></span>
                  </div> : null
                }
              </div>
            </li>
          )}
        </ul>
        :
        <div onClick={() => { this.showModal('new', value)}} style={{width: '100%', height: '100%', textAlign: 'center', display: value > moment().add(-1, 'day') ? 'block' : 'none'}} ><Icon type="plus" style={{fontSize: 70, color: '#F0F2F5'}}/></div>
      )
    }
    // 保存
    handleOk = (data) => {
      let canSave = true;
      // 验证保存信息
      data.forEach(item => {
        if (!item.workContent || item.zbrList.length === 0) {
          canSave = false;
          message.warn('请将排班信息填写完整再保存');
        }
      });
      if (canSave) {
        const items = [];
        const workList = [];
        data.length > 0 && data.map(item => {
          const zbrList = []
          item.zbrList.length > 0 && item.zbrList.map(item1 => {
            zbrList.push({
              userId: item1.id,
              userName: item1.name,
            })
          })
          // workList.push({
          //   workContentId: item.workContent.id,
          //   workContent: item.workContent.name,
          //   bcList:[
          //     {
          //       bcName: '白班',
          //       bcId: 19,
          //       zbrList,
          //     }
          //   ]
          // })

          items.push({
            regionId: item.regionId,
            regionName: item.regionName,
            zoneId: this.props.zoneId,
            pbDate: this.state.selectDate,
            ecode: this.props.user.ecode,
            workList: [
              {
                workContentId: item.workContent.id,
                workContent: item.workContent.name,
                bcList:[
                  {
                    bcName: '白班',
                    bcId: 19,
                    zbrList,
                  }
                ]
              }
            ],
          })
        })
        

        console.log(items, 'itemsssss')
        this.props.dispatch({
          type: 'maintain/addWorkforce',
          payload: {items: JSON.stringify(items)},
          callback: (res) => {
            if (res.success) {
              message.success(res.msg);
              this.handleCancel('new');
              this.getSchedulData(this.state.checkData);
            } else {
              message.warn(res.msg);
            }
          },
        });
      }
    };
    handleEditOk = (data, rowKey) => {
      let canSave = true;
      // 验证保存信息
      data.forEach(item => {
        if (!item.workContent || item.zbrList.length === 0) {
          canSave = false;
          message.warn('请将排班信息填写完整再保存');
        }
      });
      if (canSave) {
        // const {pbId, regionId, zoneId, regionName} = pbId;
        const items = [];
        const params = [];
        data.length > 0 && data.map(item => {
          const workList = [];
          const zbrList = []
          item.zbrList.length > 0 && item.zbrList.map(item1 => {
            zbrList.push({
              userId: item1.id,
              userName: item1.name,
            })
          })
          workList.push({
            gid: item.workListId ? item.workListId : '',
            workContentId: item.workContent.id,
            workContent: item.workContent.name,
            bcList:[
              {
                bcName: '白班',
                bcId: 19,
                zbrList,
              }
            ]
          })
          items.push({
            gid: isNaN(Number(item.gid)) ? '' : item.gid,
            regionId: item.regionId,
            regionName: item.regionName,
            zoneId: item.zoneId,
            pbDate: this.state.selectDate,
            ecode: this.props.user.ecode,
            workList,
          })
        })
        
        console.log(data, items,rowKey, 'itemsssss')
        //删除的排班计划
        if(rowKey.length > 0){
          this.props.dispatch({
            type: 'maintain/delWorkforce',
            payload: {pbId: rowKey.join(",")},
          });
        }
        this.props.dispatch({
          type: 'maintain/addWorkforce',
          payload: {items: JSON.stringify(items)},
          callback: (res) => {
            if (res.success) {
              message.success(res.msg);
              this.handleCancel('edit');
              this.getSchedulData(this.state.checkData);
            } else {
              message.warn(res.msg);
            }
          },
        });
      }
    };
    // 重置还原
    handleReset = (val) => {
      if(val === 'new'){
        this.newcalendar.onReset()
      }else if(val === 'edit'){
        this.editcalendar.onReset()
      }
    }
    // 取消
    handleCancel = (val) => {
      this.handleReset(val);
      if(val === 'new'){
        this.setState({show: false});
      }else if(val === 'edit'){
        this.setState({showEdit: false});
      }else if(val === 'detail'){
        this.setState({showDetail: false});
      }
    }

    render() {
      const { selectDate, pbData, pbDetailData, pbEditData } = this.state;
      const {region} = this.props;
      return (
        <div className={styles["calendar"]}>
          <Calendar
            dateCellRender={this.dateCellRender}
            onPanelChange={this.onPanelChange}
            onSelect={this.onSelect}
          />
          <NewModal
            {...this.props}
            onRef={(ref) => { this.newcalendar = ref; }}
            selectDate={selectDate}
            data={pbData}
            show={this.state.show}
            handleOk={this.handleOk}
            handleReset={() => this.handleReset('new')}
            handleCancel={() => this.handleCancel('new')}
            region={{id: region.id, name: region.name}}
            areaData={this.props.areaData}
            stationid={this.props.stationid}
          />
          <EditModal
            {...this.props}
            onRef={(ref) => { this.editcalendar = ref; }}
            selectDate={selectDate}
            data={pbEditData}
            show={this.state.showEdit}
            handleOk={this.handleEditOk}
            handleReset={() => this.handleReset('edit')}
            handleCancel={() => this.handleCancel('edit')}
            areaData={this.props.areaData}
            stationid={this.props.stationid}
            zoneId={this.props.zoneId}
          />
          <DetailModal
            {...this.props}
            onRef={(ref) => { this.detailcalendar = ref; }}
            selectDate={selectDate}
            data={pbDetailData}
            show={this.state.showDetail}
            handleOk={this.handleOk}
            handleCancel={() => this.handleCancel('detail')}
          />
        </div>
        
      );
    }
}

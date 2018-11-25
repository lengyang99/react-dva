import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Dialog from '../../components/yd-gis/Dialog/Dialog';
import LegendCheckbox from './LegendCheckbox';
import styles from './TraceLegend.less';

const dataTransform = (data) => {
  const equipments = data.layertypes.equipment;
  const keyPoints = data.layertypes.keypoint;
  const pipesections = data.layertypes.pipesection;
  const keyline = data.layertypes.keyline;
  let taskData = [];
  let pipeLineData = [];
  let totalTask = 0;
  let keyLineData = [];

  if (keyPoints && keyPoints[0]) {
    keyPoints.map(item => {
      totalTask += item.datas.length;
      taskData.push(
        {
          name: `未到位${item.name}`,
          number: item.datas.filter(item1 => item1.isArrive === 0).length,
          data: item.datas.filter(item1 => item1.isArrive === 0),
          color: './images/task-detail/overTime.png',
          type: 'point',
        },
        {
          name: `已到位${item.name}`,
          number: item.datas.filter(item1 => item1.isArrive === 1).length,
          data: item.datas.filter(item1 => item1.isArrive === 1),
          color: './images/task-detail/isArrive.png',
          type: 'point',
        },
        {
          name: `已反馈${item.name}`,
          number: item.datas.filter(item1 => item1.isFeedback === 1).length,
          data: item.datas.filter(item1 => item1.isFeedback === 1),
          color: './images/task-detail/noArrive.png',
          type: 'point',
        },
      );
    })

  }

  if (equipments && equipments[0]) {
    totalTask += equipments[0].datas.length;
    let overTimeSrc = '';
    let arriveTimeSrc = '';
    equipments.map(item => {
      if(item.layername === '2'){
        overTimeSrc = 'pressureDevice_overTime.png'
        arriveTimeSrc = 'pressureDevice_isArrive.png'
      }else if(item.layername === '14'){
        overTimeSrc = 'housePoint_overTime.png'
        arriveTimeSrc = 'housePoint_isArrive.png'
      }else if(item.layername === '3'){
        if(item.name.includes('高')){
          overTimeSrc = 'h_valve_overTime.png'
          arriveTimeSrc = 'h_valve_isArrive.png'
        }else if(item.name.includes('中')){
          overTimeSrc = 'm_valve_overTime.png'
          arriveTimeSrc = 'm_valve_isArrive.png'
        }else{
          overTimeSrc = 'valve_overTime.png'
          arriveTimeSrc = 'valve_isArrive.png'
        }
      }else if(item.layername !== '2' && item.layername !== '3' && item.layername !== '14'){
        overTimeSrc = 'overTime.png'
        arriveTimeSrc = 'isArrive.png'
      }
      taskData.push(
        {
          name: `未到位${item.name}`,
          number: item.datas.filter(item1 => item1.isArrive === 0).length,
          data: item.datas.filter(item1 => item1.isArrive === 0),
          color: `./images/task-detail/${overTimeSrc}`,
          type: 'point',
        },
        {
          name: `已到位${item.name}`,
          number: item.datas.filter(item1 => item1.isArrive === 1).length,
          data: item.datas.filter(item1 => item1.isArrive === 1),
          color: `./images/task-detail/${arriveTimeSrc}`,
          type: 'point',
        }
      );
    })
  }

  if (pipesections && pipesections.length > 0) {
    let pipeArr = [];
    let arriveLineArr = [];
    pipesections.map(item => {
      item.datas.map(item1 => {
        pipeArr.push(item1)
      })
    })
    pipeLineData.push(
      {
        name: '未覆盖(m)',
        number: data.totalLine - data.arriveLine < 0 ? 0 : data.totalLine - data.arriveLine,
        data: pipeArr.filter(item => item.isCover === 0),
        color: 'red',
        type: 'line',
      },
      {
        name: '已覆盖(m)',
        number: data.arriveLine < data.totalLine ? data.arriveLine : data.totalLine,
        data: pipeArr.filter(item => item.isCover === 0),
        color: 'green',
        type: 'line',
      },
    )
  }

  if (keyline && keyline.length > 0) {
    let keylineArr = [];
    let arriveLineArr = [];
    pipesections.map(item => {
      item.datas.map(item1 => {
        keylineArr.push(item1)
      })
    })
    keyLineData.push(
      {
        name: '未覆盖(m)',
        number: data.totalKeyline - data.arriveKeyline < 0 ? 0 : data.totalKeyline - data.arriveKeyline,
        data: keylineArr.filter(item => item.isCover === 0),
        color: 'red',
        type: 'line',
      },
      {
        name: '已覆盖(m)',
        number: data.arriveKeyline < data.totalKeyline ? data.arriveKeyline : data.totalKeyline,
        data: keylineArr.filter(item => item.isCover === 0),
        color: 'green',
        type: 'line',
      },
    )
  }

  return {
    totalTask,
    totalLine: data.totalLine,
    taskData,
    pipeLineData,
    keyLineData,
  };
};
@connect(state => ({
  patrolTaskDetailData: state.patrolPlanList.patrolTaskDetailData || {},
  patrolDetailAllData: state.patrolPlanList.patrolDetailAllData,
}))
export default class TraceLegend extends PureComponent {
  onChange = (type, val) => {
    const values = val.data;
    console.log(type, values);
    if(type === 'task'){
      let pointArr = [];
      (val || []).map(item => {
        item.data.map(item1 => {
          pointArr.push(item1)
        })
      })
      // 绘制关键点
      let mainPoinst = pointArr.filter((item) => { return item.layername === '关键点' });;
      // 绘制调压设备dno=2
      let pressureDevice = pointArr.filter((item) => { return item.layername === '2' });
      // 绘制庭院点dno=14
      let housePoint = pointArr.filter((item) => { return item.layername === '14' });
      // 绘制阀门dno=3

      //阀门
      let valve = pointArr.filter((item) => { return item.layername === '3' && !item.name.includes('高') && !item.name.includes('中')});
      //中阀门
      let valve_m = pointArr.filter((item) => { return item.layername === '3' && item.name.includes('中')});
      //高阀门
      let valve_h = pointArr.filter((item) => { return item.layername === '3' && item.name.includes('高')});

      // 设备里的其他类型
      let otherDevice = pointArr.filter((item) => {
        return item.layername !== '2' && item.layername !== '3' && item.layername !== '14' && item.layername !== '关键点';
      });
      this.props.map.getMapDisplay().removeLayer('testlayer0');
      this.props.showPoint(mainPoinst, { isArrive: 'isArrive.png', noArrive: 'noArrive.png', overTime: 'overTime.png' });
      this.props.showPoint(pressureDevice, { isArrive: 'pressureDevice_isArrive.png', noArrive: 'pressureDevice_noArrive.png', overTime: 'pressureDevice_overTime.png' });
      this.props.showPoint(housePoint, { isArrive: 'housePoint_isArrive.png', noArrive: 'housePoint_noArrive.png', overTime: 'housePoint_overTime.png' });
      this.props.showPoint(valve, { isArrive: 'valve_isArrive.png', noArrive: 'valve_noArrive.png', overTime: 'valve_overTime.png' });
      this.props.showPoint(valve_m, { isArrive: 'm_valve_isArrive.png', noArrive: 'm_valve_noArrive.png', overTime: 'm_valve_overTime.png' });
      this.props.showPoint(valve_h, { isArrive: 'h_valve_isArrive.png', noArrive: 'h_valve_noArrive.png', overTime: 'h_valve_overTime.png' });
      this.props.showPoint(otherDevice, { isArrive: 'isArrive.png', noArrive: 'noArrive.png', overTime: 'overTime.png' });
    }
    if(type === 'pipeLine'){
      this.props.showPath(undefined, 2, 'stop')
      this.props.map.getMapDisplay().removeLayer('taskPipeLine');
      this.props.map.getMapDisplay().removeLayer('taskOverPipeLine');
      this.props.map.getMapDisplay().removeLayer('taskOverPipeLine1');
      (val || []).map(item => {
        if(item.color === 'red'){
          this.props.checkPath(item.data, 2, 'red')
        }
        if(item.color === 'green'){
          item.data.map((item1, index) => {
            let overPipeList = item1.coverLineList;
            for (let i = 0; i < overPipeList.length; i++) {
              let overPipe = overPipeList[i].coverLine;
              if (overPipe) {
                let overPipes = JSON.parse(overPipe);
                for (let k = 0; k < overPipes.length; k++) {
                  const op = overPipes[k];
                  const oparamLine = {
                    id: 'taskOverPipeLine' + index + i + k + 1,
                    layerId: 'taskOverPipeLine1',
                    layerIndex: 30,
                    dots: op.map((coor) => ({ x: coor[0], y: coor[1] })),
                    color: [0, 255, 0],
                    width: 4,
                  };
                  this.props.map.getMapDisplay().polyline(oparamLine);
                }
              }
            }

          })
        }
      })

    }
    // this.props.map.setLayerVisibility('testlayer0', false);
  };
  onCloseDetailDialog = () => {
    this.props.onClose();
  }
  render() {
    const { totalTask, taskData, pipeLineData, totalLine, keyLineData } = dataTransform(this.props.patrolDetailAllData);
    const { totalNum, totalKeyline } = this.props.patrolTaskDetailData;
    console.log('dataTransform(this.props.patrolTaskDetailData)', dataTransform(this.props.patrolDetailAllData));
    console.log('this.props.patrolTaskDetailData', this.props.patrolDetailAllData);

    return (
      <Dialog
        title="任务详情"
        width={350}
        height={435}
        position={{
          left: 10,
          top: 270,
        }}
        onClose={this.onCloseDetailDialog}
      >
        <div style={{maxHeight: 350, overflowY: 'scroll'}}>
          <div className={styles.container} style={{display: taskData.length === 0 ? 'none' : 'block'}}>
            <label htmlFor="task" className={styles.label}>巡视任务总数(个): {totalNum}</label>
            <LegendCheckbox
              type="task"
              list={taskData}
              onChange={this.onChange}
            />
          </div>
          <div className={styles.container} style={{display: pipeLineData.length === 0 ? 'none' : 'block'}}>
            <label htmlFor="pipeLine" className={styles.label}>巡视管线总长(m): {totalLine}</label>
            <LegendCheckbox
              type="pipeLine"
              list={pipeLineData}
              onChange={this.onChange}
            />
          </div>
          <div className={styles.container} style={{display: keyLineData.length === 0 ? 'none' : 'block'}}>
            <label htmlFor="keyLine" className={styles.label}>关键线总长(m): {totalKeyline}</label>
            <LegendCheckbox
              type="keyLine"
              list={keyLineData}
              onChange={this.onChange}
            />
          </div>
        </div>
      </Dialog>
    );
  }
}

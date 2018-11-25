import React from 'react';
import { connect } from 'dva';
import { Modal, message, Tooltip } from 'antd';
import styles from '../css/emerHandleProcess.css';

let getHandleProcessTimer = -1;

@connect(state => ({
  token: state.login.token,
  currentEmerEvent: state.emerLfMap.currentEmerEvent, // 当前应急事件
  currentEmerEventData: state.emerLfMap.currentEmerEventData, // 当前点击应急事件
}))

export default class EmerHandleProcess extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      openPictureViewer: false,
      // emerHandleProcessData: [],
      emerHandleProcessPic: [],
      num: 0,
    });
    message.config({
      duration: 1.5,
    });
  }

  componentDidMount = () => {
    // console.log('***emerHandleProcess***组件加载完毕');
    const { emerHandleProcessRecordData } = this.props;
    this.handleGetEmerHandlePic(emerHandleProcessRecordData);
  }

  componentWillReceiveProps = (nextProps) => {
    // console.log('***emerHandleProcess***组件接收到新的参数');
    // console.log(nextProps);
    this.handleGetEmerHandlePic(nextProps.emerHandleProcessRecordData);
  }

  componentWillUnmount = () => {
    // console.log('***emerHandleProcess***组件卸载');
    this.setState = (state, callback) => {};
  }

  // 打开/关闭图片查看器
  handleOpenPictureViewer = (op, record) => {
    if (this.state.emerHandleProcessPic.length === 0) {
      // 如果没有图片
      message.warning('当前没有图片可供查看');
      return false;
    }
    if (op === 'open') {
      if (record) {
        // 携带附件信息的应急处置记录，定位到当前图片
        console.log(record);
        console.log(this.state.emerHandleProcessPic);
        for (let i = 0; i < this.state.emerHandleProcessPic.length; i += 1) {
          let currentRecord = this.state.emerHandleProcessPic[i];
          if (record === currentRecord.imgAttachedFile) {
            this.setState({
              num: i,
              openPictureViewer: true,
            });
            return;
          }
        }
      } else {
        // 从第一张图片开始浏览
        let a = this.state.openPictureViewer;
        let b = this.state.num;
        this.setState({
          num: 0,
          openPictureViewer: true,
        });
        return;
      }
    } else {
      this.setState({
        openPictureViewer: false,
      });
    }
  }

  // 获取上报的图片
  handleGetEmerHandlePic = (emerHandleProcessRecordData) => {
    let picArr = [];
    for (let i = 0; i < emerHandleProcessRecordData.length; i += 1) {
      let picItem = emerHandleProcessRecordData[i];
      if (picItem.imgAttachedFile) {
        let pics = picItem.imgAttachedFile.split(',');
        for(let j = 0; j < pics.length; j += 1){
          picArr.push({...picItem, imgAttachedFile: pics[j]});
        }
      }
    }
    this.setState({
      emerHandleProcessPic: picArr,
    });
  }

  // 下一张图片
  add = (num, len) => {
    if (num === len - 1) {
      return false;
    }
    this.setState({
      num: num + 1,
    });
  }

  // 上一张图片
  minus = (num) => {
    if (num === 0) {
      return false;
    }
    this.setState({
      num: num - 1,
    });
  }

  render() {
    const { token, emerHandleProcessRecordData } = this.props;
    let picPath = 'proxy/attach/findById';
    let len = emerHandleProcessRecordData.length;
    let lenPic = this.state.emerHandleProcessPic.length;
    let picNum = this.state.num;
    let picOpen = this.handleOpenPictureViewer;
    let picAdd = this.add;
    let picMinus = this.minus;
    return (
      <div>
        <Modal
          title="图片查看器"
          visible={this.state.openPictureViewer}
          footer={null}
          mask={false}
          width={587}
          onCancel={(op, record) => this.handleOpenPictureViewer('close', null)}
          wrapClassName={'Modal'}
          bodyStyle={{ padding: 0 }}
        >
          {
            this.state.emerHandleProcessPic.map((item, index) => {
              return (
                <div>
                  {
                    picNum === index ? <div className={styles.emerEvent1}>
                      <div>
                        <div>
                          <div className={styles.left}>
                            {
                              picNum === 0 ? <img alt="leftArrow_invalidClick" src="../../images/emer/leftArrow_invalidClick.png" /> :
                              <img alt="leftArrow_validClick" src="../../images/emer/leftArrow_validClick.png" onClick={(num) => picMinus(picNum)} />
                            }
                          </div>
                          <img
                            alt={`${item.imgAttachedFile}`}
                            width={476}
                            height={350}
                            src={item.imgAttachedFile ? `${picPath}?token=${token}&id=${item.imgAttachedFile}` : ''}
                          />
                          <div className={styles.right}>
                            {
                              picNum === lenPic - 1 ?
                                <img alt="rightArrow_invalidClick" src="../../images/emer/rightArrow_invalidClick.png" /> :
                                <img alt="rightArrow_invalidClick" src="../../images/emer/rightArrow_validClick.png" onClick={(num, len) => picAdd(picNum, lenPic)} />
                            }
                          </div>
                        </div>
                        <p className={styles.footer}>
                          <span>{item.handleTime}</span>
                          <span>{item.handleContent}</span>
                          <span className={styles.textRight}>上报人:{item.handler}</span>
                        </p>
                      </div>
                    </div> : ''
                  }
                </div>
              );
            })
          }
        </Modal>
        <div className={styles.emerEvent}>
          <div className={styles.leftViewTitle}>
            处置进展
            <img
              alt="pictureView"
              className={styles.TwoImg}
              src="../../images/emer/pictureView.png"
              onClick={(op, record) => this.handleOpenPictureViewer('open', null)}
            />
          </div>
          <div className={styles.leftMain}>
            {
              emerHandleProcessRecordData.map(function (item, index) {
                return (
                  <p key={index}>
                    {len - 1 === index ? <img alt="timeLine" src="../../images/emer/timeLine-redPoint.png" /> :
                    <img alt="timeLine_bluePoint" src="../../images/emer/timeLine_bluePoint.png" />}
                    {len !== 0 && len - 1 === index ? '' : <div />}
                    {(item.handleTime || ' ').split(' ')[1]}
                    <span>{item.handler}</span>
                    <Tooltip placement="topLeft" title={item.handleContent}>
                      <a id={styles.link} onClick={(op, record) => this.handleOpenPictureViewer('open', item)}>
                        {item.handleContent}
                      </a>
                    </Tooltip>
                    {
                      item.imgAttachedFile ?
                        item.imgAttachedFile.split(',').map((item1, index) => {
                          return (
                            <img
                              alt={`${item1}`}
                              src={`${picPath}?token=${token}&id=${item1}`}
                              onClick={(op, record) => picOpen('open', item1)}
                              style={{ width: '20px', height: '20px', marginLeft: `${10 * (index + 1)}%`, marginTop: '11px' }}
                            />
                          );
                        }) : ''
                    }
                  </p>
                );
              })
            }
          </div>
        </div>
      </div>
    );
  }
}

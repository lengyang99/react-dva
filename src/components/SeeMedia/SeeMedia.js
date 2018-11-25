/**
 * Created by hexi on 2017/11/24.
 */
import React from 'react';
import PropTypes from 'prop-types';
import {message} from 'antd';
import styles from './index.css';

/**
 * 附件查看
 */
class SeeMedia extends React.PureComponent {
  static defaultProps = {
    open: false,
  };

  constructor(props) {
    super(props);

    this.attaches = [];
    // 图片的索引, 也就是attaches的下标, 默认为0
    this.index = this.props.indexShow || 0;
    this.zIndex = 99999;
    this.degree = 0;
    this.degreeX = 0;
    this.degreeY = 0;

    this.proxy = false;

    this.naturalWidth = 0;
    this.naturalHeight = 0;
    this.state = {
      showPrevBtn: true,
      showAfterBtn: true,
      shoeViewToolBar: true,
      nowAtt: props.attaches[0],
      width: window.innerWidth,
      height:  window.innerHeight
    }

    this.width =  window.innerWidth;
    this.height =  window.innerHeight;
    this.initHtml();
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeBody);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeBody);
  }

  resizeBody = () => {
    let that = this;
    let body = document.getElementsByTagName('body');
    that.width =  window.innerWidth;
    that.height =  window.innerHeight;

    that.setState({
      width: that.width,
      height: that.height
    });
  }

  initHtml = () => {
    if (this.props.attaches.length === 0) {
      console.error('The length of attaches must be above 0');
      return;
    }

    this.width = this.width || this.props.width;
    this.height = this.height || this.props.height;

    // this.handlePlaceholder();
    // this.createHtml();
  }

  handlePlaceholder = () => {
    this.props.attaches.forEach(function (attach) {
      if (attach.url.indexOf('${') !== -1) {
        var placeholder = attach.url.substring(attach.url.indexOf('${') + 2, attach.url.indexOf('}'));
        for (var i = 0; i < shareDisks.length; i++) {
          if (shareDisks[i].placeholder === placeholder) {
            attach.url = 'http://' + shareDisks[i].value + attach.url.substring(attach.url.indexOf('}') + 1);
            break;
          }
        }
      }
    });
  }

  createHtml = () => {
    let that = this;

    if (this.props.attaches.length === 0) {
      return;
    }

    let resultDiv = [];
    let maskWidth = that.width;
    let maskHeight = that.height;

    let markStyle = {
      zIndex: that.zIndex,
      // left: window.offset().left + 0,
      // top: window.offset().top + 0,
      width: maskWidth,
      height: maskHeight,
    };
    resultDiv.push(<div className={styles['media-center-mask']} style={markStyle}></div>);

    let canvasStyle = {
      zIndex: that.zIndex + 1,
      position: 'absolute',
      // left: window.offset().left + 0,
      // top: window.offset().top + 0,
      width: maskWidth,
      height: maskHeight
    };

    let picContainerStyle = {
      zIndex: that.zIndex + 1,
      position: 'absolute',
      textAlign: 'center',
      left: 0,
      top: 0,
      width: maskWidth,
      height: maskHeight,
      lineHeight: maskHeight - 6 + 'px'
    };

    let funMouseOver = () => {
      if (that.switchBtn) {
        this.setState({
          showPrevBtn: true,
          showAfterBtn: true
        });
      }
    };

    let funMouseOut = () => {
      if (that.switchBtn) {
        this.setState({
          showPrevBtn: false,
          showAfterBtn: false
        });
      }
    }

    let photoStyle = {
      width: '100%',
      height: '100%',
      verticalAlign: 'middle',
      maxWidth: maskWidth,
      maxHeight: maskHeight,
      position: 'relative'
    };

    let toolbarStyle = {
      width: '100%',
      position: 'absolute',
      height: that.height - 80
    };

    let prevBtnStyle = {
      'z-index': that.zIndex + 1,
      top: maskHeight * 0.4
    };

    let nextBtnStyle = {
      'z-index': that.zIndex + 2,
      top: maskHeight * 0.4,
      left: maskWidth * 0.98 - 60
    };

    let closeBtnStyle = {
      'z-index': that.zIndex + 1
    };

    let nextParam = '>';
    let beforeParam = '<';
    let attDiv = that.loadAttachment(that.index);
    resultDiv.push(
      <div className={styles['media-center-canvas']} style={canvasStyle}>
        <div style={picContainerStyle} onMouseOver={funMouseOver} onMouseOut={funMouseOut}>
          <div className="photo" style={photoStyle}>
              {attDiv}
          </div>
          {/*<div className="toolbar" style={toolbarStyle}>*/}
            {/*<ul class="viewer-toolbar" className={this.state.shoeViewToolBar ? styles.show : styles.hide}>*/}
              {/*<li role="button" className="viewer-zoom-in" data-action="zoom-in"></li>*/}
              {/*<li role="button" className="viewer-zoom-out" data-action="zoom-out"></li>*/}
              {/*<li role="button" className="viewer-one-to-one" data-action="one-to-one"></li>*/}
              {/*<li role="button" className="viewer-reset" data-action="reset"></li>*/}
              {/*<li role="button" className="viewer-prev" data-action="prev"></li>*/}
              {/*<li role="button" className="viewer-next" data-action="next"></li>*/}
              {/*<li role="button" className="viewer-rotate-left" data-action="rotate-left"></li>*/}
              {/*<li role="button" className="viewer-rotate-right" data-action="rotate-right"></li>*/}
              {/*<li role="button" className="viewer-flip-horizontal" data-action="flip-horizontal"></li>*/}
              {/*<li role="button" className="viewer-flip-vertical" data-action="flip-vertical"></li>*/}
            {/*</ul>*/}
          {/*</div>*/}
          <div className={styles["photo-info-bg"]}></div>
          <div className={styles["photo-info"]}>
            <p className="photo-info-time" style={{margin: '12px 0'}}></p>
            <p className="photo-info-remark"></p>
          </div>
          <div className={styles['closeBtn']} title="关闭" style={closeBtnStyle} onClick={this.closeAttBtn.bind(this)}>×</div>
          <div className={styles.prevBtn + ' '+ (that.state.showPrevBtn ? styles.show : styles.hide)} title = '上一张' onClick={that._preImage} style={prevBtnStyle}>{beforeParam}</div>
          <div className={styles.prevBtn + ' ' + (that.state.showAfterBtn ? styles.show : styles.hide)} title = '下一张' onClick={that._nextImage} style={nextBtnStyle}>{nextParam}</div>
        </div>
      </div>);
    return <div>{resultDiv}</div>;
  }

  closeAttBtn = () => {
    this.props.onClose();
  }

  loadAttachment = (index) => {
    let extension = this.props.attaches[index].type;
    let url = this.props.attaches[index].url;
    let name = this.props.attaches[index].name;
    if (extension) {
      extension = extension.toLowerCase();
    }

    if (extension === 'mp3') {
      this.setState({
        shoeViewToolBar: false,
      });
      return this._loadAudio(url);
    } else if (extension === 'mp4') {
      this.setState({
        shoeViewToolBar: false,
      });
      return this._loadVideo(url);
    } else if (extension === 'png' || extension === 'jpg' || extension === 'jpeg' || extension === 'gif') {
      this.setState({
        shoeViewToolBar: true,
      });
      return this._loadImage(url);
    } else if (extension === 'pdf') {
      this.setState({
        shoeViewToolBar: false,
      });
      return this._loadText(url);
    } else {
      this.setState({
        shoeViewToolBar: false,
      });
      return this._loadOtherMedia(url, name);
    }
  }

  // mouseWheelHandler = (e) => {
  //   let that = this;
  //   let e = window.event || e;
  //
  //   //判断鼠标滚轮 是上滑 还是下滑  上滑为1   下滑为-1
  //   let delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
  //   let ratio = 0.1;
  //   if (e.deltaY) {
  //     delta = e.deltaY > 0 ? 1 : -1;
  //   } else if (e.wheelDelta) {
  //     delta = -e.wheelDelta / 120;
  //   } else if (e.detail) {
  //     delta = e.detail > 0 ? 1 : -1;
  //   }
  //   ratio = -delta * ratio;
  //   //缩放图片
  //   that._zoom(that, ratio, e);
  //   // 最后一点，在方法中返回false是为了终止标准的鼠标滚轮事件处理，以防它上下滑动网页
  //   return false;
  // }

  _loadImage = (url) => {
    let img = <img src={url} className={styles["photo-img"]} alt="图片可能已损坏或者不是图片资源"/>;

    // var that = this;
    // var image = new Image();
    // image.src = url;
    return img;
    // // 如果图片被缓存，则直接返回缓存数据
    // if (image.complete) {
    //   //that._setImageStyle($img, $tag);
    //   //that.naturalHeight = $img.height();
    //   //that.naturalWidth = $img.width();
    //   //that.degree = 0;
    //   //对图片的  toolbar 绑定事件
    //  // that._imgToolBarEvent();
    //   }
    //


  }

  _loadAudio = (url) => {
    let audioStyle = {
      position: 'absolute',
      top: this.height * 0.4,
      left: (this.width - 300) / 2
    };
    let audio = <audio id="media-center-audio" controls="controls" src={url} style={audioStyle}></audio>

    return audio;
  }

  _loadVideo = (url) => {
    let video = <video controls="controls" maxHeight = {this.height} maxWidth={this.width} autoplay="true" src={url}></video>

    return video;
  }

  _loadText = (url) => {
    let iframeStyle = {
      position: 'absolute',
      left: this.width * 0.2 * 0.5,
      width: this.width * 0.8,
      backgroundColor: '#fff'
    };
    let iframe = <iframe src={url} width = '100%' height = '100%'  scrolling = 'no' frameborder = '0'>您的浏览器不支持嵌入式框架，或者当前配置为不显示嵌入式框架。</iframe>;

    return iframe;
  }

  _loadOtherMedia = (url, name) => {
    let _this = this;

    let btnWidth = 80;
    let btnHeight = 40;

    let btnLeft = (_this.width - btnWidth) / 2;

    // 去除转发
    //url = url.substring(url.indexOf('?') + 1, url.length);

    let mediaName = url.substring(url.lastIndexOf("/") + 1, url.length);

    let fileStyle = {
      position: 'absolute',
      top: this.height * 0.4 - 40,
      left: 0,
      lineHeight: '20px',
      fontSize: '18px',
      color: '#fff',
      width: _this.width - 10,
      marginLeft: 1
    };

    let downStyle = {
      position: 'absolute',
      top: this.height * 0.4,
      left: btnLeft,
      width: btnWidth,
      height: btnHeight,
      textAlign: 'center',
      lineHeight: '38px',
      borderRadius: 2,
      color: '#fafafa',
      backgroundColor: '#20B888',
      textDecoration: 'none',
      cursor: 'pointer'
    };

    return (
      <div>
        <span style={fileStyle}>文件名: {name}</span>
        <a className={styles['save-as-download-btn']} style={downStyle} href={url}
           title = '请直接点击或鼠标右键转下载工具打开，不要拖拽到下载工具悬浮框中'>下  载</a>
      </div>
    );
  }

  _preImage = () => {
    var that = this;
    if (that.index <= 0) {
      return;
    }
    that.index--;
    this.setState({
      nowAtt: that.props.attaches[that.index]
    });
  }

  _nextImage = () => {
    var that = this;
    if (that.index >= that.props.attaches.length - 1) {
      return;
    }
    that.index++;
    this.setState({
      nowAtt: that.props.attaches[that.index]
    });
  }

  render() {
    let contair = this.createHtml();
    return (
      <div style={{position: 'fixed', top: '0px',  right: '0px', bottom: '0px', left: '0px', zIndex: '1000000'}}>
        {contair}
      </div>
        //document.getElementsByTagName('body')
    );
  }
}


SeeMedia.propTypes = {

}

SeeMedia.defaultProps = {

}

export default SeeMedia;

import { MapTool } from './MapTool';

/**
 * 默认地图工具
 */
class DefaultMapTool extends MapTool {
  constructor(map, apiUrl, callback) {
    super(map, apiUrl);

    // 显示当前坐标的回调函数
    this.setXy = callback;

    this.setCallBack = this.setCallBack.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  setCallBack(callback) {
    this.setXy = callback;
  }

  onMouseMove(event) {
    if (!this.setXy) {
      return;
    }
    Promise.resolve().then(() => {
      this.setXy({ x: event.mapPoint.x.toFixed(4), y: event.mapPoint.y.toFixed(4) });
    });
  }
}

export { DefaultMapTool };

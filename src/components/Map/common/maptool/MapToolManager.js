import { DefaultMapTool } from './DefaultMapTool';

/**
 * 地图工具管理器
 */
class MapToolManager {
  constructor(map) {
    // arcgis js地图对象
    this.map = map;

    // 默认地图工具
    this.defaultMapTool = null;

    // 当前地图工具
    this.mapTool = null;

    // 存储事件处理器的Handler
    this.eventHandlers = {
      clickHandler: null,
      dblClickHandler: null,
      keyDownHandler: null,
      keyUpHandler: null,
      mouseDownHandler: null,
      mouseMoveHandler: null,
      mouseUpHandler: null,
      mouseWheelHandler: null,
    };

    this.addMapEventHandler = this.addMapEventHandler.bind(this);
    this.removeMapEventHandler = this.removeMapEventHandler.bind(this);
    this.getMapTool = this.getMapTool.bind(this);
    this.setMapTool = this.setMapTool.bind(this);
    this.initDefaultMapTool = this.initDefaultMapTool.bind(this);
    this.getDefaultMapTool = this.getDefaultMapTool.bind(this);
    this.resetToDefaultMapTool = this.resetToDefaultMapTool.bind(this);
  }

  /**
   * 初始化默认地图工具
   * @param apiUrl
   * @param setXy
   */
  initDefaultMapTool(apiUrl, setXy) {
    if (!this.map) {
      throw new Error('arcgis js地图对象不能为空');
    }

    if (!apiUrl) {
      throw new Error('apiUrl不能为空');
    }

    if (!setXy) {
      throw new Error('显示坐标的回调方法setXy不能为空');
    }

    this.defaultMapTool = new DefaultMapTool(this.map,
      apiUrl, setXy);
    this.setMapTool(this.defaultMapTool);
  }

  /**
   * 获取默认地图工具
   * @returns {DefaultMapTool|null}
   */
  getDefaultMapTool() {
    return this.defaultMapTool;
  }

  /**
   * 添加事件监听
   */
  addMapEventHandler() {
    if (Object.prototype.hasOwnProperty.call(this.mapTool, 'onClick')) {
      this.eventHandlers.clickHandler = this.map.on('click', (event) => { this.mapTool.onClick(event); });
    }

    if (Object.prototype.hasOwnProperty.call(this.mapTool, 'onDblClick')) {
      this.eventHandlers.dblClickHandler = this.map.on('dbl-click', (event) => { this.mapTool.onDblClick(event); });
    }

    if (Object.prototype.hasOwnProperty.call(this.mapTool, 'onKeyDown')) {
      this.eventHandlers.keyDownHandler = this.map.on('key-down', (event) => { this.mapTool.onKeyDown(event); });
    }

    if (Object.prototype.hasOwnProperty.call(this.mapTool, 'onKeyUp')) {
      this.eventHandlers.keyUpHandler = this.map.on('key-up', (event) => { this.mapTool.onKeyUp(event); });
    }

    if (Object.prototype.hasOwnProperty.call(this.mapTool, 'onMouseDown')) {
      this.eventHandlers.mouseDownHandler = this.map.on('mouse-down', (event) => { this.mapTool.onMouseDown(event); });
    }

    // 始终监听鼠标移动(为的是在地图左下角始终显示鼠标光标坐标)
    this.eventHandlers.mouseMoveHandler = this.map.on('mouse-move',
      (event) => {
        if (Object.prototype.hasOwnProperty.call(this.mapTool, 'onMouseMove')) {
          this.mapTool.onMouseMove(event);
        }
        if (this.mapTool !== this.defaultMapTool) {
          this.defaultMapTool.onMouseMove(event);
        }
      });

    if (Object.prototype.hasOwnProperty.call(this.mapTool, 'onMouseUp')) {
      this.eventHandlers.mouseUpHandler = this.map.on('mouse-up', (event) => { this.mapTool.onMouseUp(event); });
    }

    if (Object.prototype.hasOwnProperty.call(this.mapTool, 'onMouseWheel')) {
      this.eventHandlers.mouseWheelHandler = this.map.on('mouse-wheel', (event) => { this.mapTool.onMouseWheel(event); });
    }
  }

  /**
   * 删除事件监听
   */
  removeMapEventHandler() {
    for (const prop in this.eventHandlers) {
      if (this.eventHandlers[prop]) {
        this.eventHandlers[prop].remove();
        this.eventHandlers[prop] = null;
      }
    }
  }

  /**
   * 销毁当前地图工具
   */
  destroyCurrentMapTool() {
    if (this.mapTool) {
      this.mapTool.destroy();
      this.removeMapEventHandler();
      this.mapTool.setMapToolManager(null);
    }

    this.mapTool = null;
  }

  /**
   * 销毁默认地图工具
   */
  destroyDefaultMapTool() {
    if (this.defaultMapTool) {
      this.defaultMapTool.destroy();
      this.defaultMapTool.setMapToolManager(null);
    }
    this.defaultMapTool = null;
  }

  /**
   * 获取当前地图工具
   * @returns {null|*}
   */
  getMapTool() {
    return this.mapTool;
  }

  /**
   * 设置当前地图工具
   * @param mapTool
   */
  setMapTool(mapTool) {
    if (!mapTool) {
      throw new Error('mapTool为空');
    }

    if (this.mapTool === mapTool) {
      return;
    }

    this.destroyCurrentMapTool();

    this.mapTool = mapTool;

    this.mapTool.setMapToolManager(this);

    this.mapTool.init();

    this.addMapEventHandler();
  }

  /**
   * 将当前地图工具重置到默认地图工具
   */
  resetToDefaultMapTool() {
    if (!this.defaultMapTool) {
      throw new Error('未设置默认地图工具！');
    }

    this.setMapTool(this.defaultMapTool);
  }
}

export { MapToolManager };

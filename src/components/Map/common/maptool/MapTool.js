/**
 * 地图工具基类
 */
class MapTool {
  /**
   * 构造函数
   * @param map  arcgis map对象
   * @param apiUrl
   */
  constructor(map, apiUrl) {
    this.map = map;
    this.apiUrl = apiUrl;
    this.mapToolManager = null;

    this.init = this.init.bind(this);
    this.destroy = this.destroy.bind(this);

    this.onClick = this.onClick.bind(this);
    this.onDblClick = this.onDblClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);
  }

  /**
   * 设置地图工具管理器
   * @param mapToolManager
   */
  setMapToolManager(mapToolManager) {
    this.mapToolManager = mapToolManager;
  }

  /**
   * 初始化
   */
  init() {}

  /**
   * 清理
   */
  destroy() {}

  onClick(event) {}

  onDblClick(event) {}

  onKeyDown(event) {}

  onKeyUp(event) {}

  onMouseDown(event) {}

  onMouseMove(event) {}

  onMouseUp(event) {}

  onMouseWheel(event) {}
}

export { MapTool };

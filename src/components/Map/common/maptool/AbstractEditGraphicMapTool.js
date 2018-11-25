import { loadModules } from 'esri-loader';
import { message, Modal } from 'antd';
import { MapTool } from './MapTool';

const confirm = Modal.confirm;

/**
 * 编辑Graphic工具的抽象基类
 * 不应该直接使用此类的实例
 */
class AbstractEditGraphicMapTool extends MapTool {
  constructor(map, apiUrl, layerId, editingCallback, deletingCallback = null) {
    super(map, apiUrl);

    // 待编辑图形所属的GraphicsLayer的id
    this.layerId = layerId;

    // 编辑图形后的回调方法
    this.editingCallback = editingCallback;

    // 删除图形触发的回调方法(此回调是可选的，传入此方法才会去响应用户的删除请求)
    this.deletingCallback = deletingCallback;

    // this.layerId对应的GraphicsLayer
    this.graphicsLayer = null;
    this.onClickGraphicsLayerHandler = null;
    this.editTool = null;

    // 当前编辑的图形
    this.graphic = null;

    // 编辑前的老图形
    this.oldGraphic = null;

    this.onClickGraphicsLayer = this.onClickGraphicsLayer.bind(this);
  }

  /**
   * 显示使用此工具的提示信息
   * 子类可覆盖此方法，以提供自定义提示信息
   */
  showTooltip() {
    let msg = '选择图形开始编辑：Enter键保存修改，Esc键取消修改';
    if (this.deletingCallback) {
      msg = `${msg}，Delete键删除图形`;
    }
    message.info(msg);
  }

  init() {
    this.showTooltip();

    this.graphicsLayer = this.map.getLayer(this.layerId);
    if (!this.graphicsLayer) {
      return;
    }

    this.onClickGraphicsLayerHandler = this.graphicsLayer.on('click', this.onClickGraphicsLayer);
    loadModules(['esri/toolbars/edit'], { url: this.apiUrl })
      .then(([Edit]) => {
        this.editTool = new Edit(this.map, { allowAddVertices: true, allowDeleteVertices: true});
      });
  }

  destroy() {
    if (this.editTool) {
      this.cancelEditting();
      this.editTool.deactivate();
      this.editTool = null;
    }

    if (this.onClickGraphicsLayerHandler) {
      this.onClickGraphicsLayerHandler.remove();
      this.onClickGraphicsLayerHandler = null;
    }
  }

  /**
   * 点击GraphicsLayer的事件响应方法
   * @param event
   */
  onClickGraphicsLayer(event) {
    if (!this.editTool) {
      return;
    }

    // 已经开始编辑了，直接返回
    if (this.graphic) {
      return;
    }

    this.graphic = event.graphic;

    this.saveGraphic(event.graphic).then(() => {
      loadModules(['esri/toolbars/edit'], { url: this.apiUrl }).then(([Edit]) => {
        this.editTool.activate(Edit.EDIT_VERTICES | Edit.MOVE | Edit.ROTATE | Edit.SCALE, this.graphic);
      });
    });
  }

  /**
   * 保存编辑前的图形，需要返回一个Promise
   * 由于js没有抽象方法机制，这里只能采取直接抛出异常的折衷方法
   * @param graphic 当前图形
   */
  saveGraphic(graphic) {
    throw new Error('不应该直接使用AbstractEditGraphicMapTool中的saveGraphic方法，请使用子类中对应覆盖的此方法');
  }

  /**
   * 删除图形
   */
  deleteGraphic() {
    confirm({
      title: '确认删除此图形吗?',
      content: '删除后将不可恢复',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        if (this.deletingCallback) {
          this.deletingCallback(this.graphic);
          this.editTool.deactivate();
          this.graphic = null;
          this.oldGraphic = null;
        }
      },
      onCancel() {},
    });
  }

  /**
   * 完成编辑
   */
  finishEditting() {
    if (!this.editTool || !this.graphic) {
      return;
    }

    this.editTool.deactivate();

    if (this.editingCallback) {
      this.editingCallback(this.graphic);
    }
    this.graphic = null;
    this.oldGraphic = null;
  }

  /**
   * 取消编辑
   */
  cancelEditting() {
    if (!this.editTool || !this.graphic) {
      return;
    }

    // 如果有修改，就回滚
    if (this.editTool.getCurrentState().isModified) {
      this.graphicsLayer.add(this.oldGraphic);
      this.graphicsLayer.remove(this.graphic);
    }
    this.editTool.deactivate();
    this.graphic = null;
    this.oldGraphic = null;
  }

  /**
   * 监听键盘事件
   * @param event
   */
  onKeyDown(event) {
    if (!this.editTool || !this.graphic) {
      return;
    }

    if (event.keyCode == 27) { // Esc
      this.cancelEditting();
    } else if (event.keyCode == 13) { // Enter
      this.finishEditting();
    } else if (this.deletingCallback && event.keyCode == 46) { // Delete
      this.deleteGraphic();
    }
  }
}

export { AbstractEditGraphicMapTool };

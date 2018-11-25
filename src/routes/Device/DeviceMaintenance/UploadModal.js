import React, { PureComponent } from 'react';
import { Modal, Button, Icon, message, Select, Upload, Tooltip, TreeSelect } from 'antd';
import styles from './index.less';

const Option = Select.Option;
const defaultState = {
  visible: false,
  taskType: 1,
  stationId: null,
  stationName: null,
  fileList: [],
  unExistentEqs: [],
  invalidModels: [],
  connectedPlanEqs: [],
  canNew: false,
};
const TreeNode = TreeSelect.TreeNode;
const loopStationList = (list) => {
  return !Array.isArray(list) ? null : list.map(ele => {
    if (!ele.hasOwnProperty('children') || ele.children.length === 0) {
      return <TreeNode value={parseInt(ele.gid, 10)} dataRef={ele} title={ele.locName} key={`${ele.gid}`} />;
    } else {
      return (
        <TreeNode value={parseInt(ele.gid, 10)} dataRef={ele} title={ele.locName} key={`${ele.gid}`}>
          {loopStationList(ele.children)}
        </TreeNode>
      );
    }
  });
};
export default class UploadModal extends PureComponent {
    state={
      ...defaultState,
    }
    handleChangeVisible = () => {
      this.setState({visible: !this.state.visible});
    }
    handleStationChange = (value, label) => {
      this.setState({stationId: value, stationName: label[0]});
    }
  handleClose = () => {
    this.setState(defaultState);
  }
  importPlan = (type) => {
    const { taskType, stationId, stationName } = this.state;
    if (!stationId && !stationName) {
      message.info('请选择所属组织');
      return;
    }
    const fd = new FormData();
    const fileList = [...this.state.fileList];
    const { functionId } = this.props;
    const { gid, trueName } = this.props.user;
    fd.append('file', fileList[0].originFileObj);
    fd.append('createId', parseInt(gid, 10));
    fd.append('createName', trueName);
    fd.append('functionId', parseInt(functionId, 10));
    fd.append('stationId', stationId);
    fd.append('stationName', stationName);
    fd.append('taskType', taskType);
    fd.append('isChangeTime', type);
    this.props.dispatch({
      type: 'device/importPlan',
      payload: fd,
      callback: (res) => {
        if (res.success) {
          message.success(res.msg);
          this.handleChangeVisible();
          this.props.queryPrePlanList();
        } else {
          message.warn(res.msg);
        }
      },
    });
  }
  handleOk = () => {
    const { stationId, stationName } = this.state;
    if (!stationId && !stationName) {
      message.warn('请选择所属组织');
      return;
    }
    const fileList = [...this.state.fileList];
    const { taskType } = this.state;
    const { functionId } = this.props;
    const { gid, trueName } = this.props.user;
    if (fileList.length === 0) {
      message.warn('请上传计划excel文件');
    } else {
      const fd = new FormData();
      fd.append('file', fileList[0].originFileObj);
      fd.append('createId', parseInt(gid, 10));
      fd.append('createName', trueName);
      fd.append('functionId', parseInt(functionId, 10));
      fd.append('taskType', taskType);
      this.props.dispatch({
        type: 'device/exportPlan',
        payload: fd,
        callback: (res) => {
          if (res.success) {
            if (res.data) {
              const { unExistentEqs, invalidModels, connectedPlanEqs } = res.data;
              this.setState({ unExistentEqs, invalidModels, connectedPlanEqs, canNew: invalidModels.length === 0 });
            }
          } else {
            message.warn(res.msg);
          }
        },
      });
    }
  }
  onTaskTypeChange = (value) => {
    this.setState({
      taskType: value,
      canNew: false,
    });
  }
  render() {
    const {stationList} = this.props;
    const { unExistentEqs, invalidModels, connectedPlanEqs, canNew, stationId } = this.state;
    const helpUrl = `${window.location.origin}/staticFile/计划导入模板.xls`;
    const uploadProps = {
      onRemove: (file) => {
        this.setState(({ fileList }) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
            canNew: false,
          };
        });
      },
      beforeUpload: (file) => {
        this.setState(({ fileList }) => ({
          fileList: [...fileList, file],
        }));
        return false;
      },
      onChange: ({ file, fileList }) => {
        Object.assign(fileList, { status: file.status });
        this.setState({ fileList: fileList.slice(-1) });
      },
      fileList: this.state.fileList,
    };
    return (
      <Modal
        visible={this.state.visible}
        title="计划导入"
        maskClosable={false}
        destroyOnClose
        afterClose={() => this.handleClose()}
        onOk={() => { this.handleOk(); }}
        onCancel={() => this.handleChangeVisible()}
        confirmLoading={this.props.vaLoading}
        bodyStyle={{
          maxHeight: 460,
          overflowY: 'auto',
        }}
      >
        <div>
          <div>

            <div className={styles['field-block']}>

              <label><span className={styles.starSpan}>*</span>所属组织：</label>
              <TreeSelect
                className={styles.select2}
                showSearch
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                placeholder="请选择"
                allowClear
                value={stationId}
                onChange={this.handleStationChange}
                treeDefaultExpandAll
                filterTreeNode={(inputValue, treeNode) => treeNode.props.title.indexOf(inputValue) > -1}
              >
                {loopStationList(stationList)}
              </TreeSelect>
            </div>
            <div className={styles['field-block2']}>
              <Button><Icon type="download" /><a style={{ marginLeft: 8 }} href={helpUrl} >模板下载</a></Button>
            </div>
          </div>
          <div className={styles['field-block']}>
            <label>&nbsp;&nbsp;&nbsp;计划类型：</label>
            <Select
              className={styles.select2}
              value={this.state.taskType}
              onChange={this.onTaskTypeChange}
              allowClear
            >
              <Option value={1}>常规</Option>
              <Option value={2}>临时</Option>
            </Select>
          </div>
          <Upload {...uploadProps}>
            <Tooltip title="最多支持导入300条计划">
              <Button>
                <Icon type="upload" />上传附件
              </Button>
            </Tooltip>
          </Upload >
          {unExistentEqs && unExistentEqs.length !== 0 ? <div>
            <label>在设备台账中无法找到以下设备，请维护设备台账！</label>
            {(unExistentEqs).map(item => (
              <div style={{ marginBottom: 5 }}><label>{`设备编号:  ${item.eqCode}, 设备名称:  ${item.eqName}`}</label></div>
            ))}
          </div> : null}
          {connectedPlanEqs && connectedPlanEqs.length !== 0 ? <div>
            <label>以下设备已制定计划，是否继续添加计划？</label>
            {(connectedPlanEqs).map(item => (
              <div style={{ marginBottom: 5 }}><label>{`设备编号:  ${item.eqCode}, 设备名称:  ${item.eqName}`}</label></div>
            ))}
          </div> : null}
          {invalidModels && invalidModels.length !== 0 ? <div>
            <label>下列计划存在非法数据，请仔细检查！</label>
            {(invalidModels).map(item => (
              <div style={{ marginBottom: 5 }}><label>{`计划名称:  ${item.planName}`}</label></div>
            ))}
          </div> : null}
          {connectedPlanEqs && connectedPlanEqs.length !== 0 ? <Button type="primary" onClick={() => { this.importPlan(0); }}>忽略当前创建计划</Button> : null}
          {canNew ? <Button style={{ marginLeft: 10 }} type="primary" loading={this.props.impLoading} onClick={() => { this.importPlan(1); }}>创建计划</Button> : null}
          <div />
        </div>
      </Modal>
    );
  }
}

import React from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';

/**
 * 拖拽框
 */
class DragBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: this.props.show,
            displayOverlayDiv4Move: 'none',
        }
    }

    startDrag = () => {
        this.setState({
            displayOverlayDiv4Move: this.props.modal ? 'none' : 'block',
        });
    }

    stopDrag = () => {
        this.setState({
            displayOverlayDiv4Move: 'none',
        });
    }

    handleOverlayClick = () => {
        this.props.handleOverlayClick(this.props.data);
    }

    render() {
        const dialogZIndex = 100;
        const wrapStyle = {
            display: this.state.show ? 'inline-block' : 'none',
            // position: 'fixed',
            zIndex: 99,
        };
        // 用于 iframe 
        const moveOverlayStyle = {
            display: this.state.displayOverlayDiv4Move,
            backgroundColor: 'transparent',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
        };

        return (
            <div style={wrapStyle}>
                <Draggable
                    handle={this.props.clickToMoveSelector}
                    bounds={this.props.boundary}
                    onStart={this.startDrag}
                    onStop={this.stopDrag}
                >
                    {this.props.children}
                </Draggable>

                <div className="dialog-overlay"
                     style={{
                         display: this.props.modal ? 'block' : 'none',
                         zIndex: dialogZIndex - 1,
                         position: 'fixed',
                         backgroundColor: '#333333',
                         opacity: 0.3,
                         top: 0,
                         bottom: 0,
                         left: 0,
                         right: 0,
                     }}
                     onClick={this.handleOverlayClick}
                />
                <div style={moveOverlayStyle} />
            </div>
        );
    }
}


DragBox.propTypes = {
    data: PropTypes.object,
    show: PropTypes.bool,
    modal: PropTypes.bool,
    clickToMoveSelector: PropTypes.string,
    boundary: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.string,
    ]),
    style: PropTypes.shape({
        overlayStyle: PropTypes.object,
    }),
    handleOverlayClick: PropTypes.func,
}

/**
 * 拖拽框
 * 
 * @prop {object} data -组件附带的信息(点击遮罩时返回)
 * @prop {bool} canMove=false -拖动
 * @prop {bool} modal=true -模态
 * @prop {bool} show=true -控制是否可见
 * @prop {string} clickToMoveSelector -点击拖动区域的选择器（默认为 title 部分）
 * @prop {object|string} boundary -可移动区域的边界
 * @prop {number} boundary.top -可向左移动多少像素
 * @prop {number} boundary.left
 * @prop {number} boundary.right
 * @prop {number} boundary.bottom
 * @prop {object} style -自定义样式
 * @prop {object} style.overlayStyle 遮罩层的样式
 * @prop {function} handleOverlayClick -遮罩层的点击事件
 */
 
DragBox.defaultProps = {
    data: {},
    canMove: false,
    modal: true,
    show: true,
    clickToMoveSelector: '.dialog-title-wrap',
    boundary: 'body',
    style: {
        overlayStyle: {},
    },
    handleOverlayClick: () => null,
}

export default DragBox;

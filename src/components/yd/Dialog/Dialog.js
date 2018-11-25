/**
 * Created by remote on 2017/6/18.
 */

import React from 'react';
import PropTypes from 'prop-types';

import DragBox from '../DragBox/DragBox';
import {Modal} from 'antd';

/**
 * 对话框
 */
class Dialog extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <DragBox>
                <Modal
                    title="Modal"
                    visible={true}
                    okText="确认"
                    cancelText="取消"
                >
                    <p>Bla bla ...</p>
                    <p>Bla bla ...</p>
                    <p>Bla bla ...</p>
                </Modal>
            </DragBox>
        )
    }
}

Dialog.propTypes = {}

Dialog.defaultProps = {}

export default Dialog;
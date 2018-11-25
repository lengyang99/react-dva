import React from 'react';
import PropTypes from 'prop-types';
import { Tabs } from 'antd';
const TabPane = Tabs.TabPane;

export default class Tab extends React.Component {
    constructor(props) {
        super(props);
    }

    initPanel = (field) => {
        let tabPanes = [];
        for (let i = 0; i < field.length; i++) {
            let tabPane = (
                <TabPane tab={field[i].tab} key={field[i].key}>
                    {field[i].value}
                </TabPane>
            );
            tabPanes.push(tabPane);
        }
        return tabPanes;
    };

    render() {
        let panelInfo = this.initPanel(this.props.field);
        return (
            <Tabs style={{width: '100%'}}
                  animated={false}>
                {panelInfo}
            </Tabs>
        );
    }
}

Tab.propTypes = {
    field: PropTypes.array,
};

Tab.defaultProps = {
    field: [],
};

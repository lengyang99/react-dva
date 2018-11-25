import React, {Component} from 'react';

export default class homePage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={{width: '100%', height: 'cacl(100vh - 100px)', backgroundColor: '#F7F7F7', paddingTop: '5px', minHeight: '830px', fontSize: '14px'}}>
                <div style={{position: 'positive', width: 100, margin: '0px auto', fontSize: '30px', marginTop: '300px'}}>建设中</div>
            </div>
        );
    }
}

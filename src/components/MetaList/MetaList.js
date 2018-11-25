import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Pagination} from 'antd';
import styles from './MetaList.less';

export default class MetaList extends PureComponent {
    constructor(props) {
        super(props);
    }

    componentWillReceiveProps(nextProps) {
        // clean state
    }

    render() {
        const {avatar, title, description, contentColumn, dataSource, action, pagination,onChange,rowKey,height,itemDbClick} = this.props;

        const ListContent = ({data, cols}) => {

            const contents = cols.map((ii) => (
                <div className={styles.itemContentDiv}
                     style={(ii.width?{width:ii.width}:{})}
                     key={ii.field}>
                    <span className={styles.itemContentDivSpan}>{
                        ii.titleRender?ii.titleRender(data):ii.title}</span>
                    <div className={styles.itemContentDivP}>{
                        ii.render ? ii.render(data) : data[ii.field]
                    } &nbsp;</div>
                </div>
            ));
            return (
                <div className={styles.itemContent}>
                    <div className={styles.listContent}>
                        {contents}
                    </div>
                </div>)
        };

        const ListItem = ({data}) => {
            const titleEle = Object.prototype.toString.call(title) === '[object Function]' ?
                (title && title(data)) : data[title];
            //src="https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png"/>
            const ava = avatar(data) || {
                src:'',
                style:{}
            };
            return (
                <div className={styles.listItem} onDoubleClick={()=>{
                  itemDbClick && itemDbClick(data) ;
                }}>
                    <div className={styles.itemMeta}>
                        <div className={styles.metaAvatar}>
                            <span className={styles.avatarImage}
                                  style={ava.style}
                            >
                                <img
                                    src={ava.src}/>
                            </span>
                        </div>
                        <div className={styles.metaContent}>
                            <div className={styles.metaTitle}>
                                {titleEle}
                            </div>
                            <div className={styles.metaDescription}>
                                {data[description] || ''}
                            </div>
                        </div>
                    </div>
                    <ListContent data={data} cols={contentColumn}/>
                    <div className={styles.itemAction}>
                        {action && action(data)}
                    </div>
                </div>
            );
        };

        const items = dataSource.map((dt,index) => (
            <ListItem key={`gig-${rowKey?dt[rowKey]:index}`} data={dt}/>
        ));

        const pages = pagination ? (
            <Pagination {...pagination}
              />
        ) : null;

        let itemStyle = {
            height: height
        };
        return (
            <div>
                <div className={styles.metaList} style={itemStyle}>
                    {items}
                </div>
                <div className={styles.pages}>
                    <div style={{display:'inline-block'}}>
                    </div>
                    {pages}
                </div>

            </div>

        );
    }

    static defaultProps = {
        dataSource: [],
        contentColumn: []
    };

    /**
     * avatar:function(data){
     * return {
     *      src:''.
     *      style:{
     *          backgroundColor:'#DDDDDD'
     *      }
     * }
     */
    static propTypes = {
        rowKey:PropTypes.string,
        contentColumn: PropTypes.arrayOf(PropTypes.shape({
            title: PropTypes.string.isRequired,
            field: PropTypes.string.isRequired,
            render: PropTypes.func,
            titleRender:PropTypes.func,
            width:PropTypes.oneOfType([PropTypes.number,PropTypes.string])
        })),
        avatar: PropTypes.func,
        title: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        description: PropTypes.string,
        dataSource: PropTypes.array,
        pagination: PropTypes.any,
        onChange: PropTypes.func,
        action: PropTypes.func,
        itemDbClick:PropTypes.func
    };
}

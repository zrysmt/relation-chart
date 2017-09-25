import './relationPane.css';

import React, {Component} from 'react';
import axios from 'axios';
import _ from 'lodash';

import RelationChart from './relationChart';

let pServer = 'http://localhost:8989/'; 
let left = 'api/relation/left';         //左边
let right = 'api/relation/right';       //右边


class RelationPane extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            links: []
        };
        this.dataStore = [];  //store this.state.data
        this.linksStore = [];  //store this.state.links
        this.level = 0;        //中心层
        //初始值
        this.appId = "initialAppId";       //当前appId
        this.cluster = "initialCluster";     //当前cluster
        this.handleChildrenClick = this.handleChildrenClick.bind(this);
    }

    getDataFromServer(appId, cluster) {
        if (!(appId && cluster)) return;
        this.appId = appId;
        this.cluster = cluster;

        axios.get(`${pServer}${left}`)
            .then((leftData) => {
                axios.get(`${pServer}${right}`)
                    .then((rightData) => {
                        console.log(leftData, rightData);
                        if (this.isArrayAndHasLengths(leftData.data) || this.isArrayAndHasLengths(rightData.data)) {
                            let appIdJson = [{
                                "appId":appId,
                                "name": appId+"&"+cluster,
                                "cluster": cluster,
                                "level": 0, "type": "center"}];

                            this.dealRelationData(appIdJson, leftData.data, rightData.data);
                        }
                    })
            })
            .catch((err) => {
                console.error('Error:Relation data', err);
            })
    }

    isArrayAndHasLengths(arr) {
        if (Object.prototype.toString.call(arr) === "[object Array]" && arr.length > 0) {
            return true;
        }
        return false;
    }

    /**
     * 处理关系数据
     * @param appIdJson 查询的中心节点
     * @param clientsJson 该中心节点的客户端
     * @param serversJson 该中心节点的服务端
     */
    dealRelationData(appIdJson, clientsJson = [], serversJson = []) {
        clientsJson = this.addDataAttr('clients', clientsJson, this.level + 1);
        serversJson = this.addDataAttr('servers', serversJson, this.level - 1);

        let data = this.dataStore.concat(appIdJson, clientsJson, serversJson);
        data.forEach((d,i)=>{
            if(!d.name && d.appId && d.cluster) d.name = d.appId + "&" + d.cluster;
            let appIdClusterArr = d.name.split("&");
            if(!d.appId) d.appId = appIdClusterArr[0];
            if(!d.cluster) d.cluster = appIdClusterArr[1];
        });
        data = _.uniqBy(data, 'name');   //去重

        this.dataStore = data;
        //level 不让它再自增长，而是改为点击的时候计算+1
        /*if(this.isArrayAndHasLengths(clientsJson) || this.isArrayAndHasLengths(serversJson)){
            this.level++ ;
        }*/
        let links = this.linksStore;
        if (this.isArrayAndHasLengths(clientsJson)) {
            clientsJson.forEach((d, i) => {
                if (appIdJson.name !== d.name) {
                    links.push({
                        source: appIdJson[0].name ,
                        target: d.name
                    })
                }
            });
        }
        if (this.isArrayAndHasLengths(serversJson)) {
            serversJson.forEach((d, i) => {
                if (appIdJson.name !== d.name) {
                    links.push({
                        source: d.name ,
                        target: appIdJson[0].name
                    })
                }
            });
        }

        this.linksStore = links;
        this.setState({
            data: data,
            links: links
        }, () => {
            console.log("this.state:",this.state);
        });
    }

    addDataAttr(type, arr, level) {
        if (Object.prototype.toString.call(arr) !== "[object Array]") return;

        arr.forEach((d, i) => {
            d.level = level;
            d.type = type;
        });
        return arr;
    }

    /**
     * 回调函数,点击新的appId
     * @param data
     */
    handleChildrenClick(data, level) {
        this.level = level;
        if (data.appId && data.cluster) this.getDataFromServer(data.appId, data.cluster);
    }

    componentDidMount() {
        
        this.getDataFromServer(this.appId , this.cluster);
    }
     
    render() {
        let { data, links} = this.state;
        return (
            <div>
                <RelationChart
                    data={data}
                    links={links}
                    handleChildrenClick={this.handleChildrenClick}/>
            </div>
        );
    }
}

export default RelationPane;
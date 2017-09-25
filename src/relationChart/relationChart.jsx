/**
 * 基于Echarts的关系图
 */
import './relationChart.css';

import React, {Component} from 'react';
import echarts from 'echarts';

class RelationChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clickNums : 0,  //点击的次数
            data: [],
            links: []
        };
    }

    initECharts(data, links) {
        this.dispose();
        let container = document.getElementById('relation-chart');
        if(!container) return;
        this.myChart = echarts.init(container);

        data = this.addDataXY(data);

        let option = {
            tooltip: {
                formatter: (params)=>{
                    let data = params.data , str = "";
                    if(data.name){
                        str += "appId&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;"+data.name+"<br/>";
                    }else{
                        return params.name;
                    }
                    if(data.cluster)  str +="cluster&nbsp;&nbsp;:&nbsp;"+data.cluster+"<br/>";
                    if(data.timeout)  str +="timeout&nbsp;:&nbsp;"+data.timeout+"<br/>";
                    if(data.parallel)  str +="parallel&nbsp;:&nbsp;"+data.parallel+"<br/>";
                    return str;
                }
            },
            animationDurationUpdate: 500,
            animationEasingUpdate: 'quinticInOut',
            legend: [{
                show:false,
                left:'center',
                bottom:'bottom',
                data: data.map(function (a) {
                    return a.name;
                })
            }],
            /*toolbox: {
                feature: {
                    dataZoom: {
                    },
                    saveAsImage: {
                        pixelRatio:2
                    }
                }
            },*/
            series: [
                {
                    name:'Relationship',
                    type: 'graph',
                    layout: 'none'/*'circular'*/,
                    symbolSize: 20,
                    roam: true,
                    focusNodeAdjacency: true,
                    hoverAnimation:false,
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            distance:0,
                            formatter: (params)=>{
                                let textArr = params.name.split("&");
                                return textArr[0]+ "\r\n" + textArr[1];
                            }
                        }
                    },
                    circular: {
                        rotateLabel: true
                    },
                    edgeSymbol: ['circle', 'arrow'],
                    edgeSymbolSize: [0, 8],
                    data: data,
                    links: links,
                    categories:data,
                    itemStyle:{
                        normal:{
                            formatter: '{b}',
                            color:({data})=>{
                                if(data.isActive) return '#0000ff';
                                let colors = ['#d53a35','#aa3d8f','#9fdabf','#a9199z','#e98f6f','#6ab0b8','#334b5c',
                                    '#1b91da','#391bda'];
                                return colors[Math.abs(data.level) % 8];
                            },
                        }
                    },
                    lineStyle: {
                        normal: {
                            opacity: 0.9,
                            width: 1.4,
                            curveness: 0.1
                        }
                    }
                }
            ]
        };
        /*if(this.state.clickNums){
            option.series[0].width = "80%";
            option.series[0].height = "80%";
        }*/

        this.myChart.setOption(option);

        window.onresize = () => {
            if(this.myChart) this.myChart.resize();
        };
        this.myChart.on('click', (e) => {
            if(e.data && e.data.name && e.data.x && e.data.y){
                this.setState({ clickNums:this.state.clickNums+1});
                this.handleChartEvent(e);
            }
        });
    }

    handleChartEvent(e) {
        if (this.handleParentClick  && e.data.cluster && e.data.appId) {
            this.dispose();
            let level = e.data.level;  //传递当前level
            this.handleParentClick(e.data,level);
        }
    }

    componentWillReceiveProps(props) {
        if (props.data && props.links) {
            let {data, links } = props;
            this.setState({
                data: data,
                links: links
            },()=>{
                console.log('this.state：',this.state)
            });

        }
        if (props.handleChildrenClick) this.handleParentClick = props.handleChildrenClick;
    }

    /**
     * 为data节点数组增加x y坐标
     * level 分层   type去区分左右
     * @param data 节点数组
     * @returns {Array}
     */
    addDataXY(data) {
        let container = document.getElementById('relation-chart');
        let width = container.clientWidth,
            height = container.clientHeight;
        let mWidth = parseInt(width / 2);
        let mHeight = parseInt(height / 2);
        let xLen = this.state.clickNums === 0? 80 : 180;   //x 方向上的距离,首次渲染距离是60
        let yLen = 50;    //y
        let yOffset = 0;  //计算后平均的每个节点距离中心的距离
        let index = 1,obj = {},obj1 = {};
        //统计每个level的个数
        data.forEach((d,i)=>{
            if(obj1[d.level]){
                obj1[d.level].nums++;
            }else{
                obj1[d.level] = {};
                obj1[d.level].nums = 1;
            }
        });

        data.forEach((d,i)=>{
            //处理nums和index属性
            for(let key in obj1){
                if(key === d.level) d.nums = obj1[key].nums;
            }
            if(obj[d.level]){
                d.index = ++index;
            }else{
                obj[d.level] = true;
                d.index = 1;
                index = 1;
            }
            //处理x，y坐标
            if(d.nums && d.index) yOffset = (Math.floor(d.nums / 2) - d.index) * yLen;

            if (0 === d.level || "center" === d.type) {
                d.x = mWidth;
                d.y = mHeight - yOffset;
            } else if ("clients" === d.type) {
                d.x = mWidth + d.level * xLen;
                d.y = mHeight - yOffset;
            } else if ("servers" === d.type) {
                d.x = mWidth + d.level * xLen;
                d.y = mHeight - yOffset;
            }
        });
        console.log(data);

        return data;
    }
    componentDidUpdate() {
        let {data, links} = this.state;
        this.initECharts(data, links);
    }

    componentWillUnmount() {
        this.dispose();
    }
    dispose(){
        if (this.myChart) {
            this.myChart.dispose();
            // this.myChart = null;
        }
    }
    render() {
        let {data, links} = this.state;

        if (data.length === 0) return <div>没有数据</div>;

        return (
            <div id="relation-chart"></div>
        );
    }
}

export default RelationChart;
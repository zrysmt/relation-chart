**基于Echarts实现一个关系图React组件**

## 1.说明
图形库是基于Echarts，项目中自己写的一个后面会用到的React组件，现在共享出来。依赖的库如下。
```js
    "axios": "^0.16.2",
    "echarts": "^3.7.1",
    "lodash": "^4.17.4",
    "react": "^15.6.1",
    "react-dom": "^15.6.1",
    "react-scripts": "1.0.13"
```
整体的效果如下：
![](https://raw.githubusercontent.com/zrysmt/mdPics/master/echarts/relation/1.png)
点击某个节点后，如右上角，会将与右上角有关的重新绘制
![](https://raw.githubusercontent.com/zrysmt/mdPics/master/echarts/relation/2.png)

## 2.环境
使用facebook给出的脚手架工具[create-react-app](https://github.com/facebookincubator/create-react-app).

**开发者模式：** 
执行
```bash
npm start
```
浏览器会自动打开`localhost:3000`。
启用mock数据服务
```bash
npm run mock
```
或者是
```bash
node mock/mock.js
```
**编译模式**
```bash
npm run build
```
## 3.使用说明
- `relationPane`组件是包含性组件，主要是请求数据，并将数据包装成适合与关系图组件的`data`和`links`.
- `relationChart` 组件是关系图组件,使用Echarts绘图。
变量说明，在`relationPane`组件中：
```js
let pServer = 'http://localhost:8989/'; //服务器地址，这里是mock数据服务
let left = 'api/relation/left';         //左边 接口url
let right = 'api/relation/right';       //右边 接口url
let initialAppId = 'initialAppId';      //初始AppId(属性之一，可以是任意的)
let initialCluster = 'initialCluster';  //初始Cluster(属性之一，可以是任意的)
```

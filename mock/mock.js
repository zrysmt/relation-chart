/**
 * mock数据 服务
 */
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.listen(8989);
console.log('server start port 8989');

//解决跨域
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    if (req.method == "OPTIONS") {
        res.send(200); /*让options请求快速返回*/
    } else {
        next();
    }
});

app.use(function (req,res,next) {
    res.setHeader('Cache-Control', 'public, max-age=3600');
    next();
});


//relation
var leftJson = require('./relation/left.json');
var leftJson2 = require('./relation/left2.json');
var leftJson3 = require('./relation/left3.json');
var rightJson = require('./relation/right.json');
var rightJson2 = require('./relation/right2.json');
var rightJson3 = require('./relation/right3.json');

var index = 1;
app.get('/api/relation/left',function (req,res) {
    index++;
    // res.send([]);  //测试返回空
    if('1' == index % 3){
        res.send(rightJson);
    }else if('2' == index % 3){
        res.send(rightJson2);
    }else{
        res.send(rightJson3);
    }
});
app.get('/api/relation/right',function (req,res) {
    if('1' == index % 3){
        res.send(leftJson);
    }else if('2' == index % 3){
        res.send(leftJson2);
    }else{
        res.send(leftJson3);
    }
});



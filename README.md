安装node.js
安装创建express项目框架
引用socket.io.js和https所用的证书
项目下载后执行npm i 命令
在www文件和webrtc_client文件中修改192.168.0.109为本机的IP地址
然后执行npm start
最后在浏览器中输入https://加自己的本地IP地址:3007（或者输入localhost：3007）

socket.io使用{服务器端：var io = require('socket.io');   服务器端接收io.sockets.on('connection', onConnection);   客户端连接：var socket = io.connect('https://192.168.0.109:3007'); 其他的具体看代码}


证书引用：var io = require('socket.io');
var app = require('../app');
var debug = require('debug')('Xserver:server');
var fs = require('fs');
var path = require('path');
var allsocket = {};
var allroom = [];
/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3007');
app.set('port', port);

/**
 * Create HTTP server.
 */
var updir=__dirname.slice(0,-4);
var  options={
    key: fs.readFileSync(path.join(updir, 'fake-keys/v.jiashizhan.com.key')),//证书文件的存放地址及证书fake-keys/v.jiashizhan.com.key
    cert: fs.readFileSync(path.join(updir, 'fake-keys/v.jiashizhan.com.pem'))//证书文件的存放地址及证书fake-keys/v.jiashizhan.com.pem
};
var server = require('https').createServer(options,app);//服务器引用证书和app.js文件
server= server.listen(process.env.PORT || port, process.env.IP || "192.168.0.109", function() {//设置服务器的监听ip和端口
    var addr = server.address();
    console.log("Server listening at", addr.address + ":" + addr.port);
});

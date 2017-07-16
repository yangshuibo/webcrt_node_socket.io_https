var PeerConnections = (window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
var URL = (window.URL || window.webkitURL || window.msURL || window.oURL);
var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
var nativeRTCIceCandidate = (window.mozRTCIceCandidate || window.RTCIceCandidate);
var nativeRTCSessionDescription = (window.mozRTCSessionDescription || window.RTCSessionDescription);
var moz = !!navigator.mozGetUserMedia;
var iceServer = {
    "iceServers": [{
        "url": "stun:stun.l.google.com:19302"
    }, {
        "url": "turn:numb.viagenie.ca",
        "username": "webrtc@live.com",
        "credential": "muazkh"
    }]
};
var socket = io.connect('https://192.168.0.109:3007');
var localstream;
var room = "";
var username = "";
var thisuserid = "";
var me = null;
var peerConnections = {};
var connections = [];
var numStreams = 0;
var initializedStreams = 0;
var isCaller = prompt("1", 1);

$("div.login").show();
$("button.b").click(function () {
    $("div.login").hide();
    username = $("input.username").val();
    room = $("input.room").val();
    thisuserid = $("input.userid").val();
    socket.emit("login", room, username, thisuserid)
});

socket.on("new_peer", function (userid, room, username) {
    alert("欢迎" + username + "加入" + room + "号房间!!!");
});

socket.on("peer", function (all_ids, id) {
    connections = all_ids;
    console.log("connections长度：" + connections.length);
    userLocalstream();
    setTimeout(function () {
        sendOffer();
        // add_stresm()
    }, 3000);

});
// var createPeerConnections = function() {
//     var _this = this;
//     var i, m;
//     for (i = 0, m = this.connections.length; i < m; i++) {
//         alert("长度:"+this.connections.length);
//         createPeerConnection(this.connections[i])
//     }
// };
var sendOffer = function () {
    if (connections.length > 0) {
        for (var i = 0; i < connections.length; i++) {
            peerConnections[connections[i]] = createPeerConnection(connections[i]);
            alert("先走的流在走的本地流获取");
            peerConnections[connections[i]].createOffer(oncreaterOffer(peerConnections[connections[i]], connections[i]), function () {
                console.log("出错")
            });
        }
    }
};
var oncreaterOffer = function (pc, userId) {
    alert("是第一个人的userid:" + userId);
    return function (desc) {
        alert("123");
        pc.setLocalDescription(desc);
        socket.emit("Offer", JSON.stringify({
            "event": "_offer",
            "data": {
                "id": thisuserid,
                "sdp": desc,
                "userid": userId
            }
        }))
    };

};
var createPeerConnection = function (socketId) {
    var p1 = new PeerConnections(iceServer);
    this.peerConnections[socketId] = p1;
    this.peerConnections[socketId].onicecandidate = function (event) {
        if (event.candidate !== null) {
            alert("执行成功" + event.candidate);
            console.log("执行成功" + event.candidate);
            var miaoshu = {
                "event": isCaller,
                "data": {
                    "id": thisuserid,
                    "candidate": event.candidate,
                    "userid": socketId
                }
            };
            socket.emit("event", JSON.stringify(miaoshu))
        }
    };

    peerConnections[socketId].addStream(localstream);
    // 如果检测到媒体流连接到本地，将其绑定到一个video标签上输出
    this.peerConnections[socketId].onaddstream = function (event) {
        console.log("检测到远程流" + event.stream+socketId);
        var Video = '<video id="' + socketId + '" autoplay></video>';
        $("div.room").append(Video);
        document.getElementById('' + socketId + '').src = URL.createObjectURL(event.stream);
    };
    return p1
};
// var add_stresm = function () {
//
//     console.log("流和userid是否有"+connections.length+"   "+connections.toString()+"   "+localstream);
//     for(var i=0;i<connections.length;i++){
//
//     }
// };
var userLocalstream = function () {
    if(getUserMedia){
        alert("先走的本地音视频获取");
        //获取摄像头和音频
        getUserMedia.call(navigator, {//约束参数,控制音视频的开启与关闭
            video: true,//视频约束
            audio: true//音频约束
        }, function (localMediaStream) {//第二个参数，调用本地的设备，localMediaStream是视频流参数
            var video = document.getElementById("localVideo");//将本地的视频流传进页面
            video.src = window.URL.createObjectURL(localMediaStream);//获取视频流
            localstream = localMediaStream
        }, function (e) {//报错处理
            console.log(e)
        });
    }else{
        alert("没有摄像设备，请检查是否有摄像设备！！！！！！");
    }

};


// $("button.c").click(function () {
//
// });


socket.on("Offer", function (desc) {
    console.log("qqqq" + desc.data.id);
    var targetId = desc.data.id;
    peerConnections[desc.data.id] = createPeerConnection(desc.data.id);
    peerConnections[desc.data.id].setRemoteDescription(new nativeRTCSessionDescription(desc.data.sdp));
    console.log("qqqq--" + peerConnections[desc.data.id]);
    peerConnections[desc.data.id].createAnswer(function (desc) {
        alert("456");
        peerConnections[targetId].setLocalDescription(desc);
        socket.emit("Answer", JSON.stringify({
            "event": "_answer",
            "data": {
                "id": thisuserid,
                "sdp": desc,
                "userid": targetId
            }
        }))
    }, function () {
        console.log("出错...........")
    })
});
socket.on("Answer", function (desc) {
    console.log("设置远程sdp"+desc.data.id);
    peerConnections[desc.data.id].setRemoteDescription(new nativeRTCSessionDescription(desc.data.sdp));
    console.log('回应123'+desc.data.id);

});

socket.on("event", function (desc) {
    console.log("你倒是回应啊" + desc.data.id);
    if (desc.event === isCaller) {
        console.log('回应666' + typeof desc + desc.data.candidate);
       peerConnections[desc.data.id].addIceCandidate(new RTCIceCandidate(desc.data.candidate));
    }
});
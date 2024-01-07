const WebSocket = require('ws');
const os = require('os');

let wsArr = {};
let masterWs = null;
const openServer_ws = (port) => {
    return new Promise(async (resolve, reject) => {
        try {
            const SERVER_IP = getServerIp();
            const wss = new WebSocket.Server({ port: port });

            wss.on('listening', () => {
                // 服务开启成功
                console.log("websocket服务端开启成功");
                resolve({
                    ip: SERVER_IP,
                    port: port
                });
            });

            wss.on('error', (error) => {
                // 服务开启失败
                console.error('WebSocket服务器开启失败', error);
                reject(error)
            });

            wss.on('connection', function connection(ws, req) {
                // 客户端连接成功时触发
                const userId = req.url.split('/')[1];//用户Id
                const userName = decodeURIComponent(req.url.split('/')[2]);//用户名
                const userLevel = req.url.split('/')[3];//权限级别 100:主机，0:从机
                console.log('新用户登录');

                if (wsArr[userId] != null) {
                    ws.close(1000, "用户ID重复");
                } else {

                    // 将客户信息存储在连接信息中
                    ws.ikarosData = {
                        userId: userId,
                        userName: userName,
                        userLevel: userLevel,
                        time: Date.now()
                    }

                    // 保存客户端连接信息，方便之后向指定客户端发送消息
                    wsArr[userId] = ws;

                    if (userLevel == '100') {
                        masterWs = ws;
                    }

                    console.log("有新的客户端接入", ws.ikarosData);
                    console.log("全部客户", Object.keys(wsArr));

                    // 向所有登录用户发送通知
                    sendMessage_ws("SYSTEM", Object.keys(wsArr), `${userName}[${userId}]加入`, "SYSTEM_MSG");
                    // 向所有登录用户发送用户列表
                    sendMessage_ws("SYSTEM", Object.keys(wsArr), getUsetList(), "USER_LIST");

                    if (masterWs != null && masterWs.ikarosData.gameId != null && masterWs.ikarosData.gameId != "") {
                        // 告知登录的用户房主选择的游戏是什么
                        sendMessage_ws("SYSTEM", [ws.ikarosData.userId], {
                            gameId: masterWs.ikarosData.gameId,
                            gameName: masterWs.ikarosData.gameName
                        }, "SELECT_GAME");
                    }

                    ws.on('close', (code, msg) => {
                        const ikarosData = ws.ikarosData;
                        const logoutUserId = ikarosData.userId;
                        const logoutUserName = ikarosData.userName;
                        const logoutUserLevel = ikarosData.userLevel;

                        if (logoutUserLevel == '100') {
                            // 房主退出，强制退出全部用户

                            // 向所有登录用户发送通知
                            sendMessage_ws("SYSTEM", Object.keys(wsArr), `房主${logoutUserName}[${logoutUserId}]退出`, "MASTER_LOGOUT");

                            wsArr = [];
                            masterWs = null;

                            // 关闭连接
                            wss.close();
                        } else {
                            // 普通用户退出
                            delete wsArr[logoutUserId];

                            console.log(`用户 ${logoutUserName} 断开连接`);
                            console.log(Object.keys(wsArr));

                            // 向所有登录用户发送通知
                            sendMessage_ws("SYSTEM", Object.keys(wsArr), `${logoutUserName}[${logoutUserId}]退出`, "SYSTEM_MSG");
                            // 向所有登录用户发送用户列表
                            sendMessage_ws("SYSTEM", Object.keys(wsArr), getUsetList(), "USER_LIST");
                        }
                    });

                    ws.on("message", (data)=>{
                        // 服务端接收到消息，由服务端转发给接收者
                        const messageData = JSON.parse(data);
                        const { userId, targetUserIds, message, msgType } = messageData;
                        sendMessage_ws(userId, targetUserIds, message, msgType);
                    });
                }
            });
        } catch (error) {
            console.error(error);
            reject(error)
        }
    });
}

/**
 * 
 * @param {String} userId 发送者
 * @param {Array} targetUserIds 接收者
 * @param {String} message 消息对象
 * @param {String} msgType 消息类型 
 *  SYSTEM_MSG:系统通知,
 *  USER_CHAT:用户聊天信息,
 *  USER_LIST:用户信息列表,
 *  MASTER_LOGOUT:房主退出,
 *  SELECT_GAME: 房主选择了游戏
 */
const sendMessage_ws = (userId, targetUserIds, message, msgType) => {
    if (targetUserIds == null || targetUserIds.length == 0) {
        targetUserIds = Object.keys(wsArr);
    }

    const msg = JSON.stringify({
        data: message,
        type: msgType,
        userId: userId,
    });

    if (msgType == 'SELECT_GAME') {
        masterWs.ikarosData.gameId = message.gameId;
        masterWs.ikarosData.gameName = message.gameName;
    }

    for (let i = 0; i < targetUserIds.length; i++) {
        const targetUserId = targetUserIds[i];
        const targetUser_ws = wsArr[targetUserId];
        if (targetUser_ws != null) {
            if (msgType == 'SELECT_GAME' && targetUserId == masterWs.ikarosData.userId) {
                // 房主
                continue;
            }
            targetUser_ws.send(msg);
        }
    }
}


// 获取本机的局域网IP
function getServerIp() {
    let interfaces = os.networkInterfaces();
    for (let devName in interfaces) {
        let iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}

function getUsetList() {
    let userList = [];
    for (const [userId, ws] of Object.entries(wsArr)) {
        userList.push(ws.ikarosData);
    }
    return userList;
}

module.exports = {
    openServer_ws,
    sendMessage_ws
}
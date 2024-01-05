const os = require('os');
const http = require('http');
const querystring = require("querystring");
let server;

// 开启局域网接口
function openServer_http() {
    // 防止重复开启
    closeServer()

    // 获取本机的局域网IP和自定义端口
    let SERVER_PORT = 9998;
    let SERVER_IP = getServerIp();

    server = http.createServer();

    server.on('request', (req, res) => {
        // 防止跨域
        res.writeHead(200, { "Content-Type": "application/json;charset=utf-8", "access-control-allow-origin": "*" })

        let param = null; // 监听传递的值
        req.on("data", function (postDataChunk) {
            param = querystring.parse(postDataChunk.toString());
            console.log("请求参数", param);
        });

        // 监听 接口
        req.on('end', () => {
            if (req.method === 'POST' && req.url === '/send') {
                let context = {
                    code: 200,
                    param: param,
                    data: { type: 'Hello World!' }
                }
                res.end(JSON.stringify(context))
            }
        });
    });

    // 返回端口开启结果
    return new Promise((resolve, reject) => {
        server.listen(SERVER_PORT, SERVER_IP, () => {
            // 服务器正确开启
            resolve({
                code: 200,
                data: `http://${SERVER_IP}:${SERVER_PORT}`,
                msg: `服务器开启成功，服务器地址: http://${SERVER_IP}:${SERVER_PORT}`
            });
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                // 服务器端口已经被使用
                reject({
                    code: 404,
                    data: `端口:${SERVER_PORT}被占用,请更换占用端口`,
                    msg: `端口:${SERVER_PORT}被占用,请更换占用端口`
                });
            }
        });
    });
}

function sendMessage_http(ip, host, url, sendData) {
    return new Promise((resolve, reject) => {
        try {
            // POST请求参数
            const postData = JSON.stringify(sendData);

            // 设置请求头部信息
            const options = {
                hostname: ip, // API服务器地址
                port: host, // 默认HTTP端口为80
                path: url, // API接口路径
                method: 'POST',
                headers: {
                    "Content-Type": "application/json;charset=utf-8", // 指定请求体格式为JSON
                    'Content-Length': Buffer.byteLength(postData) // 计算请求体长度
                }
            };

            // 创建HTTP客户端并发送POST请求
            const req = http.request(options, (res) => {
                let data = null;

                res.on('data', (postDataChunk) => {
                    data = postDataChunk.toString();
                });

                res.on('end', () => {
                    console.log("响应结果", data);
                    resolve(data);
                });
            });

            req.write(postData); // 写入请求体数据
            req.end(); // 结束请求
        } catch (error) {
            reject(error);
        }
    });
}

// 关闭server
function closeServer() {
    server && server.removeAllListeners();
    server && server.close(() => {
        console.log("服务接口关闭");
    });
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

module.exports = {
    openServer_http,
    sendMessage_http,
}
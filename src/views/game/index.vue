<template>
    <div class="game" v-loading="loading">
        <el-container>
            <el-aside class="side-menu">
                <el-radio-group v-model="gameOrUser">
                    <el-radio-button label="game">游戏</el-radio-button>
                    <el-radio-button label="user" :disabled="isNull(userList)">计分</el-radio-button>
                </el-radio-group>
                <div class="game-list" v-if="gameOrUser == 'game'">
                    <el-card shadow="hover" v-for="game in gameList" :class="nowGame.id == game.id ? 'active' : ''"
                        :style="playerInfo.isMaster ? {} : { 'pointer-events': 'none' }" @click="nowGame = game;">
                        {{ game.name }}
                    </el-card>
                </div>
                <div class="user-list" v-if="gameOrUser == 'user'">
                    <el-card shadow="hover" v-for="user in userListOrder" :class="user.userLevel == '100' ? 'master' : ''">
                        {{ user.userName }}
                        &nbsp;:&nbsp;
                        {{ isNull(user.point) ? 0 : user.point }}
                    </el-card>
                </div>
            </el-aside>
            <el-container>
                <el-header>
                    <el-page-header :icon="null">
                        <template #title><span></span></template>
                        <template #content>
                            <span class="game-name">{{ nowGame.name }}</span>
                            &nbsp;
                            <el-tag class="ml-2" :type="playerInfo.isMaster ? 'danger' : 'success'"
                                v-if="isNotNull(playerInfo.playerName)">
                                <template v-if="playerInfo.isMaster">房主</template>
                                <template v-else>玩家</template>
                                :{{ playerInfo.playerName }}
                            </el-tag>
                            <el-tag class="ml-2" type="danger" v-else>未设置名称</el-tag>
                            &nbsp;
                            <el-tag class="ml-2" type="danger" v-if="wsServerInfo.isOpen">
                                服务端:{{ wsServerInfo.wsIp }}:{{ wsServerInfo.wsPort }}
                            </el-tag>
                            <el-tag class="ml-2" type="success" v-else-if="wsClientInfo.isOpen">
                                客户端:{{ wsClientInfo.wsIp }}:{{ wsClientInfo.wsPort }}
                            </el-tag>
                            <el-tag class="ml-2" type="danger" v-else>服务未开启</el-tag>
                            &nbsp;
                        </template>
                        <template #extra>
                            <span class="close-win" @click="handleClose">
                                <el-icon>
                                    <CloseBold />
                                </el-icon>
                            </span>
                        </template>
                    </el-page-header>
                </el-header>
                <el-main>
                    <el-container>
                        <router-view :gameMessage="gameMessage" :playerInfo="playerInfo"
                            @send-message="sendWsMessage"></router-view>
                    </el-container>
                </el-main>
                <el-footer>
                    <el-button type="success" class="open-server" v-if="!wsClientInfo.isOpen && !wsServerInfo.isOpen"
                        @click="playerInfoDialog.vivible = true">
                        设置名称
                    </el-button>

                    <template v-if="isNotNull(playerInfo.playerName)">
                        <el-button type="success" class="open-server" v-if="!wsClientInfo.isOpen && !wsServerInfo.isOpen"
                            @click="createRoom">
                            开启房间
                        </el-button>
                        <el-button type="success" class="open-client" v-if="!wsClientInfo.isOpen && !wsServerInfo.isOpen"
                            @click="intoRoom">
                            进入房间
                        </el-button>

                        <el-button type="danger" class="close-client" v-else @click="quitRoom">
                            退出房间
                        </el-button>
                    </template>

                </el-footer>
            </el-container>
        </el-container>

        <el-dialog v-model="playerInfoDialog.vivible" :close-on-click-modal="false" title="设置用户名" width="30%">
            <el-form label-width="auto">
                <el-form-item label="用户ID">
                    <el-input v-model="playerInfoDialog.playerId" show-word-limit />
                </el-form-item>
                <el-form-item label="用户名">
                    <el-input v-model="playerInfoDialog.playerName" show-word-limit maxlength="5" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="closePlayerInfoDialog(false)">取消</el-button>
                    <el-button type="primary" @click="closePlayerInfoDialog(true)">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <el-dialog v-model="wsServerInfoDialog.vivible" :close-on-click-modal="false" title="连接服务器" width="30%">
            <el-form label-width="auto">
                <el-form-item label="服务器IP">
                    <el-input v-model="wsServerInfoDialog.wsIp" placeholder="0.0.0.0" />
                </el-form-item>
                <el-form-item label="服务器端口">
                    <el-input v-model="wsServerInfoDialog.wsPort" show-word-limit maxlength="5" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="closeSetServerDialog(false)">取消</el-button>
                    <el-button type="primary" @click="closeSetServerDialog(true)">确定</el-button>
                </span>
            </template>
        </el-dialog>

    </div>
</template>

<script setup>
import { onMounted, watch, computed, ref } from 'vue'
import { ElNotification } from 'element-plus'
import { useRouter } from 'vue-router'
import { isNotNull, isNull } from '@/common/utils.js'

const router = useRouter()
const loading = ref(false);

const gameOrUser = ref('game');

const gameMessage = ref(null);

// 玩家信息
const playerInfo = ref({
    // 玩家ID(本地ip)
    playerId: "",
    // 玩家名
    playerName: "",
    // 是否为房主
    isMaster: false,
});

// websocket服务端信息
const wsServerInfo = ref({
    // websocket服务ip
    wsIp: "0.0.0.0",
    // websocket服务端口
    wsPort: "50000",
    // 服务端是否开启
    isOpen: false,
});

// websocket客户端信息
const wsClientInfo = ref({
    // websocket服务ip
    wsIp: "0.0.0.0",
    // websocket服务端口
    wsPort: "50000",
    // 客户端是否开启
    isOpen: false,
});

// 玩家信息弹窗
const playerInfoDialog = ref({
    playerId: "",
    playerName: "",
    vivible: false
});
// websocket服务端信息弹窗
const wsServerInfoDialog = ref({
    wsIp: "",
    wsPort: wsServerInfo.value.wsPort,
    vivible: false
});

// 用户列表
const userList = ref([]);
const userListOrder = computed(() => {
    return userList.value.sort((a, b) => a.time - b.time);
})
// 游戏列表
const gameList = ref([
    { id: "snake", name: "贪吃蛇" },
    { id: "gobang", name: "五子棋" }
]);
const nowGame = ref({});


onMounted(async () => {
    // 获取本机ip
    const localIp = await mainWinApi.getLocalIp();

    playerInfo.value.playerId = localIp;
    playerInfoDialog.value.playerId = localIp;

    wsServerInfo.value.wsIp = localIp;
    wsClientInfo.value.wsIp = localIp;
    wsServerInfoDialog.value.wsIp = localIp;
})

watch(nowGame, (newValue, oldValue) => {
    router.push({
        path: '/game/' + newValue.id
    });
    if (playerInfo.value.isMaster) {
        // 发送通知，告知其他玩家选择的游戏是什么
        sendWsMessage(playerInfo.value.playerId, [], {
            gameId: newValue.id,
            gameName: newValue.name,
        }, "SELECT_GAME");
    }
});

// 开启房间
const createRoom = async () => {
    playerInfo.value.isMaster = true;
    // 开启服务
    await openServer();
    // 连接服务
    await openClient("100");
}
// 进入房间
const intoRoom = () => {
    wsServerInfoDialog.value.vivible = true;
}
// 退出房间
const quitRoom = () => {
    websocket.close();
}

const closePlayerInfoDialog = async (type) => {
    playerInfoDialog.value.vivible = false;
    if (type) {
        playerInfo.value.playerId = playerInfoDialog.value.playerId;
        playerInfo.value.playerName = playerInfoDialog.value.playerName;
    } else {
        playerInfoDialog.value.playerId = playerInfo.value.playerId;
        playerInfoDialog.value.playerName = playerInfo.value.playerName;
    }
}

const closeSetServerDialog = async (type) => {
    wsServerInfoDialog.value.vivible = false;
    playerInfo.value.isMaster = false;
    if (type) {
        try {
            loading.value = true;
            wsServerInfo.value.wsIp = wsServerInfoDialog.value.wsIp;
            wsServerInfo.value.wsPort = wsServerInfoDialog.value.wsPort;
            // 连接服务
            await openClient("0");
        } catch (error) {
        }
        loading.value = false;
    }
}

// 开启websocket服务
const openServer = () => {
    return new Promise((resolve, reject) => {
        mainWinApi.openWsServer(wsServerInfo.value.wsPort).then((data) => {
            // 服务开启成功
            wsServerInfo.value.isOpen = true;
            wsServerInfo.value.wsIp = data.ip;
            wsServerInfo.value.wsPort = data.port;

            ElNotification({
                offset: 100,
                message: "服务开启成功",
                type: 'success',
            })
            resolve(data);
        }).catch((error) => {
            // 服务开启失败
            console.error(error);
            wsServerInfo.value.isOpen = false;
            ElNotification({
                offset: 100,
                message: "服务开启失败",
                type: 'error',
            })
            reject(error);
        });
    });
}

let websocket;
const openClient = (level) => {
    return new Promise((resolve, reject) => {
        const wsIp = wsServerInfo.value.wsIp;
        const wsPort = wsServerInfo.value.wsPort;
        const playerId = playerInfo.value.playerId;
        const playerName = playerInfo.value.playerName;
        websocket = new WebSocket('ws://' + wsIp + ":" + wsPort + "/" + playerId + "/" + playerName + "/" + level);

        websocket.onopen = () => {
            wsClientInfo.value.isOpen = true;
            ElNotification({
                offset: 100,
                message: "服务连接成功",
                type: 'success',
            })
            resolve();
        };

        websocket.onerror = (event) => {
            wsClientInfo.value.isOpen = false;
            ElNotification({
                offset: 100,
                message: "服务连接失败",
                type: 'error',
            })
            reject();
        };

        websocket.onmessage = (event) => {
            const messageData = JSON.parse(event.data);
            // 消息类型 SYSTEM_MSG:系统通知,USER_CHAT:用户聊天信息,USER_LIST:用户信息列表,MASTER_LOGOUT:房主退出,SELECT_GAME: 房主选择了游戏
            const msgType = messageData.type;
            // 发送者id
            const sendUserId = messageData.userId;
            // 消息内容
            const msg = messageData.data;

            if (msgType == "USER_LIST") {
                userList.value = msg;
                console.log("用户列表", messageData);
            } else if (msgType == "MASTER_LOGOUT") {
                websocket.close();
            } else if (msgType == "SELECT_GAME") {
                nowGame.value = {
                    id: msg.gameId,
                    name: msg.gameName,
                }
                ElNotification({
                    offset: 100,
                    message: "房主选择了" + msg.gameName,
                    type: 'success',
                })
            } else if (msgType == "GAME_DATA") {
                gameMessage.value = messageData;
            } else {
                console.log("信息", messageData);
            }
        };

        websocket.onclose = (event) => {
            wsServerInfo.value.isOpen = false;
            wsClientInfo.value.isOpen = false;
            playerInfo.value.isMaster = false;
            console.log("客户端连接断开")
        }
    });
}

const sendWsMessage = (userId, targetUserIds, message, msgType) => {
    // 直接给接收者发送消息
    // mainWinApi.sendWsMessage(userId, targetUserIds, message, msgType);
    
    // 发送给服务端，由服务端转发给接收者
    websocket.send(JSON.stringify({
        userId: userId,
        targetUserIds: targetUserIds,
        message: message,
        msgType: msgType,
    }))
}

const handleClose = () => {
    mainWinApi.closeWindow();
}
</script>

<style scoped>
.game {
    height: 100%;
}

.game>>>.el-main {
    padding: 0px;
}

.game>>>.el-container {
    height: 100%;
}

.game>>>.el-header {
    -webkit-app-region: drag;
    border-bottom: 2px solid var(--ikaros-theme-color);
    height: auto;
    padding: 10px 10px;
}

.game>>>.el-footer {
    height: auto;
    padding: 10px 10px;
}

.side-menu {
    background-color: var(--ikaros-theme-color);
    width: 150px;
    text-align: center;
    padding-top: 10px;
}

.game-list>>>.el-card {
    width: 130px;
    margin: 10px auto;
}

.game-list>>>.el-card__body {
    padding: 10px;
}

.game-list>>>.el-card.active {
    border-color: #00dcff;
    box-shadow: 0px 0px 12px #00dcff;
}

.user-list>>>.el-card {
    width: 130px;
    margin: 10px auto;
}

.user-list>>>.el-card__body {
    padding: 5px;
}

.user-list>>>.el-card.master {
    background-color: #fde5e5;
}

.close-win {
    -webkit-app-region: no-drag;
    display: inline-block;
    padding: 0px 10px;
}

.server-btn {
    -webkit-app-region: no-drag;
    display: inline-block;
    margin-left: 20px;
}
</style>
<template>
    <div class="game" v-loading="loading">
        IP:<input type="text" v-model="ws_ip">
        PORT:<input type="text" v-model="ws_port">
        NAME:<input type="text" v-model="ws_name">
        <button @click="openClient">连接服务</button>
        <br>

        <button @click="openServer">开启服务</button>
        <p v-for="msg in messageArr">{{ msg }}</p>

        <br>
        <br>
        <br>
        msg:<input type="text" v-model="ws_msg">
        <button @click="sendMsg">发送</button>

    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const loading = ref(false);

const messageArr = ref([]);
const ws_ip = ref("192.168.4.72");
const ws_port = ref(12345);
const ws_name = ref("001");
const ws_msg = ref("");

onMounted(async () => {

})

const openServer = () => {
    mainWinApi.openWsServer(ws_port.value).then(() => {
        messageArr.value.push("服务开启成功");
    }).catch((error) => {
        console.error(error);
        messageArr.value.push("服务开启失败");
    });
}

let websocket;
const openClient = () => {
    loading.value = true;
    websocket = new WebSocket('ws://' + ws_ip.value + ":" + ws_port.value);

    websocket.onopen = () => {
        loading.value = false;
        websocket.send(ws_name.value);
        messageArr.value.push("服务连接成功");
    };

    websocket.onmessage = (event) => {
        messageArr.value.push("收到消息:" + event.data);
    };

    websocket.onerror = (event) => {
        loading.value = false;
        messageArr.value.push("连接失败!!!!");
    };
}

const sendMsg = () => {
    websocket.send(ws_msg.value);
}

</script>

<style scoped></style>
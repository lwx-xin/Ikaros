<template>
    <div class="chat" v-loading="loading">
        <el-container>
            <el-aside class="user-list">
                <el-card shadow="hover" v-for="user in userList">
                    {{ user.userName }}
                </el-card>
            </el-aside>
            <el-container>
                <el-header>Header</el-header>
                <el-main>Main</el-main>
                <el-footer>Footer</el-footer>
            </el-container>
        </el-container>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const loading = ref(false);
// 用户列表
const userList = ref([]);
//
const local_ip = ref('127.0.0.1');
//
const ws_port = ref('5000');


onMounted(async () => {
    local_ip.value = await mainWinApi.getLocalIp();

})


</script>

<style scoped>
.chat {
    height: 100%;
}

.chat>>>.el-container {
    height: 100%;
}

.user-list {
    background-color: var(--ikaros-theme-color);
    width: 200px;
}

.user-list>>>.el-card {
    width: 170px;
    margin: 10px auto;
}

.user-list>>>.el-card__body {
    padding: 10px;
}</style>
<template>
    <div class="home">
        <el-row>
            <el-card shadow="hover" @click="fishBook">Fish-Book</el-card>
            <el-card shadow="hover" @click="ldCompare">LD-Compare</el-card>
            <el-card shadow="hover" @click="game">Game</el-card>
            <el-card shadow="hover" @click="chat">Chat</el-card>
        </el-row>
    </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useIkarosStore } from "@/store/index.js"
import { onMounted } from 'vue'

const router = useRouter()
const ikarosStore = useIkarosStore()

onMounted(() => {
    ikarosStore.$patch((state) => {
        state.isMainPage = true;
        state.pageTitle = "";
    })
})

const fishBook = () => {
    router.push({
        path: '/main/fishBook'
    })
}

const ldCompare = () => {

}

const game = () => {
    router.push({
        path: '/game'
    })
}

const chat = () => {
    router.push({
        path: '/chat'
    })
}

</script>

<style scoped>
.home>>>.el-card{
    width: 150px;
    margin: 10px;
    text-align: center;
}
</style>
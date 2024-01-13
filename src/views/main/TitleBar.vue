<template>
    <el-page-header class="title-bar">
        <template #icon>
            <span v-show="ikarosStore.isMainPage">
                IK
            </span>
            <span v-show="!ikarosStore.isMainPage" @click="back" class="back-win">
                <el-icon>
                    <Back />
                </el-icon>
            </span>
        </template>
        <template #title><span></span></template>
        <template #content>{{ ikarosStore.pageTitle }}</template>
        <template #extra>
            <span class="min-win" @click="handleMinimize">
                <el-icon>
                    <Minus />
                </el-icon>
            </span>
            <span class="close-win" @click="handleClose">
                <el-icon>
                    <CloseBold />
                </el-icon>
            </span>
        </template>
    </el-page-header>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()

import { useIkarosStore } from "@/store/index.js"
const ikarosStore = useIkarosStore()

const handleMinimize = () => {
    mainWinApi.resizeMinWindow();
}

const handleClose = () => {
    mainWinApi.closeWindow();
}

const back = () => {
    console.log("back",ikarosStore.pageTitle)
    let path = "/main/home";
    switch (ikarosStore.pageTitle) {
        case 'Fish-Book':
            path = "/main/home";
            break;
    }
    router.push({
        path: path
    })
}
</script>

<style scoped>
.title-bar {
    -webkit-app-region: drag;
}

.back-win{
    -webkit-app-region: no-drag;
    display: inline-block;
    padding: 0px 10px;
}

.min-win {
    -webkit-app-region: no-drag;
    display: inline-block;
    padding: 0px 10px;
}

.close-win {
    -webkit-app-region: no-drag;
    display: inline-block;
    padding: 0px 10px;
}
</style>
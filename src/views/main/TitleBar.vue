<template>
    <el-page-header class="title-bar">
        <template #icon>
            <span v-show="ikarosStore.isMainPage">
                IK
            </span>
            <span v-show="!ikarosStore.isMainPage">
                <el-icon><Back /></el-icon>
            </span>
        </template>
        <template #title><span></span></template>
        <template #content>{{ ikarosStore.pageTitle }}</template>
        <template #extra>
            <span class="min-win" @click="handleMinimize">
                <el-icon><Minus /></el-icon>
            </span>
            <span class="close-win" @click="handleClose">
                <el-icon><CloseBold /></el-icon>
            </span>
        </template>
    </el-page-header>
</template>

<script setup>

import { useIkarosStore } from "@/store/index.js"
const ikarosStore = useIkarosStore()

const handleMinimize = () => {
    mainWinApi.resizeMinWindow();
}

const handleClose = () => {
    mainWinApi.closeWindow();
}
</script>

<style scoped>
.title-bar {
    -webkit-app-region: drag;
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
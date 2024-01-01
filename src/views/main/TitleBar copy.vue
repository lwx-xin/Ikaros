<template>
    <div class="title-bar" @mousedown="startDrag">
        <div class="win-logo">
            <el-image :src="logo" />
        </div>
        <ul class="window-actions">
            <li class="win-minimize-btn" @click="handleMinimize">
                <el-icon>
                    <Minus />
                </el-icon>
            </li>
            <li class="win-close-btn" @click="handleClose">
                <el-icon>
                    <SwitchButton />
                </el-icon>
            </li>
        </ul>
    </div>
</template>

<script setup>
import logo from '../../../public/images/logo.png'

const handleMinimize = () => {
    mainWinApi.resizeMinWindow();
}

const handleClose = () => {
    mainWinApi.closeWindow();
}
</script>

<style scoped>
.title-bar {
    height: 100%;
    display: flex;
    -webkit-app-region: drag;
}

.window-actions {
    width: 100%;
    list-style: none;
    display: flex;
    justify-content: flex-end
}

.window-actions li {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-app-region: no-drag;
}

.window-actions li:not(.win-logo) {
    width: 40px;
}

.window-actions li:not(.win-logo):hover {}

.win-logo>>>.el-image {
    width: calc(var(--el-menu-icon-width) + var(--el-menu-base-level-padding) * 2);
}

/* .title-bar>>>.el-header {
    height: auto;
    text-align: right;
    padding: 0px;
}

.window-actions {
    list-style: none;
}
.window-actions li{
    display: inline-block;
    padding: 10px 15px;
}
.window-actions li:hover{
    background-color: #C6E2FF;
} */</style>

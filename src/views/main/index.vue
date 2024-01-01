<template>
    <div class="main">
        <el-container class="container">
            <el-header>
                <el-main>
                    <TitleBar></TitleBar>
                </el-main>
            </el-header>
            <el-container>
                <SideMenu v-if="ikarosStore.isMainPage"></SideMenu>
                <el-main>
                    <router-view></router-view>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script setup>
import SideMenu from './SideMenu.vue';
import TitleBar from './TitleBar.vue';

import { useIkarosStore } from "@/store/index.js"
const ikarosStore = useIkarosStore()
</script>

<style scoped>
.main {
    height: 100%;
    width: 100%;
}

.main .container {
    height: 100%;
}

.main>>>.el-header {
    padding: 0px;
    background-color: var(--ikaros-theme-color);
}

.content-main {
    padding: 0;
}
</style>
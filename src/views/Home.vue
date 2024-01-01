<template>
    <div class="home">
        <el-row :gutter="12">
            <el-col :span="8">
                <el-card shadow="hover" @click="fishBook">Fish-Book</el-card>
            </el-col>
            <el-col :span="8">
                <el-card shadow="hover" @click="ldCompare">LD-Compare</el-card>
            </el-col>
            <el-col :span="8">
                <el-card shadow="hover">Other</el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { useRouter,useRoute } from 'vue-router'
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
    // mainWinApi.openFishBookWindow();
    router.push({
        path: '/main/fishBook'
    })
}
const ldCompare = () => {
    // ipcRenderer.send('window-open-fishBook');
}
</script>

<style scoped></style>
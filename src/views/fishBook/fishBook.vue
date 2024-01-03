<template>
    <div class="fish-book" v-loading="loading">
        <el-row class="btn-list">
            <el-popover placement="top-start" title="提示" width="400" trigger="click">
                <template #reference>
                    <el-button type="primary">
                        上传小说
                        <el-icon class="el-icon--right">
                            <Upload />
                        </el-icon>
                    </el-button>
                </template>
                <div class="popover-content">
                    您的书架对应您磁盘上的一个名为【book】的文件夹，如果您想要上传小说的话，点击下方蓝色按钮后，只需要把txt文件拖进文件夹，回到软件点击【同步书架】按钮即可。
                    <el-divider></el-divider>
                    <div style="text-align: center">
                        <el-button type="primary" @click="openBookDirectory">
                            打开书架本地文件夹
                        </el-button>
                    </div>
                </div>
            </el-popover>
            <el-button type="primary" @click="refreshBooks">
                同步书架
                <el-icon>
                    <Refresh />
                </el-icon>
            </el-button>
        </el-row>
        <el-row class="book-list">
            <template v-for="book in bookList">
                <el-card shadow="hover" class="book-card">
                    <template #header>
                        <div class="book-header">阅读中</div>
                    </template>
                    <div class="book-content">
                        <div>{{ book.name }}</div>
                    </div>
                    <template #footer>
                        <div class="book-footer">已读{{ percentage(book.end / book.words) }}</div>
                    </template>
                </el-card>
            </template>
        </el-row>
    </div>
</template>

<script setup>
import { useIkarosStore } from "@/store/index.js"
import { onMounted, ref } from 'vue'
import { ElNotification } from 'element-plus'
import { percentage } from '@/common/utils.js'

const ikarosStore = useIkarosStore()

const bookList = ref([]);
const loading = ref(false);

onMounted(() => {
    ikarosStore.$patch((state) => {
        state.isMainPage = false;
        state.pageTitle = "Fish-Book";
    });
    getBookInfoList();
})

// 打开本地书架目录
const openBookDirectory = () => {
    mainWinApi.openBookDirectory();
}

// 同步书架数据
const refreshBooks = async () => {
    loading.value = true;
    console.log("1");

    try {
        await mainWinApi.refreshBooks();
		
		console.log("2");
        bookList.value = await mainWinApi.getBookInfoList();
		console.log("3");
        console.log(bookList.value);
        ElNotification({
            offset: 100,
            message: "同步成功",
            type: 'success',
        })
    } catch (error) {
        console.log(error);
        ElNotification({
            offset: 100,
            message: "同步失败",
            type: 'error',
        })
    }
    loading.value = false;

}

const getBookInfoList = async () => {
    console.log("getBookInfoList");
    loading.value = true;

    try {
        bookList.value = await mainWinApi.getBookInfoList();
        console.log(bookList.value);
        ElNotification({
            offset: 100,
            message: "书架信息读取成功",
            type: 'success',
        })
    } catch (error) {
        console.log(error);
        ElNotification({
            offset: 100,
            message: "书架信息读取失败",
            type: 'error',
        })
    }
    loading.value = false;
}
</script>

<style scoped>
.btn-list {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
}

.book-content {
    width: 140px;
    height: 130px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.book-content div {}

.book-footer {
    text-align: right;
}

.book-header,
.book-footer {
    color: #c8c9cc;
    font-size: 12px;
}

.book-card {
    margin: 10px;
    background-color: #fdf6ec;
}

.book-card>>>.el-card__header,
.book-card>>>.el-card__footer {
    border: none;
}
</style>
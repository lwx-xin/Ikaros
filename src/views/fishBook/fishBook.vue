<template>
    <div class="fish-book" v-loading="loading">
        <el-row class="btn-list">
            <el-button type="primary" @click="uploadBook">
                上传小说
                <el-icon class="el-icon--right">
                    <Upload />
                </el-icon>
            </el-button>
            <el-button type="primary" @click="openBookDirectory" v-if="false">
                打开书架目录
                <el-icon class="el-icon--right">
                    <Upload />
                </el-icon>
            </el-button>
            <el-button type="primary" @click="refreshBooks" v-if="false">
                同步书架
                <el-icon>
                    <Refresh />
                </el-icon>
            </el-button>
        </el-row>
        <el-row class="book-list">
            <template v-for="book in bookList">
                <el-card shadow="hover" class="book-card" @click="openBook(book.id)">
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

// 上传小说
const uploadBook = async () => {
    try {
        loading.value = true;
        // 上传
        const bookName = await mainWinApi.uploadBook();
        bookList.value = await mainWinApi.getBookInfoList();
        // 重新加载列表
        if (bookName) {
            ElNotification({
                offset: 100,
                message: "文件【" + bookName + "】添加成功",
                type: 'success',
            });
        }
        loading.value = false;
    } catch (error) {
        loading.value = false;
        ElNotification({
            offset: 100,
            message: "上传失败",
            type: 'error',
        })
    }
}

// 同步书架数据
const refreshBooks = async () => {
    loading.value = true;

    try {
        await mainWinApi.refreshBooks();

        bookList.value = await mainWinApi.getBookInfoList();
        ElNotification({
            offset: 100,
            message: "同步成功",
            type: 'success',
        })
    } catch (error) {
        ElNotification({
            offset: 100,
            message: "同步失败",
            type: 'error',
        })
    }
    loading.value = false;

}

// 加载书架信息
const getBookInfoList = async () => {
    loading.value = true;
    try {
        bookList.value = await mainWinApi.getBookInfoList();
        ElNotification({
            offset: 100,
            message: "书架信息读取成功",
            type: 'success',
        })
    } catch (error) {
        ElNotification({
            offset: 100,
            message: "书架信息读取失败",
            type: 'error',
        })
    }
    loading.value = false;
}

// 打开图书
const openBook = (bookId) => {
    mainWinApi.openReadBookWindow(bookId);
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
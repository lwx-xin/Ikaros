<template>
    <div class="fish-book" @mousedown="startDrag">
        <div>{{ content }}</div>
        <div class="win-close-btn" @click="handleClose">
            <el-icon>
                <close />
            </el-icon>
        </div>
        <div class="win-close-btn" @click="beforePage">
            pre
        </div>
        <div class="win-close-btn" @click="nextPage">
            next
        </div>
    </div>addBook
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute();
const bookId = ref(route.params.bookId);
let wordsPerPage = ref(10);

onMounted(async () => {
    await getBookSettingInfo();
    await readFile(bookId, wordsPerPage, "");
})

const getBookSettingInfo = async () => {
    wordsPerPage = ref(10);
}

const handleClose = () => {
    fishBookWinApi.closeWindow();
}

const content = ref('');

const readFile = async (bookId, wordsPerPage, type) => {
    const data = await fishBookWinApi.readFile(bookId.value, wordsPerPage.value, type);
    content.value = data;
}

const nextPage = async () => {
    await readFile(bookId, wordsPerPage, "next");
}
const beforePage = async () => {
    await readFile(bookId, wordsPerPage, "before");
}
</script>

<style scoped>
.fish-book {
    width: 100%;
    height: 100%;
    -webkit-app-region: drag;
    background-color: #ffffff;
    display: flex;
    justify-content: flex-end
}

.fish-book>div {
    display: inline-block;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.win-close-btn {
    -webkit-app-region: no-drag;
    background-color: #e09898;
}
</style>
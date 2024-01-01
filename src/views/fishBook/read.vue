<template>
    <div class="fish-book" @mousedown="startDrag">
        <div>{{ content }}</div>
        <div class="win-close-btn" @click="addBook">
            addBook
        </div>
        <div class="win-close-btn" @click="beforePage">
            before
        </div>
        <div class="win-close-btn" @click="nextPage">
            next
        </div>
        <div class="win-close-btn" @click="handleClose">
            <el-icon>
                <close />
            </el-icon>
        </div>
    </div>addBook
</template>

<script setup>
import { onMounted, ref } from 'vue'

onMounted(async () => {
    await readFile();
})

const handleClose = () => {
    fishBookWinApi.closeWindow();
}

const content = ref('');
const start = ref(1);
const length = ref(100);

const readFile = async () => {
    console.log('readFile');
    const data = await fishBookWinApi.readFile('变废为宝：开局捡到假死美杜莎.txt', start.value, length.value);
    content.value = data;
}

const nextPage = async () => {
    start.value += length.value;
    await readFile();
}
const beforePage = async () => {
    if (start.value > 1) {
        start.value -= length.value;
        await readFile();
    }
}

const addBook = async () => {
    await fishBookWinApi.addBook('变废为宝：开局捡到假死美杜莎.txt');
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
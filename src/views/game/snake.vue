<template>
    <div class="snake" v-loading="loading">
        <button @click="sendMessage">aaa</button>
    </div>
</template>

<script setup>
import { onMounted, watch, ref, getCurrentInstance } from 'vue'

const loading = ref(false);
const props = defineProps(['gameMessage','playerInfo']);
const instance = getCurrentInstance();


onMounted(async () => {

})

watch(() => props.gameMessage, (newValue, oldValue) => {
    // 对 props 中的 gameMessage 进行变化的响应
    console.log('gameMessage changed:', newValue);
});

const sendMessage = () => {
    instance.emit('send-message', props.playerInfo.playerId, [], {
        "aaa":"1111",
        "bbb":"2222",
        "ccc":"3333",
    }, "GAME_DATA");
}

</script>

<style scoped>
.snake {
    height: 100%;
}
</style>
<template>
    <div class="snake">
        <div v-for="(rowData, x) in gameMap" class="row" :key="x">
            <div v-for="(colData, y) in rowData" class="col" :class="x + '-' + y" :key="y"
                :style="{ 'background-color': getBg(x, y) }" @click="addSnake(props.playerInfo.playerId, x, y)"></div>
        </div>
        |{{ snakes }}|
    </div>
</template>

<script setup>
import { onMounted, watch, ref, getCurrentInstance, nextTick } from 'vue'

const loading = ref(false);

const props = defineProps(['gameMessage', 'playerInfo']);
const instance = getCurrentInstance();

// 游戏地图的宽高
const gameMapRow = ref(20);
const gameMapCol = ref(20);
// 游戏地图
const gameMap = ref([]);

// 蛇集合，key:玩家id，value:蛇数组
const snakes = ref({});
const snakeColor = ref({});

onMounted(async () => {
    const playerId = props.playerInfo.playerId;
    drwaGameMap();
    addSnake(playerId, 1, 1);
    snakeColor.value[playerId] = "red";
})

const drwaGameMap = () => {
    for (let i = 0; i < gameMapRow.value; i++) {
        let row = [];
        for (let j = 0; j < gameMapCol.value; j++) {
            row.push({
                x: i,
                y: j,
                status: 0,
            });
        }
        gameMap.value.push(row);
    }
}

const addSnake = (playerId, x, y) => {
    if (!snakes.value[playerId]) {
        snakes.value[playerId] = [];
    }
    snakes.value[playerId].push({ x, y });
}

watch(() => snakes.value[props.playerInfo.playerId], (newVal, oldVal) => {
    console.log(newVal, oldVal);
}, { deep: true });

const getBg = (x, y) => {
    for (const [playerId, snakeInfo] of Object.entries(snakes.value)) {
        for (let i = 0; i < snakeInfo.length; i++) {
            const snakeBody = snakeInfo[i];
            if (snakeBody["x"] == x && snakeBody["y"] == y) {
                return snakeColor.value[playerId];
            }
        }
    }
    return "";
}

</script>

<style scoped>
.snake {
    width: 100%;
    height: 100%;
    font-family: "Poppins", sans-serif;
    color: white;
    background-color: #222738;
}

.col {
    border: 1px solid white;
    width: 25px;
    height: 25px;
}
</style>
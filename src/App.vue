<template>
    <router-view></router-view>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
    mainWinApi.initTable();
})
</script>
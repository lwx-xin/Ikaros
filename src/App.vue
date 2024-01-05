<template>
	<router-view></router-view>
</template>

<script setup>
import { onMounted, ref } from 'vue'

onMounted(async () => {
	// 初始化settings
	await mainWinApi.initSettings(false);

	// 开启httpServer
	/* mainWinApi.openHttpServer().then((res)=>{
		console.log("httpServer-success",res)
	}).catch((error)=>{
		console.log("httpServer-error",error)
	}); */
})
</script>
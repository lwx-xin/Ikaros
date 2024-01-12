<template>
	<div class="settings-system">
		SYSTEM
	</div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { isNotNull, isNull } from '@/common/utils.js'

const form = ref({});

onMounted(async () => {
	mainWinApi.getSettings("system", null).then((settingsDatas)=>{
		if(isNotNull(settingsDatas)){
			for(let i=0;i<settingsDatas.length;i++){
				const key = settingsDatas[i].key;
				const value = settingsDatas[i].value;
				form[key]=value;
			}
		}
	}).catch((error) => {
		
	});
})
</script>

<style scoped></style>
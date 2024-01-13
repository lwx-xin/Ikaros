<template>
	<div class="settings">
		<el-radio-group v-model="configTab">
			<el-radio-button label="system">系统设置</el-radio-button>
			<el-radio-button label="fishBook">Fish-Book</el-radio-button>
		</el-radio-group>
		<router-view></router-view>
	</div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { isNotNull, isNull } from '@/common/utils.js'

const router = useRouter();
const configTab = ref("");

onMounted(async () => {
    configTab.value = "system"
})

watch(configTab, async (newData, oldData) => {
	let path = "/main/settings/";
	if(newData=="system"){
		path += "system";
	} else if(newData=="fishBook"){
		path += "fishBook";
	}
    router.push({
        path: path,
    });
})

const changeSettings = (m, k, v) => {
	mainWinApi.setSettings(m, k, v).then(()=>{
		
	}).catch((error) => {
		
	});
}
</script>

<style scoped></style>
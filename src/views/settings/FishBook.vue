<template>
	<div class="settings-fish-book">
		<el-form size="small" :model="form" label-position="left" label-width="120px">
			<el-alert
				class="tip"
				title="打开小说阅读器后，再调整下面的设置项，可直接预览效果哦！"
				type="info"
			></el-alert>
			<el-form-item label="每页字数">
				<el-slider
					v-model="form.wordsPerPage"
					:min="5"
					:max="200"
					:step="1"
					:marks="marksWordsTotal"
					@change="changeConfig('wordsPerPage')"
					style="width: 420px"
				></el-slider>
			</el-form-item>
			<br />
			<el-form-item label="字体颜色">
				<el-color-picker
					v-model="form.textColor"
					@change="changeConfig('textColor')"
					show-alpha
					style="width: 100px"
				></el-color-picker>
			</el-form-item>
			<el-form-item label="背景颜色">
				<el-color-picker
					v-model="form.textBgColor"
					@change="changeConfig('textBgColor')"
					color-format="hex"
					show-alpha
					style="width: 100px"
				></el-color-picker>
				<span class="color-picker-tip">
					Tip：支持调整背景色透明度，调整为 0，则只显示文字
				</span>
			</el-form-item>
			<el-form-item label="窗口透明度">
				<el-slider
					v-model="form.bgOpacity"
					:min="0.1"
					:max="1"
					:step="0.01"
					:marks="marksBgOpacity"
					@change="changeConfig('bgOpacity')"
					style="width: 420px"
				></el-slider>
			</el-form-item>
			<br />
			<el-form-item label="字体大小">
				<el-slider
					v-model="form.fontSize"
					:min="12"
					:max="30"
					:step="1"
					@change="changeConfig('fontSize')"
					style="width: 420px"
				></el-slider>
			</el-form-item>
			<br />
			<el-form-item label="字体间距">
				<el-slider
					v-model="form.letterSpacing"
					:min="0"
					:max="20"
					:step="0.5"
					@change="changeConfig('letterSpacing')"
					style="width: 420px"
				></el-slider>
			</el-form-item>
			<el-form-item label="阅读器窗口">
				<el-checkbox v-model="form.resizable" @change="resizableChange">
					允许调整宽高
				</el-checkbox>
			</el-form-item>
			<br />
			<el-button type="primary" plain @click="resetBookSettings">
				恢复默认设置
			</el-button>
		</el-form>
	</div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { isNotNull, isNull, toNumber } from '@/common/utils.js'

const form = ref({});
const module = ref("fishBook");

const marksBgOpacity = ref({
	0.1: '0.1',
	0.5: '0.5',
	0.7: {
		style: {
			color: '#1989FA',
		},
		label: '极致体验',
	},
	1: '1',
});
const marksWordsTotal = ref({
	40: {
		style: {
			color: '#1989FA',
		},
		label: '推荐40',
	},
	100: '100',
	150: '150',
	200: '200',
});

onMounted(async () => {
	// number类型的字段
	const numberField = ["wordsPerPage","bgOpacity","fontSize","letterSpacing"];
	mainWinApi.getSettings(module.value, null).then((settingsDatas)=>{
		if(isNotNull(settingsDatas)){
			for(let i=0;i<settingsDatas.length;i++){
				const key = settingsDatas[i].key;
				let value = settingsDatas[i].value;
				if(numberField.includes(key)){
					value = toNumber(value);
				}
				form["value"][key]=value;
			}
		}
		console.log(form.value)
		console.log(settingsDatas)
	}).catch((error) => {
		
	});
})

const changeConfig = (key) => {
	changeSettings(module.value, key, form["value"][key]);
}

const resizableChange = () => {
}

const resetBookSettings = () => {
}

const changeSettings = (m, k, v) => {
console.log("11111",m, k, v)
	mainWinApi.setSettings(m, k, v).then(()=>{
	
	}).catch((error) => {
		console.lo(error)
	});
}
</script>

<style scoped></style>
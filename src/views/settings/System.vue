<template>
    <div class="settings-system">
        <el-form size="small" :model="form" label-position="left" label-width="120px">
            <el-form-item label="主窗口大小">
                <el-input-number v-model="form.mainWin_width" @change="changeConfig('mainWin_width')"/>
                <span class="word-x">X</span>
                <el-input-number v-model="form.mainWin_height" @change="changeConfig('mainWin_height')"/>
            </el-form-item>

            <el-button type="primary" plain @click="resetBookSettings">
                恢复默认设置
            </el-button>{{ form }}
        </el-form>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElNotification } from 'element-plus'
import { isNotNull, isNull, toNumber } from '@/common/utils.js'

const form = ref({});
const module = ref("system");


onMounted(async () => {
    loadSettings();
})

const loadSettings = () => {
    // number类型的字段
    const numberField = ["mainWin_width", "mainWin_height", "readBookWin_width", "readBookWin_height"];
    mainWinApi.getAllSettings(module.value).then((settingsDatas) => {
        console.log(settingsDatas);
        if (isNotNull(settingsDatas)) {
            for (let i = 0; i < settingsDatas.length; i++) {
                const key = settingsDatas[i].key;
                let value = settingsDatas[i].value;
                if (numberField.includes(key)) {
                    value = toNumber(value);
                }
                form["value"][key] = value;
            }
        }
        ElNotification({
            offset: 100,
            message: "配置加载成功",
            type: 'success',
        });
    }).catch((error) => {
        console.error(error);
        ElNotification({
            offset: 100,
            message: "配置加载失败",
            type: 'error',
        });
    });
}

const changeConfig = (key) => {
    changeSettings(module.value, key, form["value"][key]);
}

const resetBookSettings = () => {
    mainWinApi.initSettings(module.value).then(() => {
        loadSettings();
        ElNotification({
            offset: 100,
            message: "已恢复默认设置",
            type: 'success',
        });
    }).catch((error) => {
        ElNotification({
            offset: 100,
            message: "恢复默认设置失败",
            type: 'error',
        });
        console.error(error);
    });
}
const changeSettings = (m, k, v) => {
    mainWinApi.setSettings(m, k, v).then(() => {

    }).catch((error) => {
        console.lo(error)
    });
}
</script>

<style scoped>
.settings-system{
    padding-top: 10px;
}

.word-x{
    margin: 0px 10px;
}
</style>
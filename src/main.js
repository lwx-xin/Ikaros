import { createApp } from 'vue'
import { createPinia } from 'pinia';

import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus';
import { ElNotification } from 'element-plus';
import 'element-plus/dist/index.css';

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './assets/common.scss'

const app = createApp(App);

app.use(createPinia());

app.use(router);

// 设置 ElNotification 的全局默认显示时间
ElNotification({
  duration: 1000 // 单位是毫秒，这里设置为 5 秒
});
app.use(ElementPlus);
// 注册全部的图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}


app.mount('#app');

import { createRouter, createWebHistory } from 'vue-router'

import Main from '@/views/main/index.vue'

import Home from '@/views/Home.vue'
import ShortcutKeys from '@/views/ShortcutKeys.vue'
import Settings from '@/views/Settings.vue'

import FishBook from '@/views/fishBook/fishBook.vue'
import ReadBook from '@/views/fishBook/readBook.vue'

import GameHome from '@/views/game/index.vue'
import Snake from '@/views/game/snake.vue'
import Gobang from '@/views/game/gobang.vue'

import Chat from '@/views/chat/index.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: "/main/home"
        },
        {
            path: '/main',
            name: 'main',
            component: Main,
            children: [
                {
                    // 首页
                    path: 'home',
                    name: 'home',
                    component: Home
                },
                {
                    // 快捷键
                    path: 'shortcutKeys',
                    name: 'shortcutKeys',
                    component: ShortcutKeys
                },
                {
                    // 设置
                    path: 'settings',
                    name: 'settings',
                    component: Settings
                },
                {
                    // fish-book首頁
                    path: 'fishBook',
                    name: 'fishBook',
                    component: FishBook
                },
            ]
        },
        {
            // readBook
            path: '/readBook/:bookId',
            name: 'readBook',
            component: ReadBook
        },
        {
            // chat首頁
            path: '/chat',
            name: 'chat',
            component: Chat
        },
        {
            // game首頁
            path: '/game',
            name: 'game',
            component: GameHome,
            children: [
                {
                    // 贪吃蛇
                    path: 'snake',
                    name: 'snake',
                    component: Snake
                },
                {
                    // 五子棋
                    path: 'gobang',
                    name: 'gobang',
                    component: Gobang
                },
            ]
        },
    ]
})

export default router

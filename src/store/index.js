import { defineStore } from 'pinia'

export const useIkarosStore = defineStore('ikarosStore', {
    state: () => {
        return {
            isMainPage: true, // 是否为主页
            pageTitle: "",
        }
    },

    actions: {

    },

    getters: {

    }
})
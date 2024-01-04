const { app } = require('electron');
const path = require('path');

// 目录
const pathConfig = {
	// fish-book模块存放book的目录
	fishBook_book_path: path.join(app.getAppPath(), '/public/module/fishBook/book')
}

// 窗口参数
const winConfig = {
	main: {
		width: 1000,
		height: 600
	},
	fishBook: {
        width: 800,
        height: 600,
	}
}

// 阅读器相关设置项
const bookSettings = {
    // 小说每页字数
    wordsPerPage: 40,
    // 小说字体颜色
    textColor: '#ffffff',
    // 小说背景颜色
    textBgColor: '#000000',
    // 窗口透明度
    bgOpacity: 0.7,
    // 是否允许调整窗口宽高
    resizable: true,
    // 小说字体大小
    fontSize: 16,
    // 小说字间距
    letterSpacing: 0,
};
// 快捷键
const shortcutSettings = {
    // 上一页
    key1: 'alt + z',
    // 下一页
    key2: 'alt + c',
    // 阅读器显隐切换
    key3: 'alt + v',
};

module.exports = {
	pathConfig,
	winConfig,
	bookSettings,
	shortcutSettings
}
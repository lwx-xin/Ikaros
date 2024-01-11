const { app } = require('electron');
const path = require('path');

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

const moduleSettings = {
	// fishBook相关设置项
	fishBook: {
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
		// fish-book模块存放book的目录
		bookPath: path.join(app.getAppPath(), '/public/module/fishBook/book')
	}
}

module.exports = {
	winConfig,
	moduleSettings
}
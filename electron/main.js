// 导入Electron模块
const { app, BrowserWindow, Tray, Menu, ipcMain, screen } = require('electron');
const path = require('path');
const mainProcessEvent = require('../src/common/processEvent/mainProcessEvent.js');

const ikarosUtil = require('../src/common/ikarosUtil.js')

let mainWin;

const createMainWin = async () => {
    // 初始化Table
    await ikarosUtil.initIkarosTable();
    // 初始化settings
    await ikarosUtil.initIkarosSettings();

    // 获取窗口默认参数
    let mainWinParams = { width: 800, height: 600 };
    const mainWin_width = await ikarosUtil.getSettings("system", "mainWin_width");
    const mainWin_height = await ikarosUtil.getSettings("system", "mainWin_height");
    if (mainWin_width && mainWin_height) {
        mainWinParams = {
            width: Number(mainWin_width),
            height: Number(mainWin_height)
        }
    }
    mainWin = new BrowserWindow({
        ...mainWinParams,

        show: false,
        frame: false,

        // 窗口图标。 在 Windows 上推荐使用 ICO 图标来获得最佳的视觉效果, 默认使用可执行文件的图标.
        icon: path.resolve(__dirname, '../public/images/logo.png'),

        webPreferences: {
            // 定义预加载的js
            preload: path.resolve(__dirname, 'mainPreload.js'),
        },

    });
    console.log("主窗口", mainWin.getSize());
    // 移除默认的标题栏
    // mainWin.setMenu(null);

    mainWin.on('ready-to-show', () => {
        mainWin.show();
        setMainHeight();
    });

    // 监听窗口大小改变事件
    mainWin.on('resize', () => {
        setMainHeight();
    });

    // 开发环境下，打开开发者工具。
    // if (!isPackaged) {
    mainWin.webContents.openDevTools();
    // }

    // 加载 index.html
    mainWin.loadURL(
        app.isPackaged
            ? `file://${path.join(__dirname, '../dist/index.html')}`
            : 'http://localhost:9999'
    );

    // 创建一个系统托盘图标
    const tray = new Tray(path.join(__dirname, '../public/images/logo.png'));

    // 鼠标悬浮在图标上显示的提示
    tray.setToolTip('mini-ikaros');

    const contextMenu = Menu.buildFromTemplate([
        {
            label: '打开主界面',
            icon: path.join(__dirname, '../public/images/app.png'),
            click: () => {
                mainWin.show();
            },
        },
        {
            label: '退出',
            icon: path.join(__dirname, '../public/images/quit.png'),
            click: function () {
                app.quit();
            },
        },
    ]);
    tray.setContextMenu(contextMenu);

    // 监听托盘图标的点击事件，重新显示窗口
    tray.on('click', () => {
        mainWin.show();
    });

    // 注册主主窗口的事件
    for (const [key, processEvent] of Object.entries(mainProcessEvent)) {
        if (typeof processEvent == "function") {
            processEvent();
        }
    }

};

// 在应用准备就绪时调用函数
app.whenReady().then(() => {
    createMainWin();
});

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
// app.on("window-all-closed", () => {
//     if (process.platform !== "darwin") {
//         app.quit();
//     }
// });

const setMainHeight = () => {
    // 可以在这里根据窗口高度来决定是否显示滚动条
    mainWin.webContents.executeJavaScript(`document.querySelector(".home-main").style.height = (window.innerHeight-document.querySelector(".el-header").clientHeight)+"px"`);
}

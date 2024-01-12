// 导入Electron模块
const { app, BrowserWindow, Tray, Menu, ipcMain, screen } = require('electron');
const path = require('path');
const mainProcessEvent = require('../src/common/processEvent/mainProcessEvent.js');

const { winConfig } = require('../src/common/config/sysConfig.js');

let mainWin;

const createMainWin = () => {
    mainWin = new BrowserWindow({
        ...winConfig.main,

        show: false,
        frame: false,

        // 窗口图标。 在 Windows 上推荐使用 ICO 图标来获得最佳的视觉效果, 默认使用可执行文件的图标.
        icon: path.resolve(__dirname, '../public/images/logo.png'),

        webPreferences: {
            // 定义预加载的js
            preload: path.resolve(__dirname, 'mainPreload.js'),
        },

    });
    // 移除默认的标题栏
    // mainWin.setMenu(null);

    mainWin.on('ready-to-show', () => {
        // mainWin.show();
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
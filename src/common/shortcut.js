const { globalShortcut } = require('electron');

// 绑定readWindow快捷键
const registerReadWindowShortcuts = (readWindow) => {
    const shortcuts = {
        // 上一页
        "Alt+Z": () => {
            // 向渲染进程发送消息
            readWindow.webContents.send('pre-page');
        },
        // 下一页
        "Alt+C": () => {
            readWindow.webContents.send('next-page');
        },
        // 阅读器窗口显隐切换
        "Alt+V": () => {
            if (readWindow.isVisible()) {
                readWindow.hide();
            } else {
                readWindow.show();
            }
        },
    };

    Object.entries(shortcuts).forEach(([shortcut, callback]) => {
        globalShortcut.register(shortcut, throttle(callback, 500));
    });
}


// 解绑readWindow快捷键
const unregisterReadWindowShortcuts = () => {
    globalShortcut.unregisterAll();
}


// 防抖节流函数
const throttle = (func, delay) => {
    let canClick = true;
    return function () {
        if (canClick) {
            func.apply(this, arguments);
            canClick = false;
            setTimeout(() => {
                canClick = true;
            }, delay);
        }
    };
}

module.exports = {
    registerReadWindowShortcuts,
    unregisterReadWindowShortcuts,
};
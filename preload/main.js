const { contextBridge, ipcRenderer } = require('electron');

const openHttpServer = () => {
    return ipcRenderer.invoke("open-server-http");
}

const sendHttpMessage = (ip, host, url, sendData) => {
    return ipcRenderer.invoke("send-message-http", ip, host, url, sendData);
}

const openWsServer = (port) => {
    return ipcRenderer.invoke("open-server-ws", port);
}

const sendWsMessage = (userId, targetUserIds, message, msgType) => {
    return ipcRenderer.invoke("send-message-ws", userId, targetUserIds, message, msgType);
}

const getLocalIp = () => {
    return ipcRenderer.invoke("get-local-ip");
}

const resizeMinWindow = () => {
    ipcRenderer.invoke("window-min");
}

const resizeMaxWindow = () => {
    ipcRenderer.invoke("window-max");
}

const closeWindow = () => {
    ipcRenderer.invoke("window-close");
}

const openReadBookWindow = (bookId) => {
    ipcRenderer.invoke("window-open-readBook", bookId);
}

const openBookDirectory = (fileName) => {
    ipcRenderer.invoke("open-books-folder");
}

const uploadBook = () => {
    return ipcRenderer.invoke("upload-book");
}

const refreshBooks = () => {
    return ipcRenderer.invoke("refresh-books");
}

const getBookInfoList = () => {
    return ipcRenderer.invoke("get-book-info-list");
}

const getSettings = (setKey) => {
    return ipcRenderer.invoke('get-settings', setKey);
}

const setSettings = (setKey, setVal) => {
    return ipcRenderer.invoke('set-settings', setKey, setVal);
}

const initSettings = (isInit) => {
    return ipcRenderer.invoke('init-settings', isInit);
}

contextBridge.exposeInMainWorld("mainWinApi", {
    resizeMinWindow,
    resizeMaxWindow,
    closeWindow,
    openReadBookWindow,
    openBookDirectory,
    uploadBook,
    refreshBooks,
    getBookInfoList,
    getSettings,
    setSettings,
    initSettings,

    openHttpServer,
    sendHttpMessage,

    openWsServer,
    sendWsMessage,

    getLocalIp,
});
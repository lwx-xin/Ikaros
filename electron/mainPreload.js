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

const uploadBook = () => {
    return ipcRenderer.invoke("upload-book");
}

const getBookShelfList = () => {
    return ipcRenderer.invoke("get-book-shelf-list");
}

const getSettings = (module, key) => {
    return ipcRenderer.invoke('get-settings', module, key);
}

const getAllSettings = (module) => {
    return ipcRenderer.invoke('get-all-settings', module);
}

const setSettings = (module, key, value) => {
    return ipcRenderer.invoke('set-settings', module, key, value);
}

const initSettings = (module) => {
    return ipcRenderer.invoke('init-settings', module);
}
const initIkarosTable = () => {
    return ipcRenderer.invoke('init-table');
}

contextBridge.exposeInMainWorld("mainWinApi", {
    resizeMinWindow,
    resizeMaxWindow,
    closeWindow,
    openReadBookWindow,

    uploadBook,
    getBookShelfList,

    getSettings,
    getAllSettings,
    setSettings,
    initSettings,
    initIkarosTable,

    openHttpServer,
    sendHttpMessage,

    openWsServer,
    sendWsMessage,

    getLocalIp,
});
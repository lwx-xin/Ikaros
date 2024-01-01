const { contextBridge, ipcRenderer } = require('electron');

const moveWindow = (x, y) => {
    ipcRenderer.invoke("window-move", x, y);
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

const openFishBookWindow = () => {
    ipcRenderer.invoke("window-open-fishBook");
}

const openBookDirectory = (fileName) => {
    ipcRenderer.invoke("open-books-folder");
}

const refreshBooks = () => {
    return ipcRenderer.invoke("refresh-books");
}

const getBookInfoList = () => {
    return ipcRenderer.invoke("get-book-info-list");
}

const initTable = () => {
    ipcRenderer.invoke("init-table");
}

contextBridge.exposeInMainWorld("mainWinApi", {
    moveWindow,
    resizeMinWindow,
    resizeMaxWindow,
    closeWindow,
    openFishBookWindow,
    openBookDirectory,
    refreshBooks,
    getBookInfoList,
    initTable,
});
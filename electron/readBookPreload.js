const { contextBridge, ipcRenderer } = require('electron');

const readFile = async (bookId, wordsPerPage, beforeOrNext) => {
    const data = await ipcRenderer.invoke("read-file", bookId, wordsPerPage, beforeOrNext);
    return data;
}

const closeWindow = () => {
    ipcRenderer.invoke("fishBook-window-close");
}

const readPrePage = (callback) => {
    return ipcRenderer.on('pre-page', callback);
}

const readNextPage = (callback) => {
    return ipcRenderer.on('next-page', callback);
}

contextBridge.exposeInMainWorld("fishBookWinApi", {
    readFile,
    closeWindow,

    readPrePage,
    readNextPage
});
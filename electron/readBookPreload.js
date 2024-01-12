const { contextBridge, ipcRenderer } = require('electron');

const readFile = async (bookId, wordsPerPage, beforeOrNext) => {
    const data = await ipcRenderer.invoke("read-file", bookId, wordsPerPage, beforeOrNext);
    return data;
}

const closeWindow = () => {
    ipcRenderer.invoke("fishBook-window-close");
}

contextBridge.exposeInMainWorld("fishBookWinApi", {
    readFile,
    closeWindow
});
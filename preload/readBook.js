const { contextBridge, ipcRenderer } = require('electron');

const readFile = async (fileName, start, length) => {
    const data = await ipcRenderer.invoke("read-file", fileName, start, length);
    return data;
}

const closeWindow = () => {
    ipcRenderer.invoke("fishBook-window-close");
}

contextBridge.exposeInMainWorld("fishBookWinApi", {
    readFile,
    closeWindow
});
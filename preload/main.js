const { contextBridge, ipcRenderer } = require('electron');

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

contextBridge.exposeInMainWorld("mainWinApi", {
    resizeMinWindow,
    resizeMaxWindow,
    closeWindow,
    openReadBookWindow,
    openBookDirectory,
	uploadBook,
    refreshBooks,
    getBookInfoList,
});
const { ipcMain, BrowserWindow, screen, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const sqlUtils = require('../sqlite/sql.js');

// 读取book数据
const readFile = () => {
	ipcMain.handle('read-file', (event, bookId, wordsPerPage, beforeOrNext) => {
		return new Promise(async (resolve, reject) => {
			let db;
			try {
				console.log("---------------------------");
				let content = "";
				db = await sqlUtils.open();

				// 查询当前图书读取进度
				const bookInfo = await sqlUtils.selectOne(db, "SELECT * FROM book_list WHERE id=?", [bookId]);
				if (bookInfo == null || Object.keys(bookInfo).length == 0) {
					reject("【" + bookId + "】不存在");
				}
				let start = 1;
				let end = 1;
				let length = wordsPerPage;

				if ("before" == beforeOrNext) {
					start = bookInfo.end - wordsPerPage;
				} else if ("next" == beforeOrNext) {
					start = bookInfo.end + wordsPerPage;
				} else {
					start = bookInfo.end
				}
				end = start;

				if (start >= 1 && wordsPerPage > 0) {
					while (content.length < wordsPerPage) {
						const sql = "select substr(content, (?-start)+1 ,?) as content,start, end from book where book_id=? and start <= ? ORDER BY id desc limit 1";
						const params = [start, length, bookId, start];
						console.log(sql, params)

						const data = await sqlUtils.selectOne(db, sql, params);
						content += data.content;
						if (data.content.length < length) {
							length = length - data.content.length;
							start = data.end + 1;
						}
					}

					await sqlUtils.update(db, "book_list", {
						end: end
					}, {
						id: bookId
					});
				}

				sqlUtils.close(db);
				resolve(content)
			} catch (error) {
				sqlUtils.close(db);
				console.log(error);
				reject(error);
			}
		});
	});
}

// 关闭窗口
const closeWindow = () => {
	ipcMain.handle('fishBook-window-close', event => {
		const webContent = event.sender;
		const win = BrowserWindow.fromWebContents(webContent);
		win.close();
	});
}

module.exports = {
	readFile,
	closeWindow,
}
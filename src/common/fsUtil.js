const fs = require('fs');
const readline = require('readline');

// 读取json文件
const readJsonSync = (filePath) => {
    try {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(jsonData);
    } catch (error) {
        console.error('读取文件时发生错误:', error);
        return null;
    }
}

// 按行读取文件
const textFileReadLine = (filePath) => {
    return new Promise(async (resolve, reject) => {
        try {
            const rl = readline.createInterface({
                input: fs.createReadStream(filePath),
                output: process.stdout,
                terminal: false
            });

            let data = [];
            rl.on('line', (line) => {
                data.push(line);
            });
            rl.on('close', async () => {
                rl.close();
                resolve(data);
            });
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    readJsonSync,
    textFileReadLine
}
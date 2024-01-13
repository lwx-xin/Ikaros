const {
    open,
    close,
    execSql,
    initTable,
    allData,
    oneData,
    insertData,
    insertBatchData,
    updateData,
    insertOrUpdateData,
    delData,
    count,
} = require('./sqlite.js');

const table = "book";

const chunkSize = 100;

const insertBatch = (dataList) => {
    return new Promise((resolve, reject) => {
        const knex = open();
        insertBatchData(knex, table, dataList, chunkSize).then((res) => {
            close(knex);
            resolve(res);
        }).catch((error) => {
            close(knex);
            reject(error);
        });
    });
}

const getContent = (bookId, start, wordsPerPage) => {
    return new Promise(async (resolve, reject) => {
        const knex = open();
        let content = "";
        let length = wordsPerPage;
        while (content.length < wordsPerPage) {
            const sql = "select substr(content, (?-start)+1 ,?) as content,start, end from book where book_id=? and start <= ? ORDER BY id desc limit 1";
            const params = [start, length, bookId, start];

            const dataList = await execSql(knex, sql, params);
            if (dataList != null && dataList.length > 0) {
                const data = dataList[0];
                content += data.content;
                if (data.content.length < length) {
                    length = length - data.content.length;
                    start = data.end + 1;
                }
            } else {
                content = "没有更多内容了!!!";
                break;
            }
        }
        close(knex);
        resolve(content);
    });
}

module.exports = {
    insertBatch,
    getContent
}
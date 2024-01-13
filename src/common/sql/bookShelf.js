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

const table = "book_shelf";

const chunkSize = 1000;

// 书架列表
const getList = () => {
    return new Promise((resolve, reject) => {
        const knex = open();
        allData(knex, table, ["*"], {}).then((res) => {
            close(knex);
            resolve(res);
        }).catch((error) => {
            reject(error);
        });
    });
}

const getOne = (id) => {
    return new Promise((resolve, reject) => {
        const knex = open();
        oneData(knex, table, ["*"], { id }).then((res) => {
            close(knex);
            resolve(res);
        }).catch((error) => {
            reject(error);
        });
    });
}

const update = (bookshelf) => {
    return new Promise((resolve, reject) => {
        const knex = open();
        insertOrUpdateData(knex, table, bookshelf).then((res) => {
            close(knex);
            resolve(res);
        }).catch((error) => {
            reject(error);
        });
    });
}

module.exports = {
    getList,
    getOne,
    update
}
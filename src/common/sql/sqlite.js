// https://knexjs.org/
const { app } = require('electron');
const path = require('path');

const tableInfo = {
    book: {
        sql: "CREATE TABLE IF NOT EXISTS book (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, book_id TEXT, start INTEGER, end INTEGER, content TEXT)",
        key: "id"
    },
    book_shelf: {
        sql: "CREATE TABLE IF NOT EXISTS book_shelf (id TEXT PRIMARY KEY, name TEXT, words INTEGER, end INTEGER)",
        key: "id"
    },
    settings: {
        sql: "CREATE TABLE IF NOT EXISTS settings (module TEXT, key TEXT, value TEXT, PRIMARY KEY ('module', 'key'))",
        key: ["module", "key"]
    }
}

const open = () => {
    return require('knex')({
        // 指定客户端为 SQLite3
        client: 'sqlite3',
        connection: {
            // 数据库文件位置
            filename: path.join(app.getPath('userData'), 'ikaros.sqlite3')
        },
        // SQLite3 需要这个设置来处理默认值
        useNullAsDefault: true
    });
}

const close = (knex) => {
    // 关闭数据库连接
    if (knex) {
        knex.destroy();
    }
}

const initTable = (knex) => {
    return new Promise(async (resolve, reject) => {
        try {
            const tables = Object.keys(tableInfo);
            for (let i = 0; i < tables.length; i++) {
                const tableName = tables[i]
                const tableSql = tableInfo[tableName].sql;

                await knex.raw(tableSql, []);
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

// all(knex, "table", ["a", "b"], { "k1": "11", "k2": "22" })
const allData = (knex, table, select, where) => {
    return knex(table).select(...select).where(where);
}

// one(knex, "table", ["a", "b"], { "k": "11"})
const oneData = (knex, table, select, where) => {
    return knex(table).select(...select).where(where).first();
}

// insert(knex, "table", { "aa": "11", "bb": "22" });
const insertData = (knex, table, data) => {
    return knex(table).insert(data);
}

// insertBatch(knex, "table", [
//     { "aa": "11", "bb": "22" },
//     { "aa": "11", "bb": "22" }
// ], 100);
const insertBatchData = (knex, table, datas, chunkSize) => {
    return knex.transaction(trx => {
        // 使用 transaction 对象 trx 执行批量插入
        knex.batchInsert(table, datas, chunkSize)
            .transacting(trx) // 使用事务
            .then(trx.commit) // 提交事务
            .catch(trx.rollback); // 回滚事务
    });
}

// update(knex, "table", { "aa": "11", "bb": "22" }, {"key":"111"});
const updateData = (knex, table, data, where) => {
    return knex(table).update(data).where(where);
}

const insertOrUpdateData = (knex, table, data) => {
    const key = tableInfo[table].key;
    return knex(table).insert(data).onConflict(key).merge();
}

const delData = (knex, table, where) => {
    return knex(table).where(where).del();
}

const count = (knex, table, where) => {
    return knex(table).count({count: '*'}).where(where).first().then(res => res.count);
}

// execSql(knex, 'SELECT * FROM users WHERE id = ?', ["aa"]);
const execSql = (knex, sql, params) => {
    return knex.raw(sql, params);
}

module.exports = {
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
};
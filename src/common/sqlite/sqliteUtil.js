const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app, BrowserWindow } = require('electron');

// 创建数据库连接
const open = () => {
    const db = new sqlite3.Database(path.join(app.getPath('userData'), 'ikaros.sqlite3'));
    return db;
}

// 关闭数据库连接
const close = (db) => {
    if (db) {
        db.close();
    }
}

const execSql = (db, sql, params) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(sql, params, function (err) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
}

const selectAll = (db, sql, params) => {
    return new Promise((resolve, reject) => {
        db.serialize(async () => {
            db.all(sql, params, (err, row) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(row);
                };
            });
        });
    });
}

const selectOne = (db, sql, params) => {
    return new Promise((resolve, reject) => {
        db.serialize(async () => {
            db.get(sql, params, (err, row) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(row);
                };
            });
        });
    });
}

module.exports = {
    open,
    close,
    // create,
    // insert,
    // select,
    // del
    execSql,
    selectAll,
    selectOne
};
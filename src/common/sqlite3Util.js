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

// 创建表
const create = (db, sql) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(sql, [], function (err) {
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

// 插入数据
const insert = (db, sql, params) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(sql, params, function (err) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    });
};

// 删除数据
const del = (db, sql, params) => {
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

// 查询数据
const select = (db, sql, params) => {
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

module.exports = {
    open,
    close,
    create,
    insert,
    select,
    del
};
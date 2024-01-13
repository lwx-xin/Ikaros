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

const table = "settings";

const chunkSize = 100;

// 初始化设置
const init = (settingsList, module) => {
    return new Promise(async (resolve, reject) => {
        try {
            const knex = open();

            if (module) {
                await delData(knex, table, { module });
            }

            let list = [];
            for (let i = 0; i < settingsList.length; i++) {
                const settings = settingsList[i];
                const c = await count(knex, table, {
                    module: settings.module,
                    key: settings.key
                });
                if (c == 0) {
                    list.push(settings);
                }
            }

            if (list.length > 0) {
                await insertBatchData(knex, table, list, chunkSize);
            }

            close(knex);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

// 删除全部的设置
const deleteAll = () => {
    return new Promise((resolve, reject) => {
        const knex = open();
        delData(knex, table, {}).then((res) => {
            close(knex);
            resolve(res);
        }).catch((error) => {
            reject(error);
        });
    });
}

// 更新设置(insert,update)
const update = (module, key, value) => {
    return new Promise((resolve, reject) => {
        const knex = open();
        insertOrUpdateData(knex, table, { module, key, value }).then((res) => {
            close(knex);
            resolve(res);
        }).catch((error) => {
            reject(error);
        });
    });
}

const getAll = (module) => {
    return new Promise((resolve, reject) => {
        const knex = open();
        allData(knex, table, ["*"], { module }).then((res) => {
            close(knex);
            resolve(res);
        }).catch((error) => {
            reject(error);
        });
    });
}

const getOne = (module, key) => {
    return new Promise((resolve, reject) => {
        const knex = open();
        oneData(knex, table, ["*"], { module, key }).then((res) => {
            close(knex);
            resolve(res);
        }).catch(() => {
            reject();
        });
    });
}

module.exports = {
    init,
    deleteAll,
    update,
    getAll,
    getOne
}
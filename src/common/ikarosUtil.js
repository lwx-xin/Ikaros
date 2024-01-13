const path = require('path');
const fs = require('fs');
const { readJsonSync, textFileReadLine } = require('./fsUtil.js')

const sqliteUtil = require('./sql/sqlite.js')
const settingsSql = require('./sql/settings.js')

const initIkarosTable = async () => {
    const knex = sqliteUtil.open();
    await sqliteUtil.initTable(knex);
    sqliteUtil.close(knex);
}

const initIkarosSettings = (module) => {
    // 读取默认配置
    let settings = {};

    if (module) {
        // 读取src/common/config下的module配置文件
        const settingsFilePath = path.join(__dirname, `./config/${module}.json`);
        if (fs.existsSync(settingsFilePath)) {
            const settingsData = readJsonSync(settingsFilePath);
            settings[module] = settingsData;
        }
    } else {
        // 读取src/common/config下的全部配置文件，文件名为module名
        const settingsDir = path.join(__dirname, "./config");
        const settingsfiles = fs.readdirSync(settingsDir);
        for (const fileName of settingsfiles) {
            const settingsFilePath = path.join(settingsDir, fileName);

            const moduleName = path.basename(fileName, ".json");
            const settingsData = readJsonSync(settingsFilePath);

            settings[moduleName] = settingsData;
        }
    }

    let settingsList = [];

    for (const [moduleName, settingsData] of Object.entries(settings)) {
        for (const [key, value] of Object.entries(settingsData)) {
            settingsList.push({
                "module": moduleName,
                "key": key,
                "value": typeof (value) == "object" ? JSON.stringify(value) : value
            });
        }
    }

    return settingsSql.init(settingsList, module);
}

const getSettings = async (module, key) => {
    const data = await settingsSql.getOne(module, key);
    if (data) {
        return data.value;
    }
    return null;
}


module.exports = {
    initIkarosTable,
    initIkarosSettings,
    getSettings
}
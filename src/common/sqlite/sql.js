const sqliteUtils = require('./sqliteUtil');

const tableInfo = {
	book: "CREATE TABLE IF NOT EXISTS book (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, start INTEGER, end INTEGER, content TEXT)",
	book_list: "CREATE TABLE IF NOT EXISTS book_list (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, words INTEGER, end INTEGER)"
}

const checkTable = (table)=>{
	return tableInfo[table]!=null && tableInfo[table]!='';
}

const initTable = (db) => {
    return new Promise(async(resolve, reject) => {
		try {
			const tables = Object.keys(tableInfo);
			for(let i=0;i<tables.length;i++){
				const tableName = tables[i]
				const tableSql = tableInfo[tableName];
				
				await sqliteUtils.execSql(db, tableSql, []);
			}
			resolve();
		} catch (error) {
			console.error(error);
			reject(error);
		}
    });
}

const insert = (db, table, data) => {
	return insertBatch(db, table, [data], 1);
}

// dataArr: [{'k1':'v1','k2':'v2'},{'k1':'v3','k2':'v4'}]
const insertBatch = (db, table, dataArr, size) => {
    return new Promise(async(resolve, reject) => {
		try{
			if(db == null || dataArr == null || table==null || table=="" || dataArr.length == 0 || Object.keys(dataArr[0]).length == 0){
				reject("insertBatch 参数错误");
			}
			if(!checkTable(table)){
				reject("表【"+table+"】不存在");
			};
			
			const keys = Object.keys(dataArr[0]);
			let keySql = "";
			let valueSql = "";
			let params_v = [];
			
			let sqlDataArr = [];
			
			for(let i=0;i<dataArr.length;i++){
				var data = dataArr[i];

				if (valueSql != "") {
					valueSql += ",";
				}
				valueSql += "(";
				for(let j=0;j<keys.length;j++){
					
					const k = keys[j];
					const v = data[k];
					
					if(i==0){
						keySql += k;
						if(j!=keys.length-1){
							keySql += ",";
						}
					}
					
					valueSql += "?";
					if(j!=keys.length-1){
						valueSql += ",";
					}
					params_v.push(v);
				}
				valueSql += ")";
				
				if (((i+1) % size == 0 || i == dataArr.length - 1)) {
					sqlDataArr.push({
						valueSql: valueSql,
						params_v: params_v
					});
					valueSql = "";
					params_v = [];
				}
			}
			
			for(let i=0;i<sqlDataArr.length;i++){
				const sqlData = sqlDataArr[i];
				const sqlData_valueSql = sqlData["valueSql"];
				const sqlData_params_v = sqlData["params_v"];
				
				const sql = "INSERT INTO "+table+" ("+keySql+") VALUES "+sqlData_valueSql;
				
				await sqliteUtils.execSql(db, sql, sqlData_params_v);
			}
			resolve();
		}catch(error){
			reject(error);
		}
	});
}

const del = (db, table, whereData)=>{
	return new Promise(async(resolve, reject) => {
		try{
			if(db == null || whereData == null || table==null || table=="" || Object.keys(whereData).length == 0){
				reject("del 参数错误");
			}
			if(!checkTable(table)){
				reject("表【"+table+"】不存在");
			};

			let whereSql = "";
			let params = [];
			
			if(whereData != null && Object.keys(whereData).length > 0){
				const whereData_keys = Object.keys(whereData);
				
				whereSql += " WHERE ";
				
				for(let i=0;i<whereData_keys.length;i++){
					const k = whereData_keys[i];
					const v = whereData[k];
					
					if(i!=0){
						whereSql += " and "
					}
					
					whereSql += (k+"=?");
					params.push(v);
				}
			}
			
			const sql = "DELETE FROM "+table+" WHERE "+whereSql;
			await sqliteUtils.execSql(db, sql, params);
			resolve();
		}catch(error){
			reject(error);
		}
	});
}

const update = (db, table, setData, whereData)=>{
	return new Promise(async(resolve, reject) => {
		try{
			if(db == null || setData == null || table==null || table=="" || Object.keys(setData).length == 0){
				reject("update 参数错误");
			}
			if(!checkTable(table)){
				reject("表【"+table+"】不存在");
			};

			let setSql = "";
			let whereSql = "";
			let params = [];
			const setData_keys = Object.keys(setData);
			
			for(let i=0;i<setData_keys.length;i++){
				const k = setData_keys[i];
				const v = setData[k];
				
				setSql += (k+"=?");
				params.push(v);
				
				if(i!=setData_keys.length-1){
					setSql += " , "
				}
			}
			
			if(whereData != null && Object.keys(whereData).length > 0){
				const whereData_keys = Object.keys(whereData);
				
				whereSql += " WHERE ";
				
				for(let i=0;i<whereData_keys.length;i++){
					const k = whereData_keys[i];
					const v = whereData[k];
					
					if(i!=0){
						whereSql += " and "
					}
					
					whereSql += (k+"=?");
					params.push(v);
				}
			}
			
			const sql = "UPDATE "+table+" SET "+setSql+whereSql;
			await sqliteUtils.execSql(db, sql, params);
			resolve();
		}catch(error){
			reject(error);
		}
	});
}

const select=(db, table, fields, whereData)=>{
	return new Promise(async(resolve, reject) => {
		try{
			if(db == null || table==null || table==""){
				reject("select 参数错误");
			}
			if(!checkTable(table)){
				reject("表【"+table+"】不存在");
			};

			let fieldSql = "*";
			if(fields != null && fields.length>0){
				fieldSql = fields.join(",");
			}
			
			let whereSql = "";
			let params = [];
			
			if(whereData != null && Object.keys(whereData).length > 0){
				const whereData_keys = Object.keys(whereData);
				
				whereSql += " WHERE ";
				
				for(let i=0;i<whereData_keys.length;i++){
					const k = whereData_keys[i];
					const v = whereData[k];
					
					if(i!=0){
						whereSql += " and "
					}
					
					whereSql += (k+"=?");
					params.push(v);
				}
			}
			
			const sql = "SELECT "+fieldSql+" FROM "+table +whereSql;
			const resultData = await sqliteUtils.selectAll(db, sql, params);
			resolve(resultData);
		}catch(error){
			reject(error);
		}
	});
}

const selectAll = (db, sql, params) => {
	return new Promise(async(resolve, reject) => {
		try{
			const resultData = sqliteUtils.selectAll(db, sql, params);
			resolve(resultData);
		}catch(error){
			reject(error);
		}
	});
}

const selectOne = (db, sql, params) => {
	return new Promise(async(resolve, reject) => {
		try{
			const resultData = sqliteUtils.selectOne(db, sql, params);
			resolve(resultData);
		}catch(error){
			reject(error);
		}
	});
}

const execSql = (db, sql, params) => {
	return new Promise(async(resolve, reject) => {
		try{
			const resultData = sqliteUtils.execSql(db, sql, params);
			resolve(resultData);
		}catch(error){
			reject(error);
		}
	});
}

const open = ()=>{
	return new Promise(async(resolve, reject) => {
		try{
			const db = await sqliteUtils.open();
			await initTable(db);
			resolve(db);
		}catch(error){
			reject(error);
		}
	});
}
const close = (db)=>{
	sqliteUtils.close(db);
}

module.exports = {
    open,
    close,
	selectAll,
	selectOne,
	execSql,
	
	insert,
	insertBatch,
	del,
	update,
	select,
	initTable,
};